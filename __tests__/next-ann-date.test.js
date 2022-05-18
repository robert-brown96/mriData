const {
    add,
    sub,
    isBefore,
    isAfter,
    setMonth,
    isValid,
    setYear,
    isEqual
} = require("date-fns");

require("dotenv").config();
const GLD = process.env.GO_LIVE_DATE;

const { calc_next_ann_date } = require("../lib/dates/next-ann-date");

describe("Calculate Next Anniversary Date for Contract Container", () => {
    test("Salesforce Next Anniversary is on Go Live", () => {
        const input = {
            sf_next_ann: "10/1/2022"
        };

        const new_end = calc_next_ann_date(input);
        expect(new_end).toEqual(add(new Date(input.sf_next_ann), { years: 1 }));
    });
    test("Salesforce Next Anniversary is before Go Live", () => {
        const input = {
            sf_next_ann: "9/1/2022"
        };

        const new_end = calc_next_ann_date(input);
        expect(new_end).toEqual(add(new Date(input.sf_next_ann), { years: 1 }));
    });
    test("Salesforce Next Anniversary is after Go Live", () => {
        const input = {
            sf_next_ann: "10/31/2022"
        };

        const new_end = calc_next_ann_date(input);
        expect(new Date(new_end)).toEqual(
            add(new Date(input.sf_next_ann), { years: 0 })
        );
    });
});

describe("Calculate End Date: Test invalid parameters", () => {
    test("Pass null parameter throws error", () => {
        expect(() => calc_next_ann_date()).toThrow(
            "MUST PROVIDE NEXT ANNIVERSARY DATE"
        );
    });
    test("Pass null next ann date parameter throws error", () => {
        const input = {
            sf_next_ann: ""
        };
        expect(() => calc_next_ann_date(input)).toThrow(
            "MUST PROVIDE NEXT ANNIVERSARY DATE"
        );
    });
});
