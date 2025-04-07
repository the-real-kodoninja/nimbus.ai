import React from 'react';
import { Dialog, DialogContent, Typography } from '@mui/material';
import { FileContent } from '../shared/types';

interface Props {
  selectedFile: FileContent | null;
  onClose: () => void;
}

const FileViewerDialog: React.FC<Props> = ({ selectedFile, onClose }) => {
  return (
    <Dialog open={!!selectedFile} onClose={onClose} maxWidth="md" fullWidth>
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
  );
};

export default FileViewerDialog;
