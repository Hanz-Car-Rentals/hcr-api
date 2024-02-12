let cron = require('cron');
let db = require('../../db');


async function start_daily_jobs(){
    // let job = new cron.CronJob('0 0 22 * * *', () => {
    //     daily_check_01();
    // });
    // job.start();
}

module.exports = {
    start_daily_jobs
}