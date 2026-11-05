/**
 * ArquivoX API Client
 * Integração universal entre o Frontend e o Backend Laravel (via Laravel Sanctum).
 */

const BASE_URL = import.meta.env?.VITE_API_BASE_URL || "/api";

export function getToken() {
  return localStorage.getItem("arquivox_token");
}

export function setToken(token) {
  if (token) {
    localStorage.setItem("arquivox_token", token);
  } else {
    localStorage.removeItem("arquivox_token");
  }
}

async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  // Se o body não for FormData, envia como JSON
  let body = options.body;
  if (body && !(body instanceof FormData) && typeof body === "object") {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
    body,
  });

  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get("content-type") || "";
  let data = null;
  if (contentType.includes("application/json")) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorMsg =
      data?.message ||
      (typeof data === "string" ? data : "Ocorreu um erro na requisição.");
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  auth: {
    async register({ name, email, password }) {
      const res = await request("/register", {
        method: "POST",
        body: { name, email, password },
      });
      if (res.token) setToken(res.token);
      return res;
    },
    async login({ email, password }) {
      const res = await request("/login", {
        method: "POST",
        body: { email, password },
      });
      if (res.token) setToken(res.token);
      return res;
    },
    async loginGoogle(data = {}) {
      const res = await request("/login/google", {
        method: "POST",
        body: data,
      });
      if (res.token) setToken(res.token);
      return res;
    },
    async logout() {
      try {
        await request("/logout", { method: "POST" });
      } finally {
        setToken(null);
      }
    },
    async getUser() {
      return request("/user");
    },
    async resetPassword(email) {
      return request("/password/reset", {
        method: "POST",
        body: { email },
      });
    },
  },

  folders: {
    async list(parentId = null) {
      const qs = parentId ? `?parent_id=${encodeURIComponent(parentId)}` : "";
      const res = await request(`/folders${qs}`);
      return res.data || res;
    },
    async get(id) {
      const res = await request(`/folders/${id}`);
      return res.data || res;
    },
    async create({ name, description, parent_id }) {
      const res = await request("/folders", {
        method: "POST",
        body: { name, description, parent_id },
      });
      return res.data || res;
    },
    async update(id, changes) {
      const res = await request(`/folders/${id}`, {
        method: "PATCH",
        body: changes,
      });
      return res.data || res;
    },
    async delete(id) {
      return request(`/folders/${id}`, { method: "DELETE" });
    },
    async createShortcut(id, parentId = null) {
      const res = await request(`/folders/${id}/shortcut`, {
        method: "POST",
        body: { parent_id: parentId },
      });
      return res.data || res;
    },
  },

  files: {
    async list({ section = "files", folderId = null, type = "all", sort = "name", direction = "asc", q = "" } = {}) {
      const params = new URLSearchParams();
      if (section) params.set("section", section);
      if (folderId) params.set("folder_id", folderId);
      if (type && type !== "all") params.set("type", type);
      if (sort) params.set("sort", sort);
      if (direction) params.set("direction", direction);
      if (q) params.set("q", q);

      const res = await request(`/files?${params.toString()}`);
      return res.data || res;
    },
    async create({ name, folder_id, content = "" }) {
      const res = await request("/files", {
        method: "POST",
        body: { name, folder_id, content },
      });
      return res.data || res;
    },
    async upload(formData) {
      const res = await request("/files", {
        method: "POST",
        body: formData,
      });
      return res.data || res;
    },
    async get(id) {
      const res = await request(`/files/${id}`);
      return res.data || res;
    },
    async update(id, changes) {
      const res = await request(`/files/${id}`, {
        method: "PATCH",
        body: changes,
      });
      return res.data || res;
    },
    async delete(id) {
      return request(`/files/${id}`, { method: "DELETE" });
    },
    async emptyTrash() {
      return request("/trash/empty", { method: "DELETE" });
    },
    async copy(id, targetFolderId = null) {
      const res = await request(`/files/${id}/copy`, {
        method: "POST",
        body: { folder_id: targetFolderId },
      });
      return res.data || res;
    },
    async move(id, targetFolderId) {
      const res = await request(`/files/${id}/move`, {
        method: "POST",
        body: { folder_id: targetFolderId },
      });
      return res.data || res;
    },
    async checkName(name, folderId = null) {
      return request("/files/check-name", {
        method: "POST",
        body: { name, folder_id: folderId },
      });
    },
    async duplicates() {
      const res = await request("/files/duplicates");
      return res.data || res;
    },
    async fetchBlob(path) {
      const token = getToken();
      const res = await fetch(`${BASE_URL}${path}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Não foi possível carregar o arquivo.");
      return res.blob();
    },
    downloadUrl(id) {
      return `${BASE_URL}/files/${id}/download`;
    },
    viewUrl(id) {
      return `${BASE_URL}/files/${id}/view`;
    },
    streamUrl(id) {
      return `${BASE_URL}/files/${id}/stream`;
    },
    thumbnailUrl(id) {
      return `${BASE_URL}/files/${id}/thumbnail`;
    },
    async download(id, filename) {
      const token = getToken();
      const res = await fetch(`${BASE_URL}/files/${id}/download`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Erro ao baixar arquivo.");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename || `arquivo_${id}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    },
  },

  albums: {
    async list() {
      const res = await request("/albums");
      return res.data || res;
    },
    async get(id) {
      const res = await request(`/albums/${id}`);
      return res.data || res;
    },
    async create({ name, description, cover_file_id }) {
      const res = await request("/albums", {
        method: "POST",
        body: { name, description, cover_file_id },
      });
      return res.data || res;
    },
    async update(id, changes) {
      const res = await request(`/albums/${id}`, {
        method: "PATCH",
        body: changes,
      });
      return res.data || res;
    },
    async delete(id) {
      return request(`/albums/${id}`, { method: "DELETE" });
    },
    async addFile(albumId, fileId) {
      return request(`/albums/${albumId}/files`, {
        method: "POST",
        body: { file_id: fileId },
      });
    },
    async removeFile(albumId, fileId) {
      return request(`/albums/${albumId}/files/${fileId}`, {
        method: "DELETE",
      });
    },
  },

  storage: {
    async getUsage() {
      return request("/storage/usage");
    },
  },

  cloud: {
    async getConnections() {
      return request("/cloud/connections");
    },
    async connectGoogle(data = {}) {
      return request("/cloud/google/connect", {
        method: "POST",
        body: data,
      });
    },
    async disconnectGoogle() {
      return request("/cloud/google/disconnect", { method: "DELETE" });
    },
    async sync() {
      return request("/cloud/sync", { method: "POST" });
    },
  },

  watchedFolders: {
    async list() {
      return request("/watched-folders");
    },
    async create(path, label) {
      return request("/watched-folders", {
        method: "POST",
        body: { path, label },
      });
    },
    async scan(id) {
      return request(`/watched-folders/${id}/scan`, { method: "POST" });
    },
  },
};

export default api;
