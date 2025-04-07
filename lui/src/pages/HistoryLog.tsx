import React, { useState } from 'react';
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
  Divider,
  Collapse,
  Button,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AccountCircle from '@mui/icons-material/AccountCircle';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { HistoryItem, UserSettings } from '../components/shared/types';

interface Props {
  isDarkTheme: boolean;
  userSettings: UserSettings;
  history?: HistoryItem[]; // Optional since it can be passed via state
  setHistory?: React.Dispatch<React.SetStateAction<HistoryItem[]>>; // Optional
}

const HistoryLog: React.FC<Props> = ({ isDarkTheme, userSettings, history = [], setHistory }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const historyData: HistoryItem[] = location.state?.history || history;
  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>({});

  const handleDelete = (index: number) => {
    if (setHistory) {
      const updatedHistory = historyData.filter((_, i) => i !== index);
      setHistory(updatedHistory);
    }
  };

  const toggleExpand = (index: number) => {
    setExpandedItems((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const handleClearHistory = () => {
    if (setHistory) {
      setHistory([]);
    }
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
          <Typography variant="h6" align="center" sx={{ marginBottom: 2 }}>
            Thunderhead Archives
          </Typography>
          {historyData.length === 0 ? (
            <Typography variant="body2" align="center" sx={{ color: 'text.secondary' }}>
              No history available.
            </Typography>
          ) : (
            <List>
              {historyData.map((item, index) => (
                <React.Fragment key={index}>
                  <ListItem sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <ListItemText
                      primary={`Query: ${item.query}`}
                      secondary={`Date: ${new Date(item.date).toLocaleString()}`}
                    />
                    <Box>
                      <IconButton onClick={() => toggleExpand(index)}>
                        {expandedItems[index] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                      <IconButton edge="end" color="inherit" onClick={() => handleDelete(index)}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </ListItem>
                  <Collapse in={expandedItems[index]}>
                    <Box sx={{ padding: 2, backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', borderRadius: 2, marginBottom: 1 }}>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        <strong>Response:</strong> {item.response}
                      </Typography>
                    </Box>
                  </Collapse>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          )}
          {historyData.length > 0 && (
            <Button variant="contained" color="error" onClick={handleClearHistory} sx={{ marginTop: 2 }}>
              Clear History
            </Button>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default HistoryLog;