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
  Chip,
  Collapse,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AccountCircle from '@mui/icons-material/AccountCircle';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const HistoryLog = ({ isDarkTheme, history, setHistory }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const historyData = location.state?.history || history || [];
  const [expandedItems, setExpandedItems] = useState({});

  const handleDelete = (index) => {
    const updatedHistory = historyData.filter((_, i) => i !== index);
    setHistory(updatedHistory);
  };

  const toggleExpand = (index) => {
    setExpandedItems((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  // Psychological profiling based on queries
  const generatePsychProfile = (query) => {
    if (query.toLowerCase().includes('code') || query.toLowerCase().includes('program')) {
      return {
        trait: 'Analytical Thinker',
        description: 'You exhibit a strong inclination towards problem-solving and logical reasoning, typical of a coder or engineer.',
        thunderheadInsight: 'The Thunderhead observes your meticulous nature, akin to a Scythe ensuring precision in their gleaning.',
      };
    } else if (query.toLowerCase().includes('app') || query.toLowerCase().includes('design')) {
      return {
        trait: 'Creative Visionary',
        description: 'You show a flair for creativity and innovation, often thinking about user experiences and aesthetics.',
        thunderheadInsight: 'The Thunderhead sees your potential to create, much like the Toll’s vision for a new world order.',
      };
    } else {
      return {
        trait: 'Curious Explorer',
        description: 'You have a broad curiosity, seeking knowledge across various domains.',
        thunderheadInsight: 'The Thunderhead notes your inquisitive nature, reminiscent of a Ghost in the Shell, navigating the vast digital consciousness.',
      };
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
          <Typography variant="body2" align="center" sx={{ color: 'text.secondary', marginBottom: 2 }}>
            The Thunderhead has recorded your interactions, preserving them as a digital consciousness, much like a Ghost in the Shell.
          </Typography>
          <List>
            {historyData.map((item, index) => {
              const psychProfile = generatePsychProfile(item.query);
              return (
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
                      <Typography variant="body2" sx={{ marginTop: 1 }}>
                        <strong>Thunderhead Analysis:</strong> {psychProfile.thunderheadInsight}
                      </Typography>
                      <Typography variant="body2" sx={{ marginTop: 1 }}>
                        <strong>Psychological Profile:</strong> {psychProfile.trait} - {psychProfile.description}
                      </Typography>
                    </Box>
                  </Collapse>
                  <Divider />
                </React.Fragment>
              );
            })}
          </List>
        </Paper>
      </Box>
    </Box>
  );
};

export default HistoryLog;