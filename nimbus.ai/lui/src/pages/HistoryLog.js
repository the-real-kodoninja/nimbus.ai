import React from 'react';
import { Box, Typography, List, ListItem, ListItemText, Button } from '@mui/material';

const HistoryLog = ({ history, onDeleteLog }) => {
  const startDate = history.length > 0 ? new Date(history[0].date).toLocaleString() : 'N/A';
  const lastDate = history.length > 0 ? new Date(history[history.length - 1].date).toLocaleString() : 'N/A';

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h4" gutterBottom>
        History Log
      </Typography>
      <Typography variant="subtitle1">
        Date Started: {startDate}
      </Typography>
      <Typography variant="subtitle1">
        Last Communication Date: {lastDate}
      </Typography>
      <Button variant="contained" color="secondary" onClick={onDeleteLog} sx={{ marginBottom: 2 }}>
        Delete Log
      </Button>
      <List>
        {history.map((item, index) => (
          <ListItem key={index}>
            <ListItemText primary={`Query: ${item.query}`} secondary={`Response: ${item.response}`} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default HistoryLog;