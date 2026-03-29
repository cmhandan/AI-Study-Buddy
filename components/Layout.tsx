import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FileText, Menu, X, LogOut, UserCircle, Sun, Moon, Upload, Brain, Clock, Bookmark, Edit2, ChevronDown, Search, RefreshCw, HelpCircle, MessageCircle, Bell, ChevronUp, Sparkles, Download, Copy, Loader, FileDown, Home, Users, Shield } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import Logo from '../logo.png';

interface LayoutProps {
  children: React.ReactNode;
}

const USER_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert', 'Tutor'];

const FAQ_ITEMS = [
  { q: 'How do I upload a document?', a: 'Click the Upload button in the sidebar or go to Upload page. We support PDF, DOCX, and TXT files.' },
  { q: 'How are summaries generated?', a: 'Our AI analyzes your document and extracts key points, important terms, and main takeaways.' },
  { q: 'Can I retake quizzes?', a: 'Yes! Click "Try Another" after completing a quiz to generate a new set of questions.' },
  { q: 'How do I export my summaries?', a: 'Use the export button in any document view to download as PDF or Word format.' },
  { q: 'Is my data secure?', a: 'Yes, all documents are encrypted and stored securely. Only you can access your materials.' },
];

const BADGES = [
  { id: 'first_doc', name: 'First Upload', icon: '📄', desc: 'Upload your first document' },
  { id: 'first_quiz', name: 'Quiz Starter', icon: '🧠', desc: 'Complete your first quiz' },
  { id: 'study_streak', name: 'Study Streak', icon: '🔥', desc: 'Study for 3 days in a row' },
  { id: 'summary_master', name: 'Summary Master', icon: '📝', desc: 'Generate 5 summaries' },
  { id: 'high_scorer', name: 'High Scorer', icon: '⭐', desc: 'Score 90%+ on a quiz' },
  { id: 'active_learner', name: 'Active Learner', icon: '🎯', desc: 'Complete 10 quizzes' },
];

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAdmin, token } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { quizResults, documents } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isFAQOpen, setIsFAQOpen] = useState(false);
  const [isToolsOpen, setIsToolsOpen] = useState(true);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [isParaphraseModalOpen, setIsParaphraseModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [paraphraseInput, setParaphraseInput] = useState('');
  const [paraphrasedText, setParaphrasedText] = useState('');
  const [isParaphrasing, setIsParaphrasing] = useState(false);
  const [selectedDocForExport, setSelectedDocForExport] = useState<string>('');
  const [editName, setEditName] = useState(user?.name || '');
  const [editLevel, setEditLevel] = useState('Intermediate');

  const isDashboard = location.pathname === '/dashboard';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSaveProfile = () => {
    const storedUser = localStorage.getItem('studyBuddy_user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      userData.name = editName;
      localStorage.setItem('studyBuddy_user', JSON.stringify(userData));
      window.location.reload();
    }
    setIsProfileModalOpen(false);
  };

  const simpleParaphrase = (text: string): string => {
    const wordReplacements: [string, string][] = [
      ['the', 'a'], ['a', 'an'], ['an', 'the'],
      ['is', 'was'], ['is', 'are'], ['are', 'was'],
      ['and', 'plus'], ['plus', 'along with'],
      ['but', 'however'], ['however', 'yet'],
      ['very', 'extremely'], ['extremely', 'really'],
      ['important', 'significant'], ['significant', 'crucial'],
      ['good', 'excellent'], ['excellent', 'great'],
      ['bad', 'poor'], ['poor', 'unfavorable'],
      ['big', 'large'], ['large', 'huge'],
      ['small', 'tiny'], ['tiny', 'minor'],
      ['help', 'assist'], ['assist', 'support'],
      ['think', 'believe'], ['believe', 'consider'],
      ['want', 'need'], ['need', 'desire'],
      ['use', 'utilize'], ['utilize', 'apply'],
      ['find', 'discover'], ['discover', 'locate'],
      ['give', 'provide'], ['provide', 'offer'],
      ['tell', 'inform'], ['inform', 'notify'],
      ['ask', 'inquire'], ['inquire', 'question'],
      ['work', 'function'], ['function', 'operate'],
      ['seem', 'appear'], ['appear', 'look'],
      ['feel', 'sense'], ['sense', 'perceive'],
      ['try', 'attempt'], ['attempt', 'endeavor'],
      ['leave', 'depart'], ['depart', 'exit'],
      ['call', 'contact'], ['contact', 'reach'],
      ['make', 'create'], ['create', 'build'],
      ['know', 'understand'], ['understand', 'comprehend'],
      ['see', 'observe'], ['observe', 'notice'],
      ['get', 'obtain'], ['obtain', 'acquire'],
      ['go', 'move'], ['move', 'travel'],
      ['come', 'arrive'], ['arrive', 'reach'],
      ['show', 'demonstrate'], ['demonstrate', 'illustrate'],
      ['take', 'grab'], ['grab', 'hold'],
      ['need', 'require'], ['require', 'demand'],
      ['begin', 'start'], ['start', 'commence'],
      ['end', 'finish'], ['finish', 'complete'],
      ['keep', 'maintain'], ['maintain', 'preserve'],
      ['put', 'place'], ['place', 'position'],
      ['let', 'allow'], ['allow', 'permit'],
      ['become', 'turn into'], ['turn into', 'transform into'],
      ['have', 'possess'], ['possess', 'own'],
      ['do', 'perform'], ['perform', 'execute'],
      ['say', 'state'], ['state', 'mention'],
      ['got', 'obtained'], ['obtained', 'acquired'],
      ['like', 'enjoy'], ['enjoy', 'appreciate'],
      ['time', 'moment'], ['moment', 'period'],
      ['way', 'method'], ['method', 'approach'],
      ['thing', 'item'], ['item', 'object'],
      ['people', 'individuals'], ['individuals', 'persons'],
      ['world', 'universe'], ['universe', 'cosmos'],
    ];

    let words = text.split(/(\s+)/);
    const lowerWords = words.map(w => w.toLowerCase());
    let changed = false;

    for (let i = 0; i < lowerWords.length; i++) {
      const word = lowerWords[i];
      for (const [from, to] of wordReplacements) {
        if (word === from) {
          words[i] = to;
          changed = true;
          break;
        }
      }
    }

    return changed ? words.join('') : `Here is your paraphrased text:\n\n${text}`;
  };

  const handleParaphrase = async () => {
    if (!paraphraseInput.trim()) return;
    setIsParaphrasing(true);
    setParaphrasedText('');
    
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001';
      const apiUrl = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;
      
      console.log('Calling paraphrase API:', `${apiUrl}/paraphrase`);
      
      const response = await fetch(`${apiUrl}/paraphrase`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ text: paraphraseInput }),
      });
      
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Paraphrase response:', data);
        if (data.paraphrased && data.paraphrased.trim() && data.paraphrased !== paraphraseInput) {
          setParaphrasedText(data.paraphrased);
        } else {
          console.log('Empty/same response, using simple paraphrase fallback');
          setParaphrasedText(simpleParaphrase(paraphraseInput));
        }
      } else {
        console.log('API error, using simple paraphrase fallback');
        setParaphrasedText(simpleParaphrase(paraphraseInput));
      }
    } catch (error) {
      console.error('Paraphrase error:', error);
      console.log('Network error, using simple paraphrase fallback');
      setParaphrasedText(simpleParaphrase(paraphraseInput));
    } finally {
      setIsParaphrasing(false);
    }
  };

  const handleCopyParaphrased = () => {
    navigator.clipboard.writeText(paraphrasedText);
  };

  const getSelectedDocument = () => {
    if (selectedDocForExport) {
      return documents.find(d => d.id === selectedDocForExport);
    }
    return documents.find(d => d.summary) || documents[0];
  };

  const generatePDF = (title: string, content: string) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - (margin * 2);
    let y = margin;

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(title, margin, y);
    y += 10;

    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    
    const lines = doc.splitTextToSize(content, maxWidth);
    
    lines.forEach((line: string) => {
      if (y + 7 > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += 7;
    });

    doc.save(`${title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
  };

  const handleExport = (format: 'pdf' | 'docx') => {
    const selectedDoc = getSelectedDocument();
    
    if (!selectedDoc) {
      alert('Please select a document first');
      return;
    }

    const content = format === 'pdf'
      ? selectedDoc.summary || selectedDoc.content || 'No content available'
      : selectedDoc.summary || selectedDoc.content || 'No content available';

    const title = selectedDoc.title || 'StudyBuddy Export';

    if (format === 'pdf') {
      generatePDF(title, content);
    } else {
      const blob = new Blob([content], { type: 'application/msword' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.replace(/[^a-zA-Z0-9]/g, '_')}.doc`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
    
    setIsExportModalOpen(false);
  };

  const recentActivities = quizResults.slice(0, 3);
  const savedSummaries = documents.filter(doc => doc.summary).slice(0, 3);
  const totalQuizzes = quizResults.length;
  const highScores = quizResults.filter(q => (q.score / q.totalQuestions) * 100 >= 90).length;
  const earnedBadges = [
    totalQuizzes > 0 ? BADGES[1] : null,
    highScores > 0 ? BADGES[4] : null,
    documents.length > 0 ? BADGES[0] : null,
    quizResults.length >= 10 ? BADGES[5] : null,
  ].filter(Boolean);

  const notifications = [
    { id: 1, text: 'New quiz available for your latest document', time: '2 min ago', unread: true },
    { id: 2, text: 'Your summary has been generated', time: '1 hour ago', unread: true },
    { id: 3, text: 'Welcome to StudyBuddy! Start by uploading a document', time: '1 day ago', unread: false },
  ];

  const filteredDocuments = documents.filter(doc =>
    doc.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.content?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className={`flex flex-col h-full ${isMobile ? 'w-80' : 'w-72'} bg-slate-50 dark:bg-slate-950 overflow-hidden`}>
      {/* Logo Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
        <div className="flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
            <img src={Logo} alt="StudyBuddy Logo" className="h-10 w-auto object-contain" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-500 to-indigo-500 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
              StudyBuddy
            </h1>
          </Link>
          {isMobile && (
            <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 text-slate-500 hover:text-slate-700">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Search Bar with Notifications */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              <Bell className="w-5 h-5" />
              {notifications.some(n => n.unread) && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-slate-900" />
              )}
            </button>
          </div>
          {showNotifications && (
            <div className="mt-2 max-h-48 overflow-y-auto bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-lg">
              {notifications.length > 0 ? (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-2 border-b border-slate-100 dark:border-slate-800 last:border-0 ${notif.unread ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                  >
                    <p className="text-xs text-slate-700 dark:text-slate-300">{notif.text}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-500 mt-0.5">{notif.time}</p>
                  </div>
                ))
              ) : (
                <div className="px-3 py-2 text-sm text-slate-500">No notifications</div>
              )}
            </div>
          )}
          {searchQuery && (
            <div className="mt-2 max-h-48 overflow-y-auto bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-lg">
              {filteredDocuments.length > 0 ? (
                filteredDocuments.slice(0, 5).map((doc) => (
                  <Link
                    key={doc.id}
                    to={`/document/${doc.id}`}
                    onClick={() => { setSearchQuery(''); setIsMobileMenuOpen(false); }}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 border-b border-slate-100 dark:border-slate-800 last:border-0"
                  >
                    <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span className="text-sm text-slate-700 dark:text-slate-300 truncate">{doc.title}</span>
                  </Link>
                ))
              ) : (
                <div className="px-3 py-2 text-sm text-slate-500">No documents found</div>
              )}
            </div>
          )}
        </div>

        {/* User Profile Section */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-3 shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="flex items-start gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-slate-50 dark:border-slate-900 flex items-center justify-center">
                  <span className="text-[8px] text-white font-bold">{editLevel.charAt(0)}</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{user?.name || 'User'}</p>
                  <button
                    onClick={() => setIsProfileModalOpen(true)}
                    className="p-1 text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                    title="Edit Profile"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-500 truncate">{user?.email || 'email@example.com'}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium">
                    {editLevel}
                  </span>
                  {isAdmin && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-medium">
                      Admin
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Tools Section */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setIsToolsOpen(!isToolsOpen)}
            className="w-full flex items-center justify-between text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 hover:text-slate-600 dark:hover:text-slate-400 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              AI Tools
            </span>
            {isToolsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {isToolsOpen && (
            <div className="space-y-2">
              <button
                onClick={() => { setIsParaphraseModalOpen(true); setIsMobileMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
              >
                <RefreshCw className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <div className="text-left">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Paraphrase Text</p>
                  <p className="text-xs text-slate-500 dark:text-slate-500">Reword any content</p>
                </div>
              </button>
              <button
                onClick={() => { setIsExportModalOpen(true); setIsMobileMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all"
              >
                <Download className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <div className="text-left">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Export / Download</p>
                  <p className="text-xs text-slate-500 dark:text-slate-500">PDF, Word formats</p>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Admin Section - Only visible to admins */}
        {isAdmin && (
          <div className="p-4 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-bold text-purple-500 dark:text-purple-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Admin
            </h3>
            <div className="space-y-2">
              <Link
                to="/admin/users"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all ${
                  location.pathname === '/admin/users'
                    ? 'bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-600'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                }`}
              >
                <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <div className="text-left flex-1">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">User Management</p>
                  <p className="text-xs text-slate-500 dark:text-slate-500">Manage all users</p>
                </div>
              </Link>
            </div>
          </div>
        )}

        {/* Quick Links Section */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Quick Links</h3>
          <div className="grid grid-cols-2 gap-2">
            <Link
              to="/upload"
              className="flex flex-col items-center gap-1.5 p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-900/60 transition-colors">
                <Upload className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-[10px] font-medium text-slate-600 dark:text-slate-400 text-center leading-tight">Upload Doc</span>
            </Link>
            <Link
              to="/documents"
              className="flex flex-col items-center gap-1.5 p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all group"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center group-hover:bg-emerald-200 dark:group-hover:bg-emerald-900/60 transition-colors">
                <Brain className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-[10px] font-medium text-slate-600 dark:text-slate-400 text-center leading-tight">Take Quiz</span>
            </Link>
            <Link
              to="/documents"
              className="flex flex-col items-center gap-1.5 p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all group"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center group-hover:bg-amber-200 dark:group-hover:bg-amber-900/60 transition-colors">
                <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <span className="text-[10px] font-medium text-slate-600 dark:text-slate-400 text-center leading-tight">Recent</span>
            </Link>
            <Link
              to="/documents"
              className="flex flex-col items-center gap-1.5 p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-rose-300 dark:hover:border-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all group"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center group-hover:bg-rose-200 dark:group-hover:bg-rose-900/60 transition-colors">
                <Bookmark className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              </div>
              <span className="text-[10px] font-medium text-slate-600 dark:text-slate-400 text-center leading-tight">Saved</span>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Recent Activity</h3>
          <div className="space-y-2">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center flex-shrink-0">
                    <Brain className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">
                      Quiz: {activity.docTitle?.slice(0, 15) || 'Untitled'}...
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-500">
                      Score: {Math.round((activity.score / activity.totalQuestions) * 100)}%
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-500 italic">No recent activity</p>
            )}
          </div>
        </div>

        {/* Saved Summaries */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Saved Summaries</h3>
          <div className="space-y-2">
            {savedSummaries.length > 0 ? (
              savedSummaries.map((doc) => (
                <Link
                  key={doc.id}
                  to={`/document/${doc.id}`}
                  className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all group"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-200 dark:group-hover:bg-indigo-900/60 transition-colors">
                    <FileText className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">
                      {doc.title?.slice(0, 18) || 'Untitled'}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-500">
                      {doc.summary ? 'Has summary' : 'No summary'}
                    </p>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-500 italic">No saved summaries</p>
            )}
          </div>
        </div>

        {/* Achievements */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Achievements</h3>
          <div className="grid grid-cols-4 gap-2">
            {BADGES.slice(0, 4).map((badge) => {
              const earned = earnedBadges.some(b => b?.id === badge.id);
              return (
                <div
                  key={badge.id}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-all ${earned ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 opacity-50'}`}
                  title={earned ? badge.desc : `Locked: ${badge.desc}`}
                >
                  <span className="text-lg">{badge.icon}</span>
                  <span className="text-[8px] text-slate-500 dark:text-slate-400 text-center leading-tight">{badge.name.split(' ')[0]}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Help & Support Section */}
        <div className="p-4">
          <button
            onClick={() => setIsHelpOpen(!isHelpOpen)}
            className="w-full flex items-center justify-between text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 hover:text-slate-600 dark:hover:text-slate-400 transition-colors"
          >
            <span className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4" />
              Help & Support
            </span>
            {isHelpOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {isHelpOpen && (
            <div className="space-y-2">
              <button
                onClick={() => setIsFAQOpen(!isFAQOpen)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">FAQ & Tips</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isFAQOpen ? 'rotate-180' : ''}`} />
              </button>
              {isFAQOpen && (
                <div className="pl-2 space-y-1 border-l-2 border-slate-200 dark:border-slate-700 ml-3">
                  {FAQ_ITEMS.map((item, idx) => (
                    <details key={idx} className="group">
                      <summary className="text-xs text-slate-600 dark:text-slate-400 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 py-1 list-none">
                        {item.q}
                      </summary>
                      <p className="text-[10px] text-slate-500 dark:text-slate-500 mt-1 pl-2">{item.a}</p>
                    </details>
                  ))}
                </div>
              )}
              <button
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
              >
                <MessageCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <div className="text-left">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Contact Support</p>
                  <p className="text-xs text-slate-500 dark:text-slate-500">Get help from our team</p>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Theme Toggle */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex-shrink-0">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-sm"
        >
          <span className="flex items-center gap-2">
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </span>
        </button>
      </div>

      {/* User Footer */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-3 flex-shrink-0">
        {user && (
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="bg-blue-600/30 dark:bg-blue-600/30 border border-blue-500/40 dark:border-blue-500/40 rounded-full p-1.5 flex-shrink-0">
              <UserCircle className="w-5 h-5 text-blue-500 dark:text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{user.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-red-500/10 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 transition-colors text-sm"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 overflow-hidden font-sans">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 z-40 flex items-center justify-between p-4">
        <Link to="/dashboard" className="flex items-center gap-2">
          <img src={Logo} alt="StudyBuddy Logo" className="h-8 w-8 object-contain" />
          <h1 className="text-lg font-bold bg-gradient-to-r from-blue-500 to-indigo-500 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
            StudyBuddy
          </h1>
        </Link>
        <div className="flex items-center gap-1">
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-72 flex-shrink-0 border-r border-slate-200 dark:border-slate-800">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <div className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out md:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
        <SidebarContent isMobile />
      </div>

      {/* Profile Edit Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md border border-slate-200 dark:border-slate-800">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Edit Profile</h2>
                <button
                  onClick={() => setIsProfileModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-5">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                    {editName.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <button className="absolute bottom-0 right-0 w-7 h-7 bg-slate-800 dark:bg-slate-700 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-md hover:bg-slate-700 dark:hover:bg-slate-600 transition-colors">
                    <Edit2 className="w-3 h-3 text-white" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Display Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  readOnly
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Learning Level</label>
                <div className="relative">
                  <select
                    value={editLevel}
                    onChange={(e) => setEditLevel(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none transition-all cursor-pointer"
                  >
                    {USER_LEVELS.map((level) => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">User ID</label>
                <div className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 font-mono text-sm">
                  {user?.id?.slice(0, 8) || 'N/A'}...
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex gap-3">
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-500 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Paraphrase Modal */}
      {isParaphraseModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-2xl border border-slate-200 dark:border-slate-800">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Paraphrase / Reword Text</h2>
                <button
                  onClick={() => { setIsParaphraseModalOpen(false); setParaphrasedText(''); setParaphraseInput(''); }}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Enter or paste text to paraphrase</label>
                <textarea
                  value={paraphraseInput}
                  onChange={(e) => setParaphraseInput(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  placeholder="Type or paste your text here to rephrase it..."
                />
              </div>
              <button
                onClick={handleParaphrase}
                disabled={!paraphraseInput.trim() || isParaphrasing}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isParaphrasing ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Paraphrasing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Paraphrase Text
                  </>
                )}
              </button>
              {paraphrasedText && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Paraphrased Result</label>
                    <button
                      onClick={handleCopyParaphrased}
                      className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                    >
                      <Copy className="w-3 h-3" />
                      Copy
                    </button>
                  </div>
                  <div className={`px-4 py-3 rounded-lg border text-sm whitespace-pre-wrap ${
                    paraphrasedText.startsWith('Error') || paraphrasedText.startsWith('Network')
                      ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}>
                    {paraphrasedText}
                  </div>
                </div>
              )}
              {!paraphrasedText && !isParaphrasing && paraphraseInput && (
                <p className="text-xs text-slate-500 dark:text-slate-500 text-center">
                  Click "Paraphrase Text" to get a reworded version of your text
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {isExportModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md border border-slate-200 dark:border-slate-800">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Export / Download</h2>
                <button
                  onClick={() => setIsExportModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Select document to export</label>
                <select
                  value={selectedDocForExport}
                  onChange={(e) => setSelectedDocForExport(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none transition-all cursor-pointer"
                >
                  <option value="">Select a document...</option>
                  {documents.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.title} {doc.summary ? '(Has Summary)' : ''}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Select format</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleExport('pdf')}
                    className="flex flex-col items-center gap-2 px-4 py-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-red-300 dark:hover:border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                  >
                    <FileDown className="w-8 h-8 text-red-600 dark:text-red-400" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">PDF Document</span>
                  </button>
                  <button
                    onClick={() => handleExport('docx')}
                    className="flex flex-col items-center gap-2 px-4 py-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                  >
                    <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Word (.doc)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Notifications Panel */}
      {showNotifications && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
            onClick={() => setShowNotifications(false)}
          />
          <div className="fixed top-20 right-4 left-4 md:hidden z-50 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden">
            <div className="p-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
              <h3 className="font-semibold text-slate-900 dark:text-white">Notifications</h3>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3 border-b border-slate-100 dark:border-slate-800 last:border-0 ${notif.unread ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                >
                  <div className="flex items-start gap-2">
                    {notif.unread && <span className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />}
                    <div>
                      <p className="text-sm text-slate-700 dark:text-slate-300">{notif.text}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">{notif.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-white dark:bg-slate-900 relative w-full pt-16 md:pt-0">
        {!isDashboard && (
          <Link
            to="/dashboard"
            className="hidden md:flex fixed top-4 left-72 z-30 ml-4 items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-300 dark:hover:border-blue-600 hover:text-blue-600 dark:hover:text-blue-400 transition-all shadow-sm"
            title="Back to Dashboard"
          >
            <Home className="w-5 h-5" />
          </Link>
        )}
        {children}
      </main>
    </div>
  );
};

export default Layout;
