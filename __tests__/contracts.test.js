const Contract = require("../object-scripts/contracts");

describe("Test units for contracts transform", () => {
    test("Test Use Salesforce Location", async () => {
        const testarrdata = [
            {
                cc_id: 1,
                site_account: "aa1",
                location: "testtrue",
                mrr: 100
            }
        ];
        const loctest = await Contract.locationLookup({
            sf_loc: "test",
            arr_table: testarrdata,
            cc_id: testarrdata[0].cc_id
        });
        expect(loctest).toEqual("test");
    });
    test("Return max by location", async () => {
        const testarrdata = [
            {
                cc_id: 1,
                site_account: "aa1",
                location: "testtrue",
                mrr: 100
            },
            {
                cc_id: 1,
                site_account: "aa1",
                location: "testtrue",
                mrr: 100
            },
            {
                cc_id: 1,
                site_account: "aa1",
                location: "testtrue1",
                mrr: 100
            },
            {
                cc_id: 1,
                site_account: "aa1",
                location: "testtrue1",
                mrr: 50
            },
            {
                cc_id: 2,
                site_account: "aa1",
                location: "testtrue1",
                mrr: 100
            },
            {
                cc_id: 2,
                site_account: "aa1",
                location: "testtrue1",
                mrr: 20
            }
        ];
        const loctest = await Contract.locationLookup({
            arr_table: testarrdata,
            cc_id: testarrdata[0].cc_id
        });
        expect(loctest).toEqual("testtrue");
    });
    test("Return RHR when 0 mrr", async () => {
        const testarrdata = [
            {
                cc_id: 1,
                site_account: "aa1",
                location: "testtrue",
                mrr: 100
            },
            {
                cc_id: 1,
                site_account: "aa1",
                location: "testtrue",
                mrr: 100
            },
            {
                cc_id: 1,
                site_account: "aa1",
                location: "testtrue1",
                mrr: 100
            },
            {
                cc_id: 1,
                site_account: "aa1",
                location: "testtrue1",
                mrr: 50
            },
            {
                cc_id: 3,
                site_account: "aa1",
                location: "testtrue1",
                mrr: 0
            },
            {
                cc_id: 3,
                site_account: "aa1",
                location: "US-RHR",
                mrr: 0
            }
        ];
        const loctest = await Contract.locationLookup({
            arr_table: testarrdata,
            cc_id: 3
        });
        expect(loctest).toEqual("US-RHR");
    });
    test("Return Japan as default for mri japan", async () => {
        const testarrdata = [
            {
                cc_id: 1,
                site_account: "aa1",
                location: "testtrue",
                mrr: 100
            },
            {
                cc_id: 4,
                site_account: "aa1",
                location: "testtrue",
                mrr: 0
            },
            {
                cc_id: 1,
                site_account: "aa1",
                location: "testtrue1",
                mrr: 100
            },
            {
                cc_id: 1,
                site_account: "aa1",
                location: "testtrue1",
                mrr: 50
            },
            {
                cc_id: 4,
                site_account: "aa1",
                location: "testtrue1",
                mrr: 0
            },
            {
                cc_id: 3,
                site_account: "aa1",
                location: "US-RHR",
                mrr: 0
            }
        ];
        const loctest = await Contract.locationLookup({
            arr_table: testarrdata,
            cc_id: 4,
            subsid: "MRI-Japan"
        });
        expect(loctest).toEqual("Japan-MRI");
    });
});
