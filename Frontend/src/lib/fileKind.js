export function fileExtension(name = "") {
  const i = String(name).lastIndexOf(".");
  return i >= 0 ? String(name).slice(i + 1).toLowerCase() : "";
}

const IMAGE_EXT = ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "heic", "tiff"];
const VIDEO_EXT = ["mp4", "mov", "avi", "mkv", "webm", "flv", "wmv"];
const AUDIO_EXT = ["mp3", "wav", "ogg", "flac", "aac", "m4a"];
const TEXT_EXT = ["txt", "md", "json", "csv", "xml", "html", "css", "js", "ts", "jsx", "tsx", "php", "py", "sql", "yml", "yaml"];

export function previewKind(file) {
  const ext = fileExtension(file?.name);

  if (IMAGE_EXT.includes(ext) || file?.type === "image") return "image";
  if (ext === "pdf") return "pdf";
  if (ext === "docx") return "docx";
  if (ext === "doc") return "doc";
  if (ext === "xlsx" || ext === "xls") return "excel";
  if (ext === "csv") return "csv";
  if (VIDEO_EXT.includes(ext) || file?.type === "video") {
    if (AUDIO_EXT.includes(ext)) return "audio";
    if (VIDEO_EXT.includes(ext) || file?.type === "video") return "video";
  }
  if (AUDIO_EXT.includes(ext)) return "audio";
  if (TEXT_EXT.includes(ext) || file?.type === "code") return "text";
  return "none";
}

export function typeFromFilename(name) {
  const ext = fileExtension(name);
  if (IMAGE_EXT.includes(ext)) return "image";
  if (VIDEO_EXT.includes(ext) || AUDIO_EXT.includes(ext)) return "video";
  if (["ts", "tsx", "js", "jsx", "php", "py", "java", "c", "cpp", "h", "sql", "json", "html", "css", "scss", "sh", "yml", "yaml", "rb", "go", "cs", "rs", "bat", "cmd", "ps1"].includes(ext)) {
    return "code";
  }
  return "doc";
}
