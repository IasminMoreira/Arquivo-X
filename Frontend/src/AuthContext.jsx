import { createContext, useContext, useState, useEffect } from "react";

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
    <AuthContext.Provider value={{ user, token, logIn, signUp, logOut, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}