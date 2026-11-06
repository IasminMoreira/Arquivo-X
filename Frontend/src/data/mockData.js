// mockData.js — dados de exemplo enquanto o backend não está ligado.
//
// Formato já parecido com o do Firestore: cada arquivo tem id, name, type,
// sizeBytes, folderId (null = raiz), favorite, trashed e updatedAt.
// Quando o Firestore entrar, troca-se este arquivo por uma consulta que
// devolve a mesma estrutura.

export const FOLDERS = [
  { id: "d1", name: "Imagens do projeto", fileCount: 42, sizeBytes: 1932735283 },
  { id: "d2", name: "Vídeos demo", fileCount: 12, sizeBytes: 15246562099 },
  { id: "d3", name: "Documentos", fileCount: 88, sizeBytes: 671088640 },
  { id: "d4", name: "Código-fonte", fileCount: 230, sizeBytes: 81788928 },
];

export const FILES = [
  // raiz (aparecem em "Meus arquivos")
  { id: "f1",  name: "escopo-mvp.pdf",       type: "doc",   sizeBytes: 839680,    folderId: null, favorite: true,  trashed: false, updatedAt: "2025-05-11" },
  { id: "f2",  name: "logo-arquivox.png",    type: "image", sizeBytes: 1153434,   folderId: null, favorite: true,  trashed: false, updatedAt: "2025-05-08" },
  { id: "f3",  name: "roadmap.xlsx",         type: "doc",   sizeBytes: 262144,    folderId: null, favorite: false, trashed: false, updatedAt: "2025-05-13" },

  // dentro de "Imagens do projeto" (d1)
  { id: "f4",  name: "praia-sunset.jpg",     type: "image", sizeBytes: 4404019,   folderId: "d1", favorite: true,  trashed: false, updatedAt: "2025-05-12" },
  { id: "f5",  name: "wireframe-v2.png",     type: "image", sizeBytes: 2936013,   folderId: "d1", favorite: false, trashed: false, updatedAt: "2025-05-06" },
  { id: "f6",  name: "banner-home.png",      type: "image", sizeBytes: 1783808,   folderId: "d1", favorite: false, trashed: false, updatedAt: "2025-05-04" },

  // dentro de "Vídeos demo" (d2)
  { id: "f7",  name: "reuniao-kickoff.mp4",  type: "video", sizeBytes: 134217728, folderId: "d2", favorite: false, trashed: false, updatedAt: "2025-05-11" },
  { id: "f8",  name: "demo-interface.mov",   type: "video", sizeBytes: 100663296, folderId: "d2", favorite: true,  trashed: false, updatedAt: "2025-05-08" },

  // dentro de "Documentos" (d3)
  { id: "f9",  name: "planilha-custos.xlsx", type: "doc",   sizeBytes: 348160,    folderId: "d3", favorite: false, trashed: false, updatedAt: "2025-05-09" },
  { id: "f10", name: "contrato-drive.docx",  type: "doc",   sizeBytes: 215040,    folderId: "d3", favorite: false, trashed: false, updatedAt: "2025-05-05" },

  // dentro de "Código-fonte" (d4)
  { id: "f11", name: "api-client.ts",        type: "code",  sizeBytes: 18432,     folderId: "d4", favorite: false, trashed: false, updatedAt: "2025-05-10" },
  { id: "f12", name: "schema-banco.sql",     type: "code",  sizeBytes: 6144,      folderId: "d4", favorite: true,  trashed: false, updatedAt: "2025-05-07" },

  // na lixeira
  { id: "t1",  name: "rascunho-antigo.docx", type: "doc",   sizeBytes: 102400,    folderId: null, favorite: false, trashed: true,  updatedAt: "2025-04-28" },
  { id: "t2",  name: "teste-render.mp4",     type: "video", sizeBytes: 52428800,  folderId: null, favorite: false, trashed: true,  updatedAt: "2025-04-25" },
  { id: "t3",  name: "print-erro.png",       type: "image", sizeBytes: 634880,    folderId: null, favorite: false, trashed: true,  updatedAt: "2025-04-22" },
];

// Resumo de uso por tipo (GB) e cota total. No app real vem do Storage.
export const STORAGE = {
  totalGB: 100,
  byType: { image: 31.0, video: 24.0, doc: 6.0, code: 1.4 },
};
