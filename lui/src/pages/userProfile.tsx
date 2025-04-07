import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  AppBar,
  Toolbar,
  Paper,
  Avatar,
  IconButton,
  LinearProgress,
  Chip,
  Divider,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloudIcon from '@mui/icons-material/Cloud';
import WifiIcon from '@mui/icons-material/Wifi';

const UserProfile = ({ isDarkTheme, userSettings }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const historyData = location.state?.history || [];
  const [userStats, setUserStats] = useState({
    searches: 0,
    frequency: 0,
    visits: 0,
  });
  const [connectionLevel, setConnectionLevel] = useState(75);
  const [psychProfile, setPsychProfile] = useState({});

  useEffect(() => {
    const searches = historyData.length;
    const frequency = searches / (new Date().getDate() || 1);
    const visits = searches * 2;
    setUserStats({ searches, frequency: frequency.toFixed(2), visits });

    const level = Math.min(100, 50 + searches * 5);
    setConnectionLevel(level);

    const profile = generatePsychProfile(historyData);
    setPsychProfile(profile);
  }, [historyData]);

  const generatePsychProfile = (history) => {
    const codeQueries = history.filter(item => item.query.toLowerCase().includes('code') || item.query.toLowerCase().includes('program')).length;
    const appQueries = history.filter(item => item.query.toLowerCase().includes('app') || item.query.toLowerCase().includes('design')).length;

    if (codeQueries > appQueries) {
      return {
        trait: 'Analytical Thinker',
        description: 'You exhibit a strong inclination towards problem-solving and logical reasoning, typical of a coder or engineer.',
        thunderheadInsight: 'The Thunderhead observes your meticulous nature, akin to a Scythe ensuring precision in their gleaning.',
        ghostState: 'Your ghost is a structured entity, navigating the digital realm with precision, much like a Ghost in the Shell.',
      };
    } else if (appQueries > codeQueries) {
      return {
        trait: 'Creative Visionary',
        description: 'You show a flair for creativity and innovation, often thinking about user experiences and aesthetics.',
        thunderheadInsight: 'The Thunderhead sees your potential to create, much like the Toll’s vision for a new world order.',
        ghostState: 'Your ghost is a vibrant entity, weaving through the digital consciousness with creativity, inspired by Ghost in the Shell.',
      };
    } else {
      return {
        trait: 'Curious Explorer',
        description: 'You have a broad curiosity, seeking knowledge across various domains.',
        thunderheadInsight: 'The Thunderhead notes your inquisitive nature, reminiscent of a Ghost in the Shell, navigating the vast digital consciousness.',
        ghostState: 'Your ghost is a free spirit, exploring the vast knowledge of the net and cloud, as seen in Ghost in the Shell.',
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
            User Profile
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ flexGrow: 1, padding: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={3} sx={{ width: '100%', maxWidth: 600, padding: 2, textAlign: 'center', background: 'linear-gradient(45deg, #1e1e1e 30%, #2e2e2e 90%)' }}>
          <Box sx={{ position: 'relative', marginBottom: 2 }}>
            <Box sx={{ height: 150, background: 'linear-gradient(45deg, #6a1b9a 30%, #9c27b0 90%)', borderRadius: '16px 16px 0 0' }} />
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
                boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
              }}
              src="/path/to/user/photo.jpg"
            />
          </Box>
          <Typography variant="h5" sx={{ marginTop: 6, color: '#ffffff' }}>
            User Name
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            user@example.com
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', marginTop: 1 }}>
            Joined: April 07, 2025
          </Typography>
          <Divider sx={{ marginY: 2, backgroundColor: 'rgba(255,255,255,0.1)' }} />
          <Box sx={{ marginTop: 2 }}>
            <Typography variant="h6" sx={{ color: '#ffffff' }}>Thunderhead Analysis</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', marginTop: 1 }}>
              {psychProfile.thunderheadInsight}
            </Typography>
            <Chip label={psychProfile.trait} color="primary" sx={{ marginTop: 1 }} />
          </Box>
          <Box sx={{ marginTop: 4 }}>
            <Typography variant="h6" sx={{ color: '#ffffff' }}>Stats</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>Searches: {userStats.searches}</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>Frequency: {userStats.frequency} searches/day</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>Visits: {userStats.visits}</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', marginTop: 1 }}>
              Last Active: {new Date().toLocaleString()}
            </Typography>
          </Box>
          <Box sx={{ marginTop: 4 }}>
            <Typography variant="h6" sx={{ color: '#ffffff' }}>Thunderhead Connection</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 2 }}>
              <CloudIcon sx={{ fontSize: 40, color: 'primary.main', animation: 'spin 5s linear infinite' }} />
              <LinearProgress variant="determinate" value={connectionLevel} sx={{ width: '80%', marginLeft: 2, marginRight: 2, backgroundColor: 'rgba(255,255,255,0.1)', '& .MuiLinearProgress-bar': { backgroundColor: '#ce93d8' } }} />
              <WifiIcon sx={{ fontSize: 40, color: 'primary.main', animation: 'pulse 2s infinite' }} />
            </Box>
            <Typography variant="body2" sx={{ color: 'text.secondary', marginTop: 1 }}>
              Connection Level: {connectionLevel}%
            </Typography>
          </Box>
          <Box sx={{ marginTop: 4 }}>
            <Typography variant="h6" sx={{ color: '#ffffff' }}>Ghost State</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', marginTop: 1 }}>
              {psychProfile.ghostState}
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
            <Typography variant="h6" sx={{ color: '#ffffff' }}>Minted Coins</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', marginTop: 1 }}>
              You have mined {userStats.searches * 10} Nimbus Coins.
            </Typography>
          </Box>
          <Box sx={{ marginTop: 4 }}>
            <Typography variant="h6" sx={{ color: '#ffffff' }}>Crypto Address</Typography>
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