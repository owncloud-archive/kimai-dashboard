// const Parallel = require('async-parallel');
const kimai = require('../../../backend_modules/kimai');
import { withAuth } from '../../../modules/withAuth'

export default withAuth(async (req, res) => {
    
    const userEmail = req.auth.user.email
    
    try{
        if (req.method === 'POST') {
            
            await kimai.setSettings(userEmail, 'reportEmails','reportEmails',req.body); //save email to localdb
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({status:'ok'}));
        } else {
            let reportEmails = await kimai.getSettings(userEmail, 'reportEmails','reportEmails');
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
});