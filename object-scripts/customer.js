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
                        a. "Id" NOT IN(
                            SELECT
                                sf_id FROM trans_customers);
                    `;

/**
 *
 * @param {*} table
 * @param {*} value
 * @returns
 */
module.exports.convert_multi_select = (table, value) => {
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
    return return_value;
};

/**
 *
 * @param {String} client_id
 * @param {String} name
 * @returns {{companyname,name}}
 */
module.exports.trimNames = (client_id, name) => {
    const concat = `${client_id} ${name}`;
    return {
        companyname: name.substring(0, 79),
        name: concat.substring(0, 79)
    };
};
