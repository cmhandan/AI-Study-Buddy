import { Question } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001/api';

const authHeaders = (token: string) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
});

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

export const verifyToken = async (token: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/verify`, {
      headers: authHeaders(token),
    });
    return response.ok;
  } catch {
    return false;
  }
};

// ── Admin ─────────────────────────────────────────────────────────────────────
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  status: 'user' | 'admin';
  account_status?: 'active' | 'inactive';
  created_at: string;
  documents?: any[];
  quiz_results?: any[];
  recent_activity?: any[];
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

export const adminToggleUserStatus = async (token: string, userId: string, status: 'active' | 'inactive'): Promise<void> => {
  const r = await fetch(`${API_BASE_URL}/admin/users/${userId}/status`, {
    method: 'PUT', headers: adminHeaders(token),
    body: JSON.stringify({ account_status: status }),
  });
  if (!r.ok) { const e = await r.json().catch(() => ({ detail: r.statusText })); throw new Error(e.detail); }
};

export const adminGetUserDetails = async (token: string, userId: string): Promise<any> => {
  const r = await fetch(`${API_BASE_URL}/admin/users/${userId}/details`, {
    headers: adminHeaders(token),
  });
  if (!r.ok) { const e = await r.json().catch(() => ({ detail: r.statusText })); throw new Error(e.detail); }
  return r.json();
};
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Uploads a file to the backend for text extraction and vector indexing.
 */
export const uploadFile = async (file: File, token?: string): Promise<{ title: string; content: string; docId: string }> => {
  const formData = new FormData();
  formData.append('file', file);

  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      headers,
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
 * @param text - The document content to summarize
 * @param length - Summary length: "short", "medium", or "long"
 * @param docTitle - Optional document title for context
 */
export const generateSummary = async (text: string, length: 'short' | 'medium' | 'long' = 'medium', docTitle: string = ''): Promise<string> => {
  try {
    const response = await fetch(`${API_BASE_URL}/summary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, length, doc_title: docTitle }),
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

// ── User Documents ─────────────────────────────────────────────────────────
export interface UserDocument {
  id: string;
  user_id: string;
  title: string;
  content: string;
  doc_id: string;
  summary: string | null;
  created_at: string;
}

export const getUserDocuments = async (token: string): Promise<UserDocument[]> => {
  const response = await fetch(`${API_BASE_URL}/documents`, {
    headers: authHeaders(token),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(err.detail || 'Failed to fetch documents');
  }
  return response.json();
};

export const saveUserDocument = async (token: string, doc: { title: string; content: string; docId: string; summary?: string }): Promise<UserDocument> => {
  const response = await fetch(`${API_BASE_URL}/documents`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(doc),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(err.detail || 'Failed to save document');
  }
  return response.json();
};

export const deleteUserDocument = async (token: string, docId: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/documents/${docId}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(err.detail || 'Failed to delete document');
  }
};

export const updateDocumentSummary = async (token: string, docId: string, summary: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/documents/${docId}/summary`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify({ text: summary }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(err.detail || 'Failed to update summary');
  }
};

// ── Quiz Results ───────────────────────────────────────────────────────────
export interface QuizResult {
  id: string;
  user_id: string;
  doc_id: string;
  doc_title: string;
  score: number;
  total_questions: number;
  created_at: string;
}

export const getUserQuizResults = async (token: string): Promise<QuizResult[]> => {
  const response = await fetch(`${API_BASE_URL}/quiz-results`, {
    headers: authHeaders(token),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(err.detail || 'Failed to fetch quiz results');
  }
  return response.json();
};

export const saveQuizResult = async (token: string, result: { docId: string; docTitle: string; score: number; totalQuestions: number }): Promise<QuizResult> => {
  const response = await fetch(`${API_BASE_URL}/quiz-results`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(result),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(err.detail || 'Failed to save quiz result');
  }
  return response.json();
};

// ── Study Sessions ─────────────────────────────────────────────────────────
export interface StudySession {
  id: string;
  user_id: string;
  duration_minutes: number;
  created_at: string;
}

export const getUserStudySessions = async (token: string): Promise<StudySession[]> => {
  const response = await fetch(`${API_BASE_URL}/study-sessions`, {
    headers: authHeaders(token),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(err.detail || 'Failed to fetch study sessions');
  }
  return response.json();
};

export const saveStudySession = async (token: string, durationMinutes: number): Promise<StudySession> => {
  const response = await fetch(`${API_BASE_URL}/study-sessions`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ durationMinutes }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(err.detail || 'Failed to save study session');
  }
  return response.json();
};

// ── Dashboard Stats ───────────────────────────────────────────────────────
export interface DashboardStats {
  documentCount: number;
  quizCount: number;
  averageScore: number;
  studyHours: number;
  recentQuizzes: QuizResult[];
  recentDocuments: { id: string; title: string; created_at: string }[];
}

export const getDashboardStats = async (token: string): Promise<DashboardStats> => {
  const response = await fetch(`${API_BASE_URL}/dashboard-stats`, {
    headers: authHeaders(token),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(err.detail || 'Failed to fetch dashboard stats');
  }
  return response.json();
};