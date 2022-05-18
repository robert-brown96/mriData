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
    sf_end_date,
    sf_start_date,
    sf_next_ann
} = {}) => {
    let new_start;
    if (!sf_start_date || !sf_next_ann)
        throw new Error("MUST PROVIDE START AND END DATES");

    const prevAnn = sub(new Date(sf_next_ann), { years: 1 });
    if (!isAfter(new Date(sf_start_date), new Date(prevAnn)))
        new_start = prevAnn;
    else new_start = sf_start_date;

    return new_start;
};
