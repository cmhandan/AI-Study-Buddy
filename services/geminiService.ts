import { Question } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001/api';

// ── Auth ─────────────────────────────────────────────────────────────────────
export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: {
    id: string;
    name: string;
    email: string;
    created_at: string;
  };
}

export const authRegister = async (name: string, email: string, password: string): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(err.detail || 'Registration failed');
  }
  return response.json();
};

export const authLogin = async (email: string, password: string): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(err.detail || 'Login failed');
  }
  return response.json();
};
// ─────────────────────────────────────────────────────────────────────────────

// ── Admin ─────────────────────────────────────────────────────────────────────
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  status: 'user' | 'admin';
  created_at: string;
}

const adminHeaders = (token: string) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
});

export const adminListUsers = async (token: string): Promise<AdminUser[]> => {
  const r = await fetch(`${API_BASE_URL}/admin/users`, { headers: adminHeaders(token) });
  if (!r.ok) { const e = await r.json().catch(() => ({ detail: r.statusText })); throw new Error(e.detail); }
  return r.json();
};

export const adminDeleteUser = async (token: string, userId: string): Promise<void> => {
  const r = await fetch(`${API_BASE_URL}/admin/users/${userId}`, { method: 'DELETE', headers: adminHeaders(token) });
  if (!r.ok) { const e = await r.json().catch(() => ({ detail: r.statusText })); throw new Error(e.detail); }
};

export const adminChangePassword = async (token: string, userId: string, newPassword: string): Promise<void> => {
  const r = await fetch(`${API_BASE_URL}/admin/users/${userId}/password`, {
    method: 'PUT', headers: adminHeaders(token),
    body: JSON.stringify({ new_password: newPassword }),
  });
  if (!r.ok) { const e = await r.json().catch(() => ({ detail: r.statusText })); throw new Error(e.detail); }
};

export const adminChangeRole = async (token: string, userId: string, status: 'user' | 'admin'): Promise<void> => {
  const r = await fetch(`${API_BASE_URL}/admin/users/${userId}/role`, {
    method: 'PUT', headers: adminHeaders(token),
    body: JSON.stringify({ status }),
  });
  if (!r.ok) { const e = await r.json().catch(() => ({ detail: r.statusText })); throw new Error(e.detail); }
};
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Uploads a file to the backend for text extraction and vector indexing.
 */
export const uploadFile = async (file: File): Promise<{ title: string; content: string; docId: string }> => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: response.statusText }));
      throw new Error(err.detail || 'Failed to upload file');
    }

    return response.json();
  } catch (error: any) {
    console.error("Upload Error:", error);
    // Customize error for common connection refused (backend down) scenario
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
      throw new Error("Connection failed. Is the Python backend running on port 8000?");
    }
    throw error;
  }
};

/**
 * Generates a summary for the provided text content via Backend.
 */
export const generateSummary = async (text: string): Promise<string> => {
  try {
    const response = await fetch(`${API_BASE_URL}/summary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: response.statusText }));
      throw new Error(err.detail || 'Failed to generate summary');
    }
    const data = await response.json();
    return data.summary;
  } catch (error: any) {
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
      throw new Error("Connection failed. Is the Python backend running on port 8000?");
    }
    throw error;
  }
};

/**
 * Generates a quiz based on the provided text content via Backend.
 */
export const generateQuiz = async (text: string, numQuestions: number = 5): Promise<Question[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/quiz`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, num_questions: numQuestions }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: response.statusText }));
      throw new Error(err.detail || 'Failed to generate quiz');
    }
    return response.json();
  } catch (error: any) {
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
      throw new Error("Connection failed. Is the Python backend running on port 8000?");
    }
    throw error;
  }
};

/**
 * Sends a chat message to the backend using docId for RAG.
 */
export const sendChatMessage = async (
  message: string,
  history: { role: 'user' | 'model'; text: string }[],
  docId: string
): Promise<string> => {
  try {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        history,
        docId
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: response.statusText }));
      throw new Error(err.detail || 'Failed to get chat response');
    }
    const data = await response.json();
    return data.text;
  } catch (error: any) {
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
      throw new Error("Connection failed. Is the Python backend running on port 8000?");
    }
    throw error;
  }
};