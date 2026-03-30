// firebaseConfig.ts
import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyDY4JQr0MLX1CKo2AXt8w0QCToNRe-ldy4",
  authDomain: "krishimitra-d7227.firebaseapp.com",
  projectId: "krishimitra-d7227",
  storageBucket: "krishimitra-d7227.firebasestorage.app",
  messagingSenderId: "920887281039",
  appId: "1:920887281039:web:f97a841805b66b423477fa",
  measurementId: "G-8W0C4080RS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
export const db = getFirestore(app);