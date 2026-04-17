import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1B5E20',
      light: '#388E3C',
      dark: '#0D3817',
      contrastText: '#fff',
    },
    secondary: {
      main: '#388E3C',
      light: '#66BB6A',
      dark: '#2E7D32',
      contrastText: '#fff',
    },
    success: {
      main: '#4CAF50',
    },
    warning: {
      main: '#FFA726',
    },
    error: {
      main: '#EF5350',
    },
    info: {
      main: '#29B6F6',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontFamily: '"Noto Sans Tamil", sans-serif',
      fontWeight: 700,
    },
    h2: {
      fontFamily: '"Noto Sans Tamil", sans-serif',
      fontWeight: 700,
    },
    h3: {
      fontFamily: '"Noto Sans Tamil", sans-serif',
      fontWeight: 700,
    },
    h4: {
      fontFamily: '"Noto Sans Tamil", sans-serif',
      fontWeight: 700,
    },
    h5: {
      fontFamily: '"Noto Sans Tamil", sans-serif',
      fontWeight: 700,
    },
    h6: {
      fontFamily: '"Noto Sans Tamil", sans-serif',
      fontWeight: 700,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        size: 'small',
      },
    },
  },
});

export default theme;
