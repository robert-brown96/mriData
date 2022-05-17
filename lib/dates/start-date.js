const {
    add,
    sub,
    isBefore,
    isAfter,
    setMonth,
    isValid,
    setYear,
    isEqual,
    isSameDay,
    differenceInCalendarDays
} = require("date-fns");

require("dotenv").config();
const GLD = process.env.GO_LIVE_DATE;

module.exports.calc_start_date = ({
    calc_start,
    evergreen_term,
    sf_end_date
} = {}) => {
    let new_start;
    if (!calc_start || !sf_end_date)
        throw new Error("MUST PROVIDE START AND END DATES");
};
