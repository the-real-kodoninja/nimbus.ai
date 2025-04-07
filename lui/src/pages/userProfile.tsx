import React, { useState, useEffect } from 'react';
import { Box, Typography, List, ListItem, ListItemText, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { collection, getDocs, Timestamp } from 'firebase/firestore';
import { Thread, HistoryItem } from '../components/shared/types';

const UserProfile: React.FC = () => {
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

        // Compute historyData inside useEffect
        const historyData: HistoryItem[] = [];
        threadList.forEach(thread => {
          if (thread.history) {
            thread.history.forEach((item: HistoryItem) => {
              historyData.push(item);
            });
          }
        });

        setThreads(threadList);
      } else {
        navigate('/login-signup');
      }
    };

    fetchUserData();
  }, [navigate]); // Only navigate is a dependency

  const handleSignOut = async () => {
    await auth.signOut();
    navigate('/login-signup');
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4">User Profile</Typography>
      {userEmail ? (
        <>
          <Typography variant="body1">Email: {userEmail}</Typography>
          <Button variant="contained" color="secondary" onClick={handleSignOut} sx={{ marginTop: 2 }}>
            Sign Out
          </Button>
          <Typography variant="h5" sx={{ marginTop: 4 }}>
            Your Threads
          </Typography>
          {threads.length === 0 ? (
            <Typography variant="body1">No threads available.</Typography>
          ) : (
            <List>
              {threads.map(thread => (
                <ListItem key={thread.id}>
                  <ListItemText
                    primary={`Thread ${thread.id.slice(0, 8)}`}
                    secondary={`Last updated: ${
                      thread.updatedAt instanceof Timestamp
                        ? new Date(thread.updatedAt.toDate()).toLocaleString()
                        : 'Unknown Date'
                    }`}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </>
      ) : (
        <Typography variant="body1">Loading...</Typography>
      )}
    </Box>
  );
};

export default UserProfile;