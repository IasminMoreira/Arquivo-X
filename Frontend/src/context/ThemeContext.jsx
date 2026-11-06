// ThemeContext.jsx — preferências visuais globais: tema (claro/escuro) e
// efeito de brilho (glow) dos botões. Ambos são lembrados no localStorage e
// aplicados via atributos no <html>, valendo para o app inteiro.

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

  const [glow, setGlow] = useState(() => {
    const saved = localStorage.getItem("arquivox-glow");
    return saved === null ? true : saved === "true";
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("arquivox-theme", theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.dataset.glow = glow ? "on" : "off";
    localStorage.setItem("arquivox-glow", String(glow));
  }, [glow]);

  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));
  const toggleGlow = () => setGlow((g) => !g);

  return (
    <ThemeContext.Provider value={{ theme, toggle, setTheme, glow, toggleGlow }}>
      {children}
    </ThemeContext.Provider>
  );
}
