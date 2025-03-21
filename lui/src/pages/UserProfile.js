import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  AppBar,
  Toolbar,
  Paper,
  Avatar,
  IconButton,
  LinearProgress,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloudIcon from '@mui/icons-material/Cloud';
import WifiIcon from '@mui/icons-material/Wifi';

const UserProfile = ({ isDarkTheme }) => {
  const navigate = useNavigate();

  return (
    <Box sx={{ backgroundColor: 'background.default', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static" sx={{ backgroundColor: 'background.paper' }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => navigate(-1)} sx={{ color: isDarkTheme ? 'inherit' : 'text.primary' }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', marginLeft: '8px', color: isDarkTheme ? 'inherit' : 'text.primary' }}>
            User Profile
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ flexGrow: 1, padding: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={3} sx={{ width: '100%', maxWidth: 600, padding: 2, textAlign: 'center' }}>
          <Box sx={{ position: 'relative', marginBottom: 2 }}>
            <Box sx={{ height: 150, backgroundColor: 'primary.main' }} />
            <Avatar
              sx={{
                width: 100,
                height: 100,
                position: 'absolute',
                top: 100,
                left: '50%',
                transform: 'translateX(-50%)',
                border: '4px solid',
                borderColor: 'background.paper',
              }}
              src="/path/to/user/photo.jpg" // Replace with actual user photo path
            />
          </Box>
          <Typography variant="h5" sx={{ marginTop: 6 }}>
            User Name
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            user@example.com
          </Typography>
          <Box sx={{ marginTop: 4 }}>
            <Typography variant="h6">Stats</Typography>
            <Typography variant="body2">Searches: 123</Typography>
            <Typography variant="body2">Frequency: 10 searches/day</Typography>
            <Typography variant="body2">Visits: 45</Typography>
            {/* Add more stats as needed */}
          </Box>
          <Box sx={{ marginTop: 4 }}>
            <Typography variant="h6">Thunderhead Connection</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 2 }}>
              <CloudIcon sx={{ fontSize: 40, color: 'primary.main', animation: 'spin 5s linear infinite' }} />
              <LinearProgress variant="determinate" value={75} sx={{ width: '80%', marginLeft: 2, marginRight: 2 }} />
              <WifiIcon sx={{ fontSize: 40, color: 'primary.main', animation: 'pulse 2s infinite' }} />
            </Box>
            <Typography variant="body2" sx={{ color: 'text.secondary', marginTop: 1 }}>
              Connection Level: 75%
            </Typography>
          </Box>
          <Box sx={{ marginTop: 4 }}>
            <Typography variant="h6">Ghost State</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', marginTop: 1 }}>
              Your ghost is in a state of free thinking and connected to the vast knowledge of the net and cloud.
            </Typography>
            <Box sx={{ marginTop: 2, display: 'flex', justifyContent: 'center' }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  backgroundColor: 'primary.main',
                  animation: 'glow 3s infinite',
                }}
              >
                <WifiIcon sx={{ fontSize: 40, color: 'background.paper' }} />
              </Avatar>
            </Box>
          </Box>
          <Box sx={{ marginTop: 4 }}>
            <Typography variant="h6">Minted Coins</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', marginTop: 1 }}>
              You have mined 1500 Nimbus Coins.
            </Typography>
          </Box>
          <Box sx={{ marginTop: 4 }}>
            <Typography variant="h6">Crypto Address</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', marginTop: 1 }}>
              0x1234567890abcdef1234567890abcdef12345678
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default UserProfile;