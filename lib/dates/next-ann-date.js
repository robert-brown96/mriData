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

module.exports.calc_next_ann_date = ({ sf_next_ann } = {}) => {
    let new_next_ann;
    const advanceBillingStartPlus100 = add(new Date(GLD), {
        months: 3
    });
    if (!sf_next_ann) throw new Error("MUST PROVIDE NEXT ANNIVERSARY DATE");

    if (!isAfter(new Date(sf_next_ann), new Date(advanceBillingStartPlus100)))
        new_next_ann = add(new Date(sf_next_ann), { years: 1 });
    else new_next_ann = sf_next_ann;

    return new_next_ann;
};
