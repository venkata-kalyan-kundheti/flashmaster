import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useDropzone } from 'react-dropzone';
import toast, { Toaster } from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { useNavigate } from 'react-router-dom';

export default function Materials() {
  const [materials, setMaterials] = useState([]);
  const navigate = useNavigate();
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [title, setTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  const formatFileSize = (bytes) => {
    if (typeof bytes !== 'number') return '0.00 MB';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  const fetchMaterials = async (showSpinner = false) => {
    if (showSpinner) setLoading(true);
    try {
      const res = await api.get('/materials');
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
      setSubject('');
      setTopic('');
      setTitle('');
      fetchMaterials();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed', { id: uploadToast });
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'application/pdf': ['.pdf'], 'image/*': ['.jpeg', '.jpg', '.png'], 'text/plain': ['.txt'] } });

  const handleGenerate = async (id) => {
    const genToast = toast.loading('Gemini is generating flashcards (this might take a few seconds)...');
    try {
        await api.post(`/flashcards/generate/${id}`, {});
        toast.success('Flashcards Generated Successfully! 🧠', { id: genToast });
        fetchMaterials();
    } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to generate flashcards', { id: genToast });
    }
  };

  const handleDelete = async (id) => {
    try {
        await api.delete(`/materials/${id}`);
        toast.success('Material deleted');
        fetchMaterials();
    } catch (err) {
        toast.error('Failed to delete material');
    }
  }

  return (
    <div className="min-h-screen p-4 sm:p-8 max-w-5xl mx-auto">
        <Toaster position="top-right" toastOptions={{ style: { background: 'var(--th-tooltip-bg)', backdropFilter: 'blur(10px)', color: 'rgb(var(--th-text))', border: '1px solid var(--th-card-border)' }}}/>
      <h1 className="text-4xl font-heading font-bold mb-8 text-th-text">Study Materials</h1>
      
      {/* Upload Section */}
      <div className="glass-card p-6 mb-12">
        <h2 className="text-xl font-heading font-semibold mb-4 text-th-text">Upload New Material</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <input placeholder="Subject (e.g. Biology)" value={subject} onChange={e => setSubject(e.target.value)} className="input" />
            <input placeholder="Title (e.g. Chapter 4)" value={title} onChange={e => setTitle(e.target.value)} className="input" />
            <input placeholder="Topic (Optional)" value={topic} onChange={e => setTopic(e.target.value)} className="input" />
        </div>

        <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200 
          ${isDragActive ? 'border-primary bg-primary/10' : 'border-th-border/20 hover:border-primary/50 bg-th-surface/5'}`}>
          <input {...getInputProps()} disabled={uploading} />
          {isDragActive ? (
            <p className="text-primary text-lg font-medium">Drop the files here ...</p>
          ) : (
            <div>
                <p className="text-lg mb-2 text-th-text">Drag & drop some files here, or click to select files</p>
                <p className="text-sm text-th-muted">Supports PDF, JPG, PNG, TXT (Max 8000 tokens for Gemini)</p>
            </div>
          )}
        </div>
      </div>

      {/* Materials List */}
      {loading ? (
        <LoadingSpinner message="Loading materials..." fullPage={false} />
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {materials.map(mat => (
            <div key={mat._id} className="glass-card p-6 flex flex-col justify-between hover:-translate-y-1 transition-all">
                <div>
                   <div className="flex justify-between items-start mb-2">
                       <span className="text-xs uppercase tracking-widest text-secondary font-semibold">{mat.subject}</span>
                       <span className="text-xs text-th-muted">{new Date(mat.createdAt).toLocaleDateString()}</span>
                   </div>
                   <h3 className="text-xl font-bold font-heading mb-1 text-th-text">{mat.title}</h3>
                   {mat.topic && <p className="text-sm text-th-muted mb-4">{mat.topic}</p>}
                   <div className="flex gap-2 text-xs mb-6">
                       <span className="px-2 py-1 bg-th-surface/5 rounded-md border border-th-border/10 text-th-muted">{mat.fileType.toUpperCase()}</span>
                       <span className="px-2 py-1 bg-th-surface/5 rounded-md border border-th-border/10 text-th-muted">{formatFileSize(mat.fileSize)}</span>
                   </div>
                </div>
                
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-th-border/10">
                    <div>
                        {mat.flashcardsGenerated ? (
                            <button 
                                onClick={() => navigate('/flashcards')}
                                className="btn btn-sm btn-pill bg-secondary/15 text-secondary border border-secondary/30 hover:bg-secondary/25 hover:border-secondary/50"
                            >
                                📚 View Flashcards →
                            </button>
                        ) : (
                            <button 
                                onClick={() => handleGenerate(mat._id)}
                                className="btn btn-ghost btn-sm text-primary hover:text-accent"
                            >
                                ⚡ Generate with Gemini
                            </button>
                        )}
                    </div>
                    <button onClick={() => handleDelete(mat._id)} className="btn btn-danger btn-sm">Delete</button>
                </div>
            </div>
        ))}
        {materials.length === 0 && <p className="text-th-muted col-span-full text-center">No materials uploaded yet.</p>}
      </div>
      )}
    </div>
  );
}
