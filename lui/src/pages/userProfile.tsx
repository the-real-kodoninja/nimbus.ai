import React, { useState, useEffect } from 'react';
import { Box, Typography, List, ListItem, ListItemText, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { collection, getDocs, Timestamp } from 'firebase/firestore';
import { Thread, UserSettings } from '../components/shared/types';

interface Props {
  isDarkTheme: boolean;
  userSettings: UserSettings;
}

const UserProfile: React.FC<Props> = ({ isDarkTheme, userSettings }) => {
  const navigate = useNavigate();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        setUserEmail(user.email);

        const threadsRef = collection(db, 'users', user.uid, 'threads');
        const threadSnapshot = await getDocs(threadsRef);
        const threadList = threadSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Thread[];

        setThreads(threadList);
      } else {
        navigate('/login-signup');
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleSignOut = async () => {
    await auth.signOut();
    navigate('/login-signup');
  };

  return (
    <Box
      sx={{
        padding: 4,
        backgroundColor: isDarkTheme ? 'background.default' : 'background.paper',
        color: isDarkTheme ? 'text.primary' : 'text.secondary',
        minHeight: '100vh',
      }}
    >
      <Typography variant="h4" sx={{ marginBottom: 2 }}>
        User Profile
      </Typography>
      {userEmail ? (
        <>
          <Typography variant="body1" sx={{ marginBottom: 2 }}>
            <strong>Email:</strong> {userEmail}
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleSignOut}
            sx={{
              marginBottom: 4,
              backgroundColor: isDarkTheme ? 'secondary.dark' : 'secondary.light',
              '&:hover': {
                backgroundColor: isDarkTheme ? 'secondary.main' : 'secondary.dark',
              },
            }}
          >
            Sign Out
          </Button>
          <Typography variant="h5" sx={{ marginBottom: 2 }}>
            Your Threads
          </Typography>
          {threads.length === 0 ? (
            <Typography variant="body1" sx={{ color: isDarkTheme ? 'text.secondary' : 'text.primary' }}>
              No threads available.
            </Typography>
          ) : (
            <List>
              {threads.map(thread => (
                <ListItem key={thread.id} sx={{ marginBottom: 1, borderRadius: 1, backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }}>
                  <ListItemText
                    primary={`Thread ${thread.id.slice(0, 8)}`}
                    secondary={`Last updated: ${
                      thread.updatedAt instanceof Timestamp
                        ? new Date(thread.updatedAt.toDate()).toLocaleString()
                        : 'Unknown Date'
                    }`}
                    sx={{
                      color: isDarkTheme ? 'text.primary' : 'text.secondary',
                    }}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </>
      ) : (
        <Typography variant="body1" sx={{ color: isDarkTheme ? 'text.secondary' : 'text.primary' }}>
          Loading...
        </Typography>
      )}
    </Box>
  );
};

export default UserProfile;