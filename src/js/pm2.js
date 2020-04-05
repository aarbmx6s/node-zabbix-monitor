/**
 * @typedef {Object} PM2Info
 * @property {Object} pm2_env
 * @property {String} pm2_env.pm_id
 * @property {String} pm2_env.namespace
 * @property {String} pm2_env.name
 * @property {String} pm2_env.status
 * @property {Object} monit
 * @property {Number} monit.memory
 * @property {Number} monit.cpu
 */

/**
 * @typedef {Object} ProcessInfo
 * @property {String} pm_id
 * @property {String} namespace
 * @property {String} name
 * @property {"online"|"stopped"} status
 * @property {Number} memory
 * @property {Number} cpu
 */
/**
 * @typedef {Object} CollectedInfo
 * @property {Number} total
 * @property {Number} online
 * @property {Number} stopped
 * @property {Number} unknown_status
 * @property {ProcessInfo[]} processes
 */

const { exec } = require("child_process");

const commandPm2Info = 'pm2 jlist';

/**
 * @returns {Promise<PM2Info[]>}
 */
function getPM2Info() {
    return new Promise(function(resolve, reject) {
        exec(commandPm2Info, function(error, stdout, stderr) {
            if ( error ) {
                reject(error);
                return;
            }

            try {
                resolve(JSON.parse(stdout));
            }
            catch (error) {
                reject(error);
            }
        });
    });
}

/**
 * @param {PM2Info[]} PM2Infos
 * @returns {CollectedInfo}
 */
function collectInfo(PM2Infos) {
    /** @type {CollectedInfo} */
    let collectedInfo = {
        total: PM2Infos.length,
        online: 0,
        stopped: 0,
        unknown_status: 0,
        processes: [],
    };

    for ( let i = 0; i < PM2Infos.length; i++ ) {
        /** @type {PM2Info} */
        let pm2Info = PM2Infos[i];
        /** @type {ProcessInfo} */
        let process = {
            pm_id: pm2Info.pm2_env.pm_id,
            namespace: pm2Info.pm2_env.namespace,
            name: pm2Info.pm2_env.name,
            status: pm2Info.pm2_env.status,
            memory: pm2Info.monit.memory,
            cpu: pm2Info.monit.cpu,
        };

        switch ( process.status ) {
            case "online":
                collectedInfo.online += 1;
                break;

            case "stopped":
                collectedInfo.stopped += 1;
                break;

            default:
                collectInfo.unknown_status += 1;
        }

        collectedInfo.processes.push(process);
    }

    return collectedInfo;
}

async function run() {
    try {
        let info = await getPM2Info();
        let collected = collectInfo(info);
        let string = JSON.stringify(collected);
    
        console.log(string);
        process.exit(1);
    }
    catch (error) {
        console.error(error);
        process.exit(1);
    }
}

module.exports = {
    getPM2Info,
    collectInfo,
    run,
};