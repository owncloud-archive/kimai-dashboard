import { ThemeProvider } from '@material-ui/core/styles';
import { makeStyles } from '@material-ui/core/styles';
import { useState, useEffect } from 'react';
import { useQueryState } from 'use-location-state';
import Head from 'next/head';
import Link from 'next/link';
import CssBaseline from '@material-ui/core/CssBaseline';
import fetch from 'unfetch';
import useSWR from 'swr';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import Box from '@material-ui/core/Box';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import Fab from '@material-ui/core/Fab';
import Alert from '@material-ui/lab/Alert';
import LinearProgress from '@material-ui/core/LinearProgress';
import CircularProgress from '@material-ui/core/CircularProgress';
import Chip from '@material-ui/core/Chip';
import FormHelperText from '@material-ui/core/FormHelperText';
import Autocomplete from '@material-ui/lab/Autocomplete';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import {
    MuiPickersUtilsProvider,
    KeyboardDatePicker,
    KeyboardTimePicker,
} from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns'; //will be deprecated with v4.0.0-alpha.3'
import set from 'date-fns/set';
import addMinutes from 'date-fns/addMinutes';
import format from 'date-fns/format';

import SaveIcon from '@material-ui/icons/Save';
import CheckIcon from '@material-ui/icons/Check';

import theme from '../modules/theme';

async function fetcher(path, fromDate, toDate) {
    const res = await fetch(path);
    const json = await res.json();
    return json;
}
function timeToInt(time){
    return Number(time.substr(0,2))+Number(time.substr(3))/60;
}
const saveChanges = async (body) => {
    if(body){
        const resp = await fetch('/api/booking',{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body),
        });
        const res = await resp.json();
        return (body && res && res.status === 'ok');
    }
};
const useStyles = makeStyles(theme => ({
    chartPaper:{
        // padding: theme.spacing(1),
        // textAlign: 'center',
        // color: theme.palette.text.secondary
    },
    fab: {
        position: "fixed",
        bottom: theme.spacing(2),
        right: theme.spacing(2),
        transition: 'width 200ms',
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
    datePicker: {
        margin: '0px',
    },
    btnGroupRoot: {
        width: '100%',
    },
    btnGroupGroup: {
        width: '600px',
    },
}));

const fns = new DateFnsUtils();
const Home = (props) => {
    const { data: autofillData, error: autofillError } = useSWR(['/api/booking'], fetcher);
    const [saveLoading, setSaveLoading] = useState(false);
    const [saveError, setSaveError] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const [usernames, setUsernames] = useQueryState("usernames",[]);
    const [usernamesError, setUsernamesError] = useState("");
    const [customer, setCustomer] = useQueryState("customer","");
    const [customerError, setCustomerError] = useState("");
    const [project, setProject] = useQueryState("project","");
    const [projectError, setProjectError] = useState("");
    const [activity, setActivity] = useQueryState("activity","");
    const [activityError, setActivityError] = useState("");
    const [description, setDescription] = useQueryState("description","");
    const [descriptionError, setDescriptionError] = useState("");
    const [date, setDate] = useQueryState("date", set(new Date(), {hours:0,minutes:0,seconds:0}));
    const [dateError, setDateError] = useState("");
    // const [startTime, setStartTime] = useQueryState("startTime", set(new Date(), {hours:9,minutes:0,seconds:0}));
    const [startTime, setStartTime] = useQueryState("startTime", "09:00");
    const [startTimeError, setStartTimeError] = useState("");
    // const [endTime, setEndTime] = useQueryState("endTime", set(new Date(), {hours:9,minutes:30,seconds:0}));
    const [endTime, setEndTime] = useQueryState("endTime", "09:30");
    const [endTimeError, setEndTimeError] = useState("");
    useEffect(() => {
        if(!autofillError && autofillData && !autofillData.message){
            if(autofillData.users) { //make sure to filter out unvalid values from querystring
                const allUsernames = autofillData.users.map(u=>u.username);
                const filtered = usernames.filter(user => allUsernames.includes(user));
                if(filtered.length !== usernames.length) setUsernamesError("Some usernames were invalid and have been removed.");
                setUsernames(filtered);
            }
            if(autofillData.customers) { //make sure customer is 
                const filtered = autofillData.customers.map(c=>c.name).includes(customer) ? customer : "";
                if(filtered !== customer) setCustomerError("The submitted customer does not exist.");
                setCustomer(filtered);
            }
            if(autofillData.projects) { //make sure customer is 
                const filtered = autofillData.projects.map(p=>p.name).includes(project) ? project : "";
                if(filtered !== project) setProjectError("The submitted project does not exist.");
                setProject(filtered);
            }
            if(autofillData.activities) { //make sure customer is 
                const filtered = autofillData.activities.map(a=>a.name).includes(activity) ? activity : "";
                if(filtered !== activity) setActivityError("The submitted activity does not exist.");
                setActivity(filtered);
            }
        }
    }, [autofillData,autofillError]);

    if(autofillData && autofillData.projects && autofillData.customers){
        autofillData.projects = autofillData.projects.map(p=>({...p, customerName:autofillData.customers.filter(c=>c.id===p.customer)[0].name}));
    }
    const classes = useStyles();
    return (
        <div className="container">
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <ThemeProvider theme={theme}>
                    <CssBaseline/>
                    <Head>
                        <title>Owncloud Reporting Dashboard | Time Booking</title>
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
                                    &nbsp;/ Time Booking
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
                                    <Alert severity="error">Save unsuccessful! The API is having problems. Try again later or contact the support.</Alert>
                                </Grid>}
                                <Grid item xs={12} md={12}>
                                    <Paper className={classes.chartPaper}>
                                        <Typography variant="h6" gutterBottom color="textSecondary" align="center">
                                            Time booking UI
                                        </Typography>
                                        { autofillError && (<p>failed to load table: {autofillError.message}</p>)}
                                        { !autofillError && autofillData && autofillData.message && (<p>failed to load table: {JSON.stringify(autofillData.message)}</p>)}
                                        { !autofillError && !autofillData && (<LinearProgress />)}
                                        { !autofillError && autofillData && !autofillData.message && (
                                            
                                            <Box m={2}>
                                                <Grid container spacing={2}>
                                                    <Grid item xs={12} md={12}>
                                                        <Autocomplete
                                                            multiple
                                                            options={autofillData.users}
                                                            getOptionLabel={(option) => option.alias || option.username}
                                                            value={autofillData.users.filter(user => usernames.includes(user.username))}
                                                            onChange={(e, newUsers)=>{
                                                                setUsernames(newUsers.map(user => user.username));
                                                                setUsernamesError("");
                                                            }}
                                                            renderInput={(params) => (
                                                                <TextField
                                                                    {...params}
                                                                    error={usernamesError !== "" ? true : undefined}
                                                                    variant="standard"
                                                                    label="Users"
                                                                    required
                                                                    fullWidth
                                                                    // placeholder="add more users"
                                                                />
                                                            )}
                                                        />
                                                        <FormHelperText error={usernamesError !== "" ? true : undefined}>{usernamesError}</FormHelperText>
                                                    </Grid>
                                                    <Grid item xs={12} md={12}>
                                                        <Autocomplete
                                                            options={autofillData.customers}
                                                            getOptionLabel={(option) => option.name}
                                                            value={autofillData.customers.filter(c => c.name === customer)[0] || null}
                                                            onChange={(e, newCustomer)=>{
                                                                setCustomer(newCustomer && newCustomer.name || "");
                                                                //reset project if project does not belong to current customer
                                                                const currentProjectObj = autofillData.projects.filter(p => p.name === project)[0];
                                                                if(newCustomer && (!currentProjectObj || (currentProjectObj && currentProjectObj.customer !== newCustomer.id))){
                                                                    const customerProjects = autofillData.projects.filter(p => p.customer === newCustomer.id);
                                                                    if(customerProjects.length === 1) setProject(customerProjects[0].name);
                                                                    else setProject("");
                                                                }
                                                                setCustomerError("");
                                                            }}
                                                            renderInput={(params) => (
                                                                <TextField
                                                                    {...params}
                                                                    error={customerError !== "" ? true : undefined}
                                                                    variant="standard"
                                                                    label="Customer"
                                                                    required
                                                                    fullWidth
                                                                    // placeholder="add more users"
                                                                />
                                                            )}
                                                        />
                                                        <FormHelperText error={customerError !== "" ? true : undefined}>{customerError}</FormHelperText>
                                                    </Grid>
                                                    <Grid item xs={12} md={12}>
                                                        <Autocomplete
                                                            options={
                                                                autofillData.projects
                                                                    .filter(o=> customer === "" ? true : o.customerName === customer) // only display projects for current customer. if no customer is set, display all projects
                                                                    .sort((a, b) => -b.customerName.localeCompare(a.customerName))} // sort options by groupBy value, this is needed for correct value selection!!
                                                            groupBy={(option) => option.customerName}
                                                            getOptionLabel={(option) => option.name}
                                                            value={autofillData.projects.filter(p => p.name === project)[0] || null}
                                                            onChange={(e, newProject)=>{
                                                                console.log(newProject)
                                                                setProject(newProject && newProject.name || "")
                                                                if(newProject && newProject.customerName) setCustomer(newProject.customerName)
                                                                setProjectError("")
                                                            }}
                                                            renderInput={(params) => (
                                                                <TextField
                                                                    {...params}
                                                                    error={projectError !== "" ? true : undefined}
                                                                    variant="standard"
                                                                    label="Project"
                                                                    required
                                                                    fullWidth
                                                                    // placeholder="add more users"
                                                                />
                                                            )}
                                                        />
                                                        <FormHelperText error={projectError !== "" ? true : undefined}>{projectError}</FormHelperText>
                                                    </Grid>
                                                    <Grid item xs={12} md={12}>
                                                        <Autocomplete
                                                            options={autofillData.activities}
                                                            getOptionLabel={(option) => option.name}
                                                            value={autofillData.activities.filter(a => a.name === activity)[0] || null}
                                                            onChange={(e, newActivity)=>{
                                                                if(activity==="Other - Explain in description!" && (newActivity && newActivity.name) !== "Other - Explain in description!") setDescriptionError("");
                                                                setActivity(newActivity && newActivity.name || "");
                                                                setActivityError("");
                                                            }}
                                                            renderInput={(params) => (
                                                                <TextField
                                                                    {...params}
                                                                    error={activityError !== "" ? true : undefined}
                                                                    variant="standard"
                                                                    label="Activity"
                                                                    required
                                                                    fullWidth
                                                                    // placeholder="add more users"
                                                                />
                                                            )}
                                                        />
                                                        <FormHelperText error={activityError !== "" ? true : undefined}>{activityError}</FormHelperText>
                                                    </Grid>
                                                    <Grid item xs={12} md={12}>
                                                        <TextField 
                                                            fullWidth
                                                            error={descriptionError !== "" ? true : undefined}
                                                            helperText={descriptionError}
                                                            required={activity==="Other - Explain in description!"}
                                                            value={description}
                                                            onChange={(e)=>{
                                                                setDescription(e.target.value);
                                                                setDescriptionError("");
                                                            }}
                                                            label="Description" />
                                                    </Grid>
                                                    <Grid item xs={12} md={12}>
                                                        <br/>
                                                        <br/>
                                                        <br/>
                                                        Time Selection:
                                                    </Grid>
                                                    <Grid item xs={6} md={6}>
                                                        <KeyboardDatePicker
                                                            className={classes.datePicker}
                                                            fullWidth
                                                            disableToolbar
                                                            variant="inline"
                                                            format="dd.MM.yyyy"
                                                            // maxDate={new Date()}
                                                            margin="normal"
                                                            label="Date:"
                                                            value={date}
                                                            onChange={setDate}
                                                            KeyboardButtonProps={{
                                                                'aria-label': 'change from date',
                                                            }}
                                                            />
                                                    </Grid>
                                                    <Grid item xs={6} md={6}>
                                                        {/* <KeyboardTimePicker
                                                            className={classes.noprint}
                                                            fullWidth
                                                            disableToolbar
                                                            variant="inline"
                                                            format="HH:mm"
                                                            // maxDate={new Date()}
                                                            margin="normal"
                                                            label="Start time:"
                                                            value={startTime}
                                                            onChange={setStartTime}
                                                            KeyboardButtonProps={{
                                                                'aria-label': 'change from date',
                                                            }}
                                                            /> */}
                                                        <TextField
                                                            fullWidth
                                                            label="Start time:"
                                                            type="time"
                                                            error={startTimeError !== "" ? true : undefined}
                                                            helperText={startTimeError}
                                                            value={startTime}
                                                            onChange={(e)=>{
                                                                setStartTime(e.currentTarget.value)
                                                                setStartTimeError("");
                                                                if(timeToInt(e.currentTarget.value)>timeToInt(endTime)){
                                                                    setEndTime(e.currentTarget.value);
                                                                    setEndTimeError("");
                                                                }
                                                            }}
                                                            InputLabelProps={{
                                                                shrink: true,
                                                            }}
                                                            inputProps={{
                                                                step: 300, // 5 min
                                                            }}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12} md={12}>
                                                        <ToggleButtonGroup
                                                            value={(timeToInt(endTime)-timeToInt(startTime)).toFixed(1)}
                                                            exclusive
                                                            // size="large"
                                                            classes={{root:classes.btnGroupRoot, grouped:classes.btnGroupGroup}}
                                                            onChange={(e,v)=>setEndTime(
                                                                    addMinutes(
                                                                        set(new Date(), {hours: Number(startTime.substr(0,2)), minutes: Number(startTime.substr(3)), seconds:0, milliseconds:0}),
                                                                        Number(v)*60
                                                                    ).toTimeString().substr(0,5)
                                                                )}
                                                            aria-label="text alignment"
                                                            >
                                                            <ToggleButton value={"0.25"}>
                                                                15m
                                                            </ToggleButton>
                                                            <ToggleButton value={"0.5"}>
                                                                30m
                                                            </ToggleButton>
                                                            <ToggleButton value={"1.0"}>
                                                                1h
                                                            </ToggleButton>
                                                            <ToggleButton value={"2.0"}>
                                                                2h
                                                            </ToggleButton>
                                                            <ToggleButton value={"4.0"}>
                                                                4h
                                                            </ToggleButton>
                                                            <ToggleButton value={"8.0"}>
                                                                8h
                                                            </ToggleButton>
                                                        </ToggleButtonGroup>
                                                    </Grid>
                                                    <Grid item xs={6} md={6}>
                                                        {/* <KeyboardTimePicker
                                                            className={classes.noprint}
                                                            fullWidth
                                                            disableToolbar
                                                            variant="inline"
                                                            format="HH:mm"
                                                            // maxDate={new Date()}
                                                            margin="normal"
                                                            label="End time:"
                                                            value={endTime}
                                                            onChange={setEndTime}
                                                            KeyboardButtonProps={{
                                                                'aria-label': 'change from date',
                                                            }}
                                                            /> */}

                                                        <TextField
                                                            fullWidth
                                                            label="End time:"
                                                            type="time"
                                                            error={endTimeError !== "" ? true : undefined}
                                                            helperText={endTimeError}
                                                            value={endTime}
                                                            onChange={(e)=>{
                                                                setEndTime(e.currentTarget.value)
                                                                setEndTimeError("")
                                                            }}
                                                            InputLabelProps={{
                                                                shrink: true,
                                                            }}
                                                            inputProps={{
                                                                step: 300, // 5 min
                                                                min: startTime,
                                                            }}
                                                        />
                                                    </Grid>
                                                </Grid>
                                            </Box>
                                        )}
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
                        <Fab variant="extended" 
                            disabled={!(!autofillError && autofillData && !autofillData.message) || saveLoading || saveSuccess} 
                            color="primary" 
                            aria-label="print as pdf" 
                            className={classes.fab} 
                            onClick={async ()=>{
                                //do validation
                                let error = false;
                                const setError = (setErrorFunction,message) => {
                                    error = true;
                                    setErrorFunction(message);
                                }
                                if(usernames.length <= 0) setError(setUsernamesError,"Minimum one user required.");
                                if(project==="") setError(setProjectError,"Please select a valid project.");
                                if(customer==="") setError(setCustomerError,"Please select a valid customer.");
                                if(activity==="") setError(setActivityError,"Please select a valid activity.");
                                console.log(autofillData);
                                if(activity==="Other - Explain in description!" && description==="") setError(setDescriptionError,"Description is mandatory for the selected activity.");
                                if(startTime==="") setError(setStartTimeError,"Please select a valid star time.");
                                if(endTime==="") setError(setEndTimeError,"Please select a valid end time.");
                                if(endTime!=="" && timeToInt(endTime) <= timeToInt(startTime)) setError(setEndTimeError,"End time must be greater as start time.");
                                if(error) return;

                                if(!(autofillData && autofillData.users && autofillData.projects && autofillData.activities && autofillData.customers)) {
                                    setSaveError(true);
                                    return;
                                }
                                const body = {
                                    userIds: autofillData.users.filter(u => usernames.includes(u.username)).map(u => u.id),
                                    project: autofillData.projects.filter(p => p.name === project)[0].id,
                                    customer: autofillData.customers.filter(c => c.name === customer)[0].id,
                                    activity: autofillData.activities.filter(a => a.name === activity)[0].id,
                                    description: description,
                                    begin: format(set(date, {hours:timeToInt(startTime),minutes:timeToInt(startTime)%1*60}),"yyyy-MM-dd'T'HH:mm:ss"),
                                    end: format(set(date, {hours:timeToInt(endTime),minutes:timeToInt(endTime)%1*60}),"yyyy-MM-dd'T'HH:mm:ss"),
                                };
                                console.log(body);
                                setSaveLoading(true);
                                const successfull = await saveChanges(body); //send everthing with ids
                                // const successfull = true;
                                // on error set router/link to #alert (id="alert")
                                setTimeout(()=>{
                                    setSaveError(!successfull);
                                    setSaveLoading(false);

                                    if(successfull){
                                        setSaveSuccess(true);
                                        setTimeout(()=>{
                                            setSaveSuccess(false);
                                        },2000);
                                    }
                                },750);

                                
                                
                            }}>
                                {
                                    saveSuccess ? (
                                        <>
                                            <CheckIcon />
                                            &nbsp;
                                            Successful
                                        </>
                                    ) : (
                                        saveLoading ? (
                                            <>
                                                <CircularProgress color="secondary" size={18} />
                                                &nbsp;
                                                saving...
                                            </>
                                        ) : (
                                            <>
                                                <SaveIcon />
                                                &nbsp;
                                                Save
                                            </>
                                        )
                                    )
                                }
                        </Fab>
                    </main>
                </ThemeProvider>
            </MuiPickersUtilsProvider>
        </div>
    );
}
export default Home
