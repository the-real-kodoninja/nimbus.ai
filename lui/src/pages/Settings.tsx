import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Chip,
  IconButton,
  Tabs,
  Tab,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

interface DataSource {
  googleDriveFolderId: string;
  notionLink: string;
  otherLinks: string[];
}

interface AvatarCustomization {
  modelUrl: string;
  textureUrl?: string;
  height: number;
  skinTone: string;
  hair: { style: string; color: string };
  eyes: { color: string; shape: string };
  clothing: { top: string; bottom: string; color: string };
  accessories: string[];
  animations: { idle: string; talk: string; wave: string };
}

interface Personality {
  traits: string[];
  tone: string;
  humorLevel: number;
  empathyLevel: number;
  customScript?: string;
}

interface UserSettings {
  aiName: string;
  voice: string;
  sex: 'male' | 'female' | 'other';
  personality: Personality;
  avatar: AvatarCustomization;
}

const Settings: React.FC = () => {
  const [dataSource, setDataSource] = useState<DataSource>({
    googleDriveFolderId: '',
    notionLink: '',
    otherLinks: [],
  });
  const [newLink, setNewLink] = useState('');
  const [userSettings, setUserSettings] = useState<UserSettings>({
    agents: [],
    aiName: 'Nimbus',
    voice: 'default',
    sex: 'other',
    personality: {
      traits: ['friendly'],
      tone: 'casual',
      humorLevel: 5,
      empathyLevel: 7,
      customScript: '',
    },
    avatar: {
      modelUrl: '',
      textureUrl: '',
      height: 1.8,
      skinTone: 'medium',
      hair: { style: 'short', color: 'black' },
      eyes: { color: 'brown', shape: 'almond' },
      clothing: { top: 'shirt', bottom: 'pants', color: 'blue' },
      accessories: [],
      animations: { idle: '', talk: '', wave: '' },
    },
  });
  const [newAccessory, setNewAccessory] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const userId = auth.currentUser?.uid;
      if (userId) {
        const dataSourceRef = doc(db, 'users', userId, 'settings', 'dataSources');
        const dataSourceSnap = await getDoc(dataSourceRef);
        if (dataSourceSnap.exists()) {
          setDataSource(dataSourceSnap.data() as DataSource);
        }

        const settingsRef = doc(db, 'users', userId, 'settings', 'userSettings');
        const settingsSnap = await getDoc(settingsRef);
        if (settingsSnap.exists()) {
          setUserSettings(settingsSnap.data() as UserSettings);
        }
      }
    };

    fetchData();
  }, []);

  const handleSave = async () => {
    const userId = auth.currentUser?.uid;
    if (userId) {
      const dataSourceRef = doc(db, 'users', userId, 'settings', 'dataSources');
      await setDoc(dataSourceRef, dataSource);

      const settingsRef = doc(db, 'users', userId, 'settings', 'userSettings');
      await setDoc(settingsRef, userSettings);

      navigate('/');
    }
  };

  const addLink = () => {
    if (newLink) {
      setDataSource(prev => ({
        ...prev,
        otherLinks: [...prev.otherLinks, newLink],
      }));
      setNewLink('');
    }
  };

  const addAccessory = () => {
    if (newAccessory) {
      setUserSettings(prev => ({
        ...prev,
        avatar: {
          ...prev.avatar,
          accessories: [...prev.avatar.accessories, newAccessory],
        },
      }));
      setNewAccessory('');
    }
  };

  const removeAccessory = (accessory: string) => {
    setUserSettings(prev => ({
      ...prev,
      avatar: {
        ...prev.avatar,
        accessories: prev.avatar.accessories.filter(a => a !== accessory),
      },
    }));
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'model' | 'texture' | 'animation') => {
    const file = event.target.files?.[0];
    if (file && auth.currentUser) {
      const storageRef = ref(storage, `avatars/${auth.currentUser.uid}/${type}/${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(storageRef);
      if (type === 'model' || type === 'texture') {
        setUserSettings(prev => ({
          ...prev,
          avatar: {
            ...prev.avatar,
            [type === 'model' ? 'modelUrl' : 'textureUrl']: downloadUrl,
          },
        }));
      } else {
        setUserSettings(prev => ({
          ...prev,
          avatar: {
            ...prev.avatar,
            animations: {
              ...prev.avatar.animations,
              [event.target.name as 'idle' | 'talk' | 'wave']: downloadUrl,
            },
          },
        }));
      }
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ padding: 4, maxWidth: 800, margin: '0 auto' }}>
      <Typography variant="h4">Settings</Typography>

      <Tabs value={tabValue} onChange={handleTabChange} sx={{ marginTop: 2 }}>
        <Tab label="Agent Customization" />
        <Tab label="Personality" />
        <Tab label="Data Sources" />
      </Tabs>

      {tabValue === 0 && (
        <>
          {/* Agent Customization Section */}
          {/* ... */}
        </>
      )}

      {tabValue === 1 && (
        <>
          {/* Personality Customization Section */}
          {/* ... */}
        </>
      )}

      {tabValue === 2 && (
        <>
          {/* Data Sources Section */}
          {/* ... */}
        </>
      )}

      <Button variant="contained" onClick={handleSave} sx={{ marginTop: 2 }}>
        Save
      </Button>
    </Box>
  );
};

export default Settings;