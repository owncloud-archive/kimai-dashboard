const kimai = require('../../backend_modules/kimai');
import { withAuth } from '../../modules/withAuth'


export default withAuth(async (req, res) => {
    try{
        // const projects = await fetchKimai('/api/projects?visible=3');
        const project_details = Object.values(await kimai.DEPRECATED_getAllProjectDetails());
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(project_details));
    } catch(e){
        console.dir(e);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(e));
    }
});