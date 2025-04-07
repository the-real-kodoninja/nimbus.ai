import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import axios from 'axios';
import axiosRateLimit from 'axios-rate-limit';
import DOMPurify from 'dompurify';
import { doc, setDoc, getDoc, collection, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import AppHeader from './AppHeader';
import ThreadSidebar from './ThreadSidebar';
import ChatArea from './ChatArea';
import InputArea from './InputArea';
import FileViewerDialog from './FileViewerDialog';
import MenuOptions from './MenuOptions';
import { UserSettings, HistoryItem, Thread, FileContent } from '../shared/types';

const http = axiosRateLimit(axios.create(), { maxRequests: 10, perMilliseconds: 60000 });

interface Props {
  onThemeToggle: () => void;
  isDarkTheme: boolean;
  userSettings: UserSettings;
  setUserSettings: (settings: UserSettings) => void;
}

const LanguageModelUI: React.FC<Props> = ({ onThemeToggle, isDarkTheme, userSettings, setUserSettings }) => {
  const [input, setInput] = useState<string>('');
  const [response, setResponse] = useState<string>('');
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
  const [selectedModel, setSelectedModel] = useState<string>('aviyon1.2');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [collapsedBlocks, setCollapsedBlocks] = useState<Record<number, boolean>>({});
  const [codeSnippets, setCodeSnippets] = useState<{ code: string; language: string; name: string }[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchThreads = async () => {
      if (auth.currentUser) {
        const threadsRef = collection(db, 'users', auth.currentUser.uid, 'threads');
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
    fetchThreads();
  }, []);

  useEffect(() => {
    const saveThread = async () => {
      if (auth.currentUser && currentThread) {
        const threadRef = doc(db, 'users', auth.currentUser.uid, 'threads', currentThread);
        await setDoc(threadRef, { history, updatedAt: Timestamp.now() }, { merge: true });
      }
    };
    saveThread();
  }, [history, currentThread]);

  const createNewThread = async () => {
    if (auth.currentUser) {
      const threadsRef = collection(db, 'users', auth.currentUser.uid, 'threads');
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
    }
  };

  const selectThread = (threadId: string) => {
    const thread = threads.find(t => t.id === threadId);
    setCurrentThread(threadId);
    setHistory(thread?.history || []);
    setShowWelcome(false);
  };

  const getCrossThreadContext = async (): Promise<string> => {
    if (auth.currentUser) {
      const threadsRef = collection(db, 'users', auth.currentUser.uid, 'threads');
      const threadSnapshot = await getDocs(threadsRef);
      let context = '';
      threadSnapshot.forEach(doc => {
        if (doc.id !== currentThread) {
          const threadData = doc.data();
          const threadHistory = threadData.history || [];
          threadHistory.forEach((item: HistoryItem) => {
            context += `**Past Thread (ID: ${doc.id})**:\n- Query: ${item.query}\n- Response: ${item.response}\n\n`;
          });
        }
      });
      return context;
    }
    return '';
  };

  const speakText = (text: string, voiceName: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const selectedVoice = voices.find(voice => voice.name.toLowerCase().includes(voiceName.toLowerCase())) || voices[0];
    utterance.voice = selectedVoice;
    window.speechSynthesis.speak(utterance);
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

    const repoMatch = messageToSend.match(/(https?:\/\/(github|gitlab)\.com\/[\w-]+\/[\w-]+\/?)/);
    if (repoMatch) {
      const repoUrl = repoMatch[0];
      try {
        const repoContent = await fetchRepoContent(repoUrl);
        messageToSend += `\n\n**Repository Content**:\n${repoContent}`;
      } catch (error: any) {
        messageToSend += `\n\n**Error Fetching Repository**: ${error.message}`;
      }
    }

    const crossThreadContext = await getCrossThreadContext();
    messageToSend = `${messageToSend}\n\n**Cross-Thread Context**:\n${crossThreadContext}`;

    setInput('');
    setFiles([]);
    setShowWelcome(false);
    setErrorMessage('');

    if (isThunderClicked) {
      setIsThunderActive(true);
      setResponse('');
      setHistory([...history, { query: messageToSend, files: fileDataToSend, response: `${userSettings.aiName} is asking the Thunderhead...`, date: new Date() }]);
    } else {
      setHistory([...history, { query: messageToSend, files: fileDataToSend, response: '', date: new Date() }]);
    }

    setIsTyping(true);
    const aiResponse = await fetchAIResponse(messageToSend, fileDataToSend);
    setIsTyping(false);

    if (aiResponse.includes('I encountered an error')) {
      setErrorMessage(aiResponse);
    } else {
      setResponse(aiResponse);
      setHistory((prevHistory) => {
        const updatedHistory = [...prevHistory];
        updatedHistory[updatedHistory.length - 1].response = aiResponse;
        return updatedHistory;
      });
    }

    setIsThunderActive(false);
    setIsThunderClicked(false);
  };

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  };

  const fetchRepoContent = async (repoUrl: string): Promise<string> => {
    try {
      const platform = repoUrl.includes('github') ? 'github' : 'gitlab';
      let apiUrl: string;
      if (platform === 'github') {
        const [, owner, repo] = repoUrl.match(/github\.com\/([\w-]+)\/([\w-]+)/) || [];
        apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents`;
      } else {
        const [, projectId] = repoUrl.match(/gitlab\.com\/([\w-\/]+)/) || [];
        apiUrl = `https://gitlab.com/api/v4/projects/${encodeURIComponent(projectId)}/repository/tree`;
      }

      const response = await http.get(apiUrl, {
        headers: platform === 'github' ? { Accept: 'application/vnd.github.v3+json' } : {},
      });

      const files = response.data;
      let contentSummary = '';
      for (const file of files.slice(0, 5)) {
        const fileUrl = platform === 'github' ? file.download_url : `https://gitlab.com/api/v4/projects/${encodeURIComponent(projectId)}/repository/files/${encodeURIComponent(file.path)}/raw`;
        if (fileUrl) {
          const fileContent = await http.get(fileUrl);
          contentSummary += `- **${file.name}**:\n\`\`\`\n${fileContent.data.slice(0, 200)}...\n\`\`\`\n`;
        }
      }
      return contentSummary || 'No readable files found.';
    } catch (error: any) {
      throw new Error('Failed to fetch repository content.');
    }
  };

  const fetchAIResponse = async (message: string, fileData: FileContent[]): Promise<string> => {
    try {
      const response = await axios.post('https://nimbusagi.netlify.app/api/nimbus', {
        message,
        context: '',
        model: selectedModel,
        files: fileData,
      });
      return response.data.response;
    } catch (error: any) {
      return `I encountered an error while generating a response: ${error.message}`;
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleHistoryLogClick = () => {
    navigate('/history-log', { state: { history, setHistory } });
    handleMenuClose();
  };

  const handleUserProfileClick = () => {
    navigate('/user-profile');
    handleMenuClose();
  };

  const handleClearChat = () => {
    setHistory([]);
    setShowWelcome(true);
    handleMenuClose();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(event.target.files || []);
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
  };

  const handleRemoveFile = (fileToRemove: File) => {
    setFiles((prevFiles) => prevFiles.filter((file) => file !== fileToRemove));
  };

  const handleViewFile = (file: File) => {
    readFileContent(file).then((content) => {
      setSelectedFile({ name: file.name, type: file.type, content });
    });
  };

  const handleCloseDialog = () => {
    setSelectedFile(null);
  };

  const handleToggleCollapse = (index: number) => {
    setCollapsedBlocks((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const handleSaveSnippet = (code: string, language: string) => {
    setCodeSnippets([...codeSnippets, { code, language, name: `Snippet ${codeSnippets.length + 1}` }]);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'row', minHeight: '100vh' }}>
      <ThreadSidebar
        threads={threads}
        currentThread={currentThread}
        onCreateNewThread={createNewThread}
        onSelectThread={selectThread}
      />
      <Box sx={{ flexGrow: 1 }}>
        <Box sx={{ backgroundColor: 'background.default', minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: { xs: 1, sm: 2, md: 4 } }}>
          <AppHeader
            isDarkTheme={isDarkTheme}
            onMenuClick={handleMenuClick}
            onUserProfileClick={handleUserProfileClick}
          />
          <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', marginTop: -2, marginBottom: -2 }}>
            <ChatArea
              showWelcome={showWelcome}
              isDarkTheme={isDarkTheme}
              history={history}
              userSettings={userSettings}
              isTyping={isTyping}
              errorMessage={errorMessage}
              collapsedBlocks={collapsedBlocks}
              onToggleCollapse={handleToggleCollapse}
              onSaveSnippet={handleSaveSnippet}
              onSpeakText={speakText}
              onSelectFile={setSelectedFile}
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
              onFileUpload={handleFileUpload}
              onRemoveFile={handleRemoveFile}
              onViewFile={handleViewFile}
              onModelChange={(e) => setSelectedModel(e.target.value as string)}
              onThunderClick={() => setIsThunderClicked(!isThunderClicked)}
            />
          </Box>
          <FileViewerDialog selectedFile={selectedFile} onClose={handleCloseDialog} />
          <MenuOptions
            anchorEl={anchorEl}
            isDarkTheme={isDarkTheme}
            onClose={handleMenuClose}
            onThemeToggle={onThemeToggle}
            onHistoryLogClick={handleHistoryLogClick}
            onClearChat={handleClearChat}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default LanguageModelUI;