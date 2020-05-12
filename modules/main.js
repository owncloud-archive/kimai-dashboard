import { makeStyles } from '@material-ui/core/styles';
import { useState } from 'react';
import Link from 'next/link';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import AccessTimeIcon from '@material-ui/icons/AccessTime';
import Paper from '@material-ui/core/Paper';
import {
    MuiPickersUtilsProvider,
    KeyboardDatePicker,
} from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns'; //will be deprecated with v4.0.0-alpha.3
//import DateFnsUtils from '@material-ui/pickers/adapter/date-fns'; //use this after v4.0.0-alpha.3
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Fab from '@material-ui/core/Fab';
import SettingsIcon from '@material-ui/icons/Settings';
import PostAddIcon from '@material-ui/icons/PostAdd';
// import Autocomplete from '@material-ui/lab/Autocomplete';
import { useRouter } from 'next/router'


//import icons
import PictureAsPdfIcon from '@material-ui/icons/PictureAsPdf';

//import custom components
import ProjectTotalSpend from './charts/1_projectTotalSpend';
import CustomerConsultingHours from './charts/2_customerConsultingHours';
import BillingTypeHours from './charts/3_billingTypeHours';
import ProjectTAM from './charts/4_projectTAM';
import CustomerEngineerHours from './charts/5_engineersHours';
import CustomerPresalesHours from './charts/6_presalesHours';
import ImportedData from './charts/7_importedData';

const useStyles = makeStyles(theme => ({
    chartPaper:{
        padding: theme.spacing(1),
        // textAlign: 'center',
        // color: theme.palette.text.secondary
    },
    fab: {
        position: "fixed",
        bottom: theme.spacing(2),
        right: theme.spacing(2),
        ['@media print']:{
            display:'none',
        }
    },
    menupoint: {
        cursor:'pointer',
        '&:hover': { textDecoration:'underline' },
    },
    iconmenupoint_booking: {
        cursor:'pointer',
        position:"absolute",
        color:"white",
        right:'100px',
        '&:hover': { opacity:0.8 },
    },
    iconmenupoint: {
        cursor:'pointer',
        position:"absolute",
        color:"white",
        right:'20px',
        '&:hover': { opacity:0.8 },
    },
    iconmenupoint_import: {
        cursor:'pointer',
        position:"absolute",
        color:"white",
        right:'60px',
        '&:hover': { opacity:0.8 },
    },
    noprint: {
        ['@media print']:{
            display:'none',
        }
    },
    printonly: {
        display:'none',
        ['@media print']:{
            display:'block',
        }  
    }
}));

const Main = (props) => {
    const classes = useStyles();
    const [selectedFrom, setSelectedFrom] = useState(new Date(((new Date()).setMonth(new Date().getMonth() - 1)))); //today - 1 month
    const [selectedTo, setSelectedTo] = useState(new Date());
    const router = useRouter()
    // const [printOpen, setPrintOpen] = useState(new Date());

    // useEffect(() => {
    //     var mediaQueryList = window.matchMedia('print');
    //     const listener = (mql) => {
    //         if (mql.matches) {
    //             setPrintOpen(true);
    //             console.log("print open");
    //         } else {
    //             setPrintOpen(false);
    //             console.log("print closed");
    //         }
    //     };
    //     mediaQueryList.addListener(listener);
    //     return () => {
    //         mediaQueryList.removeListener(listener);
    //     };
    // });
    return (
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <main>
                <AppBar position="static" className={classes.noprint}>
                    <Toolbar>
                        <Typography variant="h6" className={classes.menupoint}>
                            Reporting Dashboard
                        </Typography>

                        <Tooltip title="Add a time booking" aria-label="Add a time booking">
                            <IconButton aria-label="import" className={classes.iconmenupoint_booking} onClick={() => router.push('/booking')}>    
                                <AccessTimeIcon /> 
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Consulting data import" aria-label="Consulting data import">
                            <IconButton aria-label="import" className={classes.iconmenupoint_import} onClick={() => router.push('/import')}>    
                                <PostAddIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Settings page" aria-label="Consulting data import">
                            <IconButton className={classes.iconmenupoint} onClick={() => router.push('/settings')}>
                                <SettingsIcon />
                            </IconButton>
                        </Tooltip>
                    </Toolbar>
                </AppBar>
                
                {/* grid breakpoints: xs, sm, md, lg, and xl. */}

                <Typography variant="h4" className={classes.printonly}>
                    OwnCloud Report from {selectedFrom.toDateString()} till {selectedTo.toDateString()}:
                </Typography>
                <Container maxWidth="xl">
                    <Grid container spacing={2}>
                        <Grid item xs={6} sm={5} md={3} lg={2}>
                            <KeyboardDatePicker
                                className={classes.noprint}
                                disableToolbar
                                variant="outlined"
                                format="dd.MM.yyyy"
                                maxDate={new Date()}
                                margin="normal"
                                label="From:"
                                value={selectedFrom}
                                onChange={setSelectedFrom}
                                KeyboardButtonProps={{
                                    'aria-label': 'change from date',
                                }}
                                />
                        </Grid>
                        <Grid item xs={6} sm={5} md={3} lg={2}>
                            <KeyboardDatePicker
                                className={classes.noprint}
                                disableToolbar
                                variant="outlined"
                                format="dd.MM.yyyy"
                                maxDate={new Date()}
                                margin="normal"
                                label="To:"
                                value={selectedTo}
                                onChange={setSelectedTo}
                                KeyboardButtonProps={{
                                    'aria-label': 'change to date',
                                }}
                                />
                        </Grid>
                        <Grid item xs={12} sm={12} md={6} lg={8}>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Paper className={classes.chartPaper}>
                                <Typography variant="h6" gutterBottom color="textSecondary" align="left">
                                    Time spent and budgets by projects (non TAM)
                                </Typography>
                                <ProjectTotalSpend fromDate={selectedFrom} toDate={selectedTo}/>
                            </Paper>
                        </Grid>

                        <Grid item xs={12} md={6}>                            
                            <Paper className={classes.chartPaper}>
                                <Typography variant="h6" gutterBottom color="textSecondary" align="left">
                                    Consulting hours by customer
                                </Typography>
                                <CustomerConsultingHours fromDate={selectedFrom} toDate={selectedTo}/>
                            </Paper>
                        </Grid>

                        <Grid item xs={12} md={6}>                            
                            <Paper className={classes.chartPaper}>
                                <Typography variant="h6" gutterBottom color="textSecondary" align="left">
                                    Time spent by billing types
                                </Typography>
                                <BillingTypeHours fromDate={selectedFrom} toDate={selectedTo}/>
                            </Paper>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>                            
                            <Paper className={classes.chartPaper}>
                                <Typography variant="h6" gutterBottom color="textSecondary" align="left">
                                    Time spent by customers (only TAM Projects)
                                </Typography>
                                <ProjectTAM fromDate={selectedFrom} toDate={selectedTo}/>
                            </Paper>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>                            
                            <Paper className={classes.chartPaper}>
                                <Typography variant="h6" gutterBottom color="textSecondary" align="left">
                                    Engineer working hours by customer
                                </Typography>
                                <CustomerEngineerHours fromDate={selectedFrom} toDate={selectedTo}/>
                            </Paper>
                        </Grid>

                        <Grid item xs={12} md={6}>                            
                            <Paper className={classes.chartPaper}>
                                <Typography variant="h6" gutterBottom color="textSecondary" align="left">
                                    Pre sales working hours by customer
                                </Typography>
                                <CustomerPresalesHours fromDate={selectedFrom} toDate={selectedTo}/>
                            </Paper>
                        </Grid>

                        <Grid item xs={12} md={12} className={classes.printonly}>  
                            <br/><br/><br/><br/><br/><br/>
                        </Grid>
                        <Grid item xs={12} md={12} className={classes.printonly}>  
                            <br/><br/><br/><br/><br/><br/>
                        </Grid>

                        <Grid item xs={12} md={6}>                            
                            <Paper className={classes.chartPaper}>
                                <Typography variant="h6" gutterBottom color="textSecondary" align="left">
                                    Consulting Reporting
                                </Typography>
                                <ImportedData fromDate={selectedFrom} toDate={selectedTo}/>
                            </Paper>
                        </Grid>
                    </Grid>
                </Container>
            </main>
            <Fab 
                // disabled={!(!importError && importData && !importData.message)}  //TODO: disable print button while loading, need rewrite to have access to the loading state in this component
                variant="extended" 
                color="primary" 
                aria-label="print as pdf" 
                className={classes.fab} 
                onClick={()=>window.print()}>
                <PictureAsPdfIcon />
                &nbsp;
                print as PDF
            </Fab>
        </MuiPickersUtilsProvider>
    )
}
export default Main