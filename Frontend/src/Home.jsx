// Home.jsx — a tela principal do ArquivoX (gerenciador de arquivos completo).
// Conectado diretamente à API do backend Laravel com suporte a Drag & Drop,
// progresso otimista, gerenciamento de pastas, álbuns e downloads.

import { useEffect, useMemo, useRef, useState } from "react";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import FilterBar from "./components/FilterBar";
import FileBrowser from "./components/FileBrowser";
import PreviewPanel from "./components/PreviewPanel";
import { api } from "./lib/api";
import { typeFromFilename } from "./lib/fileKind";
import { buildStorageFromFiles } from "./lib/storageUsage";
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
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [storageData, setStorageData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [section, setSection] = useState("files");
  const [folderId, setFolderId] = useState(null);
  const [view, setView] = useState("grid");
  const [activeType, setActiveType] = useState("all");
  const [sort, setSort] = useState("name");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [navOpen, setNavOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);

  // Carrega todos os dados iniciais da API do Laravel de forma limpa e sem piscadas
  useEffect(() => {
    async function loadInitialData() {
      setLoading(true);
      await Promise.all([
        loadFiles(),
        loadFolders(),
        loadStorage(),
        loadAlbums(),
      ]);
      setLoading(false);
    }

    loadInitialData();
  }, []);

  async function loadFiles() {
    try {
      const res = await api.files.list({ section: "all" });
      const list = Array.isArray(res) ? res : res?.data || [];
      setFiles(list);
    } catch (err) {
      console.warn("Falha ao carregar arquivos:", err);
    }
  }

  async function loadFolders() {
    try {
      const res = await api.folders.list();
      const list = Array.isArray(res) ? res : res?.data || [];
      setFolders(list);
    } catch (err) {
      console.warn("Falha ao carregar pastas:", err);
    }
  }

  async function loadStorage() {
    try {
      const data = await api.storage.getUsage();
      if (data) setStorageData(data);
    } catch (err) {
      console.warn("Erro ao buscar armazenamento:", err);
    }
  }

  async function loadAlbums() {
    try {
      const data = await api.albums.list();
      if (Array.isArray(data)) setAlbums(data);
    } catch (err) {
      console.warn("Erro ao buscar álbuns:", err);
    }
  }

  const liveStorage = useMemo(
    () => buildStorageFromFiles(files, storageData?.totalBytes),
    [files, storageData]
  );

  // Contadores mostrados na barra lateral
  const counts = useMemo(() => ({
    favorites: files.filter((f) => f.favorite && !f.trashed).length,
    albums: albums.length || 0,
    trash: files.filter((f) => f.trashed).length,
  }), [files, albums]);

  // Conjunto base de acordo com a seção/pasta
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
        return files.filter((f) => !f.trashed && String(f.folderId || "") === String(folderId || ""));
    }
  }, [files, section, folderId]);

  // Aplica filtro por tipo, busca e ordenação
  const visibleFiles = useMemo(() => {
    let list = base;
    if (activeType !== "all") list = list.filter((f) => f.type === activeType);
    const q = query.trim().toLowerCase();
    if (q) list = list.filter((f) => f.name.toLowerCase().includes(q));

    if (section === "recent") return list;
    return [...list].sort((a, b) => {
      switch (sort) {
        case "size": return b.sizeBytes - a.sizeBytes;
        case "date": return new Date(b.updatedAt) - new Date(a.updatedAt);
        case "type": return (TYPE_ORDER[a.type] ?? 99) - (TYPE_ORDER[b.type] ?? 99);
        default: return a.name.localeCompare(b.name, "pt-BR");
      }
    });
  }, [base, activeType, query, sort, section]);

  // Mostra as pastas na raiz e dentro de subpastas (quando sem busca/filtro ativos)
  const showFolders =
    section === "files" && !query.trim() && activeType === "all";

  // Filtra as pastas para exibir apenas as que pertencem à pasta atual (folderId)
  const visibleFolders = useMemo(() => {
    if (!showFolders) return [];
    return folders.filter((f) => {
      const fParent = f.parentId || f.parent_id || null;
      return String(fParent || "") === String(folderId || "");
    });
  }, [folders, showFolders, folderId]);

  // Caminho (breadcrumb)
  const openFolder = folderId ? folders.find((f) => String(f.id) === String(folderId)) : null;
  const crumbs = [{ label: SECTION_LABEL[section], onClick: () => goToSection(section) }];
  if (openFolder) crumbs.push({ label: openFolder.name, folderId: openFolder.id });

  // Navegação
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

  // Ações sincronizadas com a API
  async function updateFile(id, changes) {
    setFiles((fs) => fs.map((f) => (f.id === id ? { ...f, ...changes } : f)));
    setSelected((s) => (s && s.id === id ? { ...s, ...changes } : s));
    try {
      await api.files.update(id, changes);
      loadStorage();
    } catch (err) {
      console.warn("Falha ao salvar alteração no backend:", err);
    }
  }

  async function toggleFav(id) {
    const f = files.find((x) => x.id === id);
    if (!f) return;
    await updateFile(id, { favorite: !f.favorite });
  }

  async function trashFile(id) {
    await updateFile(id, { trashed: true });
    setSelected(null);
  }

  async function restoreFile(id) {
    await updateFile(id, { trashed: false });
    setSelected(null);
  }

  async function deleteForever(id) {
    setFiles((fs) => fs.filter((f) => f.id !== id));
    setSelected(null);
    try {
      await api.files.delete(id);
      loadStorage();
    } catch (err) {
      console.warn("Falha ao excluir no backend:", err);
    }
  }

  async function renameFile(id, name) {
    await updateFile(id, { name });
  }

  async function handleDownload(file) {
    if (!file) return;
    try {
      await api.files.download(file.id, file.name);
    } catch (err) {
      console.warn("Erro no download direto, abrindo rota:", err);
      window.open(api.files.downloadUrl(file.id), "_blank");
    }
  }

  // Criar pasta
  async function newFolder() {
    const tempId = "d" + Date.now();
    const targetFolder = folderId ? String(folderId) : null;
    
    const tempFolder = { 
      id: tempId, 
      name: "Nova pasta", 
      fileCount: 0, 
      sizeBytes: 0, 
      parentId: targetFolder // Mantém a referência consistente no front
    };
    
    setFolders((fs) => [tempFolder, ...fs]);

    try {
      const res = await api.folders.create({ name: "Nova pasta", parent_id: targetFolder });
      const createdFolder = res?.data || res;

      if (createdFolder?.id) {
        // Assegura que o objeto retornado mantenha o parentId correto caso o resource venha diferente
        const normalizedFolder = {
          ...createdFolder,
          parentId: createdFolder.parentId !== undefined ? createdFolder.parentId : targetFolder
        };

        setFolders((fs) => fs.map((f) => (f.id === tempId ? normalizedFolder : f)));
      } else {
        loadFolders();
      }
    } catch (err) {
      console.warn("Erro ao criar pasta na API:", err);
      setFolders((fs) => fs.filter((f) => f.id !== tempId));
    }
  }

  // Renomear pasta
  async function renameFolder(folderIdToRename, newName) {
    setFolders((fs) => fs.map((f) => (String(f.id) === String(folderIdToRename) ? { ...f, name: newName } : f)));

    try {
      await api.folders.update(folderIdToRename, { name: newName });
    } catch (err) {
      console.error("Erro ao renomear pasta na API:", err);
      loadFolders();
    }
  }

  // Excluir pasta
  async function deleteFolder(folder) {
    if (!folder) return;
    const confirmDelete = window.confirm(`Deseja realmente excluir a pasta "${folder.name}" e todo o seu conteúdo?`);
    if (!confirmDelete) return;

    setFolders((fs) => fs.filter((f) => f.id !== folder.id));
    setFiles((fs) => fs.filter((f) => String(f.folderId) !== String(folder.id)));
    if (String(folderId) === String(folder.id)) {
      setFolderId(null);
    }

    try {
      await api.folders.delete(folder.id);
      loadStorage();
    } catch (err) {
      console.error("Erro ao excluir pasta na API:", err);
      loadFolders();
      loadFiles();
    }
  }

  // Mover arquivo para pasta ou de volta para a raiz
  async function moveFileToFolder(fileId, targetFolderId = null) {
    const cleanFileId = String(fileId);
    const cleanFolderId =
      targetFolderId && targetFolderId !== "null" && targetFolderId !== "undefined"
        ? String(targetFolderId)
        : null;

    setFiles((fs) =>
      fs.map((f) => (String(f.id) === cleanFileId ? { ...f, folderId: cleanFolderId } : f))
    );

    try {
      await api.files.update(cleanFileId, { folder_id: cleanFolderId });
      loadFolders();
    } catch (err) {
      console.error("Erro ao mover arquivo na API:", err);
      loadFiles();
    }
  }

  // Criar arquivo de texto simples
  async function newFile() {
    const tempId = "n" + Date.now();
    const today = new Date().toISOString().slice(0, 10);
    const target = section === "files" ? folderId : null;
    const tempFile = {
      id: tempId,
      name: "Novo documento.txt",
      type: "doc",
      sizeBytes: 0,
      folderId: target,
      favorite: false,
      trashed: false,
      updatedAt: today,
    };
    setFiles((fs) => [tempFile, ...fs]);
    setSection("files");
    setFolderId(target);
    setActiveType("all");
    setQuery("");
    setSelected(tempFile);

    try {
      const res = await api.files.create({ name: "Novo documento.txt", folder_id: target });
      const createdFile = res?.data || res;
      if (createdFile?.id) {
        setFiles((fs) => fs.map((f) => (f.id === tempId ? createdFile : f)));
        setSelected(createdFile);
        loadStorage();
      }
    } catch (err) {
      console.warn("Erro ao criar arquivo na API:", err);
    }
  }

  // Upload de arquivos unificado
  async function handleUploadFiles(filesList, customFolderId = null) {
    if (!filesList || filesList.length === 0) return;
    const targetFolder = customFolderId !== null ? customFolderId : (section === "files" ? folderId : null);

    for (const file of filesList) {
      const tempId = "u" + Date.now() + "-" + Math.random().toString(36).substring(2, 7);

      const optimistic = {
        id: tempId,
        name: file.name,
        type: typeFromFilename(file.name),
        sizeBytes: file.size || 0,
        folderId: targetFolder,
        favorite: false,
        trashed: false,
        updatedAt: new Date().toISOString().slice(0, 10),
      };
      setFiles((fs) => [optimistic, ...fs]);

      const formData = new FormData();
      formData.append("file", file);
      if (targetFolder) {
        formData.append("folder_id", targetFolder);
      }

      try {
        const response = await api.files.upload(formData);
        const uploadedItem = response?.data || response;

        if (uploadedItem?.id) {
          setFiles((fs) => [uploadedItem, ...fs.filter((f) => f.id !== tempId && f.id !== uploadedItem.id)]);
        } else {
          setFiles((fs) => fs.filter((f) => f.id !== tempId));
        }
      } catch (err) {
        setFiles((fs) => fs.filter((f) => f.id !== tempId));
        console.error("Erro no upload:", err);
        alert(`Falha no upload de "${file.name}": ${err.message}`);
      }
    }

    loadStorage();
    loadFolders();
  }

  // Eventos Globais de Drag & Drop seguros com contador de referência
  function handleDragEnter(e) {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current += 1;
    const types = e.dataTransfer?.types ? Array.from(e.dataTransfer.types) : [];
    const isExternalFile = types.includes("Files") && !types.includes("application/x-arquivox-file");
    if (isExternalFile) {
      setIsDragging(true);
    }
  }

  function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current <= 0) {
      dragCounter.current = 0;
      setIsDragging(false);
    }
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  async function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current = 0;
    setIsDragging(false);

    const isInternalMove = e.dataTransfer.types.includes("application/x-arquivox-file");
    if (isInternalMove) return;

    if (e.dataTransfer?.files?.length > 0) {
      await handleUploadFiles(Array.from(e.dataTransfer.files));
    }
  }

  const emptyMessage =
    section === "albums"
      ? { title: "Álbuns em breve", hint: "Aqui você vai poder agrupar arquivos em coleções." }
      : section === "trash"
      ? { title: "Lixeira vazia", hint: "Arquivos que você excluir aparecem aqui." }
      : { title: "Nenhum arquivo aqui.", hint: "Tente outro filtro ou toque em “Novo” para adicionar." };

  return (
    <div
      className="app-shell"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="glow glow-a" />
      <div className="glow glow-b" />

      {isDragging && (
        <div className="drag-overlay">
          <div className="drag-box">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
            </svg>
            <h3>Solte os arquivos para fazer upload</h3>
            <p>Os arquivos serão salvos em {openFolder ? `"${openFolder.name}"` : "Meus arquivos"}</p>
          </div>
        </div>
      )}

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
          storageData={liveStorage}
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
            onUploadFiles={handleUploadFiles}
            onMoveFileToFolder={moveFileToFolder}
          />

          <FilterBar
            activeType={activeType}
            setActiveType={setActiveType}
            sort={sort}
            setSort={setSort}
          />

          <div className="scroll">
            {loading && files.length === 0 ? (
              <div className="loading-placeholder">
                <span className="spinner" />
                <p>Sincronizando com o banco de dados...</p>
              </div>
            ) : (
              <FileBrowser
                folders={visibleFolders}
                files={visibleFiles}
                view={view}
                selected={selected}
                onSelect={setSelected}
                onOpenFolder={enterFolder}
                onToggleFav={toggleFav}
                emptyMessage={emptyMessage}
                onDeleteFolder={deleteFolder}
                onRenameFolder={renameFolder}
                onMoveFileToFolder={moveFileToFolder}
                onUploadFiles={handleUploadFiles}
              />
            )}
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
        onDownload={handleDownload}
      />
    </div>
  );
}