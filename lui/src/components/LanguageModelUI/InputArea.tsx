import React from 'react';
import {
  Box,
  TextField,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Button,
  Tooltip,
  Chip,
  SelectChangeEvent,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import UploadIcon from '@mui/icons-material/Upload';
import ThunderstormIcon from '@mui/icons-material/Thunderstorm';
import { UserSettings } from '../shared/types';

interface Props {
  input: string;
  isDarkTheme: boolean;
  isInputEmpty: boolean;
  files: File[];
  selectedModel: string;
  isThunderActive: boolean;
  isThunderClicked: boolean;
  userSettings: UserSettings;
  onInputChange: (value: string) => void;
  onSubmit: () => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: (file: File) => void;
  onViewFile: (file: File) => void;
  onModelChange: (event: SelectChangeEvent<string>) => void;
  onThunderClick: () => void;
}

const InputArea: React.FC<Props> = ({
  input,
  isDarkTheme,
  isInputEmpty,
  files,
  selectedModel,
  isThunderActive,
  isThunderClicked,
  userSettings,
  onInputChange,
  onSubmit,
  onFileUpload,
  onRemoveFile,
  onViewFile,
  onModelChange,
  onThunderClick,
}) => {
  const wordCount = input.split(/\s+/).filter((word) => word.length > 0).length;

  return (
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
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              onSubmit();
            } else if (e.key === 'Tab' && e.shiftKey) {
              e.preventDefault();
              onInputChange(input + '\n');
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
          onClick={onSubmit}
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
              onDelete={() => onRemoveFile(file)}
              onClick={() => onViewFile(file)}
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
              onChange={onModelChange}
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
            onChange={onFileUpload}
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
              onClick={onThunderClick}
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
  );
};

export default InputArea;
