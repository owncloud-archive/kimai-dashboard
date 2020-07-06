const fetch = require('node-fetch');
const API_URL = 'https://demo-stable.kimai.org';
import { withAuth } from '../../modules/withAuth'


export default withAuth( async (req, res) => {
    const path = '/api/timesheets?user=all&size=200&begin=2018-01-01T01:01:01&end=2019-01-01T01:01:01';
    const result = await fetch(API_URL + path);
    // console.log("rs",result);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ name: 'John Doe' }));
})