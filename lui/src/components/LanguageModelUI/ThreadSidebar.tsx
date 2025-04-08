import React from 'react';
import { Box, Button, List, ListItemButton, ListItemText, IconButton } from '@mui/material';
import { Thread } from '../shared/types';
import { Timestamp } from 'firebase/firestore';
import CloseIcon from '@mui/icons-material/Close';

interface Props {
  threads: Thread[];
  currentThread: string | null;
  onCreateNewThread: () => void;
  onSelectThread: (threadId: string) => void;
  isSidebarVisible: boolean;
  onToggleSidebar: () => void;
}

const ThreadSidebar: React.FC<Props> = ({ threads, currentThread, onCreateNewThread, onSelectThread, isSidebarVisible, onToggleSidebar }) => {
  if (!isSidebarVisible) return null;

  return (
    <Box
      sx={{
        width: 250,
        padding: 2,
        borderRight: '1px solid rgba(255,255,255,0.1)',
        backgroundColor: 'background.paper',
        height: '100vh',
        position: 'relative',
      }}
    >
      <IconButton onClick={onToggleSidebar} sx={{ position: 'absolute', top: 8, right: 8 }}>
        <CloseIcon />
      </IconButton>
      <Button variant="contained" onClick={onCreateNewThread} sx={{ marginBottom: 2 }}>
        New Thread
      </Button>
      <List>
        {threads.map((thread) => (
          <ListItemButton
            key={thread.id}
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
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
};

export default ThreadSidebar;
