// PreviewPanel.jsx — painel lateral com detalhes e ações do arquivo.
// Favoritar, mover pra lixeira, restaurar, excluir, renomear e BAIXAR funcionais.

import { useEffect, useState } from "react";
import FilePreview from "./FilePreview";
import { TYPES, typeColor } from "../lib/fileTypes";
import { formatBytes, formatLongDate } from "../lib/format";
import { previewKind } from "../lib/fileKind";

export default function PreviewPanel({ file, onClose, onToggleFav, onTrash, onRestore, onDelete, onRename, onDownload }) {
  const open = !!file;
  const color = file ? typeColor(file.type) : "var(--muted)";

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [expanded, setExpanded] = useState(false);
  const kind = file ? previewKind(file) : "none";
  const canPreview = kind !== "none" && kind !== "doc";

  // Sai do modo de edição sempre que troca de arquivo
  useEffect(() => { setEditing(false); setExpanded(false); }, [file?.id]);

  function startRename() {
    setDraft(file.name);
    setEditing(true);
  }
  
  function saveRename() {
    const name = draft.trim();
    if (name) onRename(file.id, name);
    setEditing(false);
  }

  return (
    <>
    <aside className={`preview ${open ? "open" : ""}`}>
      <div className="pv-head">
        <h3>Detalhes</h3>
        <button className="pv-close" onClick={onClose} aria-label="Fechar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>

      {file && (
        <>
          <div className="pv-body">
            <div className={`pv-hero ${canPreview ? "has-preview" : ""}`} style={{ color }}>
              <span className="type-tag" style={{ background: color, color: "#ffffff", top: 12, left: 12 }}>
                {TYPES[file.type]?.tag || "ARQ"}
              </span>
              <FilePreview file={file} compact />
              {canPreview && (
                <button className="pv-expand" onClick={() => setExpanded(true)} type="button">
                  Ampliar
                </button>
              )}
            </div>

            {editing ? (
              <div className="pv-rename">
                <input
                  autoFocus
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") saveRename(); if (e.key === "Escape") setEditing(false); }}
                />
                <button className="save" onClick={saveRename} aria-label="Salvar nome">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M5 12l5 5L20 6" /></svg>
                </button>
              </div>
            ) : (
              <div className="pv-title">{file.name}</div>
            )}

            <div className="pv-sub">{TYPES[file.type]?.name || "Arquivo"} · {formatBytes(file.sizeBytes)}</div>
            <div className="pv-info">
              <div className="row"><span className="k">Tipo</span><span className="v">{TYPES[file.type]?.name || "Arquivo"}</span></div>
              <div className="row"><span className="k">Tamanho</span><span className="v">{formatBytes(file.sizeBytes)}</span></div>
              <div className="row"><span className="k">Editado</span><span className="v">{formatLongDate(file.updatedAt)}</span></div>
              <div className="row"><span className="k">Nos favoritos</span><span className="v">{file.favorite ? "Sim" : "Não"}</span></div>
            </div>
          </div>

          {file.trashed ? (
            <div className="pv-actions">
              <button className="full" onClick={() => onRestore(file.id)}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 1 0 3-6.7L3 8m0-5v5h5" /></svg>
                Restaurar
              </button>
              <button className="danger" style={{ gridColumn: "1 / -1" }} onClick={() => onDelete(file.id)}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m2 0v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7" /></svg>
                Excluir definitivamente
              </button>
            </div>
          ) : (
            <div className="pv-actions">
              <button className="full" onClick={() => { if (onDownload) onDownload(file); }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3v12m0 0l4-4m-4 4l-4-4M5 21h14" /></svg>
                Baixar
              </button>
              <button onClick={() => onToggleFav(file.id)}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill={file.favorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="M12 3l2.6 5.6 6.1.9-4.4 4.3 1 6.1L12 17.6 6.7 20l1-6.1L3.3 9.5l6.1-.9z" /></svg>
                {file.favorite ? "Desfavoritar" : "Favoritar"}
              </button>
              <button onClick={startRename}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" /></svg>
                Renomear
              </button>
              <button className="danger" onClick={() => onTrash(file.id)}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m2 0v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7" /></svg>
                Excluir
              </button>
            </div>
          )}
        </>
      )}
    </aside>

    {expanded && file && (
      <div className="pv-lightbox" onClick={() => setExpanded(false)}>
        <div className="pv-lightbox-card" onClick={(e) => e.stopPropagation()}>
          <div className="pv-lightbox-head">
            <strong>{file.name}</strong>
            <button type="button" onClick={() => setExpanded(false)} aria-label="Fechar visualização">Fechar</button>
          </div>
          <FilePreview file={file} />
        </div>
      </div>
    )}
    </>
  );
}