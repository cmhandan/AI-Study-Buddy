import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { StudyDocument, QuizResult, Quiz } from '../types';
import { getUserDocuments, saveUserDocument, deleteUserDocument as apiDeleteDocument, updateDocumentSummary as apiUpdateSummary, getUserQuizResults, saveQuizResult, getDashboardStats, DashboardStats, UserDocument } from '../services/geminiService';

interface AppContextType {
  documents: StudyDocument[];
  quizResults: QuizResult[];
  dashboardStats: DashboardStats | null;
  isLoading: boolean;
  addDocument: (doc: StudyDocument) => Promise<void>;
  addQuizResult: (result: { docId: string; docTitle: string; score: number; totalQuestions: number }) => Promise<void>;
  getDocument: (id: string) => StudyDocument | undefined;
  updateDocumentSummary: (id: string, summary: string) => Promise<void>;
  addQuizToDocument: (docId: string, quiz: Quiz) => void;
  deleteDocument: (id: string) => Promise<void>;
  refreshDashboard: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const [documents, setDocuments] = useState<StudyDocument[]>([]);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const [docs, quizzes, stats] = await Promise.all([
        getUserDocuments(token),
        getUserQuizResults(token),
        getDashboardStats(token)
      ]);

      const mappedDocs: StudyDocument[] = docs.map((d: UserDocument) => ({
        id: d.id,
        docId: d.doc_id,
        title: d.title,
        content: d.content,
        uploadDate: d.created_at,
        summary: d.summary || undefined,
        quizzes: []
      }));

      setDocuments(mappedDocs);
      
      const mappedQuizzes: QuizResult[] = quizzes.map((q: any) => ({
        id: q.id,
        quizId: q.id,
        score: q.score,
        totalQuestions: q.total_questions,
        date: q.created_at,
        docTitle: q.doc_title
      }));
      setQuizResults(mappedQuizzes);
      
      setDashboardStats(stats);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchData();
    } else if (!isAuthenticated) {
      setDocuments([]);
      setQuizResults([]);
      setDashboardStats(null);
      setIsLoading(false);
    }
  }, [token, isAuthenticated]);

  const addDocument = async (doc: StudyDocument) => {
    if (!token) return;
    
    await saveUserDocument(token, {
      title: doc.title,
      content: doc.content,
      docId: doc.docId,
      summary: doc.summary
    });
    
    await fetchData();
  };

  const addQuizResult = async (result: { docId: string; docTitle: string; score: number; totalQuestions: number }) => {
    if (!token) return;
    
    await saveQuizResult(token, result);
    
    const stats = await getDashboardStats(token);
    setDashboardStats(stats);
    
    const quizzes = await getUserQuizResults(token);
    const mappedQuizzes: QuizResult[] = quizzes.map((q: any) => ({
      id: q.id,
      quizId: q.id,
      score: q.score,
      totalQuestions: q.total_questions,
      date: q.created_at
    }));
    setQuizResults(mappedQuizzes);
  };

  const getDocument = (id: string) => documents.find(d => d.id === id);

  const updateDocumentSummary = async (id: string, summary: string) => {
    if (!token) return;
    
    await apiUpdateSummary(token, id, summary);
    
    setDocuments(prev => prev.map(d => d.id === id ? { ...d, summary } : d));
  };

  const addQuizToDocument = (docId: string, quiz: Quiz) => {
    setDocuments(prev => prev.map(d => {
      if (d.id === docId) {
        return { ...d, quizzes: [...d.quizzes, quiz] };
      }
      return d;
    }));
  };

  const deleteDocument = async (id: string) => {
    if (!token) return;
    
    await apiDeleteDocument(token, id);
    
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  const refreshDashboard = async () => {
    await fetchData();
  };

  return (
    <AppContext.Provider value={{ 
      documents, 
      quizResults,
      dashboardStats,
      isLoading,
      addDocument, 
      addQuizResult, 
      getDocument,
      updateDocumentSummary,
      addQuizToDocument,
      deleteDocument,
      refreshDashboard
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};