// const Parallel = require('async-parallel');
const kimai = require('../../backend_modules/kimai');
import { withAuth } from '../../modules/withAuth'


const MAX_TIMESHEET_AMOUNT = 20000;

export default withAuth( async (req, res) => {
    try{
        const { type } = req.query
        const import_values = (await kimai.getSettings('import', type+'_values'));
        if(!import_values || import_values.length < 1) throw new Error("No data imported, import data in import page first.");
        // console.log("filtered_project_budgets",filtered_project_budgets);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(import_values));
    } catch(e){
        console.dir(e);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ message: e.message }));
    }
});