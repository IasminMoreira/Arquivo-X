/**
 * ArquivoX API Client para o Frontend
 * Comunicação com o backend Laravel (Sanctum).
 */
// Em produção defina VITE_API_URL (ex.: https://api.seudominio.com/api) no Vercel.
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem("arquivox_token");

  const headers = {
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  // Se for envio de arquivo (FormData), não define o Content-Type para o navegador lidar com o boundary
  if (options.body instanceof FormData) {
    delete headers["Content-Type"];
  } else if (!headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem("arquivox_token");
    window.location.href = "/login";
    return;
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Erro na requisição.");
  }

  return response.json();
}

export const api = {
  files: {
    // Retorna a URL direta para o arquivo com o token de autenticação
    downloadUrl(fileId) {
        const token = localStorage.getItem("arquivox_token");
        return `${API_URL}/files/${fileId}/download?token=${token}`;
    },

    async download(fileId, fileName) {
        const token = localStorage.getItem("arquivox_token");
        if (!token) throw new Error("Token não encontrado.");

        const response = await fetch(`${API_URL}/files/${fileId}/download`, {
            headers: {
            Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Erro ao baixar arquivo (${response.status})`);
        }

        // Converte a resposta do servidor em Blob
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        
        // Cria um elemento <a> temporário para disparar o salvamento no SO
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName || "arquivo";
        document.body.appendChild(a);
        a.click();

        // Limpa a memória
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    },
    async list(params = {}) {
      const query = new URLSearchParams(params).toString();
      return apiFetch(`/files?${query}`);
    },
    async upload(formData) {
      // Chama apiFetch sem Content-Type para o browser criar o multipart/form-data com boundary
      return apiFetch("/files", {
        method: "POST",
        body: formData,
      });
    },
    async delete(fileId) {
      return apiFetch(`/files/${fileId}`, {
        method: "DELETE",
      });
    },
    async get(fileId) {
      return apiFetch(`/files/${fileId}`);
    },
    async update(fileId, data) {
      return apiFetch(`/files/${fileId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
    async fetchBlob(endpoint) {
      const token = localStorage.getItem("arquivox_token");

      if (!token) {
        throw new Error("Token de autenticação não encontrado.");
      }

      const response = await fetch(`${API_URL}${endpoint}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "*/*",
        },
      });

      if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.status}`);
      }

      return response.blob();
    },
  },
  folders: {
    async list(params = {}) {
      const query = new URLSearchParams(params).toString();
      return apiFetch(`/folders?${query}`);
    },
    async create(data) {
      return apiFetch("/folders", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    async update(id, data) {
      return apiFetch(`/folders/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
    async delete(id) {
      return apiFetch(`/folders/${id}`, {
        method: "DELETE",
      });
    },
  },
};
