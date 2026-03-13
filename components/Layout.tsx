import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FileText, BarChart2, PlusCircle, GraduationCap, Menu, X, LogOut, UserCircle, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { user, logout, isAdmin } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;
  const linkClass = (path: string) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive(path)
      ? 'bg-blue-600 text-white'
      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }`;

  const NavLinks = () => (
    <>
      <Link to="/" className={linkClass('/')} onClick={() => setIsMobileMenuOpen(false)}>
        <BarChart2 className="w-5 h-5" />
        <span>Dashboard</span>
      </Link>
      <Link to="/upload" className={linkClass('/upload')} onClick={() => setIsMobileMenuOpen(false)}>
        <PlusCircle className="w-5 h-5" />
        <span>Upload Material</span>
      </Link>
      <div className="pt-4 pb-2 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
        Library
      </div>
      <Link to="/documents" className={linkClass('/documents')} onClick={() => setIsMobileMenuOpen(false)}>
        <FileText className="w-5 h-5" />
        <span>My Documents</span>
      </Link>
      {isAdmin && (
        <>
          <div className="pt-4 pb-2 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Admin
          </div>
          <Link to="/admin/users" className={linkClass('/admin/users')} onClick={() => setIsMobileMenuOpen(false)}>
            <Users className="w-5 h-5" />
            <span>User Management</span>
          </Link>
        </>
      )}
    </>
  );

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100 overflow-hidden font-sans">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full bg-slate-950 border-b border-slate-800 z-40 flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-blue-500" />
          <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            StudyBuddy
          </h1>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-shrink-0 border-r border-slate-800 bg-slate-950 flex-col">
        <div className="p-6 flex items-center gap-2 border-b border-slate-800">
          <GraduationCap className="w-8 h-8 text-blue-500" />
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            StudyBuddy
          </h1>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <NavLinks />
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-3">
          {user && (
            <div className="flex items-center gap-3 px-2 py-1">
              <div className="bg-blue-600/30 border border-blue-500/40 rounded-full p-1.5 flex-shrink-0">
                <UserCircle className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-slate-200 truncate">{user.name}</p>
                  {isAdmin && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-purple-500/20 border border-purple-500/30 text-purple-300 font-semibold flex-shrink-0">Admin</span>
                  )}
                </div>
                <p className="text-xs text-slate-500 truncate">{user.email}</p>
              </div>
            </div>
          )}
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors text-sm"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <div className={`fixed inset-y-0 left-0 w-64 bg-slate-950 z-50 transform transition-transform duration-300 ease-in-out md:hidden flex flex-col border-r border-slate-800 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
        <div className="p-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-blue-500" />
            <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Menu
            </h1>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <NavLinks />
        </nav>
        <div className="p-4 border-t border-slate-800 space-y-3">
          {user && (
            <div className="flex items-center gap-3 px-2 py-1">
              <div className="bg-blue-600/30 border border-blue-500/40 rounded-full p-1.5 flex-shrink-0">
                <UserCircle className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-slate-200 truncate">{user.name}</p>
                  {isAdmin && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-purple-500/20 border border-purple-500/30 text-purple-300 font-semibold flex-shrink-0">Admin</span>
                  )}
                </div>
                <p className="text-xs text-slate-500 truncate">{user.email}</p>
              </div>
            </div>
          )}
          <button
            onClick={() => { logout(); setIsMobileMenuOpen(false); }}
            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors text-sm"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-slate-900 relative w-full pt-16 md:pt-0">
        {children}
      </main>
    </div>
  );
};

export default Layout;