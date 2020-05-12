import {
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import DateFnsUtils from '@date-io/date-fns'; //will be deprecated with v4.0.0-alpha.3


import fetch from 'unfetch';
import useSWR from 'swr';
import querystring from 'querystring';
import { Typography } from '@material-ui/core';

async function fetcher(path) {
    const res = await fetch(path);
    console.log(res);
    const json = await res.json();
    return json;
}
const fns = new DateFnsUtils();
const tickFormatter = (tick) => {
    return fns.format(new Date(tick),'MMM yyyy');
};
const ImportedData = ({ fromDate, toDate }) => {
    const { data, error } = useSWR(['/api/importDataGraph'], fetcher);
    if (error) return <div>failed to load: {error}</div>
    if (!error && data && data.message) return <div>failed to load: {data.message}</div>
    if (!data) return <div>loading...</div>

    const fromYear = fromDate.toJSON().substr(0,4)
    const newFromDate = new Date(fromYear+'-01-01');
    let finalData = data.filter(row => new Date(row.date) >= newFromDate && new Date(row.date) <= toDate);
    finalData = finalData.sort((a,b) => new Date(a.date)-new Date(b.date));

    console.log("finalData",finalData)
    return (
        <div>
            <Typography>from {newFromDate.toJSON().substr(0,10)} till {toDate.toJSON().substr(0,10)}</Typography><br/>
            <ResponsiveContainer width='100%' aspect={4.0/3.1}>
                <BarChart data={finalData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={tickFormatter}/>
                    {/* <XAxis dataKey="customerName" height={180} interval={0} tick={<CustomizedAxisTick />} /> */}
                    <YAxis yAxisId="left" orientation="left" stroke="#4E85C8" />
                    <Tooltip labelFormatter={tickFormatter}/>
                    <Legend />
                    <Bar yAxisId="left" name="total open cases" dataKey="open" fill="#4E85C8" />
                    <Bar yAxisId="left" name="new cases" dataKey="new" fill="#E56F35" />
                    <Bar yAxisId="left" name="closed cases" dataKey="closed" fill="#55606C" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
export default ImportedData;