import { Timestamp } from 'firebase/firestore';

export interface UserSettings {
  aiName: string;
  voice: string;
}

export interface HistoryItem {
  query: string;
  files: { name: string; type: string; content: string }[];
  response: string;
  date: Date;
}

export interface Thread {
  id: string;
  history: HistoryItem[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface FileContent {
  name: string;
  type: string;
  content: string;
}
