// Topbar.jsx — caminho (breadcrumb clicável), busca, tema, grade/lista, Novo.

import { useState } from "react";
import { useTheme } from "../context/ThemeContext";

export default function Topbar({ crumbs = [], view, setView, query, setQuery, onMenu, onNewFolder, onNewFile }) {
  const { theme, toggle } = useTheme();
  const [newOpen, setNewOpen] = useState(false);

  return (
    <div className="topbar">
      <button className="menu-btn" onClick={onMenu} aria-label="Abrir menu">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 6h18M3 12h18M3 18h18" />
        </svg>
      </button>

      <nav className="crumbs">
        {crumbs.map((c, i) => {
          const last = i === crumbs.length - 1;
          return (
            <span key={i} style={{ display: "contents" }}>
              {i > 0 && <span className="sep">/</span>}
              <button
                className={last ? "now" : ""}
                onClick={!last ? c.onClick : undefined}
              >
                {c.label}
              </button>
            </span>
          );
        })}
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

        <div className="new-wrap">
          <button className="btn-primary" onClick={() => setNewOpen((o) => !o)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Novo
          </button>

          {newOpen && (
            <>
              <div className="menu-backdrop" onClick={() => setNewOpen(false)} />
              <div className="menu">
                <button onClick={() => { onNewFolder(); setNewOpen(false); }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <path d="M12 11v4M10 13h4" />
                  </svg>
                  Nova pasta
                </button>
                <button onClick={() => { onNewFile(); setNewOpen(false); }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M6 3h8l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
                    <path d="M14 3v4h4M12 11v6M9 14h6" />
                  </svg>
                  Novo documento
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
