import React, { useEffect, useState, useCallback } from 'react';
import {
  Users, Trash2, KeyRound, ShieldCheck, ShieldOff,
  AlertCircle, Loader, Search, RefreshCw, X, Eye, EyeOff, CheckCircle,
  FileText, Brain, ChevronLeft, ChevronRight, Activity,
  Mail, Calendar, Clock, FileDown,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  adminListUsers, adminDeleteUser, adminChangePassword, adminChangeRole,
  adminGetUserDetails, AdminUser,
} from '../services/geminiService';

const ITEMS_PER_PAGE = 10;

interface AdminLog {
  action: string;
  timestamp: string;
  details: string;
}

const RoleBadge: React.FC<{ status: 'user' | 'admin' }> = ({ status }) =>
  status === 'admin' ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-500/20 border border-purple-300 dark:border-purple-500/40 text-purple-700 dark:text-purple-300 text-xs font-semibold">
      <ShieldCheck className="w-3 h-3" /> Admin
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-600/60 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-xs font-semibold">
      <ShieldOff className="w-3 h-3" /> User
    </span>
  );

interface DeleteModalProps {
  user: AdminUser;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}
const DeleteModal: React.FC<DeleteModalProps> = ({ user, onConfirm, onCancel, isLoading }) => (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-red-100 dark:bg-red-500/20 border border-red-300 dark:border-red-500/30 rounded-full p-2">
          <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Delete User</h3>
      </div>
      <div className="flex items-center gap-3 p-3 mb-4 bg-red-50 dark:bg-red-500/10 rounded-xl border border-red-200 dark:border-red-500/20">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-slate-900 dark:text-white">{user.name}</p>
          <p className="text-sm text-slate-500 dark:text-slate-500">{user.email}</p>
        </div>
      </div>
      <p className="text-slate-700 dark:text-slate-300 text-sm mb-2">
        Are you sure you want to permanently delete this account?
      </p>
      <p className="text-red-600 dark:text-red-400 text-xs mb-6 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg p-3">
        Warning: This will also delete all associated documents, quizzes, and study data. This action cannot be undone.
      </p>
      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-sm font-medium">
          Cancel
        </button>
        <button onClick={onConfirm} disabled={isLoading} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white transition-colors text-sm font-semibold">
          {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          Delete Account
        </button>
      </div>
    </div>
  </div>
);

interface PasswordModalProps {
  user: AdminUser;
  onConfirm: (pwd: string) => void;
  onCancel: () => void;
  isLoading: boolean;
}
const PasswordModal: React.FC<PasswordModalProps> = ({ user, onConfirm, onCancel, isLoading }) => {
  const [pwd, setPwd] = useState('');
  const [show, setShow] = useState(false);
  const [err, setErr] = useState('');
  const generateTempPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPwd(result);
    setErr('');
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pwd.length < 6) { setErr('Password must be at least 6 characters.'); return; }
    setErr('');
    onConfirm(pwd);
  };
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-amber-100 dark:bg-amber-500/20 border border-amber-300 dark:border-amber-500/30 rounded-full p-2">
              <KeyRound className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Reset Password</h3>
          </div>
          <button onClick={onCancel} className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-5">
          Set a new password for <span className="text-slate-900 dark:text-white font-medium">{user.name}</span>
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="relative">
              <input
                type={show ? 'text' : 'password'}
                value={pwd}
                onChange={e => setPwd(e.target.value)}
                placeholder="Enter new password (min. 6 chars)"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg px-4 pr-12 py-3 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
              />
              <button type="button" onClick={() => setShow(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {err && <p className="text-red-600 dark:text-red-400 text-xs mt-1">{err}</p>}
          </div>
          <button type="button" onClick={generateTempPassword} className="w-full text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
            Generate Strong Password
          </button>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onCancel} className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-sm font-medium">
              Cancel
            </button>
            <button type="submit" disabled={isLoading} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white transition-colors text-sm font-semibold">
              {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface UserDetailModalProps {
  user: AdminUser;
  onClose: () => void;
}
const UserDetailModal: React.FC<UserDetailModalProps> = ({ user, onClose }) => {
  const { token } = useAuth();
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const data = await adminGetUserDetails(token, user.id);
        setDetails(data);
      } catch (e: any) {
        setError(e.message || 'Failed to load user details');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [token, user.id]);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{user.name}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-500">{user.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : error ? (
            <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-red-600 dark:text-red-400 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {error}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs mb-2">
                    <Mail className="w-4 h-4" /> Email
                  </div>
                  <p className="text-slate-900 dark:text-white font-medium">{user.email}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs mb-2">
                    <Calendar className="w-4 h-4" /> Joined
                  </div>
                  <p className="text-slate-900 dark:text-white font-medium">
                    {new Date(user.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs mb-2">
                    <ShieldCheck className="w-4 h-4" /> Role
                  </div>
                  <RoleBadge status={user.status} />
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Documents
                </h4>
                <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4">
                  {(details as any)?.documents?.length > 0 ? (
                    <div className="space-y-2">
                      {(details as any).documents.map((doc: any, i: number) => (
                        <div key={i} className="flex items-center justify-between p-2 bg-white dark:bg-slate-800 rounded-lg">
                          <span className="text-sm text-slate-700 dark:text-slate-300 truncate">{doc.title}</span>
                          <span className="text-xs text-slate-500">{new Date(doc.created_at).toLocaleDateString()}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 dark:text-slate-500 text-center py-4">No documents uploaded</p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <Brain className="w-4 h-4" /> Quiz Results
                </h4>
                <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4">
                  {(details as any)?.quiz_results?.length > 0 ? (
                    <div className="space-y-2">
                      {(details as any).quiz_results.map((quiz: any, i: number) => (
                        <div key={i} className="flex items-center justify-between p-2 bg-white dark:bg-slate-800 rounded-lg">
                          <span className="text-sm text-slate-700 dark:text-slate-300 truncate">
                            {Math.round((quiz.score / quiz.total_questions) * 100)}%
                          </span>
                          <span className="text-xs text-slate-500">{quiz.score}/{quiz.total_questions} correct</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 dark:text-slate-500 text-center py-4">No quizzes taken</p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Recent Activity
                </h4>
                <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4">
                  {(details as any)?.recent_activity?.length > 0 ? (
                    <div className="space-y-2">
                      {(details as any).recent_activity.map((activity: any, i: number) => (
                        <div key={i} className="flex items-center gap-3 p-2 text-sm">
                          <div className="w-2 h-2 rounded-full bg-blue-500" />
                          <span className="text-slate-700 dark:text-slate-300 flex-1">{activity.action}</span>
                          <span className="text-slate-500">{new Date(activity.timestamp).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 dark:text-slate-500 text-center py-4">No recent activity</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const UserManagement: React.FC = () => {
  const { token, user: currentUser } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [filtered, setFiltered] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all');
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [pwdTarget, setPwdTarget] = useState<AdminUser | null>(null);
  const [detailTarget, setDetailTarget] = useState<AdminUser | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [adminLogs, setAdminLogs] = useState<AdminLog[]>([]);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const logAction = (action: string, details: string) => {
    setAdminLogs(prev => [{
      action,
      timestamp: new Date().toISOString(),
      details,
    }, ...prev.slice(0, 9)]);
  };

  const fetchUsers = useCallback(async () => {
    if (!token) return;
    setIsLoadingList(true);
    setListError(null);
    try {
      const data = await adminListUsers(token);
      setUsers(data);
    } catch (e: any) {
      setListError(e.message || 'Failed to load users.');
    } finally {
      setIsLoadingList(false);
    }
  }, [token]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  useEffect(() => {
    let result = users;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    }
    if (roleFilter !== 'all') result = result.filter(u => u.status === roleFilter);
    setFiltered(result);
    setCurrentPage(1);
  }, [search, roleFilter, users]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedUsers = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleDelete = async () => {
    if (!deleteTarget || !token) return;
    setActionLoading(true);
    try {
      await adminDeleteUser(token, deleteTarget.id);
      setUsers(prev => prev.filter(u => u.id !== deleteTarget.id));
      logAction('DELETE_USER', `Deleted user: ${deleteTarget.name} (${deleteTarget.email})`);
      showToast(`${deleteTarget.name} has been deleted.`);
    } catch (e: any) {
      showToast(e.message || 'Delete failed.', 'error');
    } finally {
      setActionLoading(false);
      setDeleteTarget(null);
    }
  };

  const handlePasswordChange = async (newPwd: string) => {
    if (!pwdTarget || !token) return;
    setActionLoading(true);
    try {
      await adminChangePassword(token, pwdTarget.id, newPwd);
      logAction('RESET_PASSWORD', `Reset password for: ${pwdTarget.name}`);
      showToast(`Password updated for ${pwdTarget.name}.`);
    } catch (e: any) {
      showToast(e.message || 'Password change failed.', 'error');
    } finally {
      setActionLoading(false);
      setPwdTarget(null);
    }
  };

  const handleRoleToggle = async (target: AdminUser) => {
    if (!token) return;
    const newRole = target.status === 'admin' ? 'user' : 'admin';
    try {
      await adminChangeRole(token, target.id, newRole);
      setUsers(prev => prev.map(u => u.id === target.id ? { ...u, status: newRole } : u));
      logAction('CHANGE_ROLE', `Changed role of ${target.name} from ${target.status} to ${newRole}`);
      showToast(`${target.name} is now ${newRole === 'admin' ? 'an Admin' : 'a User'}.`);
    } catch (e: any) {
      showToast(e.message || 'Role change failed.', 'error');
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Name', 'Email', 'Role', 'Created'];
    const rows = filtered.map(u => [u.id, u.name, u.email, u.status, u.created_at]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    logAction('EXPORT_USERS', `Exported ${filtered.length} users to CSV`);
    showToast('User list exported successfully.');
  };

  const stats = {
    total: users.length,
    admins: users.filter(u => u.status === 'admin').length,
    regularUsers: users.filter(u => u.status === 'user').length,
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-purple-100 dark:bg-purple-600/20 border border-purple-300 dark:border-purple-500/30 rounded-xl p-2.5">
            <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">User Management</h2>
        </div>
        <p className="text-slate-500 dark:text-slate-400">Manage all registered users — change roles, reset passwords, or remove accounts.</p>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Users', value: stats.total, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20' },
          { label: 'Admins', value: stats.admins, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/20' },
          { label: 'Students', value: stats.regularUsers, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border p-4 ${s.bg}`}>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{isLoadingList ? '—' : s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value as any)}
          className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Roles</option>
          <option value="admin">Admins</option>
          <option value="user">Users</option>
        </select>
        <button onClick={fetchUsers} className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-sm">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
        <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors text-sm font-medium">
          <FileDown className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
        {isLoadingList ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-500">
            <Loader className="w-8 h-8 animate-spin text-blue-500" />
            <p className="text-sm">Loading users…</p>
          </div>
        ) : listError ? (
          <div className="flex items-center gap-3 p-6 m-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-red-600 dark:text-red-400 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" /> {listError}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-2">
            <Users className="w-10 h-10 opacity-40" />
            <p className="text-sm">{search ? 'No users match your search.' : 'No users found.'}</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase">User</th>
                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase">Role</th>
                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase hidden md:table-cell">Joined</th>
                    <th className="text-right px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700/60">
                  {paginatedUsers.map(u => {
                    const isSelf = u.id === currentUser?.id;
                    return (
                      <tr key={u.id} className={`hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors ${isSelf ? 'bg-blue-50/50 dark:bg-blue-500/5' : ''}`}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow">
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-slate-900 dark:text-slate-100 font-medium truncate">
                                {u.name}
                                {isSelf && <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">(you)</span>}
                              </p>
                              <p className="text-slate-500 dark:text-slate-500 text-xs truncate">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4"><RoleBadge status={u.status} /></td>
                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400 hidden md:table-cell">
                          {new Date(u.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-1.5 flex-wrap">
                            <button onClick={() => setDetailTarget(u)} title="View Details" className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-400 transition-colors">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => !isSelf && handleRoleToggle(u)}
                              disabled={isSelf}
                              title={isSelf ? 'Cannot change your own role' : u.status === 'admin' ? 'Demote to User' : 'Promote to Admin'}
                              className={`p-2 rounded-lg text-xs font-medium transition-colors ${isSelf ? 'opacity-30 cursor-not-allowed bg-slate-200 dark:bg-slate-700 text-slate-400' : u.status === 'admin' ? 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-400' : 'bg-purple-100 dark:bg-purple-600/20 hover:bg-purple-200 dark:hover:bg-purple-600/40 text-purple-600 dark:text-purple-400'}`}
                            >
                              {u.status === 'admin' ? <ShieldOff className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                            </button>
                            <button onClick={() => setPwdTarget(u)} title="Reset Password" className="p-2 rounded-lg bg-amber-50 dark:bg-amber-500/10 hover:bg-amber-100 dark:hover:bg-amber-500/25 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 transition-colors">
                              <KeyRound className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => !isSelf && setDeleteTarget(u)}
                              disabled={isSelf}
                              title={isSelf ? 'Cannot delete yourself' : 'Delete User'}
                              className={`p-2 rounded-lg border transition-colors ${isSelf ? 'opacity-30 cursor-not-allowed bg-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-400' : 'bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/25 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20'}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-700">
                <p className="text-sm text-slate-500 dark:text-slate-500">
                  Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-slate-300 dark:border-slate-600 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let page = i + 1;
                    if (totalPages > 5) {
                      if (currentPage > 3) page = currentPage - 2 + i;
                      if (currentPage > totalPages - 2) page = totalPages - 4 + i;
                    }
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${currentPage === page ? 'bg-blue-600 text-white' : 'border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-slate-300 dark:border-slate-600 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {adminLogs.length > 0 && (
        <div className="mt-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4" /> Recent Admin Actions
          </h4>
          <div className="space-y-2 text-xs text-slate-500 dark:text-slate-500">
            {adminLogs.map((log, i) => (
              <div key={i} className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-900 rounded-lg">
                <span className="font-medium text-slate-700 dark:text-slate-300">{log.action}</span>
                <span>-</span>
                <span className="flex-1">{log.details}</span>
                <span>{new Date(log.timestamp).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {deleteTarget && <DeleteModal user={deleteTarget} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} isLoading={actionLoading} />}
      {pwdTarget && <PasswordModal user={pwdTarget} onConfirm={handlePasswordChange} onCancel={() => setPwdTarget(null)} isLoading={actionLoading} />}
      {detailTarget && <UserDetailModal user={detailTarget} onClose={() => setDetailTarget(null)} />}

      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl border text-sm font-medium transition-all ${toast.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/90 border-emerald-200 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-200' : 'bg-red-50 dark:bg-red-900/90 border-red-200 dark:border-red-500/40 text-red-700 dark:text-red-200'}`}>
          {toast.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-500 dark:text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-red-500 dark:text-red-400" />}
          {toast.msg}
        </div>
      )}
    </div>
  );
};

export default UserManagement;
