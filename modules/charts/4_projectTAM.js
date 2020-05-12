import {
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';

import fetch from 'unfetch';
import useSWR from 'swr';
import querystring from 'querystring';
import { Typography } from '@material-ui/core';

async function fetcher(path, fromDate, toDate) {

    const fromYear = fromDate.toJSON().substr(0,4)
    const newFromDate = new Date(fromYear+'-01-01');

    const query = querystring.stringify({fromDate:newFromDate, toDate:toDate.toJSON().substr(0,10)});
    console.log("querry",query);
    const res = await fetch(path+'?'+query);
    console.log(res);
    const json = await res.json();
    return json;
}
const CustomizedAxisTick = ({x, y, stroke, payload}) => {
    const title = payload.value.length > 30 ? payload.value.substr(0, 30-3)+'...' : payload.value;
    return (
        <g transform={`translate(${x},${y})`}>
            <text x={0} y={0} dy={16} textAnchor="end" fill="#666" transform="rotate(-45)">{title}</text>
        </g>
    );
};
const formatYAxis = (s) => {
    let hours = Math.floor(s / 60 / 60);
    let minutes = Math.floor(s / 60 - (hours * 60));
    let seconds = Math.floor(s - (hours * 60 * 60) - (minutes * 60));
    
    if(minutes<10) minutes = '0'+minutes;
    if(hours>0 && minutes == 0) minutes = '00';
    if(hours>0) return `${hours}:${minutes}`;
    else if(minutes>0) return `00:${minutes}`;
    else if(seconds>0) return `00:00,${seconds}`;
    else return `00:00`;
};
const ProjectTAM = ({ fromDate, toDate }) => {
    const { data, error } = useSWR(['/api/projectTotalSpend', fromDate, toDate], fetcher);
    if (error) return <div>failed to load: {error}</div>
    if (!error && data && data.message) return <div>failed to load: {data.message}</div>
    if (!data) return <div>loading...</div>
    

    // filter out TAM projects
    let finalData = data.filter(o=>o.projectName.indexOf('TAM')>=0);
    // filter out projects with less than 1h booked
    // finalData = finalData.filter(o=>o.projectTimeBudget >= 60 * 60);
    // filter out projects wich are not ongoing
    // finalData = finalData.filter(o=>o.projectStatus == 'ongoing');
    
    const newFromDate = new Date(fromDate.toJSON().substr(0,4)+'-01-01');
    return (
        <div>
            <Typography>from {newFromDate.toJSON().substr(0,10)} till {toDate.toJSON().substr(0,10)}</Typography><br/>
            <ResponsiveContainer width='100%' aspect={4.0/4}>
                <BarChart data={finalData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="customerName" height={180} interval={0} tick={<CustomizedAxisTick />} />
                    <YAxis yAxisId="left" tickFormatter={formatYAxis} orientation="left" stroke="#4E85C8" />
                    <Tooltip formatter={formatYAxis} />
                    <Legend />
                    <Bar name="esimated hours" yAxisId="left" dataKey="projectTimeBudget" fill="#4E85C8" />
                    <Bar name="working hours (in selected timeframe)" yAxisId="left" dataKey="projectTimeTotalSpend" fill="#E56F35" />
                    <Bar name="hours left in budget (in whole project lifetime)" yAxisId="left" dataKey="projectTimeBudgetLeft" fill="#55606C" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
export default ProjectTAM;