import React from 'react';
import { Box, Button, List, ListItem, ListItemText } from '@mui/material';
import { Thread } from '../shared/types';

interface Props {
  threads: Thread[];
  currentThread: string | null;
  onCreateNewThread: () => void;
  onSelectThread: (threadId: string) => void;
}

const ThreadSidebar: React.FC<Props> = ({ threads, currentThread, onCreateNewThread, onSelectThread }) => {
  return (
    <Box sx={{ width: 250, padding: 2, borderRight: '1px solid rgba(255,255,255,0.1)' }}>
      <Button variant="contained" onClick={onCreateNewThread} sx={{ marginBottom: 2 }}>
        New Thread
      </Button>
      <List>
        {threads.map(thread => (
          <ListItem
            key={thread.id}
            button
            selected={currentThread === thread.id}
            onClick={() => onSelectThread(thread.id)}
          >
            <ListItemText
              primary={`Thread ${thread.id.slice(0, 8)}`}
              secondary={new Date(thread.updatedAt.toDate()).toLocaleString()}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default ThreadSidebar;
