import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import LanguageModelUI from './components/LanguageModelUI';
import HistoryLog from './pages/HistoryLog';
import UserProfile from './pages/UserProfile';
import Settings from './pages/Settings';
import LoginSignup from './pages/LoginSignup';

interface UserSettings {
  aiName: string;
  voice: string;
}

const App: React.FC = () => {
  const [isDarkTheme, setIsDarkTheme] = useState<boolean>(true);
  const [history, setHistory] = useState<any[]>([]);
  const [userSettings, setUserSettings] = useState<UserSettings>({ aiName: 'Nimbus.ai', voice: 'default' });
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
    });
    return () => unsubscribe();
  }, []);

  const theme = createTheme({
    palette: {
      mode: isDarkTheme ? 'dark' : 'light',
      primary: {
        main: '#9c27b0',
        light: '#ce93d8',
      },
      background: {
        default: isDarkTheme ? '#121212' : '#f5f5f5',
        paper: isDarkTheme ? '#1e1e1e' : '#ffffff',
      },
      text: {
        primary: isDarkTheme ? '#ffffff' : '#000000',
        secondary: isDarkTheme ? '#b0b0b0' : '#666666',
      },
    },
  });

  const handleThemeToggle = () => {
    setIsDarkTheme(!isDarkTheme);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              isLoggedIn ? (
                <LanguageModelUI
                  onThemeToggle={handleThemeToggle}
                  isDarkTheme={isDarkTheme}
                  userSettings={userSettings}
                  setUserSettings={setUserSettings}
                />
              ) : (
                <LoginSignup setIsLoggedIn={setIsLoggedIn} />
              )
            }
          />
          <Route
            path="/history-log"
            element={
              <HistoryLog
                isDarkTheme={isDarkTheme}
                history={history}
                setHistory={setHistory}
                userSettings={userSettings}
              />
            }
          />
          <Route
            path="/user-profile"
            element={<UserProfile isDarkTheme={isDarkTheme} userSettings={userSettings} />}
          />
          <Route
            path="/settings"
            element={
              <Settings
                isDarkTheme={isDarkTheme}
                userSettings={userSettings}
                setUserSettings={setUserSettings}
              />
            }
          />
          <Route
            path="/login-signup"
            element={<LoginSignup setIsLoggedIn={setIsLoggedIn} />}
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;