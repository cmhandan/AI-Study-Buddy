export interface User {
  id: string;
  name: string;
  email: string;
  status: 'user' | 'admin';
  created_at: string;
}

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

export interface Question {
  question: string;
  options: string[];
  correctAnswerIndex: number;
}

export interface Quiz {
  id: string;
  title: string;
  questions: Question[];
  createdAt: string;
}

export interface QuizResult {
  id?: string;
  quizId: string;
  score: number;
  totalQuestions: number;
  date: string;
  docTitle?: string;
}

export interface StudyDocument {
  id: string;
  docId: string;
  title: string;
  content: string;
  summary?: string;
  uploadDate: string;
  quizzes: Quiz[];
}

export interface UserState {
  documents: StudyDocument[];
  quizResults: QuizResult[];
}

export enum LoadingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}