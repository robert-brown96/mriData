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

module.exports.calc_end_date = ({
    calc_start,
    evergreen_term,
    sf_end_date
} = {}) => {
    let new_end;
    if (!calc_start || !sf_end_date)
        throw new Error("MUST PROVIDE START AND END DATES");
    if (!evergreen_term || evergreen_term === 0) new_end = sf_end_date;
    else {
        // calculate for auto renewals
        const distanceStartToEnd = differenceInCalendarDays(
            new Date(sf_end_date),
            new Date(GLD)
        );
        console.log(`Distance between start and end : ${distanceStartToEnd}`);
        // check if less than 100 days out
        if (distanceStartToEnd <= 100) {
            let counter = 1;
            do {
                new_end = add(new Date(sf_end_date), {
                    months: evergreen_term * counter
                });
            } while (!isAfter(new Date(new_end), new Date(calc_start)));
        } else new_end = sf_end_date;
    }

    return new_end;
};
