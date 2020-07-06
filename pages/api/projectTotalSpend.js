// const Parallel = require('async-parallel');
const kimai = require('../../backend_modules/kimai');
import { withAuth } from '../../modules/withAuth'

const MAX_TIMESHEET_AMOUNT = 20000;

const getMetaValue = (metaArray,key) => {
    const singleMeta = metaArray.filter(o=>o.name===key)[0];
    return singleMeta ? singleMeta.value : undefined;
};

export default withAuth(async (req, res) => {
    const { query: { fromDate, toDate } } = req;
    try{
        //check inputs,
        if(!(new Date(fromDate) <= new Date())) throw new Error("invalid input fromDate"); //if provided date is not a date or in the future
        if(!(new Date(toDate) <= new Date())) throw new Error("invalid input toDate");
        if(!(new Date(fromDate) <= new Date(toDate))) throw new Error("fromDate should be lower as toDate");

        const fromFetchDate = (fromDate.substr(0,4)-1)+fromDate.substr(4); // we need to go back for a correct projectTimeBudgetLeft calculation
        const timesheets = await kimai.fetchKimai('/api/timesheets?user=all&size='+MAX_TIMESHEET_AMOUNT+'&begin='+fromFetchDate+'T01:01:01&end='+toDate+'T23:59:59&full=true');
        if(timesheets.length > (MAX_TIMESHEET_AMOUNT-1)) throw new Error("input Date range to large");
        // const projects = Object.keys(timesheets.reduce((a,o)=>{
        //     a[o.project]=null;
        //     return a;
        // },{}));
        // let project_details = await kimai.getAllProjectDetails();
        // //if we do not have all data in cached version, fall back to fetching them again
        // if(Object.values(project_details).length < projects.length){ 
        //     console.warn("cache is missing some values, fetching data again");
        //     project_details = (await Parallel.map(projects, async (id) => kimai.fetchKimai('/api/projects/'+id), Math.ceil(kimai.API_CONCURRENT_READS/10))) //100 concurrenct API requests allowed
        //                         .reduce((a,o)=>{
        //                             a[o.id]=o;
        //                             return a;
        //                         },{});
        //     // kimai.sync(); //init an async sync to update values in cache. //TODO: caused bugs... need to sync the syncs :D
        // }

        // projectTimeTotalSpend only for timefram
        let total_spend_per_project = timesheets.filter(p => new Date(p.begin) >= new Date(fromDate)).reduce((a,o)=>{
            // console.log("as",o,project_details[o.project],a);
            // const proj_detail = project_details[o.project];
            // console.log("beg",o.begin);
            if(a[o.project.id]) {
                a[o.project.id].projectTimeTotalSpend += o.duration;
            } else {
                a[o.project.id] = {
                    projectName: o.project.name,
                    projectTimeBudget: getMetaValue(o.project.metaFields,'project_timebudget') || o.project.timeBudget || 0,
                    projectTimeBudgetLeft: getMetaValue(o.project.metaFields,'project_timebudget') || o.project.timeBudget || 0,
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


        // projectTimeBudgetLeft for total history, but only if we have the project already in our result list from above
        total_spend_per_project = timesheets.reduce((a,o)=>{
            // console.log("as",o,project_details[o.project],a);
            // const proj_detail = project_details[o.project];
            if(a[o.project.id]) {
                a[o.project.id].projectTimeBudgetLeft -= o.duration;
            }
            return a;
        },total_spend_per_project);

        // console.log("filtered_total_spend_per_project",filtered_total_spend_per_project);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(Object.values(total_spend_per_project)));
    } catch(e) {
        console.dir(e);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ message: e.message }));
    }
});