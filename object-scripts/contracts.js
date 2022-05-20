const { isAfter } = require("date-fns");
const _ = require("lodash");
const DbService = require("../lib/db/db-service");
const { calc_start_date } = require("../lib/dates/start-date");
const { calc_end_date } = require("../lib/dates/end-date");
const { calc_bill_start_date } = require("../lib/dates/billing-start");
const { calc_next_ann_date } = require("../lib/dates/next-ann-date");

// get data from db
//  read into stream
//  transform to db

/** transformed fields
 * location
 * start_date
 * end_date
 * next_anniversary
 * billing_prof
 *
 */
/**
 * @typedef {Object} SfContract
 * @property {String} sf_id
 * @property {String} sf_loc
 * @property {Date} sf_start
 * @property {Date} sf_end
 * @property {Date} sf_next_ann
 * @property {String} charge_schedule
 * @property {String} sf_bp
 * @property {Number} evergreen_term
 * @property {String} subsid
 */
/**
 * @typedef {Object} NsSubscription
 * @property {String} sf_id
 * @property {Boolean} transformation_renew
 * @property {Date} calculated_start
 * @property {Date} calculated_end
 * @property {Date} calc_next_ann
 * @property {String} billing_prof
 * @property {Date} start_date
 * @property {Date} end_date
 * @property {Date} next_anniversary
 * @property {String} location
 */

const contractQl = `SELECT
                        cc. "Id" AS sf_id,
                        cc. "Location__c" AS sf_loc,
                        cc. "Start_Date__c" AS sf_start,
                        cc. "End_Date__c" AS sf_end,
                        cc. "Next_Anniversary_Date__c" AS sf_next_ann,
                        cc. "Charge_Schedule__c" AS charge_schedule,
                        cc. "Billing_Profile__c" AS sf_bp,
                        cc. "Auto_Renewal_Term_months__c" AS evergreen_term,
                        sfa."Subsidiary__c" as subsid
                    FROM
                        sf_contract_containers cc
                        LEFT JOIN sf_accounts sfa ON cc."Account__r.id" = sfa."Id"
                    WHERE
                        cc. "Id" NOT IN(
                            SELECT
                                sf_id FROM trans_subscriptions)
                    LIMIT 10000;`;

const arrQl = `SELECT
                a. "Contract_Container__r.Id" AS cc_id,
                a. "Site_Account_Id__c" AS site_account,
                a. "Location_API_Name__c" AS "location",
                sum(a. "Monthly_Rate__c") AS mrr
            FROM
                asset_transactions a
            WHERE
                a. "Location_API_Name__c" != ''
                AND a. "Contract_Container__r.Id" != ''
            GROUP BY
                a. "Contract_Container__r.Id",
                a. "Site_Account_Id__c",
                a. "Location_API_Name__c";
`;

/**
 *
 * @param {Class} param0
 * @returns
 */
const arrTable = async ({ dbs }) => {
    try {
        return await dbs.run_query({ query: arrQl });
    } catch (e) {
        console.error(`location lookup error: ${e}`);
    }
};

/**
 *
 * @param {Object} param0
 * @param {String} param0.sf_loc
 * @param {Object[]} param0.arr_table
 * @returns {String}
 */
const locationLookup = async ({ sf_loc, arr_table, cc_id, subsid }) => {
    try {
        //    console.log(`loc ${sf_loc} cc is ${cc_id} sub is ${subsid}`);
        let loc;
        // return salesfroce location
        if (sf_loc) return sf_loc;

        const arr_data = arr_table.filter(obj => obj.cc_id === cc_id);

        const max = _.maxBy(arr_data, obj => obj.mrr);
        if (max && max.mrr > 0) return max.location;

        const rhr = _.find(arr_data, ["location", "US-RHR"]);
        const res_check = _.find(arr_data, ["location", "US-Resident Check"]);
        const mda = _.find(arr_data, ["location", "South Africa-MDA"]);
        const au_rock = _.find(arr_data, ["location", "Australia-Rockend"]);
        const nz_rock = _.find(arr_data, ["location", "New Zealand-Rockend"]);
        if (rhr) {
            location = "US-RHR";
        } else if (res_check) {
            location = "US-Resident Check";
        } else if (mda) {
            location = "South Africa-MDA";
        } else if (au_rock) {
            location = "Australia-Rockend";
        } else if (nz_rock) {
            location = "New Zealand-Rockend";
        } else {
            // use default location by subsidiary

            switch (subsid) {
                case "MRI-US":
                    location = "US-MRI";
                    break;
                case "MRI-UK":
                    location = "UK-MRI";
                    break;
                case "MRI-Canada":
                    location = "Canada-MRI";
                    break;
                case "MRI-Ireland":
                    location = "Ireland-Orchard";
                    break;
                case "MRI-South Africa":
                    location = "South Africa-MRI";
                    break;
                case "MRI-Australia":
                    location = "Australia-MRI";
                    break;
                case "MRI-Singapore":
                    location = "Singapore-MRI";
                    break;
                case "MRI-New Zealand":
                    location = "New Zealand-Qube";
                    break;
                case "MRI-Hong Kong":
                    location = "Hong Kong-MRI";
                    break;
                case "MRI-Japan":
                    location = "Japan-MRI";
                    break;
                case "MRI-India-Leverton":
                    location = "India-Leverton";
                    break;
            }
        }
        return location;
    } catch (e) {
        console.error(`location lookup error: ${e}`);
    }
};

/**
 *
 * @param {SfContract} contract
 * @param {*} mappingTables
 */
const transformFunc = async (contract, mappingTables) => {
    try {
        /** @type {NsSubscription} */
        let sub = {};
        sub.sf_id = contract.sf_id;
        sub.location = await locationLookup({
            sf_loc: contract.sf_loc ? contract.sf_loc : null,
            arr: mappingTables.arr,
            subsid: contract.subsid,
            cc_id: contract.sf_id
        });
        const datePromise = await new Promise(resolve => {
            sub.start_date = calc_start_date({
                sf_start_date: contract.sf_start,
                sf_next_ann: contract.sf_next_ann
            });
            sub.end_date = calc_end_date({
                calc_start: sub.start_date,
                evergreen_term: contract.evergreen_term,
                sf_end_date: contract.sf_end
            });
            sub.next_anniversary = calc_next_ann_date({
                sf_next_ann: contract.sf_next_ann
            });
            sub.calculated_start = calc_bill_start_date({
                charge_schedule: contract.charge_schedule,
                sf_next_ann: contract.sf_next_ann
            });
            resolve();
        });

        sub.transformation_renew = isAfter(
            new Date(sub.next_ann),
            new Date(contract.sf_next_ann)
        );
        sub.billing_prof = contract.sf_bp;
        return sub;
    } catch (e) {
        console.error(e);
    }
};

const streamer = async () => {
    try {
        const dbServ = new DbService();
        const arr = await arrTable({ dbs: dbServ });
        //    console.log("arr " + JSON.stringify(arr[0]));
        await dbServ.etl({
            query: contractQl,
            transformFunc: transformFunc,
            tableName: "trans_subscriptions",
            conflict: "sf_id",
            mappingTables: {
                arr: arr
            }
        });
    } catch (e) {
        console.error(e);
    }
};

module.exports = { streamer, locationLookup };
