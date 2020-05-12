import { createMuiTheme } from '@material-ui/core/styles';

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#1b223d',
    },
    secondary: {
      main: '#1b223d',
    },
  },
  typography: {
    fontFamily: [
      'Open Sans',
    ]
  },
  status: {
    danger: '#E56F35',
  },
});
export default theme;