import React, { useEffect, useState, useCallback } from 'react';
import {
  Users, Trash2, KeyRound, ShieldCheck, ShieldOff,
  AlertCircle, Loader, Search, RefreshCw, X, Eye, EyeOff, CheckCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  adminListUsers, adminDeleteUser, adminChangePassword, adminChangeRole,
  AdminUser,
} from '../services/geminiService';

// ── Small reusable badge ──────────────────────────────────────────────────────
const RoleBadge: React.FC<{ status: 'user' | 'admin' }> = ({ status }) =>
  status === 'admin' ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-semibold">
      <ShieldCheck className="w-3 h-3" /> Admin
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-600/60 border border-slate-600 text-slate-300 text-xs font-semibold">
      <ShieldOff className="w-3 h-3" /> User
    </span>
  );

// ── Confirm-delete modal ─────────────────────────────────────────────────────
interface DeleteModalProps {
  user: AdminUser;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}
const DeleteModal: React.FC<DeleteModalProps> = ({ user, onConfirm, onCancel, isLoading }) => (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-red-500/20 border border-red-500/30 rounded-full p-2">
          <Trash2 className="w-5 h-5 text-red-400" />
        </div>
        <h3 className="text-lg font-semibold text-white">Delete User</h3>
      </div>
      <p className="text-slate-300 text-sm mb-1">
        Are you sure you want to delete <span className="font-semibold text-white">{user.name}</span>?
      </p>
      <p className="text-slate-500 text-xs mb-6">{user.email}</p>
      <p className="text-red-400 text-xs mb-6 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
        This action is irreversible. The user's account will be permanently removed.
      </p>
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2.5 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-700 transition-colors text-sm"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white transition-colors text-sm font-semibold"
        >
          {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          Delete
        </button>
      </div>
    </div>
  </div>
);

// ── Change-password modal ─────────────────────────────────────────────────────
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pwd.length < 6) { setErr('Password must be at least 6 characters.'); return; }
    setErr('');
    onConfirm(pwd);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-amber-500/20 border border-amber-500/30 rounded-full p-2">
              <KeyRound className="w-5 h-5 text-amber-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Change Password</h3>
          </div>
          <button onClick={onCancel} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-slate-400 text-sm mb-5">
          Set a new password for <span className="text-white font-medium">{user.name}</span>
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type={show ? 'text' : 'password'}
              value={pwd}
              onChange={e => setPwd(e.target.value)}
              placeholder="New password (min. 6 chars)"
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 pr-12 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
            />
            <button
              type="button"
              onClick={() => setShow(s => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
            >
              {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {err && <p className="text-red-400 text-xs">{err}</p>}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-700 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white transition-colors text-sm font-semibold"
            >
              {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const UserManagement: React.FC = () => {
  const { token, user: currentUser } = useAuth();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [filtered, setFiltered] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState('');
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [pwdTarget, setPwdTarget] = useState<AdminUser | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchUsers = useCallback(async () => {
    if (!token) return;
    setIsLoadingList(true);
    setListError(null);
    try {
      const data = await adminListUsers(token);
      setUsers(data);
      setFiltered(data);
    } catch (e: any) {
      setListError(e.message || 'Failed to load users.');
    } finally {
      setIsLoadingList(false);
    }
  }, [token]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      q ? users.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)) : users
    );
  }, [search, users]);

  const handleDelete = async () => {
    if (!deleteTarget || !token) return;
    setActionLoading(true);
    try {
      await adminDeleteUser(token, deleteTarget.id);
      setUsers(prev => prev.filter(u => u.id !== deleteTarget.id));
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
      showToast(`${target.name} is now ${newRole === 'admin' ? 'an Admin' : 'a User'}.`);
    } catch (e: any) {
      showToast(e.message || 'Role change failed.', 'error');
    }
  };

  const stats = {
    total: users.length,
    admins: users.filter(u => u.status === 'admin').length,
    regularUsers: users.filter(u => u.status === 'user').length,
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-purple-600/20 border border-purple-500/30 rounded-xl p-2.5">
            <Users className="w-6 h-6 text-purple-400" />
          </div>
          <h2 className="text-3xl font-bold text-white">User Management</h2>
        </div>
        <p className="text-slate-400">Manage all registered users — change roles, reset passwords, or remove accounts.</p>
      </header>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Users', value: stats.total, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
          { label: 'Admins', value: stats.admins, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
          { label: 'Regular Users', value: stats.regularUsers, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border p-5 ${s.bg}`}>
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">{s.label}</p>
            <p className={`text-3xl font-bold ${s.color}`}>{isLoadingList ? '—' : s.value}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
        <button
          onClick={fetchUsers}
          title="Refresh"
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors text-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Table area */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
        {isLoadingList ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-500">
            <Loader className="w-8 h-8 animate-spin text-blue-500" />
            <p className="text-sm">Loading users…</p>
          </div>
        ) : listError ? (
          <div className="flex items-center gap-3 p-6 m-4 bg-red-500/10 border border-red-500/20 rounded-xl">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-400 text-sm">{listError}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-2">
            <Users className="w-10 h-10 opacity-40" />
            <p className="text-sm">{search ? 'No users match your search.' : 'No users found.'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-900/50">
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">User</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Role</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden md:table-cell">Joined</th>
                  <th className="text-right px-6 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60">
                {filtered.map(u => {
                  const isSelf = u.id === currentUser?.id;
                  return (
                    <tr key={u.id} className={`hover:bg-slate-700/30 transition-colors ${isSelf ? 'bg-blue-500/5' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500/30 to-indigo-500/30 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                            <span className="text-blue-300 font-semibold text-xs">
                              {u.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-slate-100 font-medium truncate">
                              {u.name}
                              {isSelf && <span className="ml-2 text-xs text-blue-400">(you)</span>}
                            </p>
                            <p className="text-slate-500 text-xs truncate">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <RoleBadge status={u.status} />
                      </td>
                      <td className="px-6 py-4 text-slate-400 hidden md:table-cell">
                        {new Date(u.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {/* Toggle role */}
                          <button
                            onClick={() => !isSelf && handleRoleToggle(u)}
                            disabled={isSelf}
                            title={isSelf ? 'Cannot change your own role' : u.status === 'admin' ? 'Demote to User' : 'Promote to Admin'}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                              isSelf
                                ? 'opacity-30 cursor-not-allowed bg-slate-700 text-slate-400'
                                : u.status === 'admin'
                                ? 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                                : 'bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/30'
                            }`}
                          >
                            {u.status === 'admin' ? (
                              <><ShieldOff className="w-3.5 h-3.5" /> Demote</>
                            ) : (
                              <><ShieldCheck className="w-3.5 h-3.5" /> Promote</>
                            )}
                          </button>

                          {/* Change password */}
                          <button
                            onClick={() => setPwdTarget(u)}
                            title="Change password"
                            className="p-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/25 text-amber-400 border border-amber-500/20 transition-colors"
                          >
                            <KeyRound className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => !isSelf && setDeleteTarget(u)}
                            disabled={isSelf}
                            title={isSelf ? 'Cannot delete your own account' : 'Delete user'}
                            className={`p-2 rounded-lg border transition-colors ${
                              isSelf
                                ? 'opacity-30 cursor-not-allowed bg-slate-700 border-slate-600 text-slate-400'
                                : 'bg-red-500/10 hover:bg-red-500/25 text-red-400 border-red-500/20'
                            }`}
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
        )}
      </div>

      {/* Modals */}
      {deleteTarget && (
        <DeleteModal
          user={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          isLoading={actionLoading}
        />
      )}
      {pwdTarget && (
        <PasswordModal
          user={pwdTarget}
          onConfirm={handlePasswordChange}
          onCancel={() => setPwdTarget(null)}
          isLoading={actionLoading}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl border text-sm font-medium transition-all ${
          toast.type === 'success'
            ? 'bg-emerald-900/90 border-emerald-500/40 text-emerald-200'
            : 'bg-red-900/90 border-red-500/40 text-red-200'
        }`}>
          {toast.type === 'success'
            ? <CheckCircle className="w-4 h-4 text-emerald-400" />
            : <AlertCircle className="w-4 h-4 text-red-400" />}
          {toast.msg}
        </div>
      )}
    </div>
  );
};

export default UserManagement;
