import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { StudyDocument, QuizResult, Quiz } from '../types';

interface AppContextType {
  documents: StudyDocument[];
  quizResults: QuizResult[];
  addDocument: (doc: StudyDocument) => void;
  addQuizResult: (result: QuizResult) => void;
  getDocument: (id: string) => StudyDocument | undefined;
  updateDocumentSummary: (id: string, summary: string) => void;
  addQuizToDocument: (docId: string, quiz: Quiz) => void;
  deleteDocument: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Initial mock data
const INITIAL_DOCS: StudyDocument[] = [
  {
    id: '1',
    docId: 'mock-doc-id', // Added mock docId
    title: 'Introduction to Mitosis',
    content: `Mitosis is a part of the cell cycle when replicated chromosomes are separated into two new nuclei. Cell division gives rise to genetically identical cells in which the number of chromosomes is maintained. In general, mitosis (division of the nucleus) is preceded by the S stage of interphase (during which the DNA is replicated) and is often followed by telophase and cytokinesis; which divides the cytoplasm, organelles and cell membrane of one cell into two new cells containing roughly equal shares of these cellular components.`,
    uploadDate: new Date().toISOString(),
    quizzes: []
  }
];

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [documents, setDocuments] = useState<StudyDocument[]>(INITIAL_DOCS);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);

  // Load from local storage on mount (simulated persistence)
  useEffect(() => {
    const savedDocs = localStorage.getItem('studyBuddy_docs');
    const savedResults = localStorage.getItem('studyBuddy_results');
    if (savedDocs) setDocuments(JSON.parse(savedDocs));
    if (savedResults) setQuizResults(JSON.parse(savedResults));
  }, []);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem('studyBuddy_docs', JSON.stringify(documents));
    localStorage.setItem('studyBuddy_results', JSON.stringify(quizResults));
  }, [documents, quizResults]);

  const addDocument = (doc: StudyDocument) => {
    setDocuments(prev => [doc, ...prev]);
  };

  const deleteDocument = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  const addQuizResult = (result: QuizResult) => {
    setQuizResults(prev => [...prev, result]);
  };

  const getDocument = (id: string) => documents.find(d => d.id === id);

  const updateDocumentSummary = (id: string, summary: string) => {
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

  return (
    <AppContext.Provider value={{ 
      documents, 
      quizResults, 
      addDocument, 
      addQuizResult, 
      getDocument,
      updateDocumentSummary,
      addQuizToDocument,
      deleteDocument
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