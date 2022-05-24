const QueryStream = require("pg-query-stream");
const JSONStream = require("JSONStream");
const { Transform } = require("stream");
const { createWriteStream } = require("fs");
const pgp = require("pg-promise")();
require("dotenv").config();
const STAGE = process.env.STAGE;

module.exports = class DbService {
    constructor() {
        this.host = process.env.DB_HOST;
        this.port = process.env.DB_PORT;
        this.user = process.env.DB_USERNAME;
        this.password = process.env.DB_PASSWORD;
        this.set_db(STAGE);
        this.db = pgp(this);
        this.test_connect();
    }
    set_db(stage) {
        switch (stage) {
            case "TEST": {
                this.database = process.env.TEST_DB_DATABASE;
                break;
            }
            case "STAGING": {
                this.database = process.env.STAGING_DB_DATABASE;
                break;
            }
            case "PROD": {
                this.database = process.env.PROD_DB_DATABASE;
                break;
            }
            default: {
                throw new Error("UNSUPPORTED STAGE");
            }
        }
    }
    test_connect() {
        try {
            return this.db
                .connect()
                .then(obj => {
                    console.log(`success check ${obj}`);
                    obj.done();
                })
                .catch(e => {
                    console.log(JSON.stringify(e));
                });
        } catch (e) {
            console.error(`error connectiing ${e}`);
            throw e;
        }
    }

    async run_query({ query, params = [] } = {}) {
        try {
            return await this.db.any(query, params);
        } catch (e) {
            console.error(`error querying ${e}`);
            throw e;
        }
    }

    async bulk_insert({ bulkData, tableName, conflict } = {}) {
        try {
            const columns = Object.keys(bulkData[0]).map(str => str.trim());
            //console.log(`inserting ${bulkData.length} records`);
            const setTable = new pgp.helpers.ColumnSet(columns, {
                table: tableName
            });
            const onConflict =
                " ON CONFLICT(" + conflict + ") DO NOTHING RETURNING *";
            const insertOnConflict =
                pgp.helpers.insert(bulkData, setTable) + onConflict;
            //  console.log("ioc + " + insertOnConflict);
            const result = await this.db.any(insertOnConflict);
            //        console.log(JSON.stringify(result));
            return result;
        } catch (e) {
            console.error(`error inserting ${e}`);
            throw e;
        }
    }
    async alt_bulk_insert({ bulkData, tableName } = {}) {
        try {
            const subsC = [
                "sf_id",
                "transformation_renew",
                "calculated_start",
                "billing_prof",
                "start_date",
                "end_date",
                "next_anniversary",
                "location"
            ];
            let c =
                tableName === "trans_subscriptions"
                    ? subsC
                    : Object.keys(bulkData[0]);
            const columns = c.map(str => str.trim());
            const setTable = new pgp.helpers.ColumnSet(columns, {
                table: tableName
            });
            const onConflict = " ON CONFLICT(sf_id) DO NOTHING RETURNING *";
            const insertOnConflict =
                pgp.helpers.insert(bulkData, setTable) + onConflict;
            const result = await this.db.any(insertOnConflict);
            return result;
        } catch (e) {
            console.error(`error inserting ${e}`);
            throw e;
        }
    }
    async streamer({ query, transformFunc }) {
        try {
            const qs = new QueryStream(query);
            const outputStream = createWriteStream(__dirname + "/data.json");

            await this.db.stream(qs, s => {
                s.pipe(JSONStream.stringify()).pipe(
                    transform(async data => {
                        console.log(data);
                        return await transformFunc(data);
                    })
                );
            });
        } catch (e) {
            console.error(e);
        }
    }

    async lookupTable(tableName) {
        try {
            const ql = `SELECT name,internal_id FROM ${tableName}`;
            return await this.db.any(ql, []);
        } catch (e) {
            console.error(e);
        }
    }
    transformer = new Transform({
        transform(chunk, encoding, callback) {
            console.log("chunk" + chunk);
            let obj = Object.assign({}, JSON.parse(chunk));
            console.log(obj);
            callback(null, JSON.stringify(obj) + "\n");
        }
    });
    async et({ query, transformFunc }) {
        try {
            const outputStream = createWriteStream(__dirname + "/data.json");
            const jsonwriter = JSONStream.stringify();
            jsonwriter.pipe(outputStream);
            const qs = new QueryStream(query);
            await this.db.stream(qs, s => {
                s.pipe(JSONStream.stringify(false)).pipe(this.transformer);
            });
        } catch (e) {
            console.error(e);
        }
    }

    async feedbackTable({ tableName }) {
        try {
            let sql = ` SELECT legacy_id,client_id,product_line,input FROM ${tableName}`;
            return await this.run_query({ query: sql });
        } catch (e) {
            console.error(e);
        }
    }

    async etl({ query, transformFunc, tableName, conflict, mappingTables }) {
        try {
            //       console.log(JSON.stringify(mappingTables));
            let done = false;
            while (!done) {
                console.log("start");
                let res = await this.run_query({ query: query });
                if (res.length === 0) {
                    console.log("done looping");
                    done = true;
                } else {
                    const maps = await Promise.all(
                        res.map(async x => {
                            const r = await transformFunc(x, mappingTables);
                            //    console.log(Object.keys(r ? r : {}).length !== 0);
                            if (Object.keys(r ? r : {}).length !== 0) return r;
                        })
                    );

                    const filt = maps.filter(element => element);
                    const insertRes = await this.bulk_insert({
                        bulkData: filt,
                        tableName: tableName,
                        conflict: conflict
                    });
                    //        done = true;
                }
            }
        } catch (e) {
            console.error(e);
        }
    }
};
