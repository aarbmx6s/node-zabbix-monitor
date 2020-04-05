const { exec } = require("child_process");

/**
 * @typedef {Object} CommandResult
 * @property {String} stdout
 * @property {String} stderr
 */
/**
 * @param {String} cmd
 * @returns {Promise<CommandResult>}
 */
function runCommand(cmd) {
    return new Promise(function(resolve, reject) {
        exec(cmd, function(error, stdout, stderr) {
            if ( error ) {
                reject(error);
            }
            else {
                resolve({ stdout, stderr });
            }
        });
    });
}

module.exports = {
    runCommand,
};