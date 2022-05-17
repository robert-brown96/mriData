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

const { calc_bill_start_date } = require("../lib/date-functions");

describe("Test Calculating 90 Days in Advance", () => {
    test("Add 3 Months to Go Live Date", () => {
        const advanceBillingStart = add(new Date(GLD), { months: 3 });
        expect(advanceBillingStart).toEqual(new Date("10/1/2022"));
    });
});

describe("Billing Start Date: Test for Annual Billing", () => {
    test("Billing Start Date: Pass Set Annual Billing Next Ann is equal to Go Live Date", () => {
        const input = {
            charge_schedule: "Annual",
            sf_next_ann: "10/1/2022"
        };

        const new_start = calc_bill_start_date(input);
        expect(new_start).toEqual(input.sf_next_ann);
    });
    test("Billing Start Date: Pass Set Annual Billing Start Date mid month", () => {
        const input = {
            charge_schedule: "Annual",
            sf_next_ann: "10/8/2022"
        };

        const new_start = calc_bill_start_date(input);
        expect(new_start).toEqual(input.sf_next_ann);
    });
    test("Billing Start Date: Pass Set Annual Billing Start Date before go live", () => {
        const input = {
            charge_schedule: "Annual",
            sf_next_ann: "9/8/2022"
        };

        const new_start = calc_bill_start_date(input);
        expect(new Date(new_start)).toEqual(
            add(new Date(input.sf_next_ann), { years: 1 })
        );
    });
});

describe("Billing Start Date: Test for Biannual Billing", () => {
    test("Billing Start Date: Pass Set Biannual Billing Next Ann is equal to Go Live Date", () => {
        const input = {
            charge_schedule: "Biannual",
            sf_next_ann: "10/1/2022"
        };

        const new_start = calc_bill_start_date(input);
        expect(new_start).toEqual(input.sf_next_ann);
    });
    test("Billing Start Date: Pass Set Biannual Billing Start Date mid month", () => {
        const input = {
            charge_schedule: "Biannual",
            sf_next_ann: "10/8/2022"
        };

        const new_start = calc_bill_start_date(input);
        expect(new_start).toEqual(input.sf_next_ann);
    });
    test("Billing Start Date: Pass Set Annual Billing Start Date before go live", () => {
        const input = {
            charge_schedule: "Biannual",
            sf_next_ann: "9/8/2022"
        };

        const new_start = calc_bill_start_date(input);
        expect(new Date(new_start)).toEqual(
            add(new Date(input.sf_next_ann), { months: 6 })
        );
    });
});

describe("Billing Start Date: Test for Monthly Billing", () => {
    test("Billing Start Date: Pass Set Monthly Billing Start Date on first of month", () => {
        const input = {
            charge_schedule: "Monthly",
            sf_next_ann: "10/1/2022"
        };

        const new_start = calc_bill_start_date(input);
        expect(new_start).toEqual(new Date("7/1/2022"));
    });
    test("Billing Start Date: Pass Set Monthly Billing Start Date mid month", () => {
        const input = {
            charge_schedule: "Monthly",
            sf_next_ann: "10/8/2022"
        };

        const new_start = calc_bill_start_date(input);
        expect(new_start.getMonth()).toBe(new Date(GLD).getMonth());
        expect(new_start.getDate()).toBe(new Date(input.sf_next_ann).getDate());
    });
});

describe("Billing Start Date: Test invalid parameters", () => {
    test("Pass null charge schedule throws error", () => {
        const input = {
            sf_next_ann: "10/1/2022"
        };
        expect(() => calc_bill_start_date(input)).toThrow(
            "Unrecognized Charge Schedule"
        );
    });
    test("Pass null next anniversary parameter throws error", () => {
        const input = {
            charge_schedule: "Monthly"
        };
        expect(() => calc_bill_start_date(input)).toThrow(
            "NEXT ANNIVERSARY IS REQUIRED PARAMETER"
        );
    });
    test("Pass null parameter throws error", () => {
        expect(() => calc_bill_start_date()).toThrow(
            "NEXT ANNIVERSARY IS REQUIRED PARAMETER"
        );
    });
});
