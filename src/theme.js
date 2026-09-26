import { createTheme } from '@mui/material/styles';

const tema = createTheme({
  palette: {
    primary: { main: '#ff5722' },
    secondary: { main: '#1e88e5' },
    background: { default: '#f5f6fa' },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 800 },
    h5: { fontWeight: 700 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: { root: { border: '1px solid #e6e8ef' } },
    },
    MuiCardHeader: {
      styleOverrides: { title: { fontWeight: 700, fontSize: '1.05rem' } },
    },
  },
});

export default tema;
