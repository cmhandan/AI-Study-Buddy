import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { generateSummary, generateQuiz, sendChatMessage } from '../services/geminiService';
import { Quiz, LoadingState } from '../types';
import { MessageSquare, FileText, CheckSquare, Send, Loader, BrainCircuit, RefreshCw, ChevronLeft } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import ReactMarkdown from 'react-markdown';

const StudySession: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getDocument, updateDocumentSummary, addQuizToDocument, addQuizResult } = useApp();
  const doc = id ? getDocument(id) : undefined;
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'summary' | 'chat' | 'quiz'>('summary');

  const [summaryState, setSummaryState] = useState<LoadingState>(LoadingState.IDLE);

  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'model', text: string }[]>([]);
  const [inputMsg, setInputMsg] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [quizState, setQuizState] = useState<LoadingState>(LoadingState.IDLE);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  useEffect(() => {
    if (!doc) {
      navigate('/documents');
    }
  }, [doc, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, activeTab]);
  const handleGenerateSummary = async () => {
    if (!doc) return;
    setSummaryState(LoadingState.LOADING);
    try {
      const summary = await generateSummary(doc.content);
      updateDocumentSummary(doc.id, summary);
      setSummaryState(LoadingState.SUCCESS);
    } catch (e) {
      setSummaryState(LoadingState.ERROR);
    }
  };

  // --- Chat Logic ---
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim() || !doc) return;

    const userText = inputMsg;
    setInputMsg('');
    const newHistory = [...chatMessages, { role: 'user' as const, text: userText }];
    setChatMessages(newHistory);
    setIsChatLoading(true);

    try {
      const responseText = await sendChatMessage(userText, newHistory, doc.docId);
      setChatMessages(prev => [...prev, { role: 'model', text: responseText }]);
    } catch (error) {
      console.error(error);
      setChatMessages(prev => [...prev, { role: 'model', text: "Sorry, I encountered an error. The document might have expired from memory. Please re-upload." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleGenerateQuiz = async () => {
    if (!doc) return;
    setQuizState(LoadingState.LOADING);
    setQuizSubmitted(false);
    setUserAnswers([]);

    try {
      const questions = await generateQuiz(doc.content);
      const newQuiz: Quiz = {
        id: uuidv4(),
        title: `Quiz on ${doc.title}`,
        questions,
        createdAt: new Date().toISOString()
      };
      addQuizToDocument(doc.id, newQuiz);
      setCurrentQuiz(newQuiz);
      setQuizState(LoadingState.SUCCESS);
      setUserAnswers(new Array(questions.length).fill(-1));
    } catch (e) {
      console.error(e);
      setQuizState(LoadingState.ERROR);
    }
  };

  const handleAnswerSelect = (qIndex: number, optionIndex: number) => {
    if (quizSubmitted) return;
    const newAnswers = [...userAnswers];
    newAnswers[qIndex] = optionIndex;
    setUserAnswers(newAnswers);
  };

  const submitQuiz = () => {
    if (!currentQuiz) return;
    setQuizSubmitted(true);
    let score = 0;
    currentQuiz.questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctAnswerIndex) score++;
    });

    addQuizResult({
      quizId: currentQuiz.id,
      score,
      totalQuestions: currentQuiz.questions.length,
      date: new Date().toISOString()
    });
  };

  if (!doc) return null;

  return (
    <div className="flex flex-col h-[100dvh] bg-slate-900 text-slate-100">
      <header className="flex-shrink-0 h-16 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-3 md:px-6">
        <div className="flex items-center gap-2 md:gap-4 overflow-hidden">
          <button onClick={() => navigate('/documents')} className="text-slate-400 hover:text-white flex-shrink-0">
            <ChevronLeft className="w-6 h-6 md:hidden" />
            <span className="hidden md:inline">Back</span>
          </button>
          <div className="h-6 w-px bg-slate-800 hidden md:block"></div>
          <h2 className="font-semibold text-base md:text-lg text-white truncate max-w-[120px] md:max-w-md">{doc.title}</h2>
        </div>

        <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800 flex-shrink-0">
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-3 md:px-4 py-1.5 rounded-md text-xs md:text-sm font-medium transition-colors flex items-center gap-1 md:gap-2 ${activeTab === 'summary' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
            title="Summary"
          >
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Summary</span>
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-3 md:px-4 py-1.5 rounded-md text-xs md:text-sm font-medium transition-colors flex items-center gap-1 md:gap-2 ${activeTab === 'chat' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
            title="Chat"
          >
            <MessageSquare className="w-4 h-4" />
            <span className="hidden sm:inline">Chat</span>
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            className={`px-3 md:px-4 py-1.5 rounded-md text-xs md:text-sm font-medium transition-colors flex items-center gap-1 md:gap-2 ${activeTab === 'quiz' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
            title="Quiz"
          >
            <CheckSquare className="w-4 h-4" />
            <span className="hidden sm:inline">Quiz</span>
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-hidden flex flex-col md:flex-row relative">

        <div className="hidden md:block w-1/3 border-r border-slate-800 bg-slate-900 p-6 overflow-y-auto custom-scrollbar">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Source Material</h3>
          <div className="prose prose-invert prose-sm max-w-none text-slate-300 font-light leading-relaxed whitespace-pre-wrap">
            {doc.content}
          </div>
        </div>

        <div className="flex-1 bg-slate-900 flex flex-col overflow-hidden w-full">

          {activeTab === 'summary' && (
            <div className="flex-1 overflow-y-auto p-4 md:p-8">
              <div className="max-w-3xl mx-auto w-full">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <h2 className="text-xl md:text-2xl font-bold text-white">Document Summary</h2>
                  <button
                    onClick={handleGenerateSummary}
                    disabled={summaryState === LoadingState.LOADING}
                    className="flex items-center justify-center gap-2 text-sm bg-indigo-600 hover:bg-indigo-500 px-3 py-2 rounded-lg transition-colors w-full sm:w-auto"
                  >
                    {summaryState === LoadingState.LOADING ? <Loader className="animate-spin w-4 h-4" /> : <BrainCircuit className="w-4 h-4" />}
                    {doc.summary ? 'Regenerate' : 'Generate Summary'}
                  </button>
                </div>

                {summaryState === LoadingState.LOADING && (
                  <div className="space-y-4 animate-pulse">
                    <div className="h-4 bg-slate-800 rounded w-3/4"></div>
                    <div className="h-4 bg-slate-800 rounded w-full"></div>
                    <div className="h-4 bg-slate-800 rounded w-5/6"></div>
                  </div>
                )}

                {doc.summary && summaryState !== LoadingState.LOADING ? (
                  <div className="bg-slate-800/50 p-4 md:p-6 rounded-xl border border-slate-700">
                    <div className="prose prose-invert prose-lg text-slate-300 break-words">
                      <ReactMarkdown>{doc.summary}</ReactMarkdown>
                    </div>
                  </div>
                ) : (
                  summaryState !== LoadingState.LOADING && (
                    <div className="text-center py-20 text-slate-500">
                      <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No summary generated yet. Click the button above to analyze the document.</p>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {activeTab === 'chat' && (
            <div className="flex flex-col h-full w-full">
              <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
                {chatMessages.length === 0 && (
                  <div className="text-center py-20 text-slate-500">
                    <BrainCircuit className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Ask me anything about "{doc.title}".</p>
                  </div>
                )}
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] md:max-w-[80%] rounded-2xl px-4 py-3 text-sm break-words ${msg.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 text-slate-200 border border-slate-700'
                      }`}>
                      <ReactMarkdown className="prose prose-invert prose-sm max-w-none">{msg.text}</ReactMarkdown>
                    </div>
                  </div>
                ))}
                {isChatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-800 rounded-2xl px-4 py-3 border border-slate-700 flex items-center gap-2">
                      <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></span>
                      <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-100"></span>
                      <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-200"></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-3 md:p-4 bg-slate-950 border-t border-slate-800 flex-shrink-0">
                <form onSubmit={handleSendMessage} className="flex gap-2 max-w-3xl mx-auto w-full">
                  <input
                    type="text"
                    value={inputMsg}
                    onChange={(e) => setInputMsg(e.target.value)}
                    placeholder="Ask a question..."
                    className="flex-1 bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                    disabled={isChatLoading}
                  />
                  <button
                    type="submit"
                    disabled={isChatLoading || !inputMsg.trim()}
                    className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-colors flex-shrink-0"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* --- QUIZ TAB --- */}
          {activeTab === 'quiz' && (
            <div className="flex-1 overflow-y-auto p-4 md:p-8">
              <div className="max-w-3xl mx-auto w-full">
                {quizState === LoadingState.IDLE && !currentQuiz && (
                  <div className="text-center py-20">
                    <CheckSquare className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Test Your Knowledge</h3>
                    <p className="text-slate-400 mb-8">Generate a custom quiz based on this document.</p>
                    <button
                      onClick={handleGenerateQuiz}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center gap-2 w-full sm:w-auto justify-center"
                    >
                      <BrainCircuit className="w-5 h-5" />
                      Generate Quiz
                    </button>
                  </div>
                )}

                {quizState === LoadingState.LOADING && (
                  <div className="flex flex-col items-center justify-center py-20">
                    <Loader className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
                    <p className="text-slate-300">Generating questions...</p>
                  </div>
                )}

                {currentQuiz && (
                  <div className="space-y-8 pb-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                      <h3 className="text-xl font-bold text-white max-w-full break-words">{currentQuiz.title}</h3>
                      {!quizSubmitted ? (
                        <button
                          onClick={submitQuiz}
                          disabled={userAnswers.includes(-1)}
                          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium w-full sm:w-auto"
                        >
                          Submit Answers
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setCurrentQuiz(null);
                            setQuizState(LoadingState.IDLE);
                          }}
                          className="flex items-center gap-2 text-slate-400 hover:text-white"
                        >
                          <RefreshCw className="w-4 h-4" /> Try Another
                        </button>
                      )}
                    </div>

                    {quizSubmitted && (
                      <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 mb-6 flex items-center justify-between">
                        <div>
                          <p className="text-slate-400 text-sm">Your Score</p>
                          <p className="text-3xl font-bold text-white">
                            {userAnswers.filter((a, i) => a === currentQuiz.questions[i].correctAnswerIndex).length}
                            <span className="text-lg text-slate-500 font-normal"> / {currentQuiz.questions.length}</span>
                          </p>
                        </div>
                        <div className="text-right">
                          {(() => {
                            const score = userAnswers.filter((a, i) => a === currentQuiz.questions[i].correctAnswerIndex).length;
                            const pct = (score / currentQuiz.questions.length) * 100;
                            if (pct === 100) return <span className="text-emerald-400 font-bold">Perfect!</span>;
                            if (pct >= 70) return <span className="text-blue-400 font-bold">Great Job!</span>;
                            return <span className="text-amber-400 font-bold">Keep Studying</span>;
                          })()}
                        </div>
                      </div>
                    )}

                    {currentQuiz.questions.map((q, qIdx) => (
                      <div key={qIdx} className="bg-slate-800/50 p-4 md:p-6 rounded-xl border border-slate-700">
                        <p className="text-base md:text-lg font-medium text-white mb-4 flex gap-2">
                          <span className="text-slate-500 flex-shrink-0">{qIdx + 1}.</span>
                          <span className="break-words">{q.question}</span>
                        </p>
                        <div className="space-y-2">
                          {q.options.map((opt, oIdx) => {
                            let buttonStyle = "border-slate-700 hover:bg-slate-700 text-slate-300";

                            if (quizSubmitted) {
                              if (oIdx === q.correctAnswerIndex) {
                                buttonStyle = "bg-emerald-500/20 border-emerald-500 text-emerald-400";
                              } else if (userAnswers[qIdx] === oIdx && oIdx !== q.correctAnswerIndex) {
                                buttonStyle = "bg-red-500/20 border-red-500 text-red-400";
                              } else {
                                buttonStyle = "border-slate-800 opacity-50";
                              }
                            } else if (userAnswers[qIdx] === oIdx) {
                              buttonStyle = "bg-blue-600 border-blue-600 text-white";
                            }

                            return (
                              <button
                                key={oIdx}
                                onClick={() => handleAnswerSelect(qIdx, oIdx)}
                                disabled={quizSubmitted}
                                className={`w-full text-left p-3 rounded-lg border transition-all flex items-start justify-between gap-3 ${buttonStyle}`}
                              >
                                <span className="break-words text-sm md:text-base">{opt}</span>
                                {quizSubmitted && oIdx === q.correctAnswerIndex && <CheckSquare className="w-4 h-4 flex-shrink-0 mt-1" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default StudySession;