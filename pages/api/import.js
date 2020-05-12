// const Parallel = require('async-parallel');
const kimai = require('../../backend_modules/kimai');

export default async (req, res) => {
    try{
        if (req.method === 'POST') {
            const { body } = req;
            await kimai.setSettings('import','values',body);
            //save stuff to localdb
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({status:'ok'}));
        } else {
            let import_values = await kimai.getSettings('import','values');
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
};