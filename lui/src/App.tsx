import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { auth, db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
import LanguageModelUI from './components/LanguageModelUI/LanguageModelUI';
import HistoryLog from './pages/HistoryLog';
import UserProfile from './pages/userProfile';
import Settings from './pages/Settings';
import LoginSignup from './pages/LoginSignup';
import { UserSettings } from './components/shared/types';

const App: React.FC = () => {
  const [isDarkTheme, setIsDarkTheme] = useState<boolean>(true);
  const [userSettings, setUserSettings] = useState<UserSettings>({
    aiName: 'Nimbus',
    voice: 'default',
    sex: 'other',
    personality: 'friendly',
    avatar: { modelUrl: '', textureUrl: '' },
  });
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setIsLoggedIn(!!user);
      if (user) {
        try {
          const settingsRef = doc(db, 'users', user.uid, 'settings', 'userSettings');
          const settingsSnap = await getDoc(settingsRef);
          if (settingsSnap.exists()) {
            setUserSettings(settingsSnap.data() as UserSettings);
          }
        } catch (error) {
          console.error('Error fetching user settings:', error);
        }
      }
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
              isLoggedIn ? (
                <HistoryLog
                  isDarkTheme={isDarkTheme}
                  userSettings={userSettings}
                />
              ) : (
                <LoginSignup setIsLoggedIn={setIsLoggedIn} />
              )
            }
          />
          <Route
            path="/user-profile"
            element={
              isLoggedIn ? (
                <UserProfile
                  isDarkTheme={isDarkTheme}
                  userSettings={userSettings}
                />
              ) : (
                <LoginSignup setIsLoggedIn={setIsLoggedIn} />
              )
            }
          />
          <Route
            path="/settings"
            element={
              isLoggedIn ? (
                <Settings
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
            path="/login-signup"
            element={<LoginSignup setIsLoggedIn={setIsLoggedIn} />}
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;