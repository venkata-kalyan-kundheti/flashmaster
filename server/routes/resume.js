const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { extractTextFromPDF, extractTextFromDOCX } = require('../utils/pdfParser');
const { generateRoadmap } = require('../utils/geminiHelper');
const auth = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and DOCX files are allowed'));
    }
  }
});

// POST /api/resume/upload-resume
router.post('/upload-resume', auth, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const filePath = req.file.path;
    console.log('Resume upload - file:', req.file.originalname, 'size:', req.file.size, 'type:', req.file.mimetype);

    let extractedText = '';

    if (req.file.mimetype === 'application/pdf') {
      extractedText = await extractTextFromPDF(filePath);
    } else if (req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      extractedText = await extractTextFromDOCX(filePath);
    } else {
      // Clean up file
      fs.unlinkSync(filePath);
      return res.status(400).json({ message: 'Unsupported file type' });
    }

    // Validate extracted text
    if (!extractedText || extractedText.trim().length < 50) {
      // Clean up file
      fs.unlinkSync(filePath);
      return res.status(400).json({
        message: 'Could not extract sufficient text from the file. Please ensure the file contains readable text.'
      });
    }

    // Clean up the uploaded file after processing
    fs.unlinkSync(filePath);

    res.json({
      text: extractedText.trim(),
      fileName: req.file.originalname,
      fileSize: req.file.size,
      fileType: req.file.mimetype
    });

  } catch (error) {
    console.error('Resume upload error:', error);

    // Clean up file if it exists
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      message: error.message || 'Failed to process resume file'
    });
  }
});

// POST /api/resume/generate-roadmap
router.post('/generate-roadmap', auth, async (req, res) => {
  try {
    const { resumeText, jobRole } = req.body;

    if (!resumeText || !jobRole) {
      return res.status(400).json({
        message: 'resumeText and jobRole are required'
      });
    }

    if (resumeText.trim().length < 50) {
      return res.status(400).json({
        message: 'Resume text is too short. Please provide a more complete resume.'
      });
    }

    console.log('Generating roadmap for job role:', jobRole);
    console.log('Resume text length:', resumeText.length);

    const roadmap = await generateRoadmap(resumeText, jobRole);

    res.json(roadmap);

  } catch (error) {
    console.error('Roadmap generation error:', error);
    res.status(500).json({
      message: error.message || 'Failed to generate roadmap'
    });
  }
});

module.exports = router;