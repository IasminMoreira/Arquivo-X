// FileThumb.jsx — carrega a miniatura autenticada via fetchBlob e exibe no card
import { useState, useEffect } from "react";
import FileIcon from "./FileIcon";
import { typeColor } from "../lib/fileTypes";
import { api } from "../lib/api";

export default function FileThumb({ file, size = 30 }) {
  const [objectUrl, setObjectUrl] = useState(null);
  const [hasError, setHasError] = useState(false);

  const isMedia = (file.type === "image" || file.type === "video") && file.id && !hasError;

  useEffect(() => {
    let isMounted = true;
    let url = null;

    if (isMedia) {
      // Usa o cliente de API autenticado com Bearer Token para buscar o arquivo com segurança
      api.files.fetchBlob(`/files/${file.id}/download`)
        .then((blob) => {
          if (isMounted) {
            url = window.URL.createObjectURL(blob);
            setObjectUrl(url);
          }
        })
        .catch(() => {
          if (isMounted) setHasError(true);
        });
    }

    return () => {
      isMounted = false;
      if (url) window.URL.revokeObjectURL(url);
    };
  }, [file.id, isMedia]);

  if (isMedia && objectUrl) {
    return (
      <img
        src={objectUrl}
        alt={file.name}
        className="thumb-img"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: 1,
        }}
      />
    );
  }

  // Fallback caso não seja mídia ou ocorra erro no carregamento
  const color = typeColor(file.type);
  return (
    <div style={{ color, zIndex: 2, position: "relative" }}>
      <FileIcon type={file.type} size={size} />
    </div>
  );
}