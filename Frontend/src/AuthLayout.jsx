// AuthLayout.jsx — moldura visual das telas de login/cadastro.
// Agora usa o tema global (ThemeContext), então o toggle aqui e no app
// são o mesmo — a preferência é lembrada entre as telas.

import { useTheme } from "./context/ThemeContext";
import "./auth.css";

const SunIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
);
const MoonIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>
);

export default function AuthLayout({ title, subtitle, children }) {
  const { theme, toggle } = useTheme();

  return (
    <div className="auth-root" data-theme={theme}>
      <div className="glow glow-a" />
      <div className="glow glow-b" />

      <button className="theme-toggle" onClick={toggle} aria-label="Alternar tema">
        {theme === "dark" ? SunIcon : MoonIcon}
      </button>

      <div className="card">
        <div className="brand">
          <div className="mark" />
          <span>ArquivoX</span>
        </div>
        <h1 className="title">{title}</h1>
        {subtitle && <p className="subtitle">{subtitle}</p>}
        {children}
      </div>
    </div>
  );
}
