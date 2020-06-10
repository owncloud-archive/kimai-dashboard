import { ThemeProvider } from '@material-ui/core/styles';
import { makeStyles } from '@material-ui/core/styles';
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import CssBaseline from '@material-ui/core/CssBaseline';
import fetch from 'unfetch';
import useSWR from 'swr';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import Fab from '@material-ui/core/Fab';
import Alert from '@material-ui/lab/Alert';
import LinearProgress from '@material-ui/core/LinearProgress';
import {
    MuiPickersUtilsProvider,
    KeyboardDatePicker,
} from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns'; //will be deprecated with v4.0.0-alpha.3'
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab'

import EditTable from '../modules/tables/editTable';
import SaveIcon from '@material-ui/icons/Save';
import AddIcon from '@material-ui/icons/Add';
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';

import theme from '../modules/theme';

async function fetcher(path, fromDate, toDate) {
    // const query = querystring.stringify({fromDate:fromDate.toJSON().substr(0,10), toDate:toDate.toJSON().substr(0,10)});
    // console.log("querry",query);
    const res = await fetch(path);
    // console.log(res);
    const json = await res.json();
    return json;
}

const useStyles = makeStyles(theme => ({
    chartPaper:{
        // padding: theme.spacing(1),
        // textAlign: 'center',
        // color: theme.palette.text.secondary
    },
    alert: {
        // position: "fixed",
    },
    fab: {
        position: "fixed",
        bottom: theme.spacing(2),
        right: theme.spacing(2),
    },
    menupoint: {
        cursor:'pointer',
        '&:hover': { textDecoration:'underline' },
    },
    iconmenupoint: {
        cursor:'pointer',
        position:"absolute",
        right:'20px',
        '&:hover': { opacity:0.8 },
    }
}));

const saveChanges = async (importData, type) => {
    let jsonImport;
    if(importData[type]){
        const resEmail = await fetch('/api/import?type='+type,{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(importData[type]),
        });
        jsonImport = await resEmail.json();
        console.log("jsonImport",jsonImport);
    }
    return ((importData[type] && jsonImport && jsonImport.status === 'ok') || !importData);
};

const fns = new DateFnsUtils();
const Import = (props) => {

    const [activeTab, setActiveTab] = React.useState(0);
    const [type, setType] = React.useState(activeTab === 0 ? 'consulting' : 'support')
    
    React.useEffect(() => {
        setType(activeTab === 0 ? 'consulting' : 'support')
    },[activeTab])
    
    const { data: importData, error: importError } = useSWR('/api/import?type='+type, fetcher);

    const [importState, setImportState] = useState({ consulting:[], support:[] }); // [{date,open,new,closed}]

    const [saveLoading, setSaveLoading] = useState(false);
    const [saveError, setSaveError] = useState(false);
    
    const handleChange = (event, newValue) => {
        setActiveTab(newValue);
    };
    
    //cron table stuff:
    useEffect(() => {
        console.log('out here. importState', importState)
        if(!importError && importData && !importData.message && importState[type].length === 0){
            // importState = [...importData,...importState];
            
            setImportState({ ...importState, [type] : importData });
            console.log('in here', importState)
        }
    }, [importError,importData]);
    const importRows = importState[type] && importState[type].sort((a,b)=>new Date(b.date)-new Date(a.date)).map(value => [ 
        fns.format(new Date(value.date),'MMM yyyy'),
        value.open,
        value.new,
        value.closed,
        (<IconButton aria-label="add to shopping cart" onClick={()=>{
            console.log("asdf",importState[type],value.date)
            setImportState({...importState, [type] : importState[type].filter(row => (new Date(row.date).getMonth() !== new Date(value.date).getMonth() 
                                                        || new Date(row.date).getYear() !== new Date(value.date).getYear()))})
        }}>
            <DeleteOutlineIcon />
        </IconButton>)
    ]);
    // importState[importState.length].date;
    console.log('import rows', importRows)
    console.log('import state', importState)

    let defaultDate;
    if(importState[type] && importState[type].length > 0){
        const lastDate = new Date(importState[type][importState[type].length-1].date)
        defaultDate = new Date('1990-01-01T00:00:00.000Z');
        defaultDate.setYear(lastDate.getYear()+1900);
        defaultDate.setMonth(lastDate.getMonth()-1);
    } else {
        defaultDate = new Date(new Date().toJSON().substr(0,10)+'T00:00:00.000Z')
    }
    const [rowState, setRowState] = useState({
        date: defaultDate,
        open: 0,
        new: 0,
        closed: 0,
    });
    // ['Month', 'Total Open Cases', 'New Cases', 'Closed Cases']
    let importInputs = [
        (<KeyboardDatePicker 
            variant="inline" 
            openTo="month"
            onChange={(date)=>{
                setRowState({...rowState, date})
            }}
            value={rowState.date}
            views={['year','month']} 
            format="MMM yyyy" 
            maxDate={new Date()}
            fullWidth 
            margin="none"/>),
        (<TextField fullWidth type="number" inputProps={{style:{textAlign:'right'}}} value={rowState.open} margin="none" onChange={(e)=>setRowState({...rowState,open:e.currentTarget.value})}/>),
        (<TextField fullWidth type="number" inputProps={{style:{textAlign:'right'}}} value={rowState.new} margin="none" onChange={(e)=>setRowState({...rowState,new:e.currentTarget.value})}/>),
        (<TextField fullWidth type="number" inputProps={{style:{textAlign:'right'}}} value={rowState.closed} margin="none" onChange={(e)=>setRowState({...rowState,closed:e.currentTarget.value})}/>),
        (<IconButton color="primary" aria-label="add to import data" onClick={()=>{
            if(importState[type].filter(val => (new Date(val.date).getMonth() === rowState.date.getMonth() 
                                        && new Date(val.date).getYear() === rowState.date.getYear())).length > 0){
                if(confirm('Duplicate month. Overwrite existing values from this month?')){
                    let update = [...importState[type].filter(val => (new Date(val.date).getMonth() !== rowState.date.getMonth() 
                    || new Date(val.date).getYear() !== rowState.date.getYear())), rowState ]
                    setImportState(
                        {
                            ...importState[type].filter(val => (new Date(val.date).getMonth() !== rowState.date.getMonth() 
                                                        || new Date(val.date).getYear() !== rowState.date.getYear())),
                            [type]: update
                        })    

                    let newDate = new Date('1990-01-01T00:00:00.000Z');
                    newDate.setYear(rowState.date.getYear()+1900);
                    newDate.setMonth(rowState.date.getMonth()+1);
                    if(newDate > new Date()){
                        newDate = new Date(new Date().toJSON().substr(0,10)+'T00:00:00.000Z')
                    }
                    setRowState({
                        date: newDate,
                        open: 0,
                        new: 0,
                        closed: 0,
                    });
                }
            } else {
                let update = [...importState[type], rowState ]
                setImportState({...importState, [type]: update})
                let newDate = new Date('1990-01-01T00:00:00.000Z');
                newDate.setYear(rowState.date.getYear()+1900);
                newDate.setMonth(rowState.date.getMonth()+1);
                if(newDate > new Date()){
                    newDate = new Date(new Date().toJSON().substr(0,10)+'T00:00:00.000Z')
                }
                setRowState({
                    date: newDate,
                    open: 0,
                    new: 0,
                    closed: 0,
                });
            }
        }}>
                <AddIcon />
        </IconButton>),
    ]

    const classes = useStyles();
    return (
        <div className="container">
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <ThemeProvider theme={theme}>
                    <CssBaseline/>
                    <Head>
                        <title>Owncloud Reporting Dashboard | Import</title>
                        <link
                            rel="stylesheet"
                            href="https://fonts.googleapis.com/css?family=Open+Sans:300,400,700&display=swap"/>
                        <link
                            rel="stylesheet"
                            href="https://fonts.googleapis.com/icon?family=Material+Icons"/>
                        <meta
                            name="viewport"
                            content="minimum-scale=1, initial-scale=1, width=device-width"/>
                    </Head>
                    <main>
                        <AppBar position="static" className={classes.noprint}>
                            <Toolbar>
                                    <Link href="/">
                                            <Typography variant="h6" className={classes.menupoint}>
                                                Reporting Dashboard
                                            </Typography>
                                    </Link>
                                    <Typography variant="h6">
                                    &nbsp;/ Data Import
                                    </Typography>


                                    <Link href="/">
                                        <ArrowBackIcon className={classes.iconmenupoint}/>
                                    </Link>
                            </Toolbar>
                        </AppBar>

                        <Container maxWidth="xl">
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={12} />
                                {saveError && <Grid item xs={12} md={12}>
                                    <Alert id="alert" severity="error" className={classes.alert}>Save unsuccessful!</Alert>
                                </Grid>}

                                <Grid item xs={12} md={12}>
                                    <Tabs
                                        value={activeTab}
                                        onChange={handleChange}
                                        indicatorColor="primary"
                                        textColor="primary"
                                        centered
                                    >
                                        <Tab label="Consulting Cases" />
                                        <Tab label="Support Cases" />
                                    </Tabs>
                                </Grid>
                                <Grid item xs={12} md={12}>
                                    <Paper className={classes.chartPaper}>
                                        <Typography variant="h6" gutterBottom color="textSecondary" align="center">
                                            Import data table
                                        </Typography>
                                        { importError && (<p>failed to load table: {importError.message}</p>)}
                                        { !importError && importData && importData.message && (<p>failed to load table: {JSON.stringify(importData.message)}</p>)}
                                        { !importError && !importData && (<LinearProgress />)}
                                        { !importError && importData && !importData.message && (<EditTable rows={importRows} importInputs={importInputs} header={['Month', 'Total Open Cases', 'New Cases', 'Closed Cases','']}/>)}
                                    </Paper>
                                </Grid>
                                {/* placeholders for save btn */}
                                <Grid item xs={12} md={12}/>
                                <Grid item xs={12} md={12}/>
                                <Grid item xs={12} md={12}/>
                                <Grid item xs={12} md={12}/>
                                <Grid item xs={12} md={12}/>
                            </Grid>
                        </Container>
                        <Fab disabled={!(!importError && importData && !importData.message)} 
                            variant="extended" 
                            color="primary" 
                            aria-label="print as pdf" 
                            className={classes.fab} 
                            onClick={async ()=>{
                                setSaveLoading(true);
                                const successfull = await saveChanges(importState, type);
                                // on error set router/link to #alert (id="alert")
                                setTimeout(()=>{
                                    setSaveError(!successfull);
                                    setSaveLoading(false);
                                },100)
                                
                            }}>
                                {
                                    saveLoading ? (
                                        <>saving...</>
                                    ) : (
                                        <>
                                            <SaveIcon />
                                            &nbsp;
                                            Save
                                        </>
                                    )
                                }
                        </Fab>
                    </main>
                </ThemeProvider>
            </MuiPickersUtilsProvider>
        </div>
    );
}
export default Import
