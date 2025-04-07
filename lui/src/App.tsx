import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import LanguageModelUI from './components/LanguageModelUI/LanguageModelUI';
import HistoryLog from './pages/HistoryLog';
import UserProfile from './pages/userProfile';
import Settings from './pages/Settings';
import LoginSignup from './pages/LoginSignup';

interface UserSettings {
  aiName: string;
  voice: string;
}

const App: React.FC = () => {
  const [isDarkTheme, setIsDarkTheme] = useState<boolean>(true);
  const [userSettings, setUserSettings] = useState<UserSettings>({ aiName: 'Nimbus.ai', voice: 'default' });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
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
              isAuthenticated === null ? (
                <div>Loading...</div>
              ) : isAuthenticated ? (
                <LanguageModelUI
                  onThemeToggle={handleThemeToggle}
                  isDarkTheme={isDarkTheme}
                  userSettings={userSettings}
                  setUserSettings={setUserSettings}
                />
              ) : (
                <LoginSignup setIsLoggedIn={(status) => setIsAuthenticated(status)} />
              )
            }
          />
          <Route
            path="/history-log"
            element={
              <HistoryLog
                isDarkTheme={isDarkTheme}
                userSettings={userSettings}
              />
            }
          />
          <Route
            path="/user-profile"
            element={
              <UserProfile
                isDarkTheme={isDarkTheme}
                userSettings={userSettings}
              />
            }
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
            element={<LoginSignup setIsLoggedIn={(status) => setIsAuthenticated(status)} />}
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;