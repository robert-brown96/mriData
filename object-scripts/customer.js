const DbService = require("../lib/db/db-service");

// get data from db
//  read into stream
//  transform to db

/** transformed fields
 * name
 * companyname
 * clienttype
 * customerclass
 *
 */
/**
 * @typedef {Object} SfAccount
 * @property {String} sf_id
 * @property {String} client_id
 * @property {String} client_type
 * @property {String} companyname
 * @property {String} residential_prop_class
 * @property {String} commercial_prop_class
 * @property {String} corporate_prop_class
 *
 */
/**
 * @typedef {Object} TransCustomer
 * @property {String} sf_id
 * @property {String} client_id
 * @property {Number[]} client_type
 * @property {String} companyname
 * @property {String} name
 * @property {Number[]} residential_prop_class
 * @property {Number[]} commercial_prop_class
 * @property {Number[]} corporate_prop_class
 *
 */

/**
 * @constant {String} sfAccountQl
 */
const sfAccountQl = `SELECT
                        a. "Id" AS sf_id,
                        a. "Client_Id__c" AS client_id,
                        a. "Client_Type__c" AS client_type,
                        a. "name" AS companyname,
                        a. "Residential_Property_Class__c" AS residential_prop_class,
                        a. "Commercial_Property_Class__c" AS commercial_prop_class,
                        a. "Corporate_Property_Class__c" AS corporate_prop_class
                    FROM
                        sf_accounts a
                    WHERE
                        a."Client_Id__c" NOT IN(
                            SELECT
                                client_id FROM trans_customers) LIMIT 25000;
                    `;

/**
 *
 * @param {*} table
 * @param {*} value
 * @returns
 */
const convert_multi_select = async (table, value) => {
    return await new Promise(resolve => {
        //    console.log(table);
        const tableUse = table.reduce(
            (o, key) => ({
                ...o,
                [key.name]: key.internal_id
            }),
            {}
        );
        let split = value.split(";");
        let return_value = [];
        for (let i = 0; i < split.length; i++) {
            let t = split[i];
            if (t) {
                let temp = tableUse[t.trim()];
                if (temp && temp !== "") return_value.push(temp);
            }
        }
        resolve(return_value);
    });
};

/**
 *
 * @param {String} client_id
 * @param {String} name
 * @returns {{companyname,name}}
 */
const trimNames = async (client_id, name) => {
    try {
        const concat = `${client_id} ${name}`;
        return {
            companyname: name.substring(0, 79),
            name: concat.substring(0, 79)
        };
    } catch (e) {
        console.log(`ERROR FIR ${client_id} and ${name}`);
        console.error(e);
    }
};

/**
 *
 * @param {SfAccount} sfAccount
 * @returns {TransCustomer}
 */
const transformAccount = async (sfAccount, mappingTables) => {
    //console.log("ta" + JSON.stringify(sfAccount));
    const nameObj = await trimNames(sfAccount.client_id, sfAccount.companyname);

    const residential = convert_multi_select(
        mappingTables.residentialClass,
        sfAccount.residential_prop_class
    );
    const commercial = convert_multi_select(
        mappingTables.commercialClass,
        sfAccount.commercial_prop_class
    );
    const corporate = convert_multi_select(
        mappingTables.corporateClass,
        sfAccount.corporate_prop_class
    );

    const client_type = await convert_multi_select(
        mappingTables.clientTypes,
        sfAccount.client_type
    );
    const [rps, comps, corps] = await Promise.all([
        residential,
        commercial,
        corporate
    ]);
    return {
        client_id: sfAccount.client_id,
        companyname: nameObj.companyname,
        name: nameObj.name,
        sf_id: sfAccount.sf_id,
        client_type: client_type.join(","),
        customer_class: [...rps, ...comps, ...corps].join(",")
    };
};

const streamer = async () => {
    try {
        const dbServ = new DbService();
        const clientTypesProm = dbServ.lookupTable("map_clienttype");
        const commercialClassProm = dbServ.lookupTable("map_clienttype");
        const corporateClassProm = dbServ.lookupTable("map_clienttype");
        const residentialClassProm = dbServ.lookupTable("map_clienttype");
        const [clientTypes, commercialClass, corporateClass, residentialClass] =
            await Promise.all([
                clientTypesProm,
                commercialClassProm,
                corporateClassProm,
                residentialClassProm
            ]);

        await dbServ.etl({
            query: sfAccountQl,
            transformFunc: transformAccount,
            tableName: "trans_customers",
            conflict: "client_id",
            mappingTables: {
                clientTypes: clientTypes,
                commercialClass: commercialClass,
                corporateClass: corporateClass,
                residentialClass: residentialClass
            }
        });
    } catch (e) {
        console.error(e);
    }
};

const writeOut = async () => {
    const dbServ = new DbService();
    const d = require("../lib/db/data.json");
    dbServ.bulk_insert({
        bulkData: d,
        tableName: "trans_customers",
        conflict: "client_id"
    });
};

module.exports = {
    convert_multi_select,
    trimNames,
    transformAccount,
    streamer,
    writeOut
};
