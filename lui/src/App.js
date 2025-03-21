import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { darkTheme, lightTheme } from './theme';
import LanguageModelUI from './components/LanguageModelUI';
import HistoryLog from './pages/HistoryLog';
import UserProfile from './pages/UserProfile';

const App = () => {
  const [isDarkTheme, setIsDarkTheme] = React.useState(true); // Default to dark theme

  const handleThemeToggle = () => {
    setIsDarkTheme(!isDarkTheme);
  };

  return (
    <ThemeProvider theme={isDarkTheme ? darkTheme : lightTheme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<LanguageModelUI onThemeToggle={handleThemeToggle} isDarkTheme={isDarkTheme} />} />
          <Route path="/history-log" element={<HistoryLog isDarkTheme={isDarkTheme} />} />
          <Route path="/user-profile" element={<UserProfile isDarkTheme={isDarkTheme} />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;