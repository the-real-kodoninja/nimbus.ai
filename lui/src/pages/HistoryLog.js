import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  AppBar,
  Toolbar,
  Paper,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AccountCircle from '@mui/icons-material/AccountCircle';

const HistoryLog = ({ isDarkTheme, history, setHistory }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const historyData = location.state?.history || history || [];

  const handleDelete = (index) => {
    const updatedHistory = historyData.filter((_, i) => i !== index);
    setHistory(updatedHistory);
  };

  return (
    <Box sx={{ backgroundColor: 'background.default', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static" sx={{ backgroundColor: 'background.paper' }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => navigate(-1)} sx={{ color: isDarkTheme ? 'inherit' : 'text.primary' }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', marginLeft: '8px', color: isDarkTheme ? 'inherit' : 'text.primary' }}>
            History Log
          </Typography>
          <IconButton color="inherit" onClick={() => navigate('/user-profile')} sx={{ marginLeft: 'auto' }}>
            <AccountCircle sx={{ fontSize: 30, color: isDarkTheme ? 'inherit' : 'text.primary' }} />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box sx={{ flexGrow: 1, padding: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={3} sx={{ width: '100%', maxWidth: 600, padding: 2 }}>
          <List>
            {historyData.map((item, index) => (
              <ListItem key={index} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <ListItemText
                  primary={`Query: ${item.query}`}
                  secondary={`Response: ${item.response}\nDate: ${new Date(item.date).toLocaleString()}`}
                />
                <IconButton edge="end" color="inherit" onClick={() => handleDelete(index)}>
                  <DeleteIcon />
                </IconButton>
              </ListItem>
            ))}
          </List>
        </Paper>
      </Box>
    </Box>
  );
};

export default HistoryLog;