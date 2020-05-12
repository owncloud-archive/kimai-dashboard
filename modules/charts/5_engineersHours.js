import {
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';

import fetch from 'unfetch';
import useSWR from 'swr';
import querystring from 'querystring';
import { Typography } from '@material-ui/core';

async function fetcher(path, fromDate, toDate) {
    const query = querystring.stringify({fromDate:fromDate.toJSON().substr(0,10), toDate:toDate.toJSON().substr(0,10)});
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
const CustomerEngineerHours = ({ fromDate, toDate }) => {
    const { data, error } = useSWR(['/api/engineersHours', fromDate, toDate], fetcher);
    if (error) return <div>failed to load: {error}</div>
    if (!error && data && data.message) return <div>failed to load: {data.message}</div>
    if (!data) return <div>loading...</div>

    let finalData = data.sort((a,b) => b.customerTimeTotalSpend-a.customerTimeTotalSpend);
    let total = data.reduce((a,c)=>a+c.customerTimeTotalSpend,0);
    return (
        <div>
            <Typography>total working hours {formatYAxis(total)}h</Typography><br/>
            <ResponsiveContainer width='100%' aspect={4.0/3.1}>
                <BarChart data={finalData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="customerName" height={180} interval={0} tick={<CustomizedAxisTick />} />
                    <YAxis yAxisId="left" tickFormatter={formatYAxis} orientation="left" stroke="#4E85C8" />
                    <Tooltip formatter={formatYAxis} />
                    {/* <Legend /> */}
                    <Bar yAxisId="left" name="consulting hours" dataKey="customerTimeTotalSpend" fill="#4E85C8" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
export default CustomerEngineerHours;