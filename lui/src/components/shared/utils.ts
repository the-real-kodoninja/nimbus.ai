export const formatDate = (date: Date): string => {
  return date.toLocaleString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
    month: 'short',
    day: 'numeric',
  });
};

export const handleShareResponse = (response: string): void => {
  const shareUrl = `${window.location.origin}/share?response=${encodeURIComponent(response)}`;
  navigator.clipboard.writeText(shareUrl);
  alert('Share link copied to clipboard!');
};

export const handleShareCode = (code: string): void => {
  const shareUrl = `${window.location.origin}/share?code=${encodeURIComponent(code)}`;
  navigator.clipboard.writeText(shareUrl);
  alert('Code share link copied to clipboard!');
};

export const handleCopyCode = (code: string): void => {
  navigator.clipboard.writeText(code);
  alert('Code copied to clipboard!');
};

export const handleSaveCode = (code: string, language: string): void => {
  const blob = new Blob([code], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `code.${language || 'txt'}`;
  a.click();
  URL.revokeObjectURL(url);
};
