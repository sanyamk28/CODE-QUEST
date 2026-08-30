import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut
} from "firebase/auth";

export const firebaseConfig = {
  apiKey: "AIzaSyD4Y4QBGIkrLTs73utVpwo28QkdWaO-Hto",
  authDomain: "code-quest-d32fd.firebaseapp.com",
  projectId: "code-quest-d32fd",
  storageBucket: "code-quest-d32fd.firebasestorage.app",
  messagingSenderId: "54642993956",
  appId: "1:54642993956:web:5a50d662e14cd1f5d3a1b1",
  measurementId: "G-V3429LC2ZP"
};

export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
