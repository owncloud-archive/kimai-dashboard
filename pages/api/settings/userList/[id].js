// const Parallel = require('async-parallel');
const kimai = require('../../../../backend_modules/kimai');

export default async (req, res) => {
    try{
        if (req.method === 'POST') {
            const { body,query } = req;
            // console.log("booooody",body,query);

            await kimai.setSettings('users',query.id,body);

            //save stuff to localdb
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({status:'ok'}));
        } else {

            const { query } = req;
            let users = await kimai.fetchKimai('/api/users?visible=3');
            let localUsers = await kimai.getSettings('users',query.id);
            // console.log(localUsers);
    
            if(localUsers){ //if we already have some users in our localdb, ...
                //merge remote users and stuff from localdb together
                users = users.map((user,i) => ({
                    ...user,
                    included: localUsers.filter(usr => usr.id == user.id).length > 0 ? localUsers.filter(usr => usr.id == user.id)[0].included : false,
                }));
            }
    
            // users[0].enabled = false;
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(users));
        }
    } catch(e){
        console.dir(e);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ message: e.message }));
    }
};