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
  quizId: string;
  score: number;
  totalQuestions: number;
  date: string;
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