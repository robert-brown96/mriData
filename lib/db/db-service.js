const pgp = require("pg-promise");
require("dotenv").config();
const STAGE = process.env.STAGE;

module.exports = class DbService {
    constructor() {
        this.host = process.env.DB_HOST;
        this.port = process.env.DB_PORT;
        this.user = process.env.DB_USERNAME;
        this.password = process.env.DB_PASSWORD;
        this.database = set_db(STAGE);
        this.db = pgp(this);
        console.log(`check ${this}`);
        this.test_connect();
    }
    set_db = stage => {
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
    };
    test_connect = async () => {
        try {
            const res = await this.db.connect();
            res.done();
            return res.client.serverVersion;
        } catch (e) {
            console.error(`error connectiing ${e}`);
            throw e;
        }
    };
};
