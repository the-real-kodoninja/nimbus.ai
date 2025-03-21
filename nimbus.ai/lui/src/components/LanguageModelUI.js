import React, { useState } from 'react';
import {
  Box,
  TextField,
  Typography,
  Paper,
  IconButton,
  AppBar,
  Toolbar,
  Menu,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AccountCircle from '@mui/icons-material/AccountCircle';
import UploadIcon from '@mui/icons-material/Upload';
import ThunderstormIcon from '@mui/icons-material/Thunderstorm';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import SettingsIcon from '@mui/icons-material/Settings';
import HistoryIcon from '@mui/icons-material/History';

const CloudSVG = ({ isDarkTheme }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="30"
    height="30"
    viewBox="0 0 24 24"
    fill={isDarkTheme ? "#9c27b0" : "#000000"}
  >
    <path d="M20 17.58A4.5 4.5 0 0 0 20 15a4.5 4.5 0 0 0-4.5-4.5A4.5 4.5 0 0 0 12 6a4.5 4.5 0 0 0-4.5 4.5A4.5 4.5 0 0 0 3 15a4.5 4.5 0 0 0 0 9h17a4.5 4.5 0 0 0 0-9z" />
  </svg>
);

const LanguageModelUI = ({ onThemeToggle, isDarkTheme }) => {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [history, setHistory] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [showWelcome, setShowWelcome] = useState(true);

  const handleSubmit = async () => {
    const aiResponse = await fetchAIResponse(input);
    setResponse(aiResponse);
    setHistory([...history, { query: input, response: aiResponse, date: new Date() }]);
    setInput('');
    setShowWelcome(false);
  };

  const fetchAIResponse = async (query) => {
    return `AI Response to: ${query}`;
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const wordCount = input.split(/\s+/).filter((word) => word.length > 0).length;

  return (
    <Box sx={{ backgroundColor: 'background.default', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static" sx={{ backgroundColor: 'background.paper' }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={handleMenuClick} sx={{ color: isDarkTheme ? 'inherit' : 'text.primary' }}>
            <MenuIcon />
          </IconButton>
          <CloudSVG isDarkTheme={isDarkTheme} />
          <Typography variant="h6" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', marginLeft: '8px', color: isDarkTheme ? 'inherit' : 'text.primary' }}>
            Nimbus.ai
          </Typography>
          <IconButton color="inherit" sx={{ width: 40, height: 40 }}>
            <AccountCircle sx={{ fontSize: 30, color: isDarkTheme ? 'inherit' : 'text.primary' }} />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box sx={{ flexGrow: 1, padding: 4, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', marginTop: -4, marginBottom: -3 }}>
        <Paper elevation={3} sx={{ flexGrow: 1, width: '100%', maxWidth: 600, marginTop: 2, padding: 2, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
          <Box sx={{ overflowY: 'auto', flexGrow: 1 }}>
            {showWelcome ? (
              <Typography variant="body1" align="center" sx={{ color: isDarkTheme ? 'text.secondary' : 'text.primary', marginTop: 2 }}>
                Welcome to Nimbus.ai an agent of the Thunderhead! Ask me anything.
              </Typography>
            ) : (
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', color: isDarkTheme ? 'text.secondary' : 'text.primary', marginTop: 0 }}>
                {response}
              </Typography>
            )}
          </Box>
        </Paper>
        <Box sx={{ width: '100%', maxWidth: 632, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginTop: 2.5, paddingBottom: 0, marginBottom: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-end', width: '100%' }}>
            <TextField
              label="Hey, Nimbus!..."
              variant="outlined"
              multiline
              fullWidth
              minRows={1}
              maxRows={4}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              sx={{
                backgroundColor: 'background.paper',
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'primary.main',
                  },
                  '&:hover fieldset': {
                    borderColor: 'primary.light',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'primary.light',
                  },
                },
              }}
            />
            <IconButton
              color="primary"
              onClick={handleSubmit}
              sx={{
                marginLeft: 1,
                background: 'linear-gradient(45deg, #6a1b9a 30%, #9c27b0 90%)',
                borderRadius: '50%',
                width: 56,
                height: 56,
                '&:hover': {
                  background: 'linear-gradient(45deg, #9c27b0 30%, #6a1b9a 90%)',
                },
              }}
            >
              <ArrowForwardIcon />
            </IconButton>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: 1, width: '100%' }}>
            <Typography variant="body2" sx={{ color: isDarkTheme ? 'text.secondary' : 'text.primary' }}>
              Word Count: {wordCount}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton color="primary">
                <UploadIcon />
              </IconButton>
              <Typography variant="body2" sx={{ color: isDarkTheme ? 'text.secondary' : 'text.primary', marginLeft: 0.5 }}>
                Upload
              </Typography>
              <IconButton color="primary" sx={{ marginLeft: 1 }}>
                <ThunderstormIcon />
              </IconButton>
              <Typography variant="body2" sx={{ color: isDarkTheme ? 'text.secondary' : 'text.primary', marginLeft: 0.5 }}>
                Thunderhead
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={onThemeToggle}>
          <IconButton color="inherit">
            {isDarkTheme ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
          {isDarkTheme ? 'Light Mode' : 'Dark Mode'}
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <IconButton color="inherit">
            <SettingsIcon />
          </IconButton>
          Settings
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <IconButton color="inherit">
            <HistoryIcon />
          </IconButton>
          History Log
        </MenuItem>
        <Divider />
        <List>
          {history.map((item, index) => (
            <ListItem key={index} onClick={handleMenuClose}>
              <ListItemText primary={`Query: ${item.query}`} secondary={`Response: ${item.response}`} />
            </ListItem>
          ))}
        </List>
      </Menu>
    </Box>
  );
};

export default LanguageModelUI;