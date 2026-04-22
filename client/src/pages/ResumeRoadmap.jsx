import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import axios from 'axios';
import { Upload, FileText, Target, BookOpen, Clock, TrendingUp, RotateCcw } from 'lucide-react';

const ResumeRoadmap = () => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [parsedResume, setParsedResume] = useState(null);
  const [jobRole,      setJobRole]      = useState('');
  const [roadmap,      setRoadmap]      = useState(null);
  const [loading,      setLoading]      = useState(false);
  const [uploading,    setUploading]    = useState(false);
  const [focusJob,     setFocusJob]     = useState(false);

  const onDrop = async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;
    setUploading(true);
    setUploadedFile(file);
    try {
      const formData = new FormData();
      formData.append('resume', file);
      const response = await axios.post('/api/resume/upload-resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setParsedResume(response.data);
      toast.success('Resume uploaded and parsed successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload resume');
      setUploadedFile(null);
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
  });

  const generateRoadmap = async () => {
    if (!parsedResume || !jobRole.trim()) {
      toast.error('Please upload a resume and enter a job role');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post('/api/resume/generate-roadmap', {
        resumeText: parsedResume.text,
        jobRole: jobRole.trim(),
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setRoadmap(response.data);
      toast.success('Roadmap generated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate roadmap');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setUploadedFile(null);
    setParsedResume(null);
    setJobRole('');
    setRoadmap(null);
  };

  /* ── Shared styles ─────────────────────────────────────────── */
  const sectionCard = {
    background: 'var(--step-card-bg)',
    border: '1px solid var(--step-card-border)',
    borderRadius: '18px',
    padding: '28px',
  };

  const stepLabel = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '1.1rem',
    fontWeight: 700,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    color: 'var(--text-primary)',
    marginBottom: '20px',
  };

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '8px' }}>
        <h1
          className="text-3xl font-heading font-black"
          style={{ color: 'var(--text-primary)', marginBottom: '8px' }}
        >
          Resume Analysis &amp; Learning Roadmap
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Upload your resume and get a personalized learning plan for your target job role
        </p>
      </div>

      {/* ── Step 1: Upload ──────────────────────────────────────── */}
      <div style={sectionCard}>
        <h2 style={stepLabel}>
          <div style={{
            width: 34, height: 34, borderRadius: '10px',
            background: 'linear-gradient(135deg, #6d28d9, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(109,40,217,0.4)',
          }}>
            <Upload size={16} color="#fff" />
          </div>
          Step 1: Upload Your Resume
        </h2>

        {!parsedResume ? (
          <div
            {...getRootProps()}
            style={{
              border: `2px dashed ${isDragActive ? '#8b5cf6' : 'var(--border)'}`,
              background: isDragActive ? 'rgba(139,92,246,0.08)' : 'var(--input-bg)',
              borderRadius: '14px',
              padding: '48px 24px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.45)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = isDragActive ? '#8b5cf6' : 'var(--border)'; }}
          >
            <input {...getInputProps()} />
            <div style={{
              width: 56, height: 56, borderRadius: '14px',
              background: 'rgba(139,92,246,0.1)',
              border: '1px solid rgba(139,92,246,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <FileText size={26} color="#8b5cf6" />
            </div>

            {uploading ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>⏳ Processing your resume…</p>
            ) : isDragActive ? (
              <p style={{ color: '#8b5cf6', fontSize: '1rem', fontWeight: 600 }}>Drop your resume here…</p>
            ) : (
              <>
                <p style={{ color: 'var(--text-primary)', fontSize: '0.95rem', marginBottom: '6px' }}>
                  Drag &amp; drop your resume here, or{' '}
                  <span style={{ color: '#8b5cf6', fontWeight: 600, cursor: 'pointer' }}>click to browse</span>
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  Supports PDF and DOCX files (max 10MB)
                </p>
              </>
            )}
          </div>
        ) : (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'rgba(20,184,166,0.08)',
            border: '1px solid rgba(20,184,166,0.25)',
            borderRadius: '12px',
            padding: '16px 20px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: 42, height: 42, borderRadius: '10px',
                background: 'rgba(20,184,166,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <FileText size={20} color="#14b8a6" />
              </div>
              <div>
                <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{parsedResume.fileName}</p>
                <p style={{ fontSize: '0.78rem', color: '#14b8a6', marginTop: '2px' }}>
                  {(parsedResume.fileSize / 1024 / 1024).toFixed(2)} MB · {parsedResume.text.length} characters extracted
                </p>
              </div>
            </div>
            <button
              onClick={resetForm}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#f87171', fontSize: '0.85rem', fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: '5px',
              }}
            >
              <RotateCcw size={14} /> Remove
            </button>
          </div>
        )}
      </div>

      {/* ── Step 2: Job Role ────────────────────────────────────── */}
      <div style={sectionCard}>
        <h2 style={stepLabel}>
          <div style={{
            width: 34, height: 34, borderRadius: '10px',
            background: 'linear-gradient(135deg, #ec4899, #a855f7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(236,72,153,0.35)',
          }}>
            <Target size={16} color="#fff" />
          </div>
          Step 2: Enter Target Job Role
        </h2>
        <input
          type="text"
          value={jobRole}
          onChange={e => setJobRole(e.target.value)}
          placeholder="e.g., Software Engineer, Data Scientist, Product Manager"
          onFocus={() => setFocusJob(true)}
          onBlur={() => setFocusJob(false)}
          style={{
            width: '100%',
            maxWidth: '480px',
            padding: '12px 16px',
            background: 'var(--input-bg)',
            border: `1px solid ${focusJob ? 'var(--border-focus)' : 'var(--border)'}`,
            borderRadius: '12px',
            color: 'var(--input-text)',
            fontSize: '0.9rem',
            outline: 'none',
            transition: 'border-color 0.2s',
          }}
        />
      </div>

      {/* ── Generate Button ─────────────────────────────────────── */}
      <div style={{ textAlign: 'center' }}>
        <button
          onClick={generateRoadmap}
          disabled={!parsedResume || !jobRole.trim() || loading}
          style={{
            padding: '13px 40px',
            background: (!parsedResume || !jobRole.trim() || loading)
              ? 'rgba(255,255,255,0.07)'
              : 'linear-gradient(135deg, #6d28d9 0%, #8b5cf6 55%, #ec4899 100%)',
            border: 'none',
            borderRadius: '14px',
            color: (!parsedResume || !jobRole.trim() || loading) ? 'var(--text-muted)' : '#fff',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: '0.95rem',
            fontWeight: 700,
            cursor: (!parsedResume || !jobRole.trim() || loading) ? 'not-allowed' : 'pointer',
            boxShadow: (!parsedResume || !jobRole.trim() || loading)
              ? 'none'
              : '0 4px 22px rgba(109,40,217,0.45)',
            transition: 'all 0.2s',
            opacity: loading ? 0.7 : 1,
          }}
          onMouseEnter={e => { if (!e.currentTarget.disabled) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(109,40,217,0.55)'; }}}
          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 22px rgba(109,40,217,0.45)'; }}
        >
          {loading ? '⏳ Generating Roadmap…' : '🗺 Generate Learning Roadmap'}
        </button>
      </div>

      {/* ── Roadmap Results ─────────────────────────────────────── */}
      {roadmap && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h2
            className="text-2xl font-heading font-bold text-center"
            style={{ color: 'var(--text-primary)' }}
          >
            Your Personalized Learning Roadmap
          </h2>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div style={{
              background: 'linear-gradient(135deg, #6d28d9 0%, #8b5cf6 100%)',
              borderRadius: '16px', padding: '24px',
              boxShadow: '0 8px 24px rgba(109,40,217,0.38)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ color: 'rgba(238,240,255,0.7)', fontSize: '0.82rem', marginBottom: '6px', fontWeight: 500 }}>Current Fit</p>
                  <p style={{ color: '#fff', fontSize: '2.4rem', fontWeight: 800, lineHeight: 1 }}>{roadmap.fitPercentage}%</p>
                </div>
                <TrendingUp size={44} color="rgba(255,255,255,0.6)" />
              </div>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)',
              borderRadius: '16px', padding: '24px',
              boxShadow: '0 8px 24px rgba(20,184,166,0.32)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ color: 'rgba(238,255,253,0.7)', fontSize: '0.82rem', marginBottom: '6px', fontWeight: 500 }}>Estimated Time</p>
                  <p style={{ color: '#fff', fontSize: '1.6rem', fontWeight: 800, lineHeight: 1.2 }}>{roadmap.estimatedTimeframe}</p>
                </div>
                <Clock size={44} color="rgba(255,255,255,0.6)" />
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div style={sectionCard}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#34d399', marginBottom: '14px' }}>✅ Skills You Have</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {roadmap.skillsExtracted.map((skill, i) => (
                  <span key={i} style={{
                    padding: '5px 13px', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 500,
                    background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.3)', color: '#34d399',
                  }}>{skill}</span>
                ))}
              </div>
            </div>
            <div style={sectionCard}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fb923c', marginBottom: '14px' }}>🎯 Skills to Develop</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {roadmap.missingSkills.map((skill, i) => (
                  <span key={i} style={{
                    padding: '5px 13px', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 500,
                    background: 'rgba(251,146,60,0.12)', border: '1px solid rgba(251,146,60,0.3)', color: '#fb923c',
                  }}>{skill}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Projects */}
          <div style={sectionCard}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>
              <BookOpen size={18} color="#8b5cf6" /> Suggested Projects
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {roadmap.suggestedProjects.map((project, i) => (
                <div key={i} style={{
                  borderLeft: '3px solid #8b5cf6',
                  padding: '12px 16px',
                  background: 'rgba(139,92,246,0.06)',
                  borderRadius: '0 10px 10px 0',
                }}>
                  <p style={{ color: 'var(--text-primary)', fontSize: '0.9rem', lineHeight: 1.55 }}>{project}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Plan */}
          <div style={sectionCard}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>📋 Detailed Learning Plan</h3>
            <div style={{
              background: 'var(--input-bg)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '20px',
              whiteSpace: 'pre-wrap',
              color: 'var(--text-secondary)',
              fontSize: '0.875rem',
              lineHeight: 1.7,
            }}>
              {roadmap.roadmap}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeRoadmap;