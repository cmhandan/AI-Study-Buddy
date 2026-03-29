import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, FileText, AlertCircle, Loader, File as FileIcon } from 'lucide-react';
import { uploadFile } from '../services/geminiService';

const Upload: React.FC = () => {
  const { refreshDashboard } = useApp();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [manualText, setManualText] = useState('');
  const [title, setTitle] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadMode, setUploadMode] = useState<'file' | 'text'>('file');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const allowedExtensions = ['.pdf', '.docx', '.doc', '.txt'];
      const extension = '.' + file.name.split('.').pop()?.toLowerCase();
      
      if (!allowedExtensions.includes(extension)) {
        setError("Only PDF, DOCX, DOC, and TXT files are supported.");
        setSelectedFile(null);
        return;
      }
      
      setError(null);
      setSelectedFile(file);
      if (!title) {
        setTitle(file.name.split('.').slice(0, -1).join('.'));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please provide a title.");
      return;
    }

    if (uploadMode === 'text' && !manualText.trim()) {
      setError("Please enter some text content.");
      return;
    }

    if (uploadMode === 'file' && !selectedFile) {
      setError("Please select a file to upload.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      if (uploadMode === 'file' && selectedFile) {
        // Send to backend for extraction & indexing
        await uploadFile(selectedFile, token || undefined);
      } else {
        // If manual text, we need to send to backend to index it manually. 
        // Create a blob and upload it as a .txt file to reuse the logic
        const blob = new Blob([manualText], { type: 'text/plain' });
        const file = new File([blob], `${title}.txt`, { type: 'text/plain' });
        await uploadFile(file, token || undefined);
      }

      // Refresh dashboard data after upload (backend saves document automatically)
      await refreshDashboard();
      navigate('/documents');
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to process document");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Upload Material</h2>
        <p className="text-slate-500 dark:text-slate-400">Add new study material (PDF, DOCX, TXT) to your library.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">

            {/* Toggle Mode */}
            <div className="flex gap-4 mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">
              <button
                type="button"
                onClick={() => setUploadMode('file')}
                className={`flex items-center gap-2 pb-2 text-sm font-medium transition-colors relative ${uploadMode === 'file' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
              >
                <UploadCloud className="w-4 h-4" /> File Upload
                {uploadMode === 'file' && <div className="absolute bottom-[-17px] left-0 w-full h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full"></div>}
              </button>
              <button
                type="button"
                onClick={() => setUploadMode('text')}
                className={`flex items-center gap-2 pb-2 text-sm font-medium transition-colors relative ${uploadMode === 'text' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
              >
                <FileText className="w-4 h-4" /> Paste Text
                {uploadMode === 'text' && <div className="absolute bottom-[-17px] left-0 w-full h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full"></div>}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Document Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Biology Chapter 1"
                />
              </div>

              {uploadMode === 'file' ? (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Upload File</label>
                  <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-8 text-center hover:border-blue-500/50 transition-colors bg-slate-50 dark:bg-slate-900/50">
                    {selectedFile ? (
                      <div className="flex flex-col items-center">
                        <FileIcon className="w-10 h-10 text-blue-500 dark:text-blue-400 mb-2" />
                        <p className="text-slate-900 dark:text-white font-medium">{selectedFile.name}</p>
                        <p className="text-slate-500 dark:text-slate-500 text-xs mt-1">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                        <button
                          type="button"
                          onClick={() => setSelectedFile(null)}
                          className="text-red-500 dark:text-red-400 text-xs mt-3 hover:underline"
                        >
                          Remove file
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer flex flex-col items-center">
                        <UploadCloud className="w-10 h-10 text-slate-400 dark:text-slate-500 mb-2" />
                        <span className="text-slate-700 dark:text-slate-300 font-medium">Click to upload or drag and drop</span>
                        <span className="text-slate-500 dark:text-slate-500 text-xs mt-1">PDF, DOCX, DOC, or TXT</span>
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,.docx,.doc,.txt"
                          onChange={handleFileSelect}
                        />
                      </label>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Content</label>
                  <textarea
                    value={manualText}
                    onChange={(e) => setManualText(e.target.value)}
                    className="w-full h-64 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    placeholder="Paste your study notes here..."
                  />
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-400/10 p-3 rounded-lg border border-red-200 dark:border-red-400/20">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isProcessing}
                className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-all text-white ${isProcessing
                    ? 'bg-blue-400/50 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-900/20 dark:shadow-blue-900/40'
                  }`}
              >
                {isProcessing ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <FileText className="w-5 h-5" />
                    Save Document
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Tips / Info */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">How it works</h3>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <div className="bg-indigo-500/20 dark:bg-indigo-500/20 p-2 rounded-lg h-fit">
                  <UploadCloud className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                </div>
                <div>
                  <h4 className="text-slate-800 dark:text-slate-200 font-medium text-sm">1. Upload Content</h4>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Upload PDF, Word docs, or text files. We process them securely.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <div className="bg-emerald-500/20 dark:bg-emerald-500/20 p-2 rounded-lg h-fit">
                  <FileText className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-slate-800 dark:text-slate-200 font-medium text-sm">2. AI Analysis</h4>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Our backend indexes your text for smart, context-aware chatting.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <div className="bg-amber-500/20 dark:bg-amber-500/20 p-2 rounded-lg h-fit">
                  <Loader className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                </div>
                <div>
                  <h4 className="text-slate-800 dark:text-slate-200 font-medium text-sm">3. Study Tools</h4>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Automatically generate summaries, quizzes, and chat with your document.</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upload;