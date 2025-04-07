import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Chip,
  Collapse,
} from '@mui/material';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SearchIcon from '@mui/icons-material/Search';
import SaveIcon from '@mui/icons-material/Save';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CommitIcon from '@mui/icons-material/Commit';
import ShareIcon from '@mui/icons-material/Share';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import TextField from '@mui/material/TextField';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import prettier from 'prettier/standalone';
import parserBabel from 'prettier/parser-babel';
import parserHtml from 'prettier/parser-html';
import parserCss from 'prettier/parser-postcss';
import { handleCopyCode, handleSaveCode, handleShareCode } from '../shared/utils';

interface Props {
  code: string;
  language: string;
  index: number;
  collapsedBlocks: Record<number, boolean>;
  onToggleCollapse: (index: number) => void;
  onSaveSnippet: (code: string, language: string) => void;
}

const CodeBlock: React.FC<Props> = ({ code, language, index, collapsedBlocks, onToggleCollapse, onSaveSnippet }) => {
  const [isCollapsed, setIsCollapsed] = useState(collapsedBlocks[index] || false);
  const [formattedCode, setFormattedCode] = useState(code);
  const [runOutput, setRunOutput] = useState('');
  const [lintWarnings, setLintWarnings] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
    onToggleCollapse(index);
  };

  const formatCode = () => {
    try {
      let parser: 'babel' | 'html' | 'css' | undefined;

      if (language === 'javascript' || language === 'jsx') {
        parser = 'babel';
      } else if (language === 'html') {
        parser = 'html';
      } else if (language === 'css') {
        parser = 'css';
      } else {
        console.warn(`Unsupported language for formatting: ${language}`);
        return;
      }

      const formatted = prettier.format(code, {
        parser,
        plugins: [parserBabel, parserHtml, parserCss] as prettier.Plugin[],
        tabWidth: 2,
        useTabs: false,
        semi: true,
        singleQuote: true,
      });

      setFormattedCode(formatted);
    } catch (error) {
      console.error('Error formatting code:', error);
    }
  };

  const runCode = () => {
    const output = `**Output**:\n\`\`\`\nSimulated output for:\n${code}\n\`\`\``;
    setRunOutput(output);
  };

  const lintCode = () => {
    const warnings = language === 'javascript' && !code.includes(';') ? 'Warning: Missing semicolon at the end of a statement.' : '';
    setLintWarnings(warnings);
  };

  const getSuggestions = () => {
    const sugg = ['console.log', 'function', 'const', 'let', 'var'].filter(s => s.startsWith(code.slice(-5)));
    setSuggestions(sugg);
  };

  const commitCode = () => {
    alert(`Code committed to mock repository:\n${code}`);
  };

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
            <IconButton size="small" onClick={() => onSaveSnippet(formattedCode, language)}>
              <SaveIcon fontSize="small" sx={{ color: '#888' }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Commit Code">
            <IconButton size="small" onClick={commitCode}>
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
          <TextField
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
};

export default CodeBlock;
