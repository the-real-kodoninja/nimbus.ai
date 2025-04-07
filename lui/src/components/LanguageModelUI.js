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
  FormControl,
  InputLabel,
  Select,
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
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dark } from 'react-syntax-highlighter/dist/esm/styles/prism';

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
  const [fileContent, setFileContent] = useState('');
  const [selectedModel, setSelectedModel] = useState('google/flan-t5-small');
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!input.trim() && !fileContent) {
      setIsInputEmpty(true);
      setTimeout(() => setIsInputEmpty(false), 1000);
      return;
    }

    const messageToSend = fileContent ? `${input}\n\nFile Content:\n${fileContent}` : input;
    setInput('');
    setFileContent('');
    setShowWelcome(false);

    if (isThunderClicked) {
      setIsThunderActive(true);
      setResponse('');
      setHistory([...history, { query: messageToSend, response: 'Nimbus.ai is asking the Thunderhead...', date: new Date() }]);
    } else {
      setHistory([...history, { query: messageToSend, response: '', date: new Date() }]);
    }

    const aiResponse = await fetchAIResponse(messageToSend);
    setResponse(aiResponse);
    setHistory((prevHistory) => {
      const updatedHistory = [...prevHistory];
      updatedHistory[updatedHistory.length - 1].response = aiResponse;
      return updatedHistory;
    });

    setIsThunderActive(false);
    setIsThunderClicked(false);
  };

  const fetchAIResponse = async (input) => {
    try {
      const response = await fetch('https://nimbus-ai-backend.vercel.app/api/nimbus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          context: '',
          model: selectedModel,
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
      reader.readAsText(file);
    }
  };

  const handleModelChange = (event) => {
    setSelectedModel(event.target.value);
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    alert('Code copied to clipboard!');
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
        <Paper
          elevation={0}  // Remove elevation to remove shadow
          sx={{
            flexGrow: 1,
            width: '100%',
            maxWidth: 636,
            marginTop: 2,
            padding: 2,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            backgroundColor: 'transparent',  // Make background transparent
          }}
        >
          <Box sx={{ overflowY: 'auto', flexGrow: 1, maxHeight: '60vh' }}>  {/* Ensure scrolling for long content */}
            {showWelcome ? (
              <Typography variant="body1" align="center" sx={{ color: isDarkTheme ? 'text.secondary' : 'text.primary', marginTop: 2 }}>
                Welcome to Nimbus.ai an agent of the Thunderhead! Ask me anything.
              </Typography>
            ) : (
              history.map((item, index) => (
                <Box key={index} sx={{ display: 'flex', flexDirection: 'column', marginBottom: 2 }}>
                  {item.query && (
                    <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 1, width: '100%' }}>
                      <Avatar sx={{ marginRight: 1 }} />
                      <Box
                        sx={{
                          backgroundColor: 'primary.light',
                          padding: 1,
                          borderRadius: 1,
                          color: 'text.primary',
                          width: '100%',  // Full width for sent messages
                          overflowWrap: 'break-word',
                        }}
                      >
                        <Typography variant="body2">{item.query}</Typography>
                      </Box>
                    </Box>
                  )}
                  {item.response && (
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <Box
                        sx={{
                          padding: 1,
                          borderRadius: 1,
                          color: 'text.secondary',
                          width: '100%',  // Full width for responses
                          overflowWrap: 'break-word',
                        }}
                      >
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            code({ node, inline, className, children, ...props }) {
                              const match = /language-(\w+)/.exec(className || '');
                              return !inline && match ? (
                                <Box sx={{ position: 'relative' }}>
                                  <SyntaxHighlighter
                                    style={dark}
                                    language={match[1]}
                                    PreTag="div"
                                    {...props}
                                  >
                                    {String(children).replace(/\n$/, '')}
                                  </SyntaxHighlighter>
                                  <IconButton
                                    sx={{ position: 'absolute', top: 8, right: 8 }}
                                    onClick={() => handleCopyCode(String(children))}
                                  >
                                    <ContentCopyIcon fontSize="small" />
                                  </IconButton>
                                </Box>
                              ) : (
                                <code className={className} {...props}>
                                  {children}
                                </code>
                              );
                            },
                          }}
                        >
                          {item.response}
                        </ReactMarkdown>
                      </Box>
                      <Avatar sx={{ marginLeft: 1 }} />
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
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <FormControl sx={{ minWidth: 150, marginRight: 2 }}>
                <InputLabel id="model-select-label">Model</InputLabel>
                <Select
                  labelId="model-select-label"
                  id="model-select"
                  value={selectedModel}
                  label="Model"
                  onChange={handleModelChange}
                >
                  <MenuItem value="distilgpt2">DistilGPT2</MenuItem>
                  <MenuItem value="facebook/opt-125m">OPT-125M</MenuItem>
                  <MenuItem value="google/flan-t5-small">Flan-T5-Small</MenuItem>
                  <MenuItem value="google/flan-t5-base">Flan-T5-Base</MenuItem>
                </Select>
              </FormControl>
              <Typography variant="body2" sx={{ color: isDarkTheme ? 'text.secondary' : 'text.primary' }}>
                Word Count: {wordCount}
              </Typography>
            </Box>
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