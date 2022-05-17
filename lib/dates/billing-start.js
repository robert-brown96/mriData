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
    differenceInCalendarMonths
} = require("date-fns");

require("dotenv").config();
const GLD = process.env.GO_LIVE_DATE;

let mod = {};
mod.calc_bill_start_date = ({ charge_schedule, sf_next_ann } = {}) => {
    let new_start;
    // throw error if no next anniversary
    if (!sf_next_ann) throw new Error("NEXT ANNIVERSARY IS REQUIRED PARAMETER");
    const go_live_date = new Date(GLD);
    const advanceBillingStart = add(new Date(go_live_date), { months: 3 });
    // check if next anniversary is after go live
    const beforeGoLive = isBefore(new Date(sf_next_ann), advanceBillingStart);
    switch (charge_schedule) {
        case "Annual": {
            if (!beforeGoLive) {
                new_start = sf_next_ann;
            } else {
                new_start = add(new Date(sf_next_ann), { years: 1 });
            }
            break;
        }
        case "Biannual": {
            if (isEqual(new Date(advanceBillingStart), new Date(sf_next_ann))) {
                new_start = sf_next_ann;
            } else if (beforeGoLive) {
                // add 6 months to next ann until it is after the in advance billing start
                let counter = 1;
                do {
                    new_start = add(new Date(sf_next_ann), {
                        months: 6 * counter
                    });
                    counter++;
                } while (
                    isBefore(new Date(new_start), new Date(advanceBillingStart))
                );
            } else {
                // subtract 6 months from next ann
                const less6 = sub(new Date(sf_next_ann), { months: 6 });
                // if less 6 months is after advance billing start, it is new start date
                if (!isBefore(new Date(less6), new Date(go_live_date)))
                    new_start = less6;
                else new_start = sf_next_ann;
            }
            break;
        }
        case "Quarterly": {
            if (isEqual(new Date(advanceBillingStart), new Date(sf_next_ann))) {
                new_start = sf_next_ann;
            } else if (beforeGoLive) {
                // add 3 months to next ann until it is after the in advance billing start
                let counter = 1;
                do {
                    new_start = add(new Date(sf_next_ann), {
                        months: 3 * counter
                    });
                    counter++;
                } while (
                    isBefore(new Date(new_start), new Date(advanceBillingStart))
                );
            } else {
                // check number of months between dates
                const distance = differenceInCalendarMonths(
                    new Date(sf_next_ann),
                    new Date(advanceBillingStart)
                );
                if (distance < 3) new_start = sf_next_ann;
                else if (distance >= 3 && distance < 6)
                    new_start = sub(new Date(sf_next_ann), { months: 3 });
                else if (distance >= 6 && distance < 9)
                    new_start = sub(new Date(sf_next_ann), { months: 6 });
                else if (distance >= 9 && distance <= 12)
                    new_start = sub(new Date(sf_next_ann), { months: 9 });
            }
            break;
        }
        case "Monthly": {
            let go_live_month = go_live_date.getMonth();
            new_start = setMonth(new Date(sf_next_ann), go_live_month);
            new_start = setYear(new Date(new_start), 2022);
            break;
        }
        default: {
            throw new Error("Unrecognized Charge Schedule");
        }
    }
    return new_start;
};

module.exports = mod;
