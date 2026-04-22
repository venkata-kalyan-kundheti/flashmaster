import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast, { Toaster } from 'react-hot-toast';
import { Search, UserCheck, UserX, Trash2 } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggle = async (id) => {
    try {
      const res = await api.patch(`/admin/users/${id}/toggle`);
      toast.success(res.data.message);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to toggle user');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}" and ALL their data? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success('User deleted');
      fetchUsers();
    } catch (err) {
      toast.error('Failed to delete user');
    }
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      <Toaster position="top-right" toastOptions={{ style: { background: 'var(--surface)', backdropFilter: 'blur(10px)', color: 'var(--text-primary)', border: '1px solid var(--border)' } }} />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-heading font-black text-th-text">User Management</h1>
          <p className="text-th-muted mt-1">{users.length} registered students</p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-th-muted" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input"
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading users..." fullPage={false} />
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-th-surface/5 border-b border-th-border/10">
                <tr>
                  <th className="px-5 py-4 text-xs tracking-widest text-th-muted uppercase font-semibold">Student</th>
                  <th className="px-5 py-4 text-xs tracking-widest text-th-muted uppercase font-semibold hidden md:table-cell">Joined</th>
                  <th className="px-5 py-4 text-xs tracking-widest text-th-muted uppercase font-semibold text-center">Materials</th>
                  <th className="px-5 py-4 text-xs tracking-widest text-th-muted uppercase font-semibold text-center">Flashcards</th>
                  <th className="px-5 py-4 text-xs tracking-widest text-th-muted uppercase font-semibold text-center hidden lg:table-cell">Quizzes</th>
                  <th className="px-5 py-4 text-xs tracking-widest text-th-muted uppercase font-semibold text-center">Status</th>
                  <th className="px-5 py-4 text-xs tracking-widest text-th-muted uppercase font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-th-border/5">
                {filteredUsers.map(u => (
                  <tr key={u._id} className="hover:bg-th-surface/5 transition-colors">
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-semibold text-th-text">{u.name}</p>
                        <p className="text-xs text-th-muted">{u.email}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-th-muted hidden md:table-cell">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4 text-center font-medium text-th-text">{u.materialsCount}</td>
                    <td className="px-5 py-4 text-center font-medium text-th-text">{u.flashcardsCount}</td>
                    <td className="px-5 py-4 text-center font-medium text-th-text hidden lg:table-cell">{u.quizzesTaken}</td>
                    <td className="px-5 py-4 text-center">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${u.isActive
                          ? 'bg-secondary/15 text-secondary border border-secondary/30'
                          : 'bg-red-400/15 text-red-400 border border-red-400/30'
                        }`}>
                        {u.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggle(u._id)}
                          className={`btn btn-sm btn-pill ${u.isActive ? 'btn-secondary' : 'btn-primary'}`}
                          title={u.isActive ? 'Disable user' : 'Activate user'}
                        >
                          {u.isActive ? <UserX size={14} /> : <UserCheck size={14} />}
                          <span className="hidden sm:inline">{u.isActive ? 'Disable' : 'Enable'}</span>
                        </button>
                        <button
                          onClick={() => handleDelete(u._id, u.name)}
                          className="btn btn-danger btn-sm btn-pill"
                          title="Delete user"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-5 py-12 text-center text-th-muted">
                      {search ? 'No users match your search.' : 'No students registered yet.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
