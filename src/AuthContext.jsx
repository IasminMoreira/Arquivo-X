// AuthContext.jsx — estado de autenticação para todo o app.
//
// Envolva seu app com <AuthProvider> (normalmente no main.jsx/index.jsx) e
// use o hook useAuth() em qualquer componente para acessar o usuário e as
// ações de login/cadastro.

import { createContext, useContext, useEffect, useState } from "react";
import { auth, googleProvider } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  linkWithPopup,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  signOut,
} from "firebase/auth";

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Observa login/logout. Persiste sozinho entre recarregamentos de página.
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  // --- Cadastro por e-mail/senha ---
  async function signUp(name, email, password) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (name) await updateProfile(cred.user, { displayName: name });
    return cred.user;
  }

  // --- Login por e-mail/senha ---
  function logIn(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  // --- Entrar/cadastrar com o Google (botão principal das telas) ---
  function logInWithGoogle() {
    return signInWithPopup(auth, googleProvider);
  }

  // --- Vincular o Google a uma conta de e-mail já logada ---
  // Use isto num botão "Conectar Google" dentro das configurações da conta,
  // quando o usuário já entrou por e-mail/senha e quer também poder entrar
  // com o Google usando o MESMO cadastro.
  function linkGoogle() {
    if (!auth.currentUser) throw new Error("Nenhum usuário logado para vincular.");
    return linkWithPopup(auth.currentUser, googleProvider);
  }

  function resetPassword(email) {
    return sendPasswordResetEmail(auth, email);
  }

  function logOut() {
    return signOut(auth);
  }

  const value = {
    user,
    loading,
    signUp,
    logIn,
    logInWithGoogle,
    linkGoogle,
    resetPassword,
    logOut,
  };

  // Não renderiza os filhos até saber se há usuário — evita "piscar" a tela
  // de login para quem já está autenticado.
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
