import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast, { Toaster } from 'react-hot-toast';
import { Search, Trash2, FileText } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function AdminMaterials() {
  const [materials, setMaterials] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchMaterials = async () => {
    try {
      const res = await api.get('/admin/materials');
      setMaterials(res.data);
    } catch (err) {
      toast.error('Failed to load materials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}" and its flashcards?`)) return;
    try {
      await api.delete(`/admin/materials/${id}`);
      toast.success('Material deleted');
      fetchMaterials();
    } catch (err) {
      toast.error('Failed to delete material');
    }
  };

  const formatFileSize = (bytes) => {
    if (typeof bytes !== 'number') return '0 KB';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  const filteredMaterials = materials.filter(m =>
    m.title.toLowerCase().includes(search.toLowerCase()) ||
    m.subject.toLowerCase().includes(search.toLowerCase()) ||
    (m.userId?.name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      <Toaster position="top-right" toastOptions={{ style: { background: 'var(--surface)', backdropFilter: 'blur(10px)', color: 'var(--text-primary)', border: '1px solid var(--border)' } }} />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-heading font-black text-th-text">Materials Overview</h1>
          <p className="text-th-muted mt-1">{materials.length} materials across the platform</p>
        </div>

        <div className="relative w-full sm:w-80">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-th-muted" />
          <input
            type="text"
            placeholder="Search by title, subject, or owner..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input"
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading materials..." fullPage={false} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMaterials.map(mat => (
            <div key={mat._id} className="glass-card p-5 flex flex-col justify-between hover:-translate-y-0.5 transition-all">
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText size={16} className="text-primary" />
                    </div>
                    <span className="text-xs uppercase tracking-widest text-secondary font-semibold">{mat.subject}</span>
                  </div>
                  <span className="text-xs text-th-muted">{new Date(mat.createdAt).toLocaleDateString()}</span>
                </div>

                <h3 className="text-lg font-bold font-heading mb-1 text-th-text">{mat.title}</h3>
                {mat.topic && <p className="text-sm text-th-muted mb-3">{mat.topic}</p>}

                <div className="flex flex-wrap gap-2 text-xs mb-3">
                  <span className="px-2 py-1 bg-th-surface/5 rounded-md border border-th-border/10 text-th-muted">{mat.fileType.toUpperCase()}</span>
                  <span className="px-2 py-1 bg-th-surface/5 rounded-md border border-th-border/10 text-th-muted">{formatFileSize(mat.fileSize)}</span>
                  {mat.flashcardsGenerated && (
                    <span className="px-2 py-1 bg-secondary/10 rounded-md border border-secondary/20 text-secondary">✓ Generated</span>
                  )}
                </div>

                <p className="text-xs text-th-muted">
                  Uploaded by: <span className="font-medium text-th-text">{mat.userId?.name || 'Unknown'}</span>
                  <span className="ml-1 opacity-60">({mat.userId?.email})</span>
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-th-border/10 flex justify-end">
                <button
                  onClick={() => handleDelete(mat._id, mat.title)}
                  className="btn btn-danger btn-sm"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          ))}
          {filteredMaterials.length === 0 && (
            <p className="text-th-muted col-span-full text-center py-8">
              {search ? 'No materials match your search.' : 'No materials on the platform yet.'}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
