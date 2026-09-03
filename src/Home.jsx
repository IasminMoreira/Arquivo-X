// Home.jsx — a tela principal do ArquivoX (o gerenciador de arquivos).
// Concentra toda a navegação (seções + pastas), filtro, ordenação, busca e
// as ações (favoritar, mover pra lixeira, restaurar, excluir).
// Os dados vêm de mockData; depois viram uma consulta ao Firestore.

import { useMemo, useState } from "react";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import FilterBar from "./components/FilterBar";
import FileBrowser from "./components/FileBrowser";
import PreviewPanel from "./components/PreviewPanel";
import { FILES, FOLDERS } from "./data/mockData";
import "./styles/app.css";

const TYPE_ORDER = { image: 0, video: 1, doc: 2, code: 3 };

const SECTION_LABEL = {
  files: "Meus arquivos",
  recent: "Recentes",
  favorites: "Favoritos",
  albums: "Álbuns",
  trash: "Lixeira",
};

export default function Home() {
  const [files, setFiles] = useState(FILES);
  const [folders, setFolders] = useState(FOLDERS);
  const [section, setSection] = useState("files"); // seção ativa da barra lateral
  const [folderId, setFolderId] = useState(null);   // pasta aberta (só em "files")
  const [view, setView] = useState("grid");
  const [activeType, setActiveType] = useState("all");
  const [sort, setSort] = useState("name");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [navOpen, setNavOpen] = useState(false);

  // contadores mostrados na barra lateral (calculados dos dados)
  const counts = useMemo(() => ({
    favorites: files.filter((f) => f.favorite && !f.trashed).length,
    albums: 4,
    trash: files.filter((f) => f.trashed).length,
  }), [files]);

  // conjunto base de acordo com a seção/pasta
  const base = useMemo(() => {
    switch (section) {
      case "favorites": return files.filter((f) => f.favorite && !f.trashed);
      case "recent":
        return [...files.filter((f) => !f.trashed)]
          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
          .slice(0, 6);
      case "trash": return files.filter((f) => f.trashed);
      case "albums": return [];
      case "files":
      default:
        return files.filter((f) => !f.trashed && f.folderId === folderId);
    }
  }, [files, section, folderId]);

  // aplica filtro por tipo, busca e ordenação
  const visibleFiles = useMemo(() => {
    let list = base;
    if (activeType !== "all") list = list.filter((f) => f.type === activeType);
    const q = query.trim().toLowerCase();
    if (q) list = list.filter((f) => f.name.toLowerCase().includes(q));

    if (section === "recent") return list; // já vem por data
    return [...list].sort((a, b) => {
      switch (sort) {
        case "size": return b.sizeBytes - a.sizeBytes;
        case "date": return new Date(b.updatedAt) - new Date(a.updatedAt);
        case "type": return TYPE_ORDER[a.type] - TYPE_ORDER[b.type];
        default: return a.name.localeCompare(b.name, "pt-BR");
      }
    });
  }, [base, activeType, query, sort, section]);

  // mostra as pastas só na raiz de "Meus arquivos" e sem busca/filtro ativos
  const showFolders =
    section === "files" && !folderId && !query.trim() && activeType === "all";

  // caminho (breadcrumb)
  const openFolder = folderId ? folders.find((f) => f.id === folderId) : null;
  const crumbs = [{ label: SECTION_LABEL[section], onClick: () => goToSection(section) }];
  if (openFolder) crumbs.push({ label: openFolder.name });

  // --- navegação ---
  function goToSection(key) {
    setSection(key);
    setFolderId(null);
    setSelected(null);
    setNavOpen(false);
  }
  function enterFolder(folder) {
    setSection("files");
    setFolderId(folder.id);
    setSelected(null);
  }

  // --- ações ---
  function updateFile(id, changes) {
    setFiles((fs) => fs.map((f) => (f.id === id ? { ...f, ...changes } : f)));
    setSelected((s) => (s && s.id === id ? { ...s, ...changes } : s));
  }
  function toggleFav(id) {
    const f = files.find((x) => x.id === id);
    updateFile(id, { favorite: !f.favorite });
  }
  function trashFile(id) {
    updateFile(id, { trashed: true });
    setSelected(null);
  }
  function restoreFile(id) {
    updateFile(id, { trashed: false });
    setSelected(null);
  }
  function deleteForever(id) {
    setFiles((fs) => fs.filter((f) => f.id !== id));
    setSelected(null);
  }
  function renameFile(id, name) {
    updateFile(id, { name });
  }

  // --- criar ---
  function newFolder() {
    const id = "d" + Date.now();
    setFolders((fs) => [{ id, name: "Nova pasta", fileCount: 0, sizeBytes: 0 }, ...fs]);
    setSection("files"); setFolderId(null); setActiveType("all"); setQuery("");
  }
  function newFile() {
    const id = "n" + Date.now();
    const today = new Date().toISOString().slice(0, 10);
    const target = section === "files" ? folderId : null;
    const file = { id, name: "Novo documento.txt", type: "doc", sizeBytes: 0, folderId: target, favorite: false, trashed: false, updatedAt: today };
    setFiles((fs) => [file, ...fs]);
    setSection("files"); setFolderId(target); setActiveType("all"); setQuery("");
    setSelected(file); // abre o painel já pra renomear
  }

  const emptyMessage =
    section === "albums"
      ? { title: "Álbuns em breve", hint: "Aqui você vai poder agrupar arquivos em coleções." }
      : section === "trash"
      ? { title: "Lixeira vazia", hint: "Arquivos que você excluir aparecem aqui." }
      : { title: "Nenhum arquivo aqui.", hint: "Tente outro filtro ou toque em “Novo” para adicionar." };

  return (
    <div className="app-shell">
      <div className="glow glow-a" />
      <div className="glow glow-b" />

      <div
        className={`backdrop ${navOpen ? "show" : ""}`}
        onClick={() => setNavOpen(false)}
      />

      <div className="app">
        <Sidebar
          open={navOpen}
          onClose={() => setNavOpen(false)}
          section={section}
          counts={counts}
          onNavigate={goToSection}
        />

        <div className="main">
          <Topbar
            crumbs={crumbs}
            view={view}
            setView={setView}
            query={query}
            setQuery={setQuery}
            onMenu={() => setNavOpen(true)}
            onNewFolder={newFolder}
            onNewFile={newFile}
          />
          <FilterBar activeType={activeType} setActiveType={setActiveType} sort={sort} setSort={setSort} />

          <div className="scroll">
            <FileBrowser
              folders={showFolders ? folders : []}
              files={visibleFiles}
              view={view}
              selected={selected}
              onSelect={setSelected}
              onOpenFolder={enterFolder}
              onToggleFav={toggleFav}
              emptyMessage={emptyMessage}
            />
          </div>
        </div>
      </div>

      <PreviewPanel
        file={selected}
        onClose={() => setSelected(null)}
        onToggleFav={toggleFav}
        onTrash={trashFile}
        onRestore={restoreFile}
        onDelete={deleteForever}
        onRename={renameFile}
      />
    </div>
  );
}
