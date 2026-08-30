import axios from 'axios';

export const firebaseConfig = {
  apiKey: "AIzaSyD4Y4QBGIkrLTs73utVpwo28QkdWaO-Hto",
  authDomain: "code-quest-d32fd.firebaseapp.com",
  projectId: "code-quest-d32fd",
  storageBucket: "code-quest-d32fd.firebasestorage.app",
  messagingSenderId: "54642993956",
  appId: "1:54642993956:web:5a50d662e14cd1f5d3a1b1",
  measurementId: "G-V3429LC2ZP"
};

const AUTH_URL = 'https://identitytoolkit.googleapis.com/v1/accounts';

export interface FirebaseAuthResult {
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  displayName?: string;
}

export async function firebaseAuthSignIn(email: string, password: string): Promise<FirebaseAuthResult> {
  try {
    const res = await axios.post(`${AUTH_URL}:signInWithPassword?key=${firebaseConfig.apiKey}`, {
      email,
      password,
      returnSecureToken: true
    });
    return res.data;
  } catch (err: any) {
    // Auto-create student account if it's their first time logging in
    const signUpRes = await axios.post(`${AUTH_URL}:signUp?key=${firebaseConfig.apiKey}`, {
      email,
      password,
      returnSecureToken: true
    });
    return signUpRes.data;
  }
}
