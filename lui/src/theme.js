import { createTheme } from '@mui/material/styles';

const darkTheme = createTheme({
  palette: {
    primary: {
      main: '#6a1b9a', // Purple color for buttons
    },
    background: {
      default: '#121212', // Dark background
      paper: '#1e1e1e', // Slightly lighter background for paper components
    },
    text: {
      primary: '#ffffff', // White text
      secondary: '#b0bec5', // Light gray text
    },
  },
  typography: {
    fontFamily: 'Arial, sans-serif',
  },
});

const lightTheme = createTheme({
  palette: {
    primary: {
      main: '#6a1b9a', // Purple color for buttons
    },
    background: {
      default: '#f0f0f0', // Slightly dimmed white background
      paper: '#e0e0e0', // Slightly darker background for paper components
    },
    text: {
      primary: '#000000', // Black text
      secondary: '#757575', // Dark gray text
    },
  },
  typography: {
    fontFamily: 'Arial, sans-serif',
  },
});

export { darkTheme, lightTheme };