// Topbar.jsx — caminho, busca, tema, alternância grade/lista e botão Novo.

import { useTheme } from "../context/ThemeContext";

export default function Topbar({ view, setView, query, setQuery }) {
  const { theme, toggle } = useTheme();

  return (
    <div className="topbar">
      <nav className="crumbs">
        <button>Meus arquivos</button>
        <span className="sep">/</span>
        <button className="now">Projeto ArquivoX</button>
      </nav>

      <div className="search">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" />
        </svg>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar arquivos e pastas"
        />
      </div>

      <div className="top-actions">
        <button className="icon-btn" onClick={toggle} title="Alternar tema" aria-label="Alternar tema">
          {theme === "dark" ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
            </svg>
          )}
        </button>

        <div className="segmented">
          <button className={view === "grid" ? "on" : ""} onClick={() => setView("grid")} title="Grade" aria-label="Grade">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="4" y="4" width="7" height="7" rx="1.5" /><rect x="13" y="4" width="7" height="7" rx="1.5" />
              <rect x="4" y="13" width="7" height="7" rx="1.5" /><rect x="13" y="13" width="7" height="7" rx="1.5" />
            </svg>
          </button>
          <button className={view === "list" ? "on" : ""} onClick={() => setView("list")} title="Lista" aria-label="Lista">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" />
            </svg>
          </button>
        </div>

        <button className="btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Novo
        </button>
      </div>
    </div>
  );
}
