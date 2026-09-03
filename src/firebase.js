// firebase.js — inicialização do Firebase (SDK modular)
// Config real do projeto ArquivoX + exports de autenticação.

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCZmqiS9QDYc98FzeDXN98hGUtAdK7ast0",
  authDomain: "arquivox-76752.firebaseapp.com",
  projectId: "arquivox-76752",
  storageBucket: "arquivox-76752.firebasestorage.app",
  messagingSenderId: "934219403263",
  appId: "1:934219403263:web:b63c606cbaf52c237ca1ca",
  measurementId: "G-1LC9B81757",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Faz o Google sempre perguntar qual conta usar (bom para quem tem várias).
googleProvider.setCustomParameters({ prompt: "select_account" });