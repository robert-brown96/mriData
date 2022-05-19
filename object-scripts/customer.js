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

