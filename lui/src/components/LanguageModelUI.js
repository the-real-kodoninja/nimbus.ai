import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Tooltip,
  Avatar,
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
    width="25"
    height="25"
    viewBox="0 0 24 24"
    style={{ marginTop: '-5px' }}
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
  const [isThunderActive, setIsThunderActive] = useState(false);
  const [isThunderClicked, setIsThunderClicked] = useState(false);
  const [isInputEmpty, setIsInputEmpty] = useState(false);
  const [fileContent, setFileContent] = useState(''); // New state for file content
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!input.trim() && !fileContent) {
      setIsInputEmpty(true);
      setTimeout(() => setIsInputEmpty(false), 1000);
      return;
    }

    if (isThunderClicked) {
      setIsThunderActive(true);
      setResponse('');
      const messageToSend = fileContent ? `${input}\n\nFile Content:\n${fileContent}` : input;
      setHistory([...history, { query: messageToSend, response: 'Your nimbus agent is asking the Thunderhead...', date: new Date() }]);
      setInput('');
      setFileContent(''); // Clear file content after submission
      setShowWelcome(false);

      const aiResponse = await fetchAIResponse(messageToSend);
      setResponse(aiResponse);
      setHistory((prevHistory) => {
        const updatedHistory = [...prevHistory];
        updatedHistory[updatedHistory.length - 1].response = aiResponse;
        return updatedHistory;
      });
      setIsThunderActive(false);
      setIsThunderClicked(false);
    } else {
      const messageToSend = fileContent ? `${input}\n\nFile Content:\n${fileContent}` : input;
      setHistory([...history, { query: messageToSend, response: '', date: new Date() }]);
      setInput('');
      setFileContent('');
      setShowWelcome(false);
    }
  };

  const fetchAIResponse = async (input) => {
    try {
      const response = await fetch('http://localhost:8001/api/nimbus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          context: '' // No specific context for LUI
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Error fetching AI response:', error);
      return 'Nimbus.ai: Sorry, I encountered an error. Please try again later.';
    }
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleHistoryLogClick = () => {
    navigate('/history-log', { state: { history, setHistory } });
    handleMenuClose();
  };

  const handleUserProfileClick = () => {
    navigate('/user-profile');
    handleMenuClose();
  };

  const handleThunderClick = () => {
    setIsThunderClicked(!isThunderClicked);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFileContent(e.target.result);
      };
      reader.readAsText(file); // For now, we'll assume text files
    }
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
          <IconButton color="inherit" onClick={handleUserProfileClick} sx={{ width: 40, height: 40 }}>
            <AccountCircle sx={{ fontSize: 30, color: isDarkTheme ? 'inherit' : 'text.primary' }} />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box sx={{ flexGrow: 1, padding: 4, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', marginTop: -4, marginBottom: -3 }}>
        <Paper elevation={3} sx={{ flexGrow: 1, width: '100%', maxWidth: 636, marginTop: 2, padding: 2, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
          <Box sx={{ overflowY: 'auto', flexGrow: 1 }}>
            {showWelcome ? (
              <Typography variant="body1" align="center" sx={{ color: isDarkTheme ? 'text.secondary' : 'text.primary', marginTop: 2 }}>
                Welcome to Nimbus.ai an agent of the Thunderhead! Ask me anything.
              </Typography>
            ) : (
              history.map((item, index) => (
                <Box key={index} sx={{ display: 'flex', flexDirection: 'column', alignItems: item.query ? 'flex-end' : 'flex-start', marginBottom: 2 }}>
                  {item.query && (
                    <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 1 }}>
                      <Avatar sx={{ marginRight: 1 }}>{/* User's avatar */}</Avatar>
                      <Typography variant="body2" sx={{ backgroundColor: 'primary.light', padding: 1, borderRadius: 1, color: 'text.primary', maxWidth: '80%', overflowY: 'auto' }}>
                        {item.query}
                      </Typography>
                    </Box>
                  )}
                  {item.response && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ backgroundColor: 'background.paper', padding: 1, borderRadius: 1, color: 'text.secondary', maxWidth: '80%', overflowY: 'auto' }}>
                        {item.response}
                      </Typography>
                      <Avatar sx={{ marginLeft: 1 }}>{/* Nimbus agent's avatar */}</Avatar>
                    </Box>
                  )}
                </Box>
              ))
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
                    borderColor: isInputEmpty ? 'red' : 'primary.main',
                  },
                  '&:hover fieldset': {
                    borderColor: isInputEmpty ? 'red' : 'primary.light',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: isInputEmpty ? 'red' : 'primary.light',
                  },
                },
                animation: isInputEmpty ? 'blink 1s step-end infinite' : 'none',
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
              <input
                accept=".txt"
                style={{ display: 'none' }}
                id="upload-file"
                type="file"
                onChange={handleFileUpload}
              />
              <label htmlFor="upload-file">
                <IconButton color="primary" component="span">
                  <UploadIcon />
                </IconButton>
              </label>
              <Typography variant="body2" sx={{ color: isDarkTheme ? 'text.secondary' : 'text.primary', marginLeft: 0.5 }}>
                Upload
              </Typography>
              <Tooltip title="Your nimbus agent will ask the Thunderhead">
                <IconButton
                  color="primary"
                  onClick={handleThunderClick}
                  sx={{
                    marginLeft: 1,
                    animation: isThunderActive ? 'thunder 1s infinite' : 'none',
                    border: isThunderClicked ? '2px solid' : 'none',
                    borderColor: 'primary.main',
                  }}
                >
                  <ThunderstormIcon />
                </IconButton>
              </Tooltip>
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
        <MenuItem onClick={handleHistoryLogClick}>
          <IconButton color="inherit">
            <HistoryIcon />
          </IconButton>
          History Log
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default LanguageModelUI;