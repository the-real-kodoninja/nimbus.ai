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
import { exportAgentAsVRM } from '../utils/exportAgent'; // Added import for exportAgentAsVRM

// Add NimbusAgent interface
interface NimbusAgent {
  id: string;
  name: string;
  role: string;
  voice: string;
  sex: 'male' | 'female' | 'other';
  personality: Personality;
  avatar: AvatarCustomization;
}

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
  agents: NimbusAgent[];
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
  const [newAgent, setNewAgent] = useState<NimbusAgent>({
    id: '',
    name: '',
    role: '',
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
        <Tab label="Agents" />
      </Tabs>

      {tabValue === 0 && (
        <>
          {/* Agent Customization Section */}
          {/* ... existing content remains unchanged ... */}
        </>
      )}

      {tabValue === 1 && (
        <>
          {/* Personality Customization Section */}
          {/* ... existing content remains unchanged ... */}
        </>
      )}

      {tabValue === 2 && (
        <>
          {/* Data Sources Section */}
          {/* ... existing content remains unchanged ... */}
        </>
      )}

      {tabValue === 3 && (
        <>
          <Typography variant="h6" sx={{ marginTop: 2 }}>Manage Nimbus Agents (Max 5)</Typography>
          {userSettings.agents.length >= 5 && (
            <Typography color="error">You have reached the maximum number of agents (5).</Typography>
          )}
          {userSettings.agents.map(agent => (
            <Box key={agent.id} sx={{ border: '1px solid', borderRadius: 2, padding: 2, marginTop: 2 }}>
              <Typography variant="h6">{agent.name} ({agent.role})</Typography>
              <Box sx={{ display: 'flex', gap: 1, marginTop: 1 }}>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => setUserSettings(prev => ({
                    ...prev,
                    agents: prev.agents.filter(a => a.id !== agent.id),
                  }))}
                >
                  Delete
                </Button>
                <Button
                  variant="contained"
                  onClick={async () => {
                    const blob = await exportAgentAsVRM(agent);
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${agent.name}_agent.vrm`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  Export as VRM
                </Button>
              </Box>
            </Box>
          ))}
          {userSettings.agents.length < 5 && (
            <>
              <Typography variant="h6" sx={{ marginTop: 2 }}>Create New Agent</Typography>
              <TextField
                label="Name"
                value={newAgent.name}
                onChange={(e) => setNewAgent(prev => ({ ...prev, name: e.target.value }))}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Role"
                value={newAgent.role}
                onChange={(e) => setNewAgent(prev => ({ ...prev, role: e.target.value }))}
                fullWidth
                margin="normal"
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Sex</InputLabel>
                <Select
                  value={newAgent.sex}
                  onChange={(e) => setNewAgent(prev => ({ ...prev, sex: e.target.value as 'male' | 'female' | 'other' }))}
                >
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
              <Button
                variant="contained"
                onClick={() => {
                  const id = Date.now().toString();
                  setUserSettings(prev => ({
                    ...prev,
                    agents: [...prev.agents, { ...newAgent, id }],
                  }));
                  setNewAgent({
                    id: '',
                    name: '',
                    role: '',
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
                }}
                sx={{ marginTop: 2 }}
              >
                Create Agent
              </Button>
            </>
          )}
        </>
      )}

      <Button variant="contained" onClick={handleSave} sx={{ marginTop: 2 }}>
        Save
      </Button>
    </Box>
  );
};

export default Settings;