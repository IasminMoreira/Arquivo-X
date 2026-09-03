// ThemeContext.jsx — tema (claro/escuro) para o app inteiro.
// Guarda a escolha no localStorage e, na primeira visita, respeita o tema
// do sistema operacional do usuário.

import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("arquivox-theme");
    if (saved === "light" || saved === "dark") return saved;
    const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
    return prefersLight ? "light" : "dark";
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("arquivox-theme", theme);
  }, [theme]);

  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <ThemeContext.Provider value={{ theme, toggle, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
