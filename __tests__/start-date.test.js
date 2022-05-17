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
    test("Start of Contract is before Next Anniversary - 1 Year");
    test("Start of Contract is after Next Anniversary - 1 Year");
});
