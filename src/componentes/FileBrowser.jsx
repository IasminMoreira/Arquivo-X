// FileBrowser.jsx — mostra as pastas e os arquivos (em grade ou lista).
// Contém três subcomponentes internos: FolderTile, FileCard e FileRow.

import FileIcon from "./FileIcon";
import { TYPES, typeColor } from "../lib/fileTypes";
import { formatBytes, formatShortDate } from "../lib/format";

function Star() {
  return (
    <svg className="fav-star" width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 3l2.6 5.6 6.1.9-4.4 4.3 1 6.1L12 17.6 6.7 20l1-6.1L3.3 9.5l6.1-.9z" />
    </svg>
  );
}

function FolderTile({ folder }) {
  return (
    <button className="folder">
      <span className="ficon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        </svg>
      </span>
      <span>
        <span className="fname">{folder.name}</span>
        <span className="fmeta">{folder.fileCount} arquivos · {formatBytes(folder.sizeBytes)}</span>
      </span>
    </button>
  );
}

function FileCard({ file, selected, onSelect }) {
  const color = typeColor(file.type);
  return (
    <button className={`card ${selected ? "sel" : ""}`} onClick={() => onSelect(file)}>
      <div className="thumb" style={{ color }}>
        <span className="type-tag" style={{ background: color, color }}>{TYPES[file.type].tag}</span>
        {file.favorite && <Star />}
        <FileIcon type={file.type} size={30} />
      </div>
      <div className="body">
        <div className="cname">{file.name}</div>
        <div className="cmeta">{formatBytes(file.sizeBytes)} · {formatShortDate(file.updatedAt)}</div>
      </div>
    </button>
  );
}

function FileRow({ file, selected, onSelect }) {
  const color = typeColor(file.type);
  return (
    <button className={`list-row ${selected ? "sel" : ""}`} onClick={() => onSelect(file)}>
      <div className="lname">
        <span className="lswatch" style={{ background: color, color }}>
          <FileIcon type={file.type} size={18} />
        </span>
        <span>{file.name}</span>
      </div>
      <div className="lmeta">{formatShortDate(file.updatedAt)}</div>
      <div className="lmeta">{formatBytes(file.sizeBytes)}</div>
      <div className="lmeta">{TYPES[file.type].name}</div>
    </button>
  );
}

export default function FileBrowser({ folders, files, view, selected, onSelect }) {
  return (
    <>
      {folders?.length > 0 && (
        <>
          <div className="section-h">Pastas</div>
          <div className="folders">
            {folders.map((f) => <FolderTile key={f.id} folder={f} />)}
          </div>
        </>
      )}

      <div className="section-h">Arquivos</div>

      {files.length === 0 ? (
        <div className="empty">
          <FileIcon type="doc" size={34} />
          <p>Nenhum arquivo aqui.</p>
          <span>Tente outro filtro ou toque em “Novo” para adicionar.</span>
        </div>
      ) : view === "grid" ? (
        <div className="grid">
          {files.map((f) => (
            <FileCard key={f.id} file={f} selected={selected?.id === f.id} onSelect={onSelect} />
          ))}
        </div>
      ) : (
        <div className="list">
          <div className="list-head">
            <div>Nome</div><div>Editado</div><div>Tamanho</div><div>Tipo</div>
          </div>
          {files.map((f) => (
            <FileRow key={f.id} file={f} selected={selected?.id === f.id} onSelect={onSelect} />
          ))}
        </div>
      )}
    </>
  );
}
