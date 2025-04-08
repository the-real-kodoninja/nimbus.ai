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
  IconButton,
} from '@mui/material';
import { styled } from '@mui/system';
import { motion } from 'framer-motion';
import CloseIcon from '@mui/icons-material/Close';

const StyledPaper = styled(Paper)(({ theme }: { theme: any }) => ({
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

interface Props {
  setIsLoggedIn: (isLoggedIn: boolean) => void;
}

const LoginSignup: React.FC<Props> = ({ setIsLoggedIn }) => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<number>(0);
  const [formData, setFormData] = useState<{ email: string; password: string; username: string }>({
    email: '',
    password: '',
    username: '',
  });
  const [error, setError] = useState<string>('');

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAuth = async () => {
    try {
      console.log('Attempting auth:', { email: formData.email, isSignup: tab === 1 });
      if (tab === 1) {
        // Signup
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        const user = userCredential.user;
        console.log('Signup successful:', user);

        // Merge guest data into user account (if applicable)
        if (guestId) {
          const guestThreadsRef = collection(db, `ghostUsers/${guestId}/threads`);
          const userThreadsRef = collection(db, `users/${user.uid}/threads`);

          const guestThreadsSnapshot = await getDocs(guestThreadsRef);
          for (const guestDoc of guestThreadsSnapshot.docs) {
            const guestThreadData = guestDoc.data();
            await setDoc(doc(userThreadsRef, guestDoc.id), guestThreadData);
          }

          // Delete guest data after merging
          for (const guestDoc of guestThreadsSnapshot.docs) {
            await deleteDoc(doc(guestThreadsRef, guestDoc.id));
          }
        }

        setIsLoggedIn(true);
        navigate('/');
      } else {
        // Login
        const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
        console.log('Login successful:', userCredential.user);
        setIsLoggedIn(true);
        navigate('/');
      }
    } catch (err: any) {
      console.error('Auth error:', err.message);
      setError(err.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    await handleAuth();
  };

  const handleClose = () => {
    navigate('/');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(to bottom, #121212, #1e1e1e)',
        position: 'relative',
      }}
    >
      <IconButton onClick={handleClose} sx={{ position: 'absolute', top: 16, right: 16, color: '#ffffff' }}>
        <CloseIcon />
      </IconButton>
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