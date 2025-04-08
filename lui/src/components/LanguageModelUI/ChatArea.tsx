import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Fade,
  CircularProgress,
  Chip,
  IconButton,
} from '@mui/material';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import ShareIcon from '@mui/icons-material/Share';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import CodeBlock from './CodeBlock';
import { HistoryItem, UserSettings, FileContent } from '../shared/types';
import { formatDate, handleShareResponse } from '../shared/utils';
import { getAvatarSnapshot } from '../../utils/avatarSnapshot'; // Import the utility for avatar snapshots

interface Props {
  showWelcome: boolean;
  isDarkTheme: boolean;
  history: HistoryItem[];
  userSettings: UserSettings;
  isTyping: boolean;
  errorMessage: string;
  collapsedBlocks: Record<number, boolean>;
  onToggleCollapse: (index: number) => void;
  onSaveSnippet: (code: string, language: string) => void;
  onSpeakText: (text: string, voiceName: string) => void;
  onSelectFile: (file: FileContent) => void;
}

const ChatArea: React.FC<Props> = ({
  showWelcome,
  isDarkTheme,
  history,
  userSettings,
  isTyping,
  errorMessage,
  collapsedBlocks,
  onToggleCollapse,
  onSaveSnippet,
  onSpeakText,
  onSelectFile,
}) => {
  const [avatarImage, setAvatarImage] = useState<string>(''); // State for avatar image

  useEffect(() => {
    const loadAvatar = async () => {
      const snapshot = await getAvatarSnapshot(userSettings.avatar); // Fetch avatar snapshot
      setAvatarImage(snapshot);
    };
    loadAvatar();
  }, [userSettings.avatar]);

  return (
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
                                onClick={() => onSelectFile(file)}
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
                              code({ inline, className, children, ...props }: { inline?: boolean; className?: string; children: React.ReactNode }) {
                                const match = /language-(\w+)/.exec(className || '');
                                const codeString = String(children).replace(/\n$/, '');
                                const language = match ? match[1] : 'text';

                                if (inline) {
                                  return <code className={className} {...props}>{children}</code>;
                                }

                                return (
                                  <CodeBlock
                                    code={codeString}
                                    language={language}
                                    index={index}
                                    collapsedBlocks={collapsedBlocks}
                                    onToggleCollapse={onToggleCollapse}
                                    onSaveSnippet={onSaveSnippet}
                                  />
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
                              <IconButton size="small" onClick={() => onSpeakText(item.response.replace('Nimbus.ai:', ''), userSettings.voice)}>
                                <VolumeUpIcon fontSize="small" />
                              </IconButton>
                              <IconButton size="small" onClick={() => handleShareResponse(item.response)}>
                                <ShareIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </Box>
                        </Box>
                        <Avatar src={avatarImage} sx={{ marginLeft: 1 }} />
                      </Box>
                    </motion.div>
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
                  <Avatar src={avatarImage} sx={{ marginLeft: 1 }} />
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
                  <Avatar src={avatarImage} sx={{ marginLeft: 1 }} />
                </Box>
              </Fade>
            )}
          </>
        )}
      </Box>
    </Paper>
  );
};

export default ChatArea;
