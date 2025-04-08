import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, IconButton, Button, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import axios from 'axios';
import axiosRateLimit from 'axios-rate-limit';
import DOMPurify from 'dompurify';
import { doc, setDoc, collection, getDocs, addDoc, Timestamp, updateDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import AppHeader from './AppHeader';
import ThreadSidebar from './ThreadSidebar';
import ChatArea from './ChatArea';
import InputArea from './InputArea';
import FileViewerDialog from './FileViewerDialog';
import MenuOptions from './MenuOptions';
import VirtualSpace from './VirtualSpace';
import { UserSettings, HistoryItem, Thread, FileContent } from '../shared/types';
import MenuIcon from '@mui/icons-material/Menu';
import { searchWebsites } from '../../modules/websiteSearch';
import { searchKnowledgeBase } from '../../modules/knowledgeBase';
import { evaluateQuality } from '../../modules/qualityMeter';
import { checkGrammar, getWritingReferences } from '../../modules/aviyonGrammar';
import { searchCodeResources } from '../../modules/aviyonCode';
import { searchHealthResources } from '../../modules/aviyonHealth';
import { searchBusinessResources } from '../../modules/aviyonBusiness';
import { searchPlanetResources } from '../../modules/aviyonPlanet';
import { getFounderInfo, logInteraction } from '../../modules/aviyonFounder';
import { applyPersonality } from '../../modules/personalityEngine';

// Add NimbusAgent interface
interface NimbusAgent {
  id: string;
  name: string;
  role: string;
  voice: string;
  sex: 'male' | 'female' | 'other';
  personality: {
    traits: string[];
    tone: string;
    humorLevel: number;
    empathyLevel: number;
    customScript?: string;
  };
  avatar: {
    modelUrl: string;
    textureUrl?: string;
    height: number;
    skinTone: string;
    hair: { style: string; color: string };
    eyes: { color: string; shape: string };
    clothing: { top: string; bottom: string; color: string };
    accessories: string[];
    animations: { idle: string; talk: string; wave: string };
  };
  threadId?: string; // Optional thread ID for agent-specific threads
}

const http = axiosRateLimit(axios.create(), { maxRequests: 10, perMilliseconds: 60000 });

interface Props {
  onThemeToggle: () => void;
  isDarkTheme: boolean;
  userSettings: UserSettings;
  setUserSettings: (settings: UserSettings) => void;
}

const LanguageModelUI: React.FC<Props> = ({ onThemeToggle, isDarkTheme, userSettings, setUserSettings }) => {
  const [input, setInput] = useState<string>('');
  const [threads, setThreads] = useState<Thread[]>([]);
  const [currentThread, setCurrentThread] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showWelcome, setShowWelcome] = useState<boolean>(true);
  const [isThunderActive, setIsThunderActive] = useState<boolean>(false);
  const [isThunderClicked, setIsThunderClicked] = useState<boolean>(false);
  const [isInputEmpty, setIsInputEmpty] = useState<boolean>(false);
  const [files, setFiles] = useState<File[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileContent | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>('aviyon1.21');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [collapsedBlocks, setCollapsedBlocks] = useState<Record<number, boolean>>({});
  const [codeSnippets, setCodeSnippets] = useState<{ code: string; language: string; name: string }[]>([]);
  const [guestId, setGuestId] = useState<string | null>(null);
  const [isSidebarVisible, setIsSidebarVisible] = useState<boolean>(true);
  const [thunderheadConnection, setThunderheadConnection] = useState<number>(100);
  const [showVirtualSpace, setShowVirtualSpace] = useState<boolean>(false);
  const [selectedAgent, setSelectedAgent] = useState<NimbusAgent | null>(null); // Added selectedAgent state
  const navigate = useNavigate();

  useEffect(() => {
    const fetchIp = async () => {
      try {
        const response = await axios.get('https://api.ipify.org?format=json');
        setGuestId(response.data.ip.replace(/\./g, '_'));
      } catch (error) {
        console.error('Error fetching IP:', error);
        setGuestId('unknown_guest_' + Math.random().toString(36).substring(2));
      }
    };

    fetchIp();
  }, []);

  useEffect(() => {
    if (guestId && input) {
      logInteraction(guestId, input, false);
    }
  }, [input, guestId]);

  const mergeGuestData = useCallback(async (userId: string) => {
    if (guestId) {
      const guestThreadsRef = collection(db, `ghostUsers/${guestId}/threads`);
      const userThreadsRef = collection(db, `users/${userId}/threads`);

      const guestThreadsSnapshot = await getDocs(guestThreadsRef);
      for (const guestDoc of guestThreadsSnapshot.docs) {
        const guestThreadData = guestDoc.data();
        await setDoc(doc(userThreadsRef, guestDoc.id), guestThreadData);
      }

      for (const guestDoc of guestThreadsSnapshot.docs) {
        await deleteDoc(doc(guestThreadsRef, guestDoc.id));
      }
    }
  }, [guestId]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user && guestId) {
        mergeGuestData(user.uid);
      }
    });
    return () => unsubscribe();
  }, [guestId, mergeGuestData]);

  useEffect(() => {
    const fetchThreads = async () => {
      const userId = auth.currentUser?.uid || guestId;
      const collectionPath = auth.currentUser ? `users/${userId}/threads` : `ghostUsers/${userId}/threads`;

      if (userId) {
        const threadsRef = collection(db, collectionPath);
        const threadSnapshot = await getDocs(threadsRef);
        const threadList = threadSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Thread[];
        setThreads(threadList);
        if (threadList.length > 0) {
          setCurrentThread(threadList[0].id);
          setHistory(threadList[0].history || []);
          setShowWelcome(false);
        }
      }
    };

    if (guestId) {
      fetchThreads();
    }
  }, [guestId]);

  useEffect(() => {
    const saveThread = async () => {
      const userId = auth.currentUser?.uid || guestId;
      const collectionPath = auth.currentUser ? `users/${userId}/threads` : `ghostUsers/${userId}/threads`;

      if (userId && currentThread) {
        const threadRef = doc(db, collectionPath, currentThread);
        await setDoc(threadRef, { history, updatedAt: Timestamp.now() }, { merge: true });
      }
    };

    if (guestId) {
      saveThread();
    }
  }, [history, currentThread, guestId]);

  const createNewThread = async (): Promise<string> => { // Updated to return thread ID
    const userId = auth.currentUser?.uid || guestId;
    const collectionPath = auth.currentUser ? `users/${userId}/threads` : `ghostUsers/${userId}/threads`;

    if (userId) {
      const threadsRef = collection(db, collectionPath);
      const newThread = {
        history: [],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
      const docRef = await addDoc(threadsRef, newThread);
      setThreads([...threads, { id: docRef.id, ...newThread }]);
      setCurrentThread(docRef.id);
      setHistory([]);
      setShowWelcome(false);
      return docRef.id; // Return the new thread ID
    }
    return ''; // Fallback return (though this shouldn't happen if userId exists)
  };

  const selectThread = (threadId: string) => {
    const thread = threads.find(t => t.id === threadId);
    setCurrentThread(threadId);
    setHistory(thread?.history || []);
    setShowWelcome(false);
  };

  const handleSubmit = async () => {
    const sanitizedInput = DOMPurify.sanitize(input);
    if (!sanitizedInput.trim() && files.length === 0) {
      setIsInputEmpty(true);
      setTimeout(() => setIsInputEmpty(false), 1000);
      return;
    }

    if (!currentThread) {
      await createNewThread();
    }

    const fileContents = await Promise.all(
      files.map(async (file) => {
        const content = await readFileContent(file);
        return { name: file.name, type: file.type, content };
      })
    );

    let messageToSend = sanitizedInput;
    let fileDataToSend = fileContents.map(f => ({ name: f.name, type: f.type, content: f.content }));

    setInput('');
    setFiles([]);
    setShowWelcome(false);
    setErrorMessage('');

    const newHistoryItem: HistoryItem = {
      query: messageToSend,
      files: fileDataToSend,
      response: '',
      date: new Date(),
    };

    setHistory([...history, newHistoryItem]);

    setIsTyping(true);
    let aiResponse = await fetchAIResponse(messageToSend, fileDataToSend); // Mock response used here

    // Updated to use selected agent's personality, falling back to first agent if none selected
    aiResponse = applyPersonality(
      aiResponse,
      selectedAgent?.personality || userSettings.agents[0]?.personality || userSettings.personality,
      messageToSend
    );

    setIsTyping(false);

    if (aiResponse.includes('I encountered an error')) {
      setErrorMessage(aiResponse);
    } else {
      setHistory((prevHistory) => {
        const updatedHistory = [...prevHistory];
        updatedHistory[updatedHistory.length - 1].response = aiResponse;
        return updatedHistory;
      });
    }
  };

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'row', minHeight: '100vh' }}>
      <ThreadSidebar
        threads={threads}
        currentThread={currentThread}
        onCreateNewThread={createNewThread}
        onSelectThread={selectThread}
        isSidebarVisible={isSidebarVisible}
        onToggleSidebar={() => setIsSidebarVisible(!isSidebarVisible)}
      />
      <Box sx={{ flexGrow: 1 }}>
        <Box
          sx={{
            backgroundColor: 'background.default',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            padding: { xs: 1, sm: 2, md: 4 },
          }}
        >
          <AppHeader
            isDarkTheme={isDarkTheme}
            onMenuClick={() => setIsSidebarVisible(!isSidebarVisible)}
            onUserProfileClick={() => navigate('/user-profile')}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
            {!isSidebarVisible && (
              <IconButton onClick={() => setIsSidebarVisible(!isSidebarVisible)}>
                <MenuIcon />
              </IconButton>
            )}
            <FormControl sx={{ minWidth: 200, marginLeft: 2 }}>
              <InputLabel>Select Agent</InputLabel>
              <Select
                value={selectedAgent?.id || ''}
                onChange={(e) => {
                  const agent = userSettings.agents.find(a => a.id === e.target.value);
                  setSelectedAgent(agent || null);
                  if (agent?.threadId) {
                    selectThread(agent.threadId);
                  } else {
                    createNewThread().then(threadId => {
                      setUserSettings(prev => ({
                        ...prev,
                        agents: prev.agents.map(a =>
                          a.id === agent?.id ? { ...a, threadId } : a
                        ),
                      }));
                    });
                  }
                }}
              >
                {userSettings.agents.map(agent => (
                  <MenuItem key={agent.id} value={agent.id}>{agent.name} ({agent.role})</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button onClick={() => setShowVirtualSpace(!showVirtualSpace)} sx={{ marginLeft: 2 }}>
              {showVirtualSpace ? 'Hide Virtual Space' : 'Show Virtual Space'}
            </Button>
          </Box>
          {showVirtualSpace && (
            <VirtualSpace
              avatar={selectedAgent?.avatar || userSettings.avatar} // Use selected agent's avatar if available
              isTalking={isTyping}
            />
          )}
          <ChatArea
            showWelcome={showWelcome}
            isDarkTheme={isDarkTheme}
            history={history}
            userSettings={userSettings}
            isTyping={isTyping}
            errorMessage={errorMessage}
            collapsedBlocks={collapsedBlocks}
            onToggleCollapse={(index) => setCollapsedBlocks((prev) => ({ ...prev, [index]: !prev[index] }))}
            onSaveSnippet={(code, language) => setCodeSnippets([...codeSnippets, { code, language, name: `Snippet ${codeSnippets.length + 1}` }])}
            onSpeakText={(text, voiceName) => speakText(text, voiceName)}
            onSelectFile={(file) => setSelectedFile(file)}
          />
          <InputArea
            input={input}
            isDarkTheme={isDarkTheme}
            isInputEmpty={isInputEmpty}
            files={files}
            selectedModel={selectedModel}
            isThunderActive={isThunderActive}
            isThunderClicked={isThunderClicked}
            userSettings={userSettings}
            onInputChange={setInput}
            onSubmit={handleSubmit}
            onFileUpload={(event) => {
              const newFiles = Array.from(event.target.files || []);
              setFiles((prevFiles) => [...prevFiles, ...newFiles]);
            }}
            onRemoveFile={(fileToRemove) => setFiles((prevFiles) => prevFiles.filter((file) => file !== fileToRemove))}
            onViewFile={(file) => readFileContent(file).then((content) => setSelectedFile({ name: file.name, type: file.type, content }))}
            onModelChange={(e) => setSelectedModel(e.target.value as string)}
            onThunderClick={() => setIsThunderClicked(!isThunderClicked)}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default LanguageModelUI;