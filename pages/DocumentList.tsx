import React from 'react';
import { useApp } from '../context/AppContext';
import { Link } from 'react-router-dom';
import { FileText, Trash2, ArrowRight } from 'lucide-react';

const DocumentList: React.FC = () => {
  const { documents, deleteDocument } = useApp();

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-0">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">My Documents</h2>
          <p className="text-slate-400">Manage and study your uploaded materials.</p>
        </div>
        <Link
          to="/upload"
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition-colors w-full md:w-auto text-center"
        >
          Add New
        </Link>
      </header>

      {documents.length === 0 ? (
        <div className="text-center py-20 bg-slate-800/50 rounded-2xl border border-slate-700 border-dashed">
          <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-300">No documents found</h3>
          <p className="text-slate-500 mt-2 mb-6">Upload your first document to get started.</p>
          <Link
            to="/upload"
            className="text-blue-400 hover:text-blue-300 font-medium hover:underline"
          >
            Go to Upload Page
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map(doc => (
            <div key={doc.id} className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden hover:border-slate-600 transition-all group">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-blue-500/10 rounded-lg">
                    <FileText className="w-6 h-6 text-blue-400" />
                  </div>
                  <button
                    onClick={() => deleteDocument(doc.id)}
                    className="text-slate-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="text-xl font-semibold text-white mb-2 line-clamp-1">{doc.title}</h3>
                <p className="text-slate-400 text-sm line-clamp-3 mb-6 h-14">
                  {doc.content}
                </p>

                <div className="flex items-center justify-between mt-auto">
                  <span className="text-xs text-slate-500">
                    {new Date(doc.uploadDate).toLocaleDateString()}
                  </span>
                  <Link
                    to={`/document/${doc.id}`}
                    className="flex items-center gap-1 text-sm font-medium text-blue-400 group-hover:text-blue-300 transition-colors"
                  >
                    Start Studying <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentList;