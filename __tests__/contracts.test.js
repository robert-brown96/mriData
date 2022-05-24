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

describe("Tests Billing Profile Feedback", () => {
    const testFeedback = [
        {
            legacy_id: "leg1",
            input: "Bill to Parent, Split by Site"
        },
        {
            legacy_id: "leg2",
            input: "Bill to Parent, Split by Site"
        },
        {
            legacy_id: "leg3",
            input: "Bundled Fee to Parent, Site Level Detail"
        }
    ];
    test("Returns based on legacy ref", () => {
        const bpRes = Contract.bpLookup({
            contract: { legacy_id: "leg3" },
            bpFeedback: testFeedback
        });
        expect(bpRes).toEqual("Bundled Fee to Parent, Site Level Detail");
    });
    test("Returns existing on contract for MRI US", () => {
        const bpRes = Contract.bpLookup({
            contract: {
                legacy_id: "leg4",
                billing_prof: "Split by Contracting Group"
            },
            bpFeedback: testFeedback,
            location: "US-MRI"
        });
        expect(bpRes).toEqual("Split by Contracting Group");
    });
    test("Returns Bill to Sites for CallMax", () => {
        const bpRes = Contract.bpLookup({
            contract: {
                legacy_id: "leg4",
                billing_prof: "Split by Contracting Group"
            },
            bpFeedback: testFeedback,
            location: "US-CallMax"
        });
        expect(bpRes).toEqual("Bill to Sites");
    });
    test("Returns Bill to Sites for Resident Check", () => {
        const bpRes = Contract.bpLookup({
            contract: {
                legacy_id: "leg4",
                billing_prof: "Split by Contracting Group"
            },
            bpFeedback: testFeedback,
            location: "US-Resident Check"
        });
        expect(bpRes).toEqual("Bill to Sites");
    });
    test("Returns Bundled Fee to Parent for Tenmast", () => {
        const bpRes = Contract.bpLookup({
            contract: {
                billing_prof: "Split by Contracting Group"
            },
            bpFeedback: testFeedback,
            location: "US-Tenmast"
        });
        expect(bpRes).toEqual("Bundled Fee to Parent");
    });
    test("Returns Bundled Fee to Parent for blank Billing Profile", () => {
        const bpRes = Contract.bpLookup({
            contract: {
                billing_prof: ""
            },
            bpFeedback: testFeedback,
            location: "US-MRI"
        });
        expect(bpRes).toEqual("Bundled Fee to Parent");
    });
});
