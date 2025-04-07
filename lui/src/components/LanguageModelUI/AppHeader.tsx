import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Button,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SettingsIcon from '@mui/icons-material/Settings';
import AccountCircle from '@mui/icons-material/AccountCircle';
import CloudSVG from './CloudSVG';
import { auth } from '../../firebase';

interface Props {
  isDarkTheme: boolean;
  onMenuClick: (event: React.MouseEvent<HTMLElement>) => void;
  onUserProfileClick: () => void;
}

const AppHeader: React.FC<Props> = ({ isDarkTheme, onMenuClick, onUserProfileClick }) => {
  const navigate = useNavigate();
  const isAuthenticated = !!auth.currentUser;

  return (
    <AppBar position="static" sx={{ backgroundColor: 'background.paper', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <Toolbar>
        <IconButton edge="start" color="inherit" onClick={onMenuClick} sx={{ color: isDarkTheme ? 'inherit' : 'text.primary' }}>
          <MenuIcon />
        </IconButton>
        <CloudSVG isDarkTheme={isDarkTheme} />
        <Typography variant="h6" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', marginLeft: '8px', color: isDarkTheme ? 'inherit' : 'text.primary' }}>
          Nimbus.ai
        </Typography>
        {isAuthenticated ? (
          <>
            <IconButton color="inherit" onClick={() => navigate('/settings')} sx={{ marginRight: 1 }}>
              <SettingsIcon sx={{ fontSize: 30, color: isDarkTheme ? 'inherit' : 'text.primary' }} />
            </IconButton>
            <IconButton color="inherit" onClick={onUserProfileClick} sx={{ width: 40, height: 40 }}>
              <AccountCircle sx={{ fontSize: 30, color: isDarkTheme ? 'inherit' : 'text.primary' }} />
            </IconButton>
          </>
        ) : (
          <Button color="inherit" onClick={() => navigate('/login-signup')} sx={{ textTransform: 'none', fontWeight: 'bold' }}>
            Login / Sign Up
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default AppHeader;
