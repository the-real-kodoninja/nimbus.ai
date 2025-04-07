import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Firebase configuration object
const firebaseConfig: {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
} = {
  apiKey: "AIzaSyANJpaIuPfg_27Q_6S9w0HaYEcuAQVSZ6g",
  authDomain: "nimbus-ai-ac285.firebaseapp.com",
  projectId: "nimbus-ai-ac285",
  storageBucket: "nimbus-ai-ac285.firebasestorage.app",
  messagingSenderId: "314036518981",
  appId: "1:314036518981:web:7a700e320dea2fa88f632c",
  // measurementId: "G-K3LNZHXHNZ",
};

// Initialize Firebase app
const app: FirebaseApp = initializeApp(firebaseConfig);

// Export Firebase services with proper types
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);