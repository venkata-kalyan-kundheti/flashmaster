import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import toast, { Toaster } from 'react-hot-toast';

export default function Materials() {
  const [materials, setMaterials] = useState([]);
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [title, setTitle] = useState('');
  const [uploading, setUploading] = useState(false);

  const formatFileSize = (bytes) => {
    if (typeof bytes !== 'number') return '0.00 MB';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  const fetchMaterials = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/materials`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setMaterials(res.data);
    } catch (err) {
      toast.error('Failed to load materials');
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
      await axios.post(`${import.meta.env.VITE_API_URL}/materials/upload`, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
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
        await axios.post(`${import.meta.env.VITE_API_URL}/flashcards/generate/${id}`, {}, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        toast.success('Flashcards Generated Successfully! 🧠', { id: genToast });
        fetchMaterials();
    } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to generate flashcards', { id: genToast });
    }
  };

  const handleDelete = async (id) => {
    try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/materials/${id}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        toast.success('Material deleted');
        fetchMaterials();
    } catch (err) {
        toast.error('Failed to delete material');
    }
  }

  return (
    <div className="min-h-screen p-8 max-w-5xl mx-auto">
        <Toaster position="top-right" toastOptions={{ style: { background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}}/>
      <h1 className="text-4xl font-heading font-bold mb-8">Study Materials</h1>
      
      {/* Upload Section */}
      <div className="glass-card p-6 mb-12">
        <h2 className="text-xl font-heading font-semibold mb-4">Upload New Material</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <input placeholder="Subject (e.g. Biology)" value={subject} onChange={e => setSubject(e.target.value)} className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-primary" />
            <input placeholder="Title (e.g. Chapter 4)" value={title} onChange={e => setTitle(e.target.value)} className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-primary" />
            <input placeholder="Topic (Optional)" value={topic} onChange={e => setTopic(e.target.value)} className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-primary" />
        </div>

        <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200 
          ${isDragActive ? 'border-primary bg-primary/10' : 'border-white/20 hover:border-primary/50 bg-white/5'}`}>
          <input {...getInputProps()} disabled={uploading} />
          {isDragActive ? (
            <p className="text-primary text-lg">Drop the files here ...</p>
          ) : (
            <div>
                <p className="text-lg mb-2">Drag & drop some files here, or click to select files</p>
                <p className="text-sm text-white/50">Supports PDF, JPG, PNG, TXT (Max 8000 tokens for Gemini)</p>
            </div>
          )}
        </div>
      </div>

      {/* Materials List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {materials.map(mat => (
            <div key={mat._id} className="glass-card p-6 flex flex-col justify-between">
                <div>
                   <div className="flex justify-between items-start mb-2">
                       <span className="text-xs uppercase tracking-widest text-secondary font-semibold">{mat.subject}</span>
                       <span className="text-xs text-white/40">{new Date(mat.createdAt).toLocaleDateString()}</span>
                   </div>
                   <h3 className="text-xl font-bold font-heading mb-1">{mat.title}</h3>
                   {mat.topic && <p className="text-sm text-white/60 mb-4">{mat.topic}</p>}
                   <div className="flex gap-2 text-xs mb-6">
                       <span className="px-2 py-1 bg-white/5 rounded-md border border-white/10">{mat.fileType.toUpperCase()}</span>
                       <span className="px-2 py-1 bg-white/5 rounded-md border border-white/10">{formatFileSize(mat.fileSize)}</span>
                   </div>
                </div>
                
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/10">
                    <div>
                        {mat.flashcardsGenerated ? (
                            <span className="text-secondary text-sm flex items-center gap-1">✅ Flashcards Ready</span>
                        ) : (
                            <button 
                                onClick={() => handleGenerate(mat._id)}
                                className="text-primary hover:text-white text-sm font-medium hover:underline flex items-center gap-1 transition-all"
                            >
                                ⚡ Generate with Gemini
                            </button>
                        )}
                    </div>
                    <button onClick={() => handleDelete(mat._id)} className="text-red-400 hover:text-red-300 text-sm">Delete</button>
                </div>
            </div>
        ))}
        {materials.length === 0 && <p className="text-white/50 col-span-full text-center">No materials uploaded yet.</p>}
      </div>
    </div>
  );
}
