import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Tabs,
  Tab,
  Fade,
} from '@mui/material';
import { styled } from '@mui/system';
import { motion } from 'framer-motion';

const StyledPaper = styled(Paper)(({ theme }) => ({
  background: 'linear-gradient(45deg, #6a1b9a 30%, #9c27b0 90%)',
  padding: theme.spacing(4),
  borderRadius: 16,
  boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
  color: '#ffffff',
  textAlign: 'center',
  maxWidth: 400,
  width: '100%',
}));

const StyledTextField = styled(TextField)({
  '& .MuiInputBase-root': {
    backgroundColor: 'rgba(255,255,255,0.1)',
    color: '#ffffff',
  },
  '& .MuiInputLabel-root': {
    color: '#ffffff',
  },
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: 'rgba(255,255,255,0.3)',
    },
    '&:hover fieldset': {
      borderColor: '#ffffff',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#ffffff',
    },
  },
});

const StyledButton = styled(Button)({
  background: 'linear-gradient(45deg, #ce93d8 30%, #ffffff 90%)',
  color: '#6a1b9a',
  fontWeight: 'bold',
  padding: '10px 20px',
  borderRadius: 8,
  marginTop: 16,
  '&:hover': {
    background: 'linear-gradient(45deg, #ffffff 30%, #ce93d8 90%)',
  },
});

const LoginSignup = ({ setIsLoggedIn }) => {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
  });
  const [error, setError] = useState('');

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (tab === 0) {
        // Login
        await signInWithEmailAndPassword(auth, formData.email, formData.password);
        setIsLoggedIn(true);
        navigate('/');
      } else {
        // Signup
        await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        setIsLoggedIn(true);
        navigate('/');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(to bottom, #121212, #1e1e1e)',
      }}
    >
      <Fade in>
        <StyledPaper elevation={6}>
          <Typography variant="h4" sx={{ marginBottom: 2 }}>
            Nimbus.ai
          </Typography>
          <Typography variant="body1" sx={{ marginBottom: 4 }}>
            {tab === 0 ? 'Welcome Back!' : 'Join the Thunderhead Network'}
          </Typography>
          <Tabs
            value={tab}
            onChange={handleTabChange}
            centered
            sx={{
              marginBottom: 4,
              '& .MuiTab-root': { color: '#ffffff' },
              '& .Mui-selected': { color: '#ce93d8' },
              '& .MuiTabs-indicator': { backgroundColor: '#ce93d8' },
            }}
          >
            <Tab label="Login" />
            <Tab label="Signup" />
          </Tabs>
          {error && (
            <Typography variant="body2" sx={{ color: 'red', marginBottom: 2 }}>
              {error}
            </Typography>
          )}
          <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <form onSubmit={handleSubmit}>
            {tab === 1 && (
              <StyledTextField
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                fullWidth
                sx={{ marginBottom: 2 }}
              />
            )}
            <StyledTextField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              fullWidth
              sx={{ marginBottom: 2 }}
            />
            <StyledTextField
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              fullWidth
              sx={{ marginBottom: 2 }}
            />
            <StyledButton type="submit">
              {tab === 0 ? 'Login' : 'Signup'}
            </StyledButton>
          </form>
        </motion.div>
        </StyledPaper>
      </Fade>
    </Box>
  );
};

export default LoginSignup;