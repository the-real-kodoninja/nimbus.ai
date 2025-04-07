import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import {
  Box,
  Typography,
  AppBar,
  Toolbar,
  Paper,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';

const Settings = ({ isDarkTheme, userSettings, setUserSettings }) => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    aiName: userSettings?.aiName || 'Nimbus.ai',
    voice: userSettings?.voice || 'default',
  });

  useEffect(() => {
    const fetchSettings = async () => {
      if (auth.currentUser) {
        const userDoc = doc(db, 'users', auth.currentUser.uid);
        const docSnap = await getDoc(userDoc);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setSettings(data);
          setUserSettings(data);
        }
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    if (auth.currentUser) {
      const userDoc = doc(db, 'users', auth.currentUser.uid);
      await setDoc(userDoc, settings, { merge: true });
      setUserSettings(settings);
      alert('Settings saved!');
    }
  };

  const handleChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Box sx={{ backgroundColor: 'background.default', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static" sx={{ backgroundColor: 'background.paper' }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => navigate(-1)} sx={{ color: isDarkTheme ? 'inherit' : 'text.primary' }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', marginLeft: '8px', color: isDarkTheme ? 'inherit' : 'text.primary' }}>
            Settings
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ flexGrow: 1, padding: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={3} sx={{ width: '100%', maxWidth: 600, padding: 2 }}>
          <Typography variant="h6" sx={{ marginBottom: 2 }}>
            Platform Settings
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', marginBottom: 2 }}>
            These settings apply to all users of Nimbus.ai.
          </Typography>
          <TextField
            label="Default Model"
            value="Aviyon1.2"
            disabled
            fullWidth
            sx={{ marginBottom: 2 }}
          />
          <TextField
            label="API Rate Limit"
            value="100 requests/minute"
            disabled
            fullWidth
            sx={{ marginBottom: 2 }}
          />

          <Typography variant="h6" sx={{ marginBottom: 2, marginTop: 4 }}>
            User Settings
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', marginBottom: 2 }}>
            Customize your Nimbus experience.
          </Typography>
          <TextField
            label="Nimbus Agent Name"
            value={settings.aiName}
            onChange={(e) => handleChange('aiName', e.target.value)}
            fullWidth
            sx={{ marginBottom: 2 }}
          />
          <FormControl fullWidth sx={{ marginBottom: 2 }}>
            <InputLabel id="voice-select-label">Voice for Text-to-Speech</InputLabel>
            <Select
              labelId="voice-select-label"
              value={settings.voice}
              label="Voice for Text-to-Speech"
              onChange={(e) => handleChange('voice', e.target.value)}
            >
              <MenuItem value="default">Default (Alloy)</MenuItem>
              <MenuItem value="echo">Echo</MenuItem>
              <MenuItem value="fable">Fable</MenuItem>
              <MenuItem value="onyx">Onyx</MenuItem>
              <MenuItem value="nova">Nova</MenuItem>
              <MenuItem value="shimmer">Shimmer</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            sx={{ marginTop: 2 }}
          >
            Save Settings
          </Button>
        </Paper>
      </Box>
    </Box>
  );
};

export default Settings;