// const Parallel = require('async-parallel');
const kimai = require('../../backend_modules/kimai');

const MAX_TIMESHEET_AMOUNT = 20000;

const getMetaValue = (metaArray,key) => {
    const singleMeta = metaArray.filter(o=>o.name===key)[0];
    return singleMeta ? singleMeta.value : undefined;
};

export default async (req, res) => {
    const { query: { fromDate, toDate } } = req;
    try{
        //check inputs,
        if(!(new Date(fromDate) <= new Date())) throw new Error("invalid input fromDate"); //if provided date is not a date or in the future
        if(!(new Date(toDate) <= new Date())) throw new Error("invalid input toDate");
        if(!(new Date(fromDate) <= new Date(toDate))) throw new Error("fromDate should be lower as toDate");

        let timesheets = await kimai.fetchKimai('/api/timesheets?user=all&size='+MAX_TIMESHEET_AMOUNT+'&begin='+fromDate+'T01:01:01&end='+toDate+'T23:59:59&full=true');
        if(timesheets.length > (MAX_TIMESHEET_AMOUNT-1))  throw new Error("input Date range to large");

        // filter our only consulting activitys
        timesheets = timesheets.filter(o => o.activity.name === "Consulting");
        
        const consulting_hours_per_costumer = timesheets.reduce((a,o)=>{
            const groupId = o.project.customer.id;
            if(a[groupId]) {
                a[groupId].customerTimeTotalSpend += o.duration;
            } else {
                a[groupId] = {
                    customerName: o.project.customer.name,
                    customerId: o.project.customer.id,
                    customerTimeTotalSpend: o.duration,
                    //customerTimeBudget: need to sum up all projects but don't count project time budgets more than once;
                };
            }
            return a;
        },{});

        // console.log("filtered_project_budgets",filtered_project_budgets);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(Object.values(consulting_hours_per_costumer)));
    } catch(e){
        console.dir(e);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ message: e.message }));
    }
};