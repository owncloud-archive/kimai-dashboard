import { ThemeProvider } from '@material-ui/core/styles';
import Head from 'next/head';
import CssBaseline from '@material-ui/core/CssBaseline';

import Main from '../modules/main';
import theme from '../modules/theme';

const Home = () => (
  <div className="container">
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Head>
        <title>Kimai Reporting Dashboard</title>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Open+Sans:300,400,700&display=swap" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
      </Head>
      <Main />
    </ThemeProvider>
  </div>
)
export default Home
