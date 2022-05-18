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
        console.log(`check ${JSON.stringify(this)}`);
        this.test_connect();
    }
    set_db(stage) {
        console.log(stage);
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

    async bulk_insert({ bulkData } = {}) {
        try {
            return await this.db.any(query, params);
        } catch (e) {
            console.error(`error inserting ${e}`);
            throw e;
        }
    }
};
