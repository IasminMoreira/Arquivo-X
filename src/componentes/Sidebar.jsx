// Sidebar.jsx — navegação, medidor de armazenamento e o rodapé do usuário.

import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { STORAGE } from "../data/mockData";
import { typeColor } from "../lib/fileTypes";
import { formatGB } from "../lib/format";

const nav = [
  { key: "files", label: "Meus arquivos", icon: <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /> },
  { key: "recent", label: "Recentes", icon: <path d="M12 3v12m0 0l4-4m-4 4l-4-4M5 21h14" /> },
  { key: "fav", label: "Favoritos", count: 8, icon: <path d="M12 3l2.6 5.6 6.1.9-4.4 4.3 1 6.1-5.3-2.9L6.7 20l1-6.1L3.3 9.5l6.1-.9z" /> },
  { key: "albums", label: "Álbuns", count: 4, icon: <><rect x="3" y="4" width="18" height="14" rx="2" /><path d="M3 9h18M8 4v5" /></> },
  { key: "trash", label: "Lixeira", count: 3, icon: <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m2 0v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7" /> },
];

export default function Sidebar() {
  const { user, logOut } = useAuth();
  const navigate = useNavigate();

  const usedGB = Object.values(STORAGE.byType).reduce((a, b) => a + b, 0);
  const types = ["image", "video", "doc", "code"];

  async function handleLogout() {
    await logOut();
    navigate("/login");
  }

  const initial = (user?.displayName || user?.email || "?").charAt(0).toUpperCase();

  return (
    <aside className="side">
      <div className="brand">
        <div className="mark" />
        <h1>ArquivoX</h1>
      </div>

      <nav className="nav">
        {nav.map((item, i) => (
          <button key={item.key} className={`nav-item ${i === 0 ? "active" : ""}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {item.icon}
            </svg>
            {item.label}
            {item.count != null && <span className="count">{item.count}</span>}
          </button>
        ))}
      </nav>

      <div className="storage">
        <div className="top">
          <span className="used">{formatGB(usedGB)}</span>
          <span className="total">de {STORAGE.totalGB} GB</span>
        </div>
        <div className="meter">
          {types.map((t) => (
            <span
              key={t}
              style={{
                width: `${(STORAGE.byType[t] / STORAGE.totalGB) * 100}%`,
                background: typeColor(t),
                color: typeColor(t),
              }}
            />
          ))}
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
