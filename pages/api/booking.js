// const Parallel = require('async-parallel');
const kimai = require('../../backend_modules/kimai');

export default async (req, res) => {
    try{
        if (req.method === 'POST') {
            const { body } = req;
            // const body2 = {
            //     userIds: [1,2,3],
            //     project: 2,
            //     customer: 1,
            //     activity: 9,
            //     description: "asdf",
            //     begin: "2020-04-16T14:04:30",
            //     end: "2020-04-16T16:04:50",
            // };
            if(!body.userIds || body.userIds.length <= 0) throw new Error("Minimum one user required.");
            if(!body.project && !(Number(body.project)>=0)) throw new Error("Please select a valid project.");
            if(!body.customer && !(Number(body.customer)>=0)) throw new Error("Please select a valid customer.");
            if(!body.activity && !(Number(body.activity)>=0)) throw new Error("Please select a valid activity.");
            if(body.activity===9 && !body.description && body.description.length<=0) throw new Error("Description is mandatory for the selected activity.");
            if(new Date(body.begin).toJSON() === null) throw new Error("Please select a valid star time.");
            if(new Date(body.end).toJSON() === null) throw new Error("Please select a valid end time.");
            if(new Date(body.end) <= new Date(body.begin)) throw new Error("End time must be greater as start time.");

            for(let userId of body.userIds){
                if(!(Number(userId)>=0)) throw new Error("Please use valid userIds.");
                let resp = await kimai.postKimai('/api/timesheets',{
                    "user": userId,
                    "begin": body.begin,
                    "end": body.end,
                    "project": body.project,
                    "activity": body.activity,
                    "description": body.description,
                    //"tags": "pew pow",
                });
                console.log("resp",resp);
                if(resp.code !== 200) throw new Error("Kimai API returned with HTTP status code: "+resp.code);
            }

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({status:'ok'}));
        } else { //GET
            let users = await kimai.fetchKimai('/api/users?visible=3');
            let customers = await kimai.fetchKimai('/api/customers?visible=3');
            let projects = await kimai.fetchKimai('/api/projects?visible=3');
            let activities = await kimai.fetchKimai('/api/activities?visible=3');
            // console.log(import_values);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({users,customers,projects,activities}));
        }
    } catch(e){
        console.dir(e);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ message: e.message }));
    }
};