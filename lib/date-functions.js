const {
    add,
    sub,
    isBefore,
    isAfter,
    setMonth,
    isValid,
    setYear,
    isEqual,
    isSameDay
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
            console.log(`is before go live: ${beforeGoLive}`);
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
                let counter = 1;
                do {
                    new_start = add(new Date(sf_next_ann), {
                        months: 6 * counter
                    });
                    counter++;
                } while (
                    isBefore(new Date(new_start), new Date(advanceBillingStart))
                );
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
