import { useEffect, useState } from "react";
import mammoth from "mammoth";
import * as XLSX from "xlsx";
import FileIcon from "./FileIcon";
import { api } from "../lib/api";
import { previewKind } from "../lib/fileKind";

async function loadBlob(fileId) {
  return api.files.fetchBlob(`/files/${fileId}/view`);
}

function wrapHtmlDocument(body) {
  return `<!doctype html>
<html><head><meta charset="utf-8">
<style>
  body { font-family: "Segoe UI", sans-serif; color: #0f172a; background: #fff; margin: 16px; font-size: 13px; line-height: 1.5; }
  table { border-collapse: collapse; width: 100%; }
  td, th { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; }
  th { background: #f1f5f9; }
  img { max-width: 100%; }
  p { margin: 0 0 10px; }
</style></head><body>${body}</body></html>`;
}

export default function FilePreview({ file, compact = false }) {
  const kind = previewKind(file);
  const [state, setState] = useState({ status: "idle", objectUrl: null, html: "", sheets: [], sheet: 0, error: "" });

  useEffect(() => {
    if (!file?.id || kind === "none" || kind === "doc") {
      setState({ status: "idle", objectUrl: null, html: "", sheets: [], sheet: 0, error: "" });
      return undefined;
    }

    let cancelled = false;
    const urls = [];
    setState((s) => ({ ...s, status: "loading", error: "" }));

    (async () => {
      try {
        const blob = await loadBlob(file.id);
        if (cancelled) return;

        if (kind === "image" || kind === "pdf" || kind === "video" || kind === "audio") {
          const objectUrl = URL.createObjectURL(blob);
          urls.push(objectUrl);
          if (cancelled) return;
          setState({ status: "ready", objectUrl, html: "", sheets: [], sheet: 0, error: "" });
          return;
        }

        const buffer = await blob.arrayBuffer();
        if (cancelled) return;

        if (kind === "docx") {
          const result = await mammoth.convertToHtml({ arrayBuffer: buffer });
          setState({ status: "ready", objectUrl: null, html: wrapHtmlDocument(result.value || "<p>Documento vazio.</p>"), sheets: [], sheet: 0, error: "" });
          return;
        }

        if (kind === "excel" || kind === "csv" || kind === "text") {
          if (kind === "text") {
            const text = new TextDecoder().decode(buffer);
            const escaped = text.replace(/[&<>]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[ch]));
            setState({ status: "ready", objectUrl: null, html: wrapHtmlDocument(`<pre>${escaped}</pre>`), sheets: [], sheet: 0, error: "" });
            return;
          }

          const workbook = XLSX.read(buffer, { type: "array" });
          const sheets = workbook.SheetNames.map((name) => {
            const table = XLSX.utils.sheet_to_html(workbook.Sheets[name], { header: "", footer: "" });
            return { name, html: wrapHtmlDocument(table || "<p>Planilha vazia.</p>") };
          });
          setState({ status: "ready", objectUrl: null, html: sheets[0]?.html || "", sheets, sheet: 0, error: "" });
          return;
        }
      } catch (err) {
        if (!cancelled) {
          setState({ status: "error", objectUrl: null, html: "", sheets: [], sheet: 0, error: err.message || "Falha ao abrir o arquivo." });
        }
      }
    })();

    return () => {
      cancelled = true;
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [file?.id, file?.name, kind]);

  if (kind === "doc") {
    return (
      <div className="pv-fallback">
        <FileIcon type={file.type} size={compact ? 36 : 54} />
        <p>Arquivos .doc antigos não abrem no navegador. Converta para .docx ou baixe o arquivo.</p>
      </div>
    );
  }

  if (kind === "none") {
    return (
      <div className="pv-fallback">
        <FileIcon type={file.type} size={compact ? 36 : 54} />
        <p>Sem pré-visualização para este formato.</p>
      </div>
    );
  }

  if (state.status === "loading") {
    return <div className="pv-fallback"><span className="spinner" />Carregando visualização…</div>;
  }

  if (state.status === "error") {
    return (
      <div className="pv-fallback">
        <FileIcon type={file.type} size={compact ? 36 : 54} />
        <p>{state.error}</p>
      </div>
    );
  }

  return (
    <div className={`pv-viewer ${compact ? "compact" : ""}`}>
      {state.sheets.length > 1 && (
        <div className="pv-sheets">
          {state.sheets.map((sheet, index) => (
            <button
              key={sheet.name}
              className={index === state.sheet ? "on" : ""}
              onClick={() => setState((s) => ({ ...s, sheet: index, html: sheet.html }))}
            >
              {sheet.name}
            </button>
          ))}
        </div>
      )}

      {kind === "image" && state.objectUrl && (
        <img src={state.objectUrl} alt={file.name} />
      )}
      {kind === "pdf" && state.objectUrl && (
        <iframe title={file.name} src={state.objectUrl} />
      )}
      {kind === "video" && state.objectUrl && (
        <video src={state.objectUrl} controls />
      )}
      {kind === "audio" && state.objectUrl && (
        <audio src={state.objectUrl} controls />
      )}
      {(kind === "docx" || kind === "excel" || kind === "csv" || kind === "text") && state.html && (
        <iframe title={file.name} sandbox="" srcDoc={state.html} />
      )}
    </div>
  );
}
