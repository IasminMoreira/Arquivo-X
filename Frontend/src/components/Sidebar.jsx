// Sidebar.jsx — navegação, medidor de armazenamento e rodapé do usuário.
// As seções agora são funcionais: clicar troca a listagem (via onNavigate).

import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { STORAGE } from "../data/mockData";
import { typeColor } from "../lib/fileTypes";
import { formatGB, formatBytes } from "../lib/format";

const NAV = [
  { key: "files",     label: "Meus arquivos", icon: <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /> },
  { key: "recent",    label: "Recentes",      icon: <path d="M12 3v12m0 0l4-4m-4 4l-4-4M5 21h14" /> },
  { key: "favorites", label: "Favoritos",     icon: <path d="M12 3l2.6 5.6 6.1.9-4.4 4.3 1 6.1-5.3-2.9L6.7 20l1-6.1L3.3 9.5l6.1-.9z" /> },
  { key: "albums",    label: "Álbuns",        icon: <><rect x="3" y="4" width="18" height="14" rx="2" /><path d="M3 9h18M8 4v5" /></> },
  { key: "trash",     label: "Lixeira",       icon: <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m2 0v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7" /> },
];

export default function Sidebar({ open = false, onClose = () => {}, section = "files", counts = {}, onNavigate = () => {}, storageData = null }) {
  const { user, logOut } = useAuth();
  const navigate = useNavigate();

  const storage = storageData || STORAGE;
  const usedBytes = storage.usedBytes != null
    ? storage.usedBytes
    : ((storage.usedGB != null ? storage.usedGB : Object.values(storage.byType || {}).reduce((a, b) => a + b, 0)) * 1073741824);
  const totalBytes = storage.totalBytes != null ? storage.totalBytes : ((storage.totalGB || 100) * 1073741824);
  const totalGB = storage.totalGB != null ? storage.totalGB : Math.round(totalBytes / 1073741824);
  const types = ["image", "video", "doc", "code"];
  const countFor = { favorites: counts.favorites, albums: counts.albums, trash: counts.trash };

  async function handleLogout() {
    onClose();
    await logOut();
    navigate("/login");
  }

  const initial = (user?.displayName || user?.email || "?").charAt(0).toUpperCase();

  return (
    <aside className={`side ${open ? "open" : ""}`}>
      <div className="brand">
        <div className="mark" />
        <h1>ArquivoX</h1>
      </div>

      <nav className="nav">
        {NAV.map((item) => (
          <button
            key={item.key}
            className={`nav-item ${section === item.key ? "active" : ""}`}
            onClick={() => onNavigate(item.key)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {item.icon}
            </svg>
            {item.label}
            {countFor[item.key] != null && <span className="count">{countFor[item.key]}</span>}
          </button>
        ))}
      </nav>

      <div className="storage">
        <div className="top">
          <span className="used">{formatBytes(usedBytes)}</span>
          <span className="total">de {totalGB} GB</span>
        </div>
        <div className="meter">
          {types.map((t) => {
            const bytes = storage.byTypeBytes?.[t] ?? ((storage.byType?.[t] || 0) * 1073741824);
            const percent = totalBytes > 0 ? (bytes / totalBytes) * 100 : 0;
            return (
              <span
                key={t}
                title={`${formatBytes(bytes)}`}
                style={{
                  width: `${percent}%`,
                  background: typeColor(t),
                  color: typeColor(t),
                }}
              />
            );
          })}
        </div>
        <div className="legend">
          <div><i className="dot" style={{ background: typeColor("image") }} />Imagens</div>
          <div><i className="dot" style={{ background: typeColor("video") }} />Vídeos</div>
          <div><i className="dot" style={{ background: typeColor("doc") }} />Documentos</div>
          <div><i className="dot" style={{ background: typeColor("code") }} />Código</div>
        </div>
      </div>

      <div className="user">
        {user?.photoURL ? (
          <img src={user.photoURL} alt="" className="avatar" />
        ) : (
          <div className="avatar avatar-fallback">{initial}</div>
        )}
        <div className="user-info">
          <span className="user-name">{user?.displayName || "Usuário"}</span>
          <span className="user-email">{user?.email}</span>
        </div>
        <button className="logout" onClick={handleLogout} title="Sair" aria-label="Sair">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
          </svg>
        </button>
      </div>
    </aside>
  );
}
