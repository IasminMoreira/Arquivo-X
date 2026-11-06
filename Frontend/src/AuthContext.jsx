import { createContext, useContext, useState, useEffect } from "react";
import { signInWithPopup, signOut as firebaseSignOut } from "firebase/auth";
import { auth, googleProvider } from "./firebase";

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

const API_URL = "http://localhost:8000/api";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("arquivox_token"));
  const [loading, setLoading] = useState(true);

  // Carrega os dados do usuário ao iniciar se já houver token salvo
  useEffect(() => {
    async function checkAuth() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/user`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          // Se o token for inválido/expirado, limpa a sessão
          localStorage.removeItem("arquivox_token");
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        console.error("Erro ao verificar autenticação:", err);
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, [token]);

  async function logIn(email, password) {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.errors?.email?.[0] || "Falha no login");
    }

    localStorage.setItem("arquivox_token", data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  }

  async function signUp(name, email, password) {
    const response = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Erro ao realizar cadastro");
    }

    localStorage.setItem("arquivox_token", data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  }

  async function logInWithGoogle() {
    // 1) Popup do Google via Firebase; 2) o backend valida o ID token e cria a sessão.
    const result = await signInWithPopup(auth, googleProvider);
    try {
      const idToken = await result.user.getIdToken();
      const response = await fetch(`${API_URL}/login/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ id_token: idToken }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Falha no login com o Google");
      }

      localStorage.setItem("arquivox_token", data.token);
      setToken(data.token);
      setUser(data.user);
      return data;
    } finally {
      // A sessão do app é a do Laravel; não mantém sessão do Firebase.
      firebaseSignOut(auth).catch(() => {});
    }
  }

  async function resetPassword(email) {
    const response = await fetch(`${API_URL}/password/reset`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ email }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || data.errors?.email?.[0] || "Não foi possível enviar o e-mail");
    }
    return data;
  }

  async function logOut() {
    if (token) {
      fetch(`${API_URL}/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }).catch(() => {});
    }

    localStorage.removeItem("arquivox_token");
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, logIn, signUp, logInWithGoogle, resetPassword, logOut, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}