// RAG API Service
export interface RAGRequest {
  query: string;
  pipeline: string;
  [key: string]: any;
}

export interface RAGResponse {
  result: string;
  sources?: any[];
}

export const sendToRAG = async (request: RAGRequest): Promise<RAGResponse> => {
  const response = await fetch('/api/rag-query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
    credentials: 'include',
  });
  if (!response.ok) {
    let errorMsg = `RAG API error: ${response.status}`;
    try {
      const errJson = await response.json() as { errors?: { message?: string }[] };
      errorMsg = errJson.errors?.[0]?.message || errorMsg;
    } catch {}
    throw new Error(errorMsg);
  }
  return response.json();
};

export async function uploadPDF(profile: string, file: File) {
  const formData = new FormData();
  formData.append("profile", profile);
  formData.append("file", file);
  const res = await fetch("/api/upload-pdf", {
    method: "POST",
    body: formData,
    credentials: "include",
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
} 