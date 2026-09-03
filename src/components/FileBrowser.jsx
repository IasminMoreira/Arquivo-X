// FileBrowser.jsx — mostra pastas e arquivos (grade ou lista).
// Pastas são clicáveis (entram na pasta) e a estrela de cada arquivo
// alterna o favorito sem abrir o painel.

import FileIcon from "./FileIcon";
import { TYPES, typeColor } from "../lib/fileTypes";
import { formatBytes, formatShortDate } from "../lib/format";

function StarButton({ active, onClick }) {
  return (
    <button
      className={`star-btn ${active ? "on" : ""}`}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      title={active ? "Desfavoritar" : "Favoritar"}
      aria-label={active ? "Desfavoritar" : "Favoritar"}
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
        <path d="M12 3l2.6 5.6 6.1.9-4.4 4.3 1 6.1L12 17.6 6.7 20l1-6.1L3.3 9.5l6.1-.9z" />
      </svg>
    </button>
  );
}

function FolderTile({ folder, onOpen }) {
  return (
    <button className="folder" onClick={() => onOpen(folder)}>
      <span className="ficon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        </svg>
      </span>
      <span className="finfo">
        <span className="fname">{folder.name}</span>
        <span className="fmeta">{folder.fileCount} arquivos · {formatBytes(folder.sizeBytes)}</span>
      </span>
    </button>
  );
}

function FileCard({ file, selected, onSelect, onToggleFav }) {
  const color = typeColor(file.type);
  return (
    <div className={`card ${selected ? "sel" : ""}`} onClick={() => onSelect(file)} role="button" tabIndex={0}>
      <div className="thumb" style={{ color }}>
        <span className="type-tag" style={{ background: color, color }}>{TYPES[file.type].tag}</span>
        <StarButton active={file.favorite} onClick={() => onToggleFav(file.id)} />
        <FileIcon type={file.type} size={30} />
      </div>
      <div className="body">
        <div className="cname">{file.name}</div>
        <div className="cmeta">{formatBytes(file.sizeBytes)} · {formatShortDate(file.updatedAt)}</div>
      </div>
    </div>
  );
}

function FileRow({ file, selected, onSelect, onToggleFav }) {
  const color = typeColor(file.type);
  return (
    <div className={`list-row ${selected ? "sel" : ""}`} onClick={() => onSelect(file)} role="button" tabIndex={0}>
      <div className="lname">
        <span className="lswatch" style={{ background: color, color }}>
          <FileIcon type={file.type} size={18} />
        </span>
        <span>{file.name}</span>
        <button
          className={`row-star ${file.favorite ? "on" : ""}`}
          onClick={(e) => { e.stopPropagation(); onToggleFav(file.id); }}
          title={file.favorite ? "Desfavoritar" : "Favoritar"}
          aria-label="Favoritar"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill={file.favorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
            <path d="M12 3l2.6 5.6 6.1.9-4.4 4.3 1 6.1L12 17.6 6.7 20l1-6.1L3.3 9.5l6.1-.9z" />
          </svg>
        </button>
      </div>
      <div className="lmeta">{formatShortDate(file.updatedAt)}</div>
      <div className="lmeta">{formatBytes(file.sizeBytes)}</div>
      <div className="lmeta">{TYPES[file.type].name}</div>
    </div>
  );
}

export default function FileBrowser({
  folders, files, view, selected, onSelect, onOpenFolder, onToggleFav, emptyMessage,
}) {
  return (
    <>
      {folders?.length > 0 && (
        <>
          <div className="section-h">Pastas</div>
          <div className="folders">
            {folders.map((f) => <FolderTile key={f.id} folder={f} onOpen={onOpenFolder} />)}
          </div>
        </>
      )}

      <div className="section-h">Arquivos</div>

      {files.length === 0 ? (
        <div className="empty">
          <FileIcon type="doc" size={34} />
          <p>{emptyMessage?.title || "Nenhum arquivo aqui."}</p>
          <span>{emptyMessage?.hint}</span>
        </div>
      ) : view === "grid" ? (
        <div className="grid">
          {files.map((f) => (
            <FileCard key={f.id} file={f} selected={selected?.id === f.id} onSelect={onSelect} onToggleFav={onToggleFav} />
          ))}
        </div>
      ) : (
        <div className="list">
          <div className="list-head">
            <div>Nome</div><div>Editado</div><div>Tamanho</div><div>Tipo</div>
          </div>
          {files.map((f) => (
            <FileRow key={f.id} file={f} selected={selected?.id === f.id} onSelect={onSelect} onToggleFav={onToggleFav} />
          ))}
        </div>
      )}
    </>
  );
}
