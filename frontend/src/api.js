const BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

// UPLOAD
export async function uploadFile(file) {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`${BASE}/upload`, {
    method: "POST",
    body: form,
  });

  return res.json();
}

// LIST
export async function listFiles() {
  const res = await fetch(`${BASE}/files`);
  return res.json();
}

// DOWNLOAD
export function downloadUrl(stored_name) {
    return `${BASE}/download/${stored_name}`;
}
  

// DELETE
export async function deleteFile(id) {
  const res = await fetch(`${BASE}/delete/${id}`, {
    method: "DELETE",
  });

  return res.json();
}
