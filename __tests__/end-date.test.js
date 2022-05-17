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

const { calc_end_date } = require("../lib/dates/end-date");

describe("Calculate End Date for Contracts with Non Renewal", () => {
    test("Non auto renewals do not change end date for null evergreen", () => {
        const input = {
            calc_start: "10/1/2022",
            sf_end_date: "9/30/2023"
        };

        const new_end = calc_end_date(input);
        expect(new_end).toEqual(input.sf_end_date);
    });
    test("Non auto renewals do not change end date for 0 evergreen", () => {
        const input = {
            calc_start: "10/1/2022",
            sf_end_date: "9/30/2023",
            evergreen_term: 0
        };

        const new_end = calc_end_date(input);
        expect(new_end).toEqual(input.sf_end_date);
    });
});

describe("Calculate End Date for Contracts with Auto Renewal", () => {
    test("End date is after go live + 100 days", () => {
        const input = {
            calc_start: "10/1/2022",
            sf_end_date: "9/30/2023",
            evergreen_term: 12
        };

        const new_end = calc_end_date(input);
        expect(new_end).toEqual(input.sf_end_date);
    });
    test("End date is before go live + 100 days", () => {
        const input = {
            calc_start: "10/1/2022",
            sf_end_date: "9/30/2022",
            evergreen_term: 12
        };

        const new_end = calc_end_date(input);
        expect(new_end).toEqual(
            add(new Date(input.sf_end_date), { months: input.evergreen_term })
        );
    });
});

describe("Calculate End Date: Test invalid parameters", () => {
    test("Pass null parameter throws error", () => {
        expect(() => calc_end_date()).toThrow(
            "MUST PROVIDE START AND END DATES"
        );
    });
    test("Pass null start date parameter throws error", () => {
        const input = {
            sf_end_date: "10/1/2022"
        };
        expect(() => calc_end_date(input)).toThrow(
            "MUST PROVIDE START AND END DATES"
        );
    });
    test("Pass null end date throws error", () => {
        const input = {
            calc_start: "10/1/2022"
        };
        expect(() => calc_end_date(input)).toThrow(
            "MUST PROVIDE START AND END DATES"
        );
    });
});
