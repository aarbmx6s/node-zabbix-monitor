/**
 * @typedef {Object} MongoDBStats
 * @property {String} conn
 * @property {String} query
 * @property {String} insert
 * @property {String} update
 * @property {String} delete
 */

/**
 * @typedef {Object} MongoDBTop
 */

/**
 * @typedef {Object} CollectionStats
 * @property {Object[]} stats
 * @property {String} stats.host
 * @property {Number} stats.connection
 * @property {Number} stats.delete
 * @property {Number} stats.insert
 * @property {Number} stats.query
 * @property {Number} stats.update
 */

const { exec } = require("child_process");
const argv = require("yargs").argv;

/**
 * @param {Object<String, MongoDBStats>} stats
 * @param {MongoDBTop} top
 * @returns {CollectionStats}
 */
function processMongoStats(stats, top) {
    /**  @type {CollectionStats} */
    let collection = {
        stats: []
    };

    for ( let host in stats ) {
        /** @type {MongoDBStats} */
        let s = stats[host];

        collection.stats.push({
            host: host,
            connection: parseInt(s.conn),
            delete: parseInt(s.delete.replace("*", "")),
            insert: parseInt(s.insert.replace("*", "")),
            query:parseInt(s.query.replace("*", "")),
            update:parseInt(s.update.replace("*", "")),
        });
    }

    return collection;
}

/**
 * @param {String} cmd
 * @returns {Promise<String>}
 */
function execute(cmd) {
    return new Promise(function(resolve, reject) {
        let child = exec(cmd);
        let data = "";

        function errorHandler(error) {
            reject(error);
        }
        function exitHandler(code, signal) {
            reject(new Error(`Process has been exited with ${code} code.`));
        }
        function endHandler() {
            child.stdout.off("end", endHandler);
            child.stdout.off("data", dataHandler);
            
            child.stderr.unpipe(process.stderr);

            child.off("exit", exitHandler);
            child.off("error", errorHandler);

            child.kill("SIGTERM");

            resolve(data);
        }
        function dataHandler(chunk) {
            data += chunk;
        }

        child.on("error", errorHandler);
        child.on("exit", exitHandler);

        child.stderr.pipe(process.stderr);

        child.stdout.setEncoding("utf8");
        child.stdout.on("data", dataHandler);
        child.stdout.on("end", endHandler);
    });
}

async function run() {
    let stats = await Promise.all([
        execute(`mongostat --humanReadable=false --json -o='conn,query,insert,update,delete' -n=1 1`),
        // execute("mongotop --json"),
    ]);
    let collection = processMongoStats(JSON.parse(stats[0]), null);

    console.log(JSON.stringify(collection));
    process.exit(0);
}

module.exports = {
    run,
};

run().catch(console.log);