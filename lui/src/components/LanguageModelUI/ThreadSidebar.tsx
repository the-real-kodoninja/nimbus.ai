import React from 'react';
import { Box, Button, List, ListItem, ListItemText } from '@mui/material';
import { Thread } from '../shared/types';
import { Timestamp } from 'firebase/firestore';

interface Props {
  threads: Thread[];
  currentThread: string | null;
  onCreateNewThread: () => void;
  onSelectThread: (threadId: string) => void;
}

export interface Thread {
  id: string;
  history: HistoryItem[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

const ThreadSidebar: React.FC<Props> = ({ threads, currentThread, onCreateNewThread, onSelectThread }) => {
  return (
    <Box sx={{ width: 250, padding: 2, borderRight: '1px solid rgba(255,255,255,0.1)' }}>
      <Button variant="contained" onClick={onCreateNewThread} sx={{ marginBottom: 2 }}>
        New Thread
      </Button>
      <List>
        {threads.map((thread) => (
          <ListItem
            key={thread.id}
            component="button"
            selected={currentThread === thread.id}
            onClick={() => onSelectThread(thread.id)}
            sx={{
              borderRadius: 1,
              '&.Mui-selected': {
                backgroundColor: 'rgba(255,255,255,0.1)',
              },
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.05)',
              },
            }}
          >
            <ListItemText
              primary={`Thread ${thread.id.slice(0, 8)}`}
              secondary={
                thread.updatedAt instanceof Timestamp
                  ? new Date(thread.updatedAt.toDate()).toLocaleString()
                  : 'Unknown Date'
              }
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default ThreadSidebar;
