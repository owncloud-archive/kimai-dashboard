import { ThemeProvider } from '@material-ui/core/styles';
import { makeStyles } from '@material-ui/core/styles';
import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import CssBaseline from '@material-ui/core/CssBaseline';
import fetch from 'unfetch';
import useSWR from 'swr';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import TextField from '@material-ui/core/TextField';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import Fab from '@material-ui/core/Fab';
import Alert from '@material-ui/lab/Alert';
import LinearProgress from '@material-ui/core/LinearProgress';

import DynamicTable from '../modules/tables/dynamicTable';
import Checkbox from '@material-ui/core/Checkbox';
import SaveIcon from '@material-ui/icons/Save';

import ChipInput from 'material-ui-chip-input';

import theme from '../modules/theme';

const EMAIL_REGEX = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;

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
    },
    noprint: {
        ['@media print']:{
            display:'none'
        }
    }
}));

const mergeApiAndState = (apiData, stateDict) => {
    return apiData.map((obj)=>({
        ...obj,
        included: stateDict[obj.id] !== undefined ? stateDict[obj.id] : obj.included
    }));
};

const saveChanges = async (cronUser,engineerUser,reportEmail) => {
    let jsonEmail, jsonCron, jsonEngineer;
    if(reportEmail){
        const resEmail = await fetch('/api/settings/reportEmail',{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(reportEmail),
        });
        jsonEmail = await resEmail.json();
        console.log("jsonEmail",jsonEmail);
    }
    if(cronUser){
        const resCron = await fetch('/api/settings/userList/cron',{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(cronUser),
        });
        jsonCron = await resCron.json();
        console.log("jsonCron",jsonCron);
    };
    if(engineerUser){
        const resEngineer = await fetch('/api/settings/userList/engineer',{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(engineerUser),
        });
        
        jsonEngineer = await resEngineer.json();
        console.log("jsonEngineer",jsonEngineer);
    };

    if( ((reportEmail && jsonEmail && jsonEmail.status === 'ok') || !reportEmail) &&
        ((cronUser && jsonCron && jsonCron.status === 'ok') || !cronUser) &&
        ((engineerUser && jsonEngineer && jsonEngineer.status === 'ok') || !engineerUser) ){
        return true;
    } else return false;
};

const Settings = (props) => {

    const { data: cronUserData, error: cronUserError } = useSWR(['/api/settings/userList/cron'], fetcher);
    const { data: engineerUserData, error: engineerUserError } = useSWR(['/api/settings/userList/engineer'], fetcher);
    const { data: reportEmailData, error: reportEmailError } = useSWR(['/api/settings/reportEmail'], fetcher);

    const [cronUserState, setCronUserState] = useState({}); //{userId:true/false,  2:true, 1:false}
    const [engineerUserState, setEngineerUserState] = useState({}); //{userId:true/false,  2:true, 1:false}
    const [reportEmailState, setReportEmailState] = useState(undefined);
    const [saveLoading, setSaveLoading] = useState(false);
    const [saveError, setSaveError] = useState(false);
    //cron table stuff:
    let cronUser = [];
    if(!cronUserError && cronUserData && !cronUserData.message){
        cronUser = mergeApiAndState(cronUserData,cronUserState);
    }
    const cronRows = cronUser.map(user => [
        (<Checkbox disabled={!user.enabled} checked={user.enabled ? user.included : false} onChange={event => setCronUserState({...cronUserState, [user.id]:event.target.checked})}/>),
        (<div style={user.enabled ? null:{textDecoration: 'line-through'}}>{user.alias}</div>),
        (<div style={user.enabled ? null:{textDecoration: 'line-through'}}>{user.username}</div>),
        (<div style={user.enabled ? null:{textDecoration: 'line-through'}}>{user.id}</div>)
    ]);
    
    //second table stuff:
    let engineerUser = [];
    if(!engineerUserError && engineerUserData && !engineerUserData.message){
        engineerUser = mergeApiAndState(engineerUserData,engineerUserState);
    }
    const engineerRows = engineerUser.map(user => [
        (<Checkbox disabled={!user.enabled} checked={user.enabled ? user.included : false} onChange={event => setEngineerUserState({...engineerUserState, [user.id]:event.target.checked})}/>),
        (<div style={user.enabled ? null:{textDecoration: 'line-through'}}>{user.alias}</div>),
        (<div style={user.enabled ? null:{textDecoration: 'line-through'}}>{user.username}</div>),
        (<div style={user.enabled ? null:{textDecoration: 'line-through'}}>{user.id}</div>)
    ]);

    //report email stuff:
    let reportEmail = [];
    if(!reportEmailError && reportEmailData !== undefined && !reportEmailData.message){
        reportEmail = reportEmailState !== undefined ? reportEmailState : (reportEmailData || []);
    }
    const emailError = reportEmail.length === 0 || reportEmail.filter(email => !email.match(EMAIL_REGEX)).length > 0;
    console.log("emailError",reportEmail,emailError,reportEmail.filter(email => !email.match(EMAIL_REGEX)).length > 0)
    const classes = useStyles();
    return (
        <div className="container">
            <ThemeProvider theme={theme}>
                <CssBaseline/>
                <Head>
                    <title>Owncloud Reporting Dashboard | Settings</title>
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
                                &nbsp;/ Settings
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
                                
                                { reportEmailError && (<p>failed to load table: {reportEmailError.message}</p>)}
                                { !reportEmailError && reportEmailData && reportEmailData.message && (<p>failed to load table: {JSON.stringify(reportEmailData.message)}</p>)}
                                { !reportEmailError && !reportEmailData && (<LinearProgress />)}
                                { !reportEmailError && reportEmailData && !reportEmailData.message && (
                                        // <TextField value={reportEmail} error={emailError} label="Cron Report Email" 
                                        // helperText={emailError && "bitte eine gültige email adresse angeben"}
                                        // onChange={(e)=>setReportEmailState(e.currentTarget.value)}
                                        // />

 
                                        // // // uncontrolled input
                                        // <ChipInput
                                        //     defaultValue={['foo', 'bar']}
                                        //     onChange={(chips) => handleChange(chips)}
                                        //     />
                                        <ChipInput
                                            fullWidth
                                            label="Cron Report Emails"
                                            error={emailError}
                                            helperText={emailError ? "bitte eine gültige email adresse angeben" :
                                                "Hier alle emails angeben. Zwischen Emails mit ENTER bestätigen." } 
                                            value={reportEmail}
                                            onAdd={(chip) => {
                                                console.log("chip",chip);
                                                setReportEmailState([...reportEmail, chip])
                                            }}
                                            onDelete={(chip, index) => setReportEmailState(reportEmail.filter(email => email !== chip))}
                                          />

                                    )}
                            </Grid>
                            <Grid item xs={12} md={12} />
                            <Grid item xs={12} md={6}>
                                <Paper className={classes.chartPaper}>
                                    <Typography variant="h6" gutterBottom color="textSecondary" align="center">
                                        Mitarbeiterliste für Cronjob und Presales chart
                                    </Typography>
                                    { cronUserError && (<p>failed to load table: {cronUserError.message}</p>)}
                                    { !cronUserError && cronUserData && cronUserData.message && (<p>failed to load table: {JSON.stringify(cronUserData.message)}</p>)}
                                    { !cronUserError && !cronUserData && (<LinearProgress />)}
                                    { !cronUserError && cronUserData && !cronUserData.message && (<DynamicTable tableId='cron' rows={cronRows} header={['Included', 'Alias', 'Username', 'ID']}/>)}
                                </Paper>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Paper className={classes.chartPaper}>
                                    <Typography variant="h6" gutterBottom color="textSecondary" align="center">
                                        Engineering Mitarbeiterliste
                                    </Typography>
                                    { engineerUserError && (<p>failed to load table: {engineerUserError.message}</p>)}
                                    { !engineerUserError && engineerUserData && engineerUserData.message && (<p>failed to load table: {JSON.stringify(engineerUserData.message)}</p>)}
                                    { !engineerUserError && !engineerUserData && (<LinearProgress />)}
                                    { !engineerUserError && engineerUserData && !engineerUserData.message && (<DynamicTable tableId='engineer' rows={engineerRows} header={['Included', 'Alias', 'Username', 'ID']}/>)}
                                </Paper>
                            </Grid>
                        </Grid>
                    </Container>
                    <Fab disabled={
                        !(  (!engineerUserError && engineerUserData && !engineerUserData.message) && 
                            (!cronUserError && cronUserData && !cronUserData.message) &&
                            (!reportEmailError && reportEmailData && !reportEmailData.message)  )
                    } 
                        variant="extended" 
                        color="primary" 
                        aria-label="print as pdf" 
                        className={classes.fab} 
                        onClick={async ()=>{
                            setSaveLoading(true);
                            const successfull = await saveChanges(cronUser,engineerUser,reportEmail);
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
        </div>
    );
}
export default Settings
