// const Parallel = require('async-parallel');
const kimai = require('../../backend_modules/kimai');
import { withAuth } from '../../modules/withAuth'


export default withAuth( async (req, res) => {
    if (process.env.AUTH_GROUPS_IMPORT) {
        const validGroups = process.env.AUTH_GROUPS_IMPORT.split(',')
        const found = validGroups.some((r) => req.auth.user.groups.includes(r))
        if (!found){
            return res.status(403).json({ message: 'You are not in the correct group to access import page.' })
        }
    } else {
        console.warn('No allowed user groups for the import page defined. Allowing all groups now!')
    }
    try{
        if (req.method === 'POST') {
            const { body } = req;
            const { type } = req.query
            await kimai.setSettings(req.auth.user.id, 'import', type+'_values',body);
            //save stuff to localdb
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({status:'ok'}));
        } else {
            const { type } = req.query
            let import_values = await kimai.getSettings(req.auth.user.id, 'import',type+'_values');
            // console.log(import_values);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(import_values || []));
        }
    } catch(e){
        console.dir(e);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ message: e.message }));
    }
});