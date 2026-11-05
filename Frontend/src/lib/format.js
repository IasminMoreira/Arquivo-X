// format.js — funções para exibir tamanho e datas em português.

export function formatBytes(bytes) {
  if (bytes == null || isNaN(bytes)) return "—";
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let value = bytes / 1024;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i++;
  }
  const rounded = value >= 10 ? Math.round(value) : Math.round(value * 10) / 10;
  return `${rounded.toString().replace(".", ",")} ${units[i]}`;
}

export function formatGB(gb) {
  if (gb == null || gb === 0) return "0 MB";
  if (gb < 1) {
    const mb = Math.round(gb * 1024);
    if (mb < 1) return `${Math.round(gb * 1024 * 1024)} KB`;
    return `${mb} MB`;
  }
  const rounded = Math.round(gb * 10) / 10;
  return `${rounded.toString().replace(".", ",")} GB`;
}

// "12 mai"
export function formatShortDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" })
    .format(d)
    .replace(".", "");
}

// "12 de maio de 2025"
export function formatLongDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric" }).format(d);
}
