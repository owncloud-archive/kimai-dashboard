// const Parallel = require('async-parallel');
const kimai = require('../../../backend_modules/kimai');

export default async (req, res) => {
    try{
        if (req.method === 'POST') {
            console.log(req.body);
            await kimai.setSettings('reportEmails','reportEmails',req.body); //save email to localdb
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({status:'ok'}));
        } else {
            let reportEmails = await kimai.getSettings('reportEmails','reportEmails');
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(reportEmails || []));
        }
    } catch(e){
        console.dir(e);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ message: e.message }));
    }
};