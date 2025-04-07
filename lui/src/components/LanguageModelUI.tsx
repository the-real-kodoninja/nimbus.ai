import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Typography,
  Paper,
  IconButton,
  AppBar,
  Toolbar,
  Menu,
  MenuItem,
  Tooltip,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Dialog,
  DialogContent,
  CircularProgress,
  Fade,
  Button,
  Collapse,
  TextField as SearchField,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AccountCircle from '@mui/icons-material/AccountCircle';
import UploadIcon from '@mui/icons-material/Upload';
import ThunderstormIcon from '@mui/icons-material/Thunderstorm';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import SettingsIcon from '@mui/icons-material/Settings';
import HistoryIcon from '@mui/icons-material/History';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ShareIcon from '@mui/icons-material/Share';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import SaveIcon from '@mui/icons-material/Save';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import CommitIcon from '@mui/icons-material/Commit';
import SearchIcon from '@mui/icons-material/Search';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import prettier from 'prettier/standalone';
import parserBabel from 'prettier/parser-babel';
import parserHtml from 'prettier/parser-html';
import parserCss from 'prettier/parser-postcss';
import axios from 'axios';
import axiosRateLimit from 'axios-rate-limit';
import DOMPurify from 'dompurify';
import { motion } from 'framer-motion';
import { doc, setDoc, getDoc, collection, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';

interface UserSettings {
  aiName: string;
  voice: string;
}

interface Props {
  onThemeToggle: () => void;
  isDarkTheme: boolean;
  userSettings: UserSettings;
  setUserSettings: (settings: UserSettings) => void;
}

interface HistoryItem {
  query: string;
  files: any[];
  response: string;
  date: Date;
}

interface Thread {
  id: string;
  history: HistoryItem[];
  createdAt: any;
  updatedAt: any;
}

const http = axiosRateLimit(axios.create(), { maxRequests: 10, perMilliseconds: 60000 });

const CloudSVG: React.FC<{ isDarkTheme: boolean }> = ({ isDarkTheme }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="25"
    height="25"
    viewBox="0 0 24 24"
    style={{ marginTop: '-5px' }}
    fill={isDarkTheme ? "#9c27b0" : "#000000"}
  >
    <path d="M20 17.58A4.5 4.5 0 0 0 20 15a4.5 4.5 0 0 0-4.5-4.5A4.5 4.5 0 0 0 12 6a4.5 4.5 0 0 0-4.5 4.5A4.5 4.5 0 0 0 3 15a4.5 4.5 0 0 0 0 9h17a4.5 4.5 0 0 0 0-9z" />
  </svg>
);

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
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [selectedModel, setSelectedModel] = useState<string>('aviyon1.2');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [collapsedBlocks, setCollapsedBlocks] = useState({});
  const [codeSnippets, setCodeSnippets] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
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

  const fetchAIResponse = async (message: string, fileData: any[]): Promise<string> => {
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

  const handleThunderClick = () => {
    setIsThunderClicked(!isThunderClicked);
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

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    alert('Code copied to clipboard!');
  };

  const handleSaveCode = (code: string, language: string) => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code.${language || 'txt'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFormatCode = (code: string, language: string) => {
    try {
      let parser;
      if (language === 'javascript' || language === 'jsx') parser = 'babel';
      else if (language === 'html') parser = 'html';
      else if (language === 'css') parser = 'css';
      else return code;

      const formatted = prettier.format(code, {
        parser,
        plugins: [parserBabel, parserHtml, parserCss],
        tabWidth: 2,
        useTabs: false,
        semi: true,
        singleQuote: true,
      });
      return formatted;
    } catch (error) {
      console.error('Error formatting code:', error);
      return code;
    }
  };

  const handleRunCode = (code: string) => {
    return `**Output**:\n\`\`\`\nSimulated output for:\n${code}\n\`\`\``;
  };

  const handleSaveSnippet = (code: string, language: string) => {
    setCodeSnippets([...codeSnippets, { code, language, name: `Snippet ${codeSnippets.length + 1}` }]);
  };

  const handleCommitCode = (code: string) => {
    alert(`Code committed to mock repository:\n${code}`);
  };

  const handleShareCode = (code: string) => {
    const shareUrl = `${window.location.origin}/share?code=${encodeURIComponent(code)}`;
    navigator.clipboard.writeText(shareUrl);
    alert('Code share link copied to clipboard!');
  };

  const handleToggleCollapse = (index: number) => {
    setCollapsedBlocks((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const handleModelChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedModel(event.target.value as string);
  };

  const handleClearChat = () => {
    setHistory([]);
    setShowWelcome(true);
    handleMenuClose();
  };

  const handleShareResponse = (response: string) => {
    const shareUrl = `${window.location.origin}/share?response=${encodeURIComponent(response)}`;
    navigator.clipboard.writeText(shareUrl);
    alert('Share link copied to clipboard!');
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
      month: 'short',
      day: 'numeric',
    });
  };

  const mockLintCode = (code: string, language: string) => {
    if (language === 'javascript') {
      return code.includes(';') ? '' : 'Warning: Missing semicolon at the end of a statement.';
    }
    return '';
  };

  const mockAutocompleteSuggestions = (code: string) => {
    return ['console.log', 'function', 'const', 'let', 'var'].filter(s => s.startsWith(code.slice(-5)));
  };

  const wordCount = input.split(/\s+/).filter((word) => word.length > 0).length;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'row', minHeight: '100vh' }}>
      {/* Sidebar for Threads */}
      <Box sx={{ width: 250, padding: 2, borderRight: '1px solid rgba(255,255,255,0.1)' }}>
        <Button variant="contained" onClick={createNewThread} sx={{ marginBottom: 2 }}>
          New Thread
        </Button>
        <List>
          {threads.map(thread => (
            <ListItem
              key={thread.id}
              button
              selected={currentThread === thread.id}
              onClick={() => selectThread(thread.id)}
            >
              <ListItemText
                primary={`Thread ${thread.id.slice(0, 8)}`}
                secondary={new Date(thread.updatedAt.toDate()).toLocaleString()}
              />
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Main Chat UI */}
      <Box sx={{ flexGrow: 1 }}>
        <Box sx={{ backgroundColor: 'background.default', minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: { xs: 1, sm: 2, md: 4 } }}>
          <AppBar position="static" sx={{ backgroundColor: 'background.paper', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <Toolbar>
              <IconButton edge="start" color="inherit" onClick={handleMenuClick} sx={{ color: isDarkTheme ? 'inherit' : 'text.primary' }}>
                <MenuIcon />
              </IconButton>
              <CloudSVG isDarkTheme={isDarkTheme} />
              <Typography variant="h6" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', marginLeft: '8px', color: isDarkTheme ? 'inherit' : 'text.primary' }}>
                Nimbus.ai
              </Typography>
              <IconButton color="inherit" onClick={() => navigate('/settings')} sx={{ marginRight: 1 }}>
                <SettingsIcon sx={{ fontSize: 30, color: isDarkTheme ? 'inherit' : 'text.primary' }} />
              </IconButton>
              <IconButton color="inherit" onClick={handleUserProfileClick} sx={{ width: 40, height: 40 }}>
                <AccountCircle sx={{ fontSize: 30, color: isDarkTheme ? 'inherit' : 'text.primary' }} />
              </IconButton>
            </Toolbar>
          </AppBar>

          <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', marginTop: -2, marginBottom: -2 }}>
            <Paper
              elevation={0}
              sx={{
                flexGrow: 1,
                width: '100%',
                maxWidth: { xs: '100%', sm: 636 },
                marginTop: 2,
                padding: 2,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                backgroundColor: 'transparent',
                borderRadius: 2,
              }}
            >
              <Box sx={{ overflowY: 'auto', flexGrow: 1, maxHeight: '60vh', paddingRight: 1 }}>
              {showWelcome ? (
                <Fade in={showWelcome}>
                  <Typography variant="body1" align="center" sx={{ color: isDarkTheme ? 'text.secondary' : 'text.primary', marginTop: 2 }}>
                    Welcome to {userSettings.aiName}, an agent of the Thunderhead! Ask me anything.
                  </Typography>
                </Fade>
                ) : (
                  <>
                    {history.map((item, index) => (
                      <Fade in key={index}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', marginBottom: 3 }}>
                          {item.query && (
                            <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 1, width: '100%' }}>
                              <Avatar sx={{ marginRight: 1 }} />
                              <Box
                                sx={{
                                  backgroundColor: 'primary.light',
                                  padding: 2,
                                  borderRadius: 2,
                                  color: 'text.primary',
                                  width: '100%',
                                  overflowWrap: 'break-word',
                                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                }}
                              >
                                <Typography variant="body2">{item.query}</Typography>
                                {item.files && item.files.length > 0 && (
                                  <Box sx={{ marginTop: 1 }}>
                                    {item.files.map((file, idx) => (
                                      <Chip
                                        key={idx}
                                        label={file.name}
                                        onClick={() => setSelectedFile(file)}
                                        sx={{ margin: 0.5 }}
                                      />
                                    ))}
                                  </Box>
                                )}
                                <Typography variant="caption" sx={{ color: 'text.secondary', marginTop: 1, display: 'block' }}>
                                  {formatDate(item.date)}
                                </Typography>
                              </Box>
                            </Box>
                          )}
                          {item.response && (
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.5 }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                <Box
                                  sx={{
                                    padding: 2,
                                    borderRadius: 2,
                                    color: 'text.secondary',
                                    width: '100%',
                                    overflowWrap: 'break-word',
                                    backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                  }}
                                >
                                  <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    rehypePlugins={[rehypeSanitize]}
                                    components={{
                                      code({ node, inline, className, children, ...props }) {
                                      const match = /language-(\w+)/.exec(className || '');
                                      const codeString = String(children).replace(/\n$/, '');
                                      const language = match ? match[1] : 'text';
                                      const [isCollapsed, setIsCollapsed] = useState(collapsedBlocks[index] || false);
                                      const [formattedCode, setFormattedCode] = useState(codeString);
                                      const [runOutput, setRunOutput] = useState('');
                                      const [lintWarnings, setLintWarnings] = useState('');
                                      const [suggestions, setSuggestions] = useState([]);

                                      const toggleCollapse = () => {
                                        setIsCollapsed(!isCollapsed);
                                        handleToggleCollapse(index);
                                      };

                                      const formatCode = () => {
                                        const formatted = handleFormatCode(codeString, language);
                                        setFormattedCode(formatted);
                                      };

                                      const runCode = () => {
                                        const output = handleRunCode(codeString);
                                        setRunOutput(output);
                                      };

                                      const lintCode = () => {
                                        const warnings = mockLintCode(codeString, language);
                                        setLintWarnings(warnings);
                                      };

                                      const getSuggestions = () => {
                                        const sugg = mockAutocompleteSuggestions(codeString);
                                        setSuggestions(sugg);
                                      };

                                      if (inline) {
                                        return <code className={className} {...props}>{children}</code>;
                                      }

                                      return (
                                        <Box sx={{ margin: '10px 0' }}>
                                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1e1e1e', padding: '5px 10px', borderRadius: '4px 4px 0 0' }}>
                                            <Typography variant="caption" sx={{ color: '#888' }}>
                                              <span style={{ color: '#569cd6', fontWeight: 'bold' }}>/src/components/</span>
                                              <span style={{ color: '#4ec9b0', fontWeight: 'bold' }}>{`example.${language}`}</span>
                                            </Typography>
                                            <Box>
                                              <Tooltip title="Format Code">
                                                <IconButton size="small" onClick={formatCode}>
                                                  <FormatAlignLeftIcon fontSize="small" sx={{ color: '#888' }} />
                                                </IconButton>
                                              </Tooltip>
                                              <Tooltip title="Run Code">
                                                <IconButton size="small" onClick={runCode}>
                                                  <PlayArrowIcon fontSize="small" sx={{ color: '#888' }} />
                                                </IconButton>
                                              </Tooltip>
                                              <Tooltip title="Lint Code">
                                                <IconButton size="small" onClick={lintCode}>
                                                  <FormatAlignLeftIcon fontSize="small" sx={{ color: '#888' }} />
                                                </IconButton>
                                              </Tooltip>
                                              <Tooltip title="Get Suggestions">
                                                <IconButton size="small" onClick={getSuggestions}>
                                                  <SearchIcon fontSize="small" sx={{ color: '#888' }} />
                                                </IconButton>
                                              </Tooltip>
                                              <Tooltip title="Save Code">
                                                <IconButton size="small" onClick={() => handleSaveCode(formattedCode, language)}>
                                                  <SaveIcon fontSize="small" sx={{ color: '#888' }} />
                                                </IconButton>
                                              </Tooltip>
                                              <Tooltip title="Copy Code">
                                                <IconButton size="small" onClick={() => handleCopyCode(formattedCode)}>
                                                  <ContentCopyIcon fontSize="small" sx={{ color: '#888' }} />
                                                </IconButton>
                                              </Tooltip>
                                              <Tooltip title="Save as Snippet">
                                                <IconButton size="small" onClick={() => handleSaveSnippet(formattedCode, language)}>
                                                  <SaveIcon fontSize="small" sx={{ color: '#888' }} />
                                                </IconButton>
                                              </Tooltip>
                                              <Tooltip title="Commit Code">
                                                <IconButton size="small" onClick={() => handleCommitCode(formattedCode)}>
                                                  <CommitIcon fontSize="small" sx={{ color: '#888' }} />
                                                </IconButton>
                                              </Tooltip>
                                              <Tooltip title="Share Code">
                                                <IconButton size="small" onClick={() => handleShareCode(formattedCode)}>
                                                  <ShareIcon fontSize="small" sx={{ color: '#888' }} />
                                                </IconButton>
                                              </Tooltip>
                                              <IconButton size="small" onClick={toggleCollapse}>
                                                {isCollapsed ? <ExpandMoreIcon fontSize="small" sx={{ color: '#888' }} /> : <ExpandLessIcon fontSize="small" sx={{ color: '#888' }} />}
                                              </IconButton>
                                            </Box>
                                          </Box>
                                          <Collapse in={!isCollapsed}>
                                            <Box sx={{ position: 'relative', backgroundColor: '#1e1e1e', borderRadius: '0 0 4px 4px', padding: '10px' }}>
                                              <SearchField
                                                placeholder="Search in code..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                size="small"
                                                sx={{ marginBottom: '10px', backgroundColor: '#2e2e2e', borderRadius: '4px', width: '100%' }}
                                                InputProps={{
                                                  startAdornment: <SearchIcon sx={{ color: '#888', marginRight: '5px' }} />,
                                                }}
                                              />
                                              <SyntaxHighlighter
                                                style={dark}
                                                language={language}
                                                PreTag="div"
                                                showLineNumbers
                                                wrapLines={true}
                                                lineNumberStyle={{ color: '#888', paddingRight: '10px' }}
                                                customStyle={{ backgroundColor: '#1e1e1e' }}
                                                {...props}
                                              >
                                                {formattedCode}
                                              </SyntaxHighlighter>
                                              {lintWarnings && (
                                                <Typography variant="caption" sx={{ color: 'orange', marginTop: '5px' }}>
                                                  {lintWarnings}
                                                </Typography>
                                              )}
                                              {suggestions.length > 0 && (
                                                <Box sx={{ marginTop: '5px' }}>
                                                  <Typography variant="caption" sx={{ color: '#888' }}>
                                                    Suggestions:
                                                  </Typography>
                                                  {suggestions.map((sugg, idx) => (
                                                    <Chip key={idx} label={sugg} size="small" sx={{ margin: '0 5px', backgroundColor: '#2e2e2e', color: '#fff' }} />
                                                  ))}
                                                </Box>
                                              )}
                                            </Box>
                                          </Collapse>
                                          {runOutput && (
                                            <Box sx={{ marginTop: '10px' }}>
                                              <ReactMarkdown>{runOutput}</ReactMarkdown>
                                            </Box>
                                          )}
                                        </Box>
                                      );
                                    },
                                  }}
                                >
                                {`${userSettings.aiName}: ${item.response.replace('Nimbus.ai:', '')}`}
                                  </ReactMarkdown>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: 1 }}>
                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                      {formatDate(item.date)}
                                    </Typography>
                                    <Box>
                                      <IconButton size="small" onClick={() => speakText(item.response.replace('Nimbus.ai:', ''), userSettings.voice)}>
                                        <VolumeUpIcon fontSize="small" />
                                      </IconButton>
                                      <IconButton size="small" onClick={() => handleShareResponse(item.response)}>
                                        <ShareIcon fontSize="small" />
                                      </IconButton>
                                    </Box>
                                  </Box>
                                </Box>
                              <Avatar sx={{ marginLeft: 1 }} />
                            </Box>
                          )}
                        </Box>
                      </Fade>
                    ))}
                    {isTyping && (
                      <Fade in={isTyping}>
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', marginBottom: 3 }}>
                          <Box
                            sx={{
                              padding: 2,
                              borderRadius: 2,
                              color: 'text.secondary',
                              width: '100%',
                              backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                            }}
                          >
                            <Typography variant="body2">
                              {userSettings.aiName} is typing... <CircularProgress size={16} sx={{ marginLeft: 1 }} />
                            </Typography>
                          </Box>
                          <Avatar sx={{ marginLeft: 1 }} />
                        </Box>
                      </Fade>
                    )}
                    {errorMessage && (
                      <Fade in={!!errorMessage}>
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', marginBottom: 3 }}>
                          <Box
                            sx={{
                              padding: 2,
                              borderRadius: 2,
                              color: 'error.main',
                              width: '100%',
                              backgroundColor: isDarkTheme ? 'rgba(255,0,0,0.1)' : 'rgba(255,0,0,0.05)',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                            }}
                          >
                            <Typography variant="body2">{errorMessage}</Typography>
                          </Box>
                          <Avatar sx={{ marginLeft: 1 }} />
                        </Box>
                      </Fade>
                    )}
                  </>
                )}
              </Box>
            </Paper>
            <Box sx={{ width: '100%', maxWidth: { xs: '100%', sm: 632 }, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginTop: 2.5, paddingBottom: 0, marginBottom: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-end', width: '100%' }}>
              <TextField
                label={`Hey, ${userSettings.aiName}!...`}
                variant="outlined"
                multiline
                fullWidth
                minRows={1}
                maxRows={4}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  } else if (e.key === 'Tab' && e.shiftKey) {
                    e.preventDefault();
                    setInput((prev) => prev + '\n');
                  }
                }}
                sx={{
                  backgroundColor: 'background.paper',
                  borderRadius: 2,
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: isInputEmpty ? 'red' : 'primary.main',
                    },
                    '&:hover fieldset': {
                      borderColor: isInputEmpty ? 'red' : 'primary.light',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: isInputEmpty ? 'red' : 'primary.light',
                    },
                  },
                  animation: isInputEmpty ? 'blink 1s step-end infinite' : 'none',
                }}
              />
                <IconButton
                  color="primary"
                  onClick={handleSubmit}
                  sx={{
                    marginLeft: 1,
                    background: 'linear-gradient(45deg, #6a1b9a 30%, #9c27b0 90%)',
                    borderRadius: '50%',
                    width: 56,
                    height: 56,
                    '&:hover': {
                      background: 'linear-gradient(45deg, #9c27b0 30%, #6a1b9a 90%)',
                    },
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  }}
                >
                  <ArrowForwardIcon />
                </IconButton>
              </Box>
              {files.length > 0 && (
                <Box sx={{ marginTop: 1, display: 'flex', flexWrap: 'wrap' }}>
                  {files.map((file, index) => (
                    <Chip
                      key={index}
                      label={file.name}
                      onDelete={() => handleRemoveFile(file)}
                      onClick={() => handleViewFile(file)}
                      sx={{ margin: 0.5, backgroundColor: 'primary.light', color: 'text.primary' }}
                    />
                  ))}
                </Box>
              )}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: 1, width: '100%', flexWrap: 'wrap', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                  <FormControl sx={{ minWidth: 150 }}>
                    <InputLabel id="model-select-label">Model</InputLabel>
                    <Select
                      labelId="model-select-label"
                      id="model-select"
                      value={selectedModel}
                      label="Model"
                      onChange={handleModelChange}
                    >
                      <MenuItem value="aviyon1.2">Aviyon1.2</MenuItem>
                      <MenuItem value="distilgpt2">DistilGPT2</MenuItem>
                      <MenuItem value="facebook/opt-125m">OPT-125M</MenuItem>
                      <MenuItem value="google/flan-t5-small">Flan-T5-Small</MenuItem>
                      <MenuItem value="google/flan-t5-base">Flan-T5-Base</MenuItem>
                    </Select>
                  </FormControl>
                  <Typography variant="body2" sx={{ color: isDarkTheme ? 'text.secondary' : 'text.primary' }}>
                    Word Count: {wordCount}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                  <input
                    accept="*/*"
                    style={{ display: 'none' }}
                    id="upload-file"
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                  />
                  <label htmlFor="upload-file">
                    <Button
                      variant="outlined"
                      startIcon={<UploadIcon />}
                      component="span"
                      sx={{ borderRadius: 2, textTransform: 'none' }}
                    >
                      Upload
                    </Button>
                  </label>
                  <Tooltip title="Your nimbus agent will ask the Thunderhead">
                    <IconButton
                      color="primary"
                      onClick={handleThunderClick}
                      sx={{
                        marginLeft: 1,
                        animation: isThunderActive ? 'thunder 1s infinite' : 'none',
                        border: isThunderClicked ? '2px solid' : 'none',
                        borderColor: 'primary.main',
                        borderRadius: 2,
                      }}
                    >
                      <ThunderstormIcon />
                    </IconButton>
                  </Tooltip>
                  <Typography variant="body2" sx={{ color: isDarkTheme ? 'text.secondary' : 'text.primary', marginLeft: 0.5 }}>
                    Thunderhead
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          <Dialog open={!!selectedFile} onClose={handleCloseDialog} maxWidth="md" fullWidth>
            <DialogContent>
              {selectedFile && (
                <>
                  {selectedFile.type.startsWith('image/') ? (
                    <img
                      src={selectedFile.content}
                      alt={selectedFile.name}
                      style={{ maxWidth: '100%', maxHeight: '80vh' }}
                    />
                  ) : selectedFile.type === 'application/pdf' ? (
                    <iframe
                      src={selectedFile.content}
                      title={selectedFile.name}
                      style={{ width: '100%', height: '80vh' }}
                    />
                  ) : (
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                      {selectedFile.content}
                    </Typography>
                  )}
                </>
              )}
            </DialogContent>
          </Dialog>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={onThemeToggle}>
              <IconButton color="inherit">
                {isDarkTheme ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
              {isDarkTheme ? 'Light Mode' : 'Dark Mode'}
            </MenuItem>
            <MenuItem onClick={handleMenuClose}>
              <IconButton color="inherit">
                <SettingsIcon />
              </IconButton>
              Settings
            </MenuItem>
            <MenuItem onClick={handleHistoryLogClick}>
              <IconButton color="inherit">
                <HistoryIcon />
              </IconButton>
              History Log
            </MenuItem>
            <MenuItem onClick={handleClearChat}>
              <IconButton color="inherit">
                <DeleteIcon />
              </IconButton>
              Clear Chat
            </MenuItem>
          </Menu>
        </Box>
      </Box>
    </Box>
  );
};

export default LanguageModelUI;