const papa = require("papaparse");
const { readFileSync } = require("fs");
const DbService = require("./db-service");

///////////////////////////////////////////////////////////

const MapService = class {
    accountMap = csvData => {
        return csvData.map(col => {
            return {
                id: col["Id"],
                name: col.name,
                Contracting_Group_Rollup__c: col.Contracting_Group_Rollup__c
            };
        });
    };
};

const csvPrep = async file => {
    const csv = readFileSync(file, "utf8");
    const jsonData = papa.parse(csv, { header: true });
    console.log(JSON.stringify(jsonData[0]));
    return jsonData.data;
};

const sendCsvToDB = async ({ filePath, table } = {}) => {
    try {
        const jsonData = await csvPrep(filePath);
        const dbService = new DbService();
        const res = await dbService.bulk_insert({
            bulkData: jsonData,
            tableName: table
        });
        console.log(JSON.stringify(res));
    } catch (e) {
        console.error(`ERROR SECNDING TO DB ${e}`);
    }
};

module.exports = { sendCsvToDB };
