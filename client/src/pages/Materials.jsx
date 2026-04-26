import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Materials() {
  const navigate = useNavigate();
  const [materials, setMaterials] = useState([]);
  const [subject, setSubject]     = useState('');
  const [topic, setTopic]         = useState('');
  const [title, setTitle]         = useState('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading]     = useState(true);
  const [generatingMaterialId, setGeneratingMaterialId] = useState(null);

  const formatFileSize = (bytes) => {
    if (typeof bytes !== 'number') return '0.00 MB';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  const fetchMaterials = async () => {
    try {
      const res = await api.get('/materials');
      setMaterials(res.data);
    } catch {
      toast.error('Failed to load materials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMaterials(); }, []);

  const onDrop = async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;
    if (!subject || !title) {
      toast.error('Please fill in Subject and Title before uploading!');
      return;
    }
    const file = acceptedFiles[0];
    const formData = new FormData();
    formData.append('file', file);
    formData.append('subject', subject);
    formData.append('topic', topic);
    formData.append('title', title);

    setUploading(true);
    const uploadToast = toast.loading('Uploading material...');
    try {
      await api.post('/materials/upload', formData);
      toast.success('Material uploaded successfully!', { id: uploadToast });
      setSubject(''); setTopic(''); setTitle('');
      fetchMaterials();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed', { id: uploadToast });
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.jpeg', '.jpg', '.png'],
      'text/plain': ['.txt'],
    },
  });

  const handleGenerate = async (id) => {
    if (generatingMaterialId) return;
    setGeneratingMaterialId(id);
    const genToast = toast.loading('Gemini is generating flashcards…');
    try {
      await api.post(`/flashcards/generate/${id}`, {});
      toast.success('Flashcards Generated Successfully! 🧠', { id: genToast });
      await fetchMaterials();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate flashcards', { id: genToast });
    } finally {
      setGeneratingMaterialId(null);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/materials/${id}`);
      toast.success('Material deleted');
      fetchMaterials();
    } catch {
      toast.error('Failed to delete material');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8 max-w-5xl mx-auto">
        <Toaster position="top-right" toastOptions={{ style: { background: 'var(--surface)', backdropFilter: 'blur(12px)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: '14px' } }} />
        <LoadingSpinner message="Loading materials..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 max-w-5xl mx-auto">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--surface)',
            backdropFilter: 'blur(12px)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            borderRadius: '14px',
            boxShadow: 'var(--card-shadow)',
          },
        }}
      />

      <h1 className="text-4xl font-heading font-bold mb-8" style={{ color: 'var(--text-primary)' }}>
        Study Materials
      </h1>

      {/* ── Upload Section ─────────────────────────────────────── */}
      <div className="glass-card p-6 mb-12">
        <h2 className="text-xl font-heading font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          Upload New Material
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[
            { placeholder: 'Subject (e.g. Biology)', value: subject, set: setSubject },
            { placeholder: 'Title (e.g. Chapter 4)',  value: title,   set: setTitle   },
            { placeholder: 'Topic (Optional)',         value: topic,   set: setTopic   },
          ].map(({ placeholder, value, set }) => (
            <input
              key={placeholder}
              placeholder={placeholder}
              value={value}
              onChange={e => set(e.target.value)}
              style={{
                background: 'var(--input-bg)',
                border: '1px solid var(--border)',
                color: 'var(--input-text)',
                borderRadius: '12px',
                padding: '10px 16px',
                outline: 'none',
                width: '100%',
                fontSize: '0.9rem',
              }}
              onFocus={e  => (e.target.style.borderColor = 'var(--border-focus)')}
              onBlur={e   => (e.target.style.borderColor = 'var(--border)')}
            />
          ))}
        </div>

        <div
          {...getRootProps()}
          style={{
            border: `2px dashed ${isDragActive ? '#8b5cf6' : 'var(--border)'}`,
            background: isDragActive ? 'rgba(139,92,246,0.08)' : 'var(--input-bg)',
            borderRadius: '14px',
            padding: '48px 20px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <input {...getInputProps()} disabled={uploading} />
          {isDragActive ? (
            <p style={{ color: '#8b5cf6', fontSize: '1.1rem' }}>Drop the files here …</p>
          ) : (
            <div>
              <p style={{ color: 'var(--text-primary)', fontSize: '1rem', marginBottom: '6px' }}>
                Drag &amp; drop some files here, or click to select files
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                Supports PDF, JPG, PNG, TXT (Max 8000 tokens for Gemini)
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Materials Grid ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {materials.map(mat => (
          <div key={mat._id} className="glass-card p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-2">
                <span
                  className="text-xs uppercase tracking-widest font-semibold"
                  style={{ color: '#8b5cf6' }}
                >
                  {mat.subject}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {new Date(mat.createdAt).toLocaleDateString()}
                </span>
              </div>

              <h3
                className="text-xl font-bold font-heading mb-1"
                style={{ color: 'var(--text-primary)' }}
              >
                {mat.title}
              </h3>

              {mat.topic && (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                  {mat.topic}
                </p>
              )}

              <div className="flex gap-2 text-xs mb-6">
                {[mat.fileType?.toUpperCase(), formatFileSize(mat.fileSize)].map(label => (
                  <span
                    key={label}
                    style={{
                      padding: '3px 10px',
                      background: 'var(--badge-bg)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      color: 'var(--text-secondary)',
                      fontWeight: 500,
                    }}
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>

            <div
              className="flex justify-between items-center mt-4 pt-4"
              style={{ borderTop: '1px solid var(--border)' }}
            >
              <div>
                {mat.flashcardsGenerated ? (
                  <div className="flex items-center gap-3 flex-wrap">
                    <span
                      className="text-sm flex items-center gap-1"
                      style={{ color: '#14b8a6', fontWeight: 500 }}
                    >
                      ✅ Flashcards Ready
                    </span>
                    <button
                      onClick={() => navigate('/flashcards')}
                      style={{
                        border: '1px solid rgba(20,184,166,0.35)',
                        background: 'rgba(20,184,166,0.15)',
                        color: '#5eead4',
                        borderRadius: '10px',
                        padding: '7px 12px',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Go to Flashcards
                    </button>
                  </div>
                ) : generatingMaterialId === mat._id ? (
                  <span
                    className="text-sm"
                    style={{ color: 'var(--text-secondary)', fontWeight: 500 }}
                  >
                    Generating flashcards...
                  </span>
                ) : (
                  <button
                    onClick={() => handleGenerate(mat._id)}
                    className="btn-gemini"
                    disabled={!!generatingMaterialId}
                  >
                    Generate with Gemini
                  </button>
                )}
              </div>

              <button
                onClick={() => handleDelete(mat._id)}
                className="btn-danger"
              >
                🗑 Delete
              </button>
            </div>
          </div>
        ))}

        {materials.length === 0 && (
          <p
            className="col-span-full text-center py-12"
            style={{ color: 'var(--text-muted)' }}
          >
            No materials uploaded yet.
          </p>
        )}
      </div>
    </div>
  );
}
