// fileTypes.js — configuração central dos tipos de arquivo.
// Uma cor fixa por tipo, usada em todo lugar (etiqueta, filtro, ícone,
// medidor de armazenamento). Muda aqui, muda no app inteiro.

export const TYPES = {
  image: { tag: "IMG", name: "Imagem", cssVar: "--t-image" },
  video: { tag: "VÍDEO", name: "Vídeo", cssVar: "--t-video" },
  doc: { tag: "DOC", name: "Documento", cssVar: "--t-doc" },
  code: { tag: "CÓDIGO", name: "Código", cssVar: "--t-code" },
};

// cor CSS de um tipo, pronta para usar em style={{ color: typeColor("image") }}
export const typeColor = (type) => `var(${TYPES[type]?.cssVar || "--muted"})`;

// filtros do topo, na ordem em que aparecem
export const FILTERS = [
  { key: "all", label: "Todos" },
  { key: "image", label: "Imagens" },
  { key: "video", label: "Vídeos" },
  { key: "doc", label: "Documentos" },
  { key: "code", label: "Código" },
];

// opções de ordenação
export const SORTS = [
  { key: "name", label: "Nome (A–Z)" },
  { key: "date", label: "Data de edição" },
  { key: "size", label: "Tamanho" },
  { key: "type", label: "Tipo" },
];
