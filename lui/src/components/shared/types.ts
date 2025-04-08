import { Timestamp } from 'firebase/firestore';

export interface AvatarCustomization {
  modelUrl: string; // URL to the 3D model file (e.g., .glb, .fbx)
  textureUrl?: string; // Optional texture file
  height: number; // Height in meters (e.g., 1.8 for 1.8m)
  skinTone: string; // e.g., "light", "medium", "dark"
  hair: {
    style: string; // e.g., "short", "long", "curly"
    color: string; // e.g., "black", "blonde", "red"
  };
  eyes: {
    color: string; // e.g., "blue", "green", "brown"
    shape: string; // e.g., "almond", "round"
  };
  clothing: {
    top: string; // e.g., "shirt", "jacket"
    bottom: string; // e.g., "pants", "skirt"
    color: string; // e.g., "blue", "red"
  };
  accessories: string[]; // e.g., ["glasses", "hat"]
  animations: {
    idle: string; // URL to idle animation file
    talk: string; // URL to talking animation file
    wave: string; // URL to waving animation file
  };
}

export interface Personality {
  traits: string[]; // e.g., ["witty", "formal", "sarcastic"]
  tone: string; // e.g., "casual", "professional"
  humorLevel: number; // 0-10
  empathyLevel: number; // 0-10
  customScript?: string; // Custom JavaScript code for behavior
}

export interface UserSettings {
  aiName: string;
  voice: string;
  sex: 'male' | 'female' | 'other';
  personality: Personality;
  avatar: AvatarCustomization;
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

export interface NimbusAgent {
  id: string; // Unique ID for the agent
  name: string;
  role: string; // e.g., "wife", "assistant", "friend"
  voice: string;
  sex: 'male' | 'female' | 'other';
  personality: Personality;
  avatar: AvatarCustomization;
  threadId?: string; // ID of the agent's dedicated thread
}

export interface UserSettings {
  agents: NimbusAgent[]; // Array of agents (max 5)
}