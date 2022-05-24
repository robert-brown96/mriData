const { streamer: runSubs } = require("./object-scripts/contracts");
/**
 * @typedef {Object} argsObj
 *
 * @property {String} mode - indicates which function to run
 * @property {String} [path] - path to file if inserting to db
 * @property {String} [table] - table name if inserting to db
 */
/**
 * @type {argsObj}
 */
const args = require("minimist")(process.argv.slice(2));
console.log(args.path);
if (!args.mode) throw new Error("MUST PROVIDE A MODE");

switch (args.mode) {
    case "insert": {
        if (!args.path || !args.table)
            throw new Error(
                `MISSING ARGUMENT. PATH=${args.path} -- TABLE=${args.table}`
            );
        console.log(args.path + " " + args.table);
        break;
    }
    case "subscription": {
        runSubs();
        break;
    }
}
