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

const { calc_start_date } = require("../lib/dates/start-date");

describe("Calculate Start Date for Contract Container", () => {
    test("Start of Contract is before Next Anniversary - 1 Year", () => {
        const input = {
            sf_start_date: "1/2/2015",
            sf_next_ann: "3/1/2023"
        };
        const new_start = calc_start_date(input);
        expect(new_start).toEqual(
            sub(new Date(input.sf_next_ann), { years: 1 })
        );
    });
    test("Start of Contract is on Next Anniversary - 1 Year", () => {
        const input = {
            sf_start_date: "3/1/2022",
            sf_next_ann: "3/1/2023"
        };
        const new_start = calc_start_date(input);
        expect(new_start).toEqual(
            sub(new Date(input.sf_next_ann), { years: 1 })
        );
    });
    test("Start of Contract is after Next Anniversary - 1 Year", () => {
        const input = {
            sf_start_date: "3/10/2022",
            sf_next_ann: "3/1/2023"
        };
        const new_start = calc_start_date(input);
        expect(new Date(new_start)).toEqual(new Date(input.sf_start_date));
    });
});
describe("Calculate End Date: Test invalid parameters", () => {
    test("Pass null parameter throws error", () => {
        expect(() => calc_start_date()).toThrow(
            "MUST PROVIDE START AND END DATES"
        );
    });
    test("Pass null next ann date parameter throws error", () => {
        const input = {
            sf_next_ann: ""
        };
        expect(() => calc_start_date(input)).toThrow(
            "MUST PROVIDE START AND END DATES"
        );
    });
    test("Pass null start date parameter throws error", () => {
        const input = {
            sf_next_ann: "1/2/2023"
        };
        expect(() => calc_start_date(input)).toThrow(
            "MUST PROVIDE START AND END DATES"
        );
    });
});
