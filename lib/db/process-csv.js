const papa = require("papaparse");
const { readFileSync } = require("fs");

const csvPrep = async file => {
    const csv = readFileSync(file, "utf8");
    const jsonData = papa.parse(csv, { header: true });
    return jsonData.data;
};

module.exports = { csvPrep };
