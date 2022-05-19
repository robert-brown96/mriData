const {
    convert_multi_select,
    trimNames
} = require("../object-scripts/customer");

const testTable = [
    { name: "Owner/GP", internal_id: 7 },
    { name: "Developer", internal_id: 1 },
    { name: "Occupier", internal_id: 8 },
    { name: "Owner/Operator", internal_id: 3 },
    { name: "Fee Manager", internal_id: 4 }
];
describe("Test Converting MultiSelect to Number Array", () => {
    test("Successfully Converts to Numbfer Array Length 1", async () => {
        const testVal = "Owner/GP";
        const testConvert = await convert_multi_select(testTable, testVal);
        expect(testConvert).toEqual([7]);
    });

    test("Successfully Converts to Numbfer Array Length 4", async () => {
        const testVal = "Developer;Owner/GP;Owner/Operator;Fee Manager";
        const testConvert = await convert_multi_select(testTable, testVal);
        expect(testConvert).toEqual([1, 7, 3, 4]);
    });

    test("Successfully Converts to Numbfer Array Length 4", async () => {
        const testVal = "";
        const testConvert = await convert_multi_select(testTable, testVal);
        expect(testConvert).toEqual([]);
    });
});

describe("Test Trimming Names", () => {
    test("Successfully returns concatenated client id and company name", async () => {
        const client_id = "V621999";
        const name = "Test Customer";
        const testConvert = await trimNames(client_id, name);
        const expected = { companyname: name, name: `${client_id} ${name}` };
        expect(testConvert).toMatchObject(expected);
    });

    test("Successfully returns concatenated client id and company name for over 80", async () => {
        const client_id = "ZQ70999";
        const name =
            "BRADFIELD AND PRICHARD REAL ESTATE CONSULTANTS PTY LTD ATF BENSON AND GUTH UNIT TRUST";
        const concatname =
            "BRADFIELD AND PRICHARD REAL ESTATE CONSULTANTS PTY LTD ATF BENSON AND GUTH UNIT";
        const testConvert = await trimNames(client_id, name);
        const expected = {
            companyname: concatname,
            name: `${client_id} ${name}`.substring(0, 79)
        };
        expect(testConvert).toMatchObject(expected);
    });
});
