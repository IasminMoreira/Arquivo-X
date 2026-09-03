// PreviewPanel.jsx — painel lateral com detalhes e ações do arquivo.
// As ações Baixar/Renomear/Excluir estão como stubs (console.log) até o
// backend entrar; Favoritar já funciona porque é estado local.

import FileIcon from "./FileIcon";
import { TYPES, typeColor } from "../lib/fileTypes";
import { formatBytes, formatLongDate } from "../lib/format";

export default function PreviewPanel({ file, onClose, onToggleFav }) {
  const open = !!file;
  const color = file ? typeColor(file.type) : "var(--muted)";

  return (
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
            <div className="pv-hero" style={{ color }}>
              <span className="type-tag" style={{ background: color, color, top: 12, left: 12 }}>
                {TYPES[file.type].tag}
              </span>
              <FileIcon type={file.type} size={54} />
            </div>
            <div className="pv-title">{file.name}</div>
            <div className="pv-sub">{TYPES[file.type].name} · {formatBytes(file.sizeBytes)}</div>
            <div className="pv-info">
              <div className="row"><span className="k">Tipo</span><span className="v">{TYPES[file.type].name}</span></div>
              <div className="row"><span className="k">Tamanho</span><span className="v">{formatBytes(file.sizeBytes)}</span></div>
              <div className="row"><span className="k">Editado</span><span className="v">{formatLongDate(file.updatedAt)}</span></div>
              <div className="row"><span className="k">Pasta</span><span className="v">Projeto ArquivoX</span></div>
              <div className="row"><span className="k">Nos favoritos</span><span className="v">{file.favorite ? "Sim" : "Não"}</span></div>
            </div>
          </div>

          <div className="pv-actions">
            <button className="full" onClick={() => console.log("baixar", file.id)}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3v12m0 0l4-4m-4 4l-4-4M5 21h14" /></svg>
              Baixar
            </button>
            <button onClick={() => onToggleFav(file.id)}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3l2.6 5.6 6.1.9-4.4 4.3 1 6.1L12 17.6 6.7 20l1-6.1L3.3 9.5l6.1-.9z" /></svg>
              {file.favorite ? "Desfavoritar" : "Favoritar"}
            </button>
            <button onClick={() => console.log("renomear", file.id)}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" /></svg>
              Renomear
            </button>
            <button className="danger" onClick={() => console.log("excluir", file.id)}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m2 0v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7" /></svg>
              Excluir
            </button>
          </div>
        </>
      )}
    </aside>
  );
}
