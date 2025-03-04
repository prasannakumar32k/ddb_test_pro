import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // Blue
      light: '#42a5f5',
      dark: '#1565c0'
    },
    secondary: {
      main: '#9c27b0', // Purple
      light: '#ba68c8',
      dark: '#7b1fa2'
    },
    error: {
      main: '#d32f2f', // Red
      light: '#ef5350',
      dark: '#c62828'
    },
    warning: {
      main: '#ed6c02', // Orange
      light: '#ff9800',
      dark: '#e65100'
    },
    success: {
      main: '#2e7d32', // Green
      light: '#4caf50',
      dark: '#1b5e20'
    }
  }
});

export default theme;