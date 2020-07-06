const nodefetch = require('node-fetch');
const fetch = require('fetch-retry')(nodefetch);
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const CronJob = require('cron').CronJob;
const assert = require('assert');

const KIMAI_API_URL = process.env.KIMAI_API_URL;
const KIMAI_API_USER = process.env.KIMAI_API_USER;
const KIMAI_API_TOKEN = process.env.KIMAI_API_TOKEN;
assert(KIMAI_API_URL, "env var KIMAI_API_URL not set");
assert(KIMAI_API_USER, "env var KIMAI_API_USER not set");
assert(KIMAI_API_TOKEN, "env var KIMAI_API_TOKEN not set");

const API_CONCURRENT_READS = 10;
const adapter = new FileSync(process.env.JSONDB_FILE_PATH || 'database/db.json');
const db = low(adapter);

// Set some defaults (required if your JSON file is empty)
db.defaults({ projects:{} })
  .write();

  const fetchKimai = async (path) => {
    console.log("fetchKimai init:",KIMAI_API_URL + path);
    const result = await fetch(KIMAI_API_URL + path, {
        headers: {
            'X-AUTH-USER': KIMAI_API_USER,
            'X-AUTH-TOKEN': KIMAI_API_TOKEN,
        },
    },{
        retries: 10,
        retryDelay: (attempt, error, response) => Math.pow(2, attempt) * 1000,
    });
    const json = await result.json();
    // console.log(json);
    // console.log("fetchKimai done:",path);
    return json;
};

const postKimai = async (path,body) => {
    console.log("postKimai init:",KIMAI_API_URL + path,body);
    const result = await fetch(KIMAI_API_URL + path, {
        method: 'POST',
        headers: {
            'X-AUTH-USER': KIMAI_API_USER,
            'X-AUTH-TOKEN': KIMAI_API_TOKEN,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    },{
        retries: 3,
        retryDelay: (attempt, error, response) => Math.pow(2, attempt) * 1000,
    });
    if (!result.ok) throw new Error('Post to kimai not successful!')
    const json = await result.json();
  
    return json;
};

/**
 * Get values from the JSON DB
 * @param {string} userId the user ID from LDAP
 * @param {string} key 
 * @param {*} id 
 */
const getSettings = async (userId,key,id) => {
    try{
        //await Parallel.each(project_details, async (proj) => db.set('projects.'+proj.id, proj).write(), 1);
        return await db.get(userId+'_'+key+'_'+id).value();
    } catch(e){
        console.dir(e);
    }
};
/**
 * Set values in the JSON DB
 * @param {*} userId the user ID coming from LDAP
 * @param {*} key 
 * @param {*} id 
 * @param {*} data 
 */
const setSettings = async (userId,key,id,data) => {
    try{
        //await Parallel.each(project_details, async (proj) => db.set('projects.'+proj.id, proj).write(), 1);
        return await db.set(userId+'_'+key+'_'+id,data).write();
    } catch(e){
        console.dir(e);
    }
};

const DEPRECATED_getAllProjectDetails = async () => {
    return await db.get('projects').value();
};
const DEPRECATED_getProjectDetailsById = async (id) => {
    return await db.get('projects').value()[id];
};
const DEPRECATED_init = async () => {
    console.log("init the cache");
    // sync as soon as file got required
    await fetchAllProjectDetails();

    // register all cron jobs to keep data up to date
    new CronJob('0 */30 * * * *', async () => { //every 10 min
        console.log("cron job triggered at", new Date());
        await fetchAllProjectDetails();
        console.log("sync done");
    }).start();
};

//making functions public (marking for export);
exports.API_CONCURRENT_READS = API_CONCURRENT_READS;
exports.fetchKimai = fetchKimai;
exports.postKimai = postKimai;
exports.getSettings = getSettings;
exports.setSettings = setSettings;

exports.DEPRECATED_getAllProjectDetails = DEPRECATED_getAllProjectDetails;
exports.DEPRECATED_getProjectDetailsById = DEPRECATED_getProjectDetailsById;
exports.DEPRECATED_init = DEPRECATED_init;
