// const kimai = require('./kimai');
const kimai = require('./kimai');
const CronJob = require('cron').CronJob;
const nodemailer = require("nodemailer");
const assert = require('assert');

const MAX_TIMESHEET_AMOUNT = 30000;
const CRITICAL_BUDGET_THRESHOLD = 0.8;

const getMetaValue = (metaArray,key) => {
    const singleMeta = metaArray.filter(o=>o.name===key)[0];
    return singleMeta ? singleMeta.value : undefined;
};

const getMonthlyBooked = async () => {
    let toDate = new Date();
    let fromDate = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000);
    toDate = toDate.toJSON().substr(0,10);
    fromDate = fromDate.toJSON().substr(0,10);
    console.log("fromDate",toDate,fromDate);
    const timesheets = await kimai.fetchKimai('/api/timesheets?user=all&size='+MAX_TIMESHEET_AMOUNT+'&begin='+fromDate+'T01:01:01&end='+toDate+'T23:59:59&full=true');
    if(timesheets.length > (MAX_TIMESHEET_AMOUNT-1)) throw new Error("input Date range to large");

    let total_spend_per_user = timesheets.reduce((a,o)=>{
        if(a[o.user]) {
            a[o.user].userTimeTotalSpend += o.duration;
        } else {
            a[o.user] = {
                id: o.user,
                userTimeTotalSpend: o.duration,
            };
        }
        return a;
    },{});

    let cron_users = await kimai.getSettings('users','cron');
    let cron_users_ids = cron_users.filter(u=>u.included).map(u=>u.id);
    let booked_times = Object.values(total_spend_per_user)
        .filter(u => cron_users_ids.includes(u.id))
        .map(u => ({...cron_users.filter(db_u=>db_u.id===u.id)[0],...u}));
    return booked_times;
};

const getUnderbookedUsers = async () => {
    let toDate = new Date();
    let fromDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    toDate = toDate.toJSON().substr(0,10);
    fromDate = fromDate.toJSON().substr(0,10);
    console.log("fromDate",toDate,fromDate);
    const timesheets = await kimai.fetchKimai('/api/timesheets?user=all&size='+MAX_TIMESHEET_AMOUNT+'&begin='+fromDate+'T01:01:01&end='+toDate+'T23:59:59&full=true');
    if(timesheets.length > (MAX_TIMESHEET_AMOUNT-1)) throw new Error("input Date range to large");

    let total_spend_per_user = timesheets.reduce((a,o)=>{
        if(a[o.user]) {
            a[o.user].userTimeTotalSpend += o.duration;
        } else {
            a[o.user] = {
                id: o.user,
                userTimeTotalSpend: o.duration,
            };
        }
        return a;
    },{});

    let cron_users = await kimai.getSettings('users','cron');
    let cron_users_ids = cron_users.filter(u=>u.included).map(u=>u.id);
    let booked_times = Object.values(total_spend_per_user)
        .filter(u => u.userTimeTotalSpend < 20 * 60 * 60) // 20h
        .filter(u => cron_users_ids.includes(u.id))
        .map(u => ({...cron_users.filter(db_u=>db_u.id===u.id)[0],...u}));
    return booked_times;
};

const getCriticalProjects = async () => {
    let toDate = new Date();
    let fromDate = new Date((toDate.toJSON().substr(0,4)-1)+toDate.toJSON().substr(4));
    toDate = toDate.toJSON().substr(0,10);
    fromDate = fromDate.toJSON().substr(0,10);
    const timesheets = await kimai.fetchKimai('/api/timesheets?user=all&size='+MAX_TIMESHEET_AMOUNT+'&begin='+fromDate+'T01:01:01&end='+toDate+'T23:59:59&full=true');
    if(timesheets.length > (MAX_TIMESHEET_AMOUNT-1)) throw new Error("input Date range to large");

    let total_spend_per_project = timesheets.filter(p => new Date(p.begin) >= new Date(fromDate)).reduce((a,o)=>{
        if(a[o.project.id]) {
            a[o.project.id].projectTimeTotalSpend += o.duration;
        } else {
            a[o.project.id] = {
                projectName: o.project.name,
                projectTimeBudget: Number(getMetaValue(o.project.metaFields,'project_timebudget') || o.project.timeBudget || 0),
                projectStatus: getMetaValue(o.project.metaFields,'status:'),
                projectBilling: getMetaValue(o.project.metaFields,'billing'),
                projectSalesForce: getMetaValue(o.project.metaFields,'sdfclink'),
                projectId: o.project.id,

                customerName: o.project.customer.name,

                projectTimeTotalSpend: o.duration,
            };
        }
        return a;
    },{});

    critical_budgets = Object.values(total_spend_per_project).filter(p => p.projectStatus === 'ongoing').filter(p => p.projectTimeBudget !== 0).filter(p => (p.projectTimeTotalSpend/p.projectTimeBudget) >= CRITICAL_BUDGET_THRESHOLD);

    return critical_budgets;
};
const formatSeconds = (s) => {
    let sign = s>0 ? '':'-';
    s = Math.abs(s);
    let hours = Math.floor(s / 60 / 60);
    let minutes = Math.floor(s / 60 - (hours * 60));
    let seconds = Math.floor(s - (hours * 60 * 60) - (minutes * 60));
    if(minutes<10) minutes = '0'+minutes;
    if(hours>0 && minutes == 0) minutes = '00';
    if(hours>0) return `${sign}${hours}:${minutes}`;
    else if(minutes>0) return `${sign}00:${minutes}`;
    else if(seconds>0) return `${sign}00:00,${seconds}`;
    else return `00:00`;
};


//check env values
if(process.env.SMTP_PORT) assert(Number(process.env.SMTP_PORT), "env var SMTP_PORT has to be a number or unset");
const SMTP_SECURE = (process.env.SMTP_SECURE && process.env.SMTP_SECURE==='FALSE') ? false : true;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM_MAIL = process.env.SMTP_FROM_MAIL;
assert(SMTP_USER, "env var SMTP_USER not set");
assert(SMTP_PASS, "env var SMTP_PASS not set");
assert(SMTP_FROM_MAIL, "env var SMTP_FROM_MAIL not set");
const sendMail = async (subject, text, html) => {
    const mail = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.mailgun.org",
        port: Number(process.env.SMTP_PORT) || 456,
        secure: SMTP_SECURE, // true for 465, false for other ports
        auth: {
            user: SMTP_USER,
            pass: SMTP_PASS,
        }
    });

    // send mail with defined transport object
    let reportEmails = await kimai.getSettings('reportEmails','reportEmails');
    if(!reportEmails || (reportEmails && reportEmails.length===0)) {
        console.warn("WARNING: no emails specified");
        return;
    }

    let info = await mail.sendMail({
        from: '"OwnCloud Reporting 📈" <'+SMTP_FROM_MAIL+'>',
        to: reportEmails.join(', '), // list of receivers
        subject,
        text,
        html,
    });
    return info;
};

const registerJobs = async () => {
    

    console.log("register critical projects job at: 0 0 0 * * *");
    new CronJob('0 0 0 * * *', async () => { //every 1 day
        // Everyday a cronjob is checking if 
        // projektbudget – booked time < 80% -> Mail to dlindner@owncloud.com and john@owncloud.com
        const critical_budgets = await getCriticalProjects();
        console.log("sending critical budget report with ",critical_budgets.length,"critical projects");
        let email_txt = `
Here is your daily report of projects with critical time budgets (total time booked / project budget >= 80%):

Percent booked:  Total time booked:  Project budget:  Name:\n`;
        let email_html = `
        <p>Here is your daily report of projects with critical time budgets (total time booked / project budget >= 80%):</p>
        
        <table>
        <tr>
            <th>Name</th>
            <th>Total time booked</th>
            <th>Project budget</th>
            <th>Percent booked</th>
        </tr>`;
        critical_budgets.forEach((proj)=>{
            const percent = (proj.projectTimeTotalSpend/proj.projectTimeBudget*100).toFixed(2).padStart("Percent booked".length, " ");
            const total = formatSeconds(proj.projectTimeTotalSpend).padStart("Total time booked".length, " ");
            const budget = formatSeconds(proj.projectTimeBudget).padStart("Project budget".length, " ");
            email_txt += `${percent}%  ${total}h  ${budget}h  ${proj.projectName}\n`;
            email_html += `<tr><td>${proj.projectName}</td><td>${total}h</td><td>${budget}h</td><td>${percent}%</td></tr>`;
        });
        email_html += `</table>`;
        const res = await sendMail("Projects with critical time budget - "+new Date().toJSON().substr(0,10),email_txt,email_html);
        console.log("report email accepted by",res.accepted,"status:",res.response);
    }).start();

    console.log("register underbooked users job at: 0 0 12 * * 5");
    new CronJob('0 0 12 * * 5', async () => { //every Friday, (friday is 5)
    // new CronJob('0 24 11 * * *', async () => { //every Friday, (friday is 5)
        // There is a cronjob every week Friday 12:00 and check if every person from our team booked minimum 20h – if not it sends me a Mail with name and hours - dlindner@owncloud.com example: Martin 16h (please do a config.txt so i can add people)
        const underbooked_users = await getUnderbookedUsers();
        if(underbooked_users.length === 0) {
            console.warn("no underbooked users");
            return;
        }
        console.log("sending underbooked users report with ",underbooked_users.length,"underbooked users");
        let email_txt = `
Here is your weekly report of underbooked users (team members with less than 20h booked):

Alias:         Username:       Booked time:\n`;
        let email_html = `
        <p>Here is your weekly report of underbooked users (team members with less than 20h booked):</p>
        
        <table>
        <tr>
            <th>Alias</th>
            <th>Username</th>
            <th>Booked time</th>
        </tr>`;
        underbooked_users.forEach((u)=>{
            const total = formatSeconds(u.userTimeTotalSpend);
            email_txt += `${u.alias.padEnd("Alias:         ".length, " ")}  ${u.username.padEnd("Username:       ".length, " ")}  ${total}h\n`;
            email_html += `<tr><td>${u.alias}</td><td>${u.username}</td><td>${total}h</td></tr>`;
        });
        email_html += `</table>`;
        const res = await sendMail("Underbooked users report for - "+new Date().toJSON().substr(0,10),email_txt,email_html);
        console.log("report email accepted by",res.accepted,"status:",res.response);
    }).start();
    console.log("monthly user report job at: 0 0 0 1 * *");
    new CronJob('0 0 0 1 * *', async () => { //every month on the first
    // new CronJob('0 36 11 * * *', async () => { //every month on the first
        // There is a cronjob every month tells me via Mail which person booked how much hours - dlindner@owncloud.com - Example Kevin 160h, David 180h (please do a config.txt so i can add people) -> Team auswählen für Cronjob, für beide cronjobs das gleiche
        const monthly_booked = await getMonthlyBooked();
        if(monthly_booked.length === 0) {
            console.warn("no underbooked users");
            return;
        }
        console.log("sending team member report with ",monthly_booked.length,"team members");
        let email_txt = `
Here is your weekly report of underbooked users (team members with less than 20h booked):

Alias:         Username:       Booked time:\n`;
        let email_html = `
        <p>Here is your monthly report of booked hours per team member:</p>
        
        <table>
        <tr>
            <th>Alias</th>
            <th>Username</th>
            <th>Booked time</th>
        </tr>`;
        monthly_booked.forEach((u)=>{
            const total = formatSeconds(u.userTimeTotalSpend);
            email_txt += `${u.alias.padEnd("Alias:         ".length, " ")}  ${u.username.padEnd("Username:       ".length, " ")}  ${total}h\n`;
            email_html += `<tr><td>${u.alias}</td><td>${u.username}</td><td>${total}h</td></tr>`;
        });
        email_html += `</table>`;
        const res = await sendMail("Monthly booked per team member report - "+new Date().toJSON().substr(0,10),email_txt,email_html);
        console.log("report email accepted by",res.accepted,"status:",res.response);
    }).start();
};
exports.registerJobs = registerJobs;


