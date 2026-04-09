import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import axios from 'axios';
import { Upload, FileText, Target, BookOpen, Clock, TrendingUp } from 'lucide-react';

const ResumeRoadmap = () => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [parsedResume, setParsedResume] = useState(null);
  const [jobRole, setJobRole] = useState('');
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

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
      console.error('Upload error:', error);
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
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
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
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      setRoadmap(response.data);
      toast.success('Roadmap generated successfully!');
    } catch (error) {
      console.error('Roadmap generation error:', error);
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

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Resume Analysis & Learning Roadmap</h1>
        <p className="text-gray-600">Upload your resume and get a personalized learning plan for your target job role</p>
      </div>

      {/* Resume Upload Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Upload className="mr-2" />
          Step 1: Upload Your Resume
        </h2>

        {!parsedResume ? (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input {...getInputProps()} />
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            {uploading ? (
              <p className="text-gray-600">Processing your resume...</p>
            ) : isDragActive ? (
              <p className="text-blue-600">Drop your resume here...</p>
            ) : (
              <div>
                <p className="text-gray-600 mb-2">
                  Drag & drop your resume here, or click to browse
                </p>
                <p className="text-sm text-gray-500">
                  Supports PDF and DOCX files (max 10MB)
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <p className="font-medium text-green-800">{parsedResume.fileName}</p>
                  <p className="text-sm text-green-600">
                    {(parsedResume.fileSize / 1024 / 1024).toFixed(2)} MB •
                    {parsedResume.text.length} characters extracted
                  </p>
                </div>
              </div>
              <button
                onClick={resetForm}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Remove
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Job Role Input */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Target className="mr-2" />
          Step 2: Enter Target Job Role
        </h2>

        <div className="max-w-md">
          <input
            type="text"
            value={jobRole}
            onChange={(e) => setJobRole(e.target.value)}
            placeholder="e.g., Software Engineer, Data Scientist, Product Manager"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Generate Roadmap Button */}
      <div className="text-center">
        <button
          onClick={generateRoadmap}
          disabled={!parsedResume || !jobRole.trim() || loading}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Generating Roadmap...' : 'Generate Learning Roadmap'}
        </button>
      </div>

      {/* Roadmap Results */}
      {roadmap && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-6 text-center">Your Personalized Learning Roadmap</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Fit Percentage */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Current Fit</p>
                  <p className="text-3xl font-bold">{roadmap.fitPercentage}%</p>
                </div>
                <TrendingUp className="h-12 w-12 opacity-80" />
              </div>
            </div>

            {/* Time Estimate */}
            <div className="bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Estimated Time</p>
                  <p className="text-2xl font-bold">{roadmap.estimatedTimeframe}</p>
                </div>
                <Clock className="h-12 w-12 opacity-80" />
              </div>
            </div>
          </div>

          {/* Skills Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="text-lg font-semibold mb-3 text-green-700">✅ Skills You Have</h3>
              <div className="space-y-2">
                {roadmap.skillsExtracted.map((skill, index) => (
                  <span key={index} className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm mr-2 mb-2">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3 text-orange-700">🎯 Skills to Develop</h3>
              <div className="space-y-2">
                {roadmap.missingSkills.map((skill, index) => (
                  <span key={index} className="inline-block bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm mr-2 mb-2">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Suggested Projects */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <BookOpen className="mr-2" />
              Suggested Projects
            </h3>
            <div className="space-y-3">
              {roadmap.suggestedProjects.map((project, index) => (
                <div key={index} className="bg-gray-50 border-l-4 border-blue-500 p-4 rounded">
                  <p className="text-gray-800">{project}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Roadmap */}
          <div>
            <h3 className="text-lg font-semibold mb-3">📋 Detailed Learning Plan</h3>
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                {roadmap.roadmap}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeRoadmap;