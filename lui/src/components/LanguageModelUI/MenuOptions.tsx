import React from 'react';
import { Menu, MenuItem, IconButton } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import SettingsIcon from '@mui/icons-material/Settings';
import HistoryIcon from '@mui/icons-material/History';
import DeleteIcon from '@mui/icons-material/Delete';

interface Props {
  anchorEl: HTMLElement | null;
  isDarkTheme: boolean;
  onClose: () => void;
  onThemeToggle: () => void;
  onHistoryLogClick: () => void;
  onClearChat: () => void;
}

const MenuOptions: React.FC<Props> = ({ anchorEl, isDarkTheme, onClose, onThemeToggle, onHistoryLogClick, onClearChat }) => {
  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
    >
      <MenuItem onClick={onThemeToggle}>
        <IconButton color="inherit">
          {isDarkTheme ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
        {isDarkTheme ? 'Light Mode' : 'Dark Mode'}
      </MenuItem>
      <MenuItem onClick={onClose}>
        <IconButton color="inherit">
          <SettingsIcon />
        </IconButton>
        Settings
      </MenuItem>
      <MenuItem onClick={onHistoryLogClick}>
        <IconButton color="inherit">
          <HistoryIcon />
        </IconButton>
        History Log
      </MenuItem>
      <MenuItem onClick={onClearChat}>
        <IconButton color="inherit">
          <DeleteIcon />
        </IconButton>
        Clear Chat
      </MenuItem>
    </Menu>
  );
};

export default MenuOptions;
