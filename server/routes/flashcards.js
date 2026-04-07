const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const Material = require('../models/Material');
const Flashcard = require('../models/Flashcard');
const { extractTextFromPDF } = require('../utils/pdfParser');
const { extractTextFromImage } = require('../utils/ocrHelper');
const { generateFlashcards, generateSummary } = require('../utils/geminiHelper');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const cloudinary = require('../config/cloudinary');

// Helper to download a remote file to a temp local path (follows redirects)
function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(destPath);

    const request = proto.get(url, (response) => {
      // Follow redirects (301, 302, 303, 307, 308)
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        file.close();
        if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
        return downloadFile(response.headers.location, destPath).then(resolve).catch(reject);
      }

      // Check for non-200 status
      if (response.statusCode !== 200) {
        file.close();
        if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
        return reject(new Error(`Download failed with status ${response.statusCode}`));
      }

      response.pipe(file);
      file.on('finish', () => {
        file.close(() => resolve());
      });
    });

    request.on('error', (err) => {
      file.close();
      if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
      reject(err);
    });

    // Set a timeout for the download
    request.setTimeout(30000, () => {
      request.destroy();
      if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
      reject(new Error('Download timed out after 30s'));
    });
  });
}

router.get('/', verifyToken, async (req, res) => {
  try {
    const flashcards = await Flashcard.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(flashcards);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/material/:materialId', verifyToken, async (req, res) => {
  try {
    const flashcards = await Flashcard.find({ materialId: req.params.materialId, userId: req.user.id });
    res.json(flashcards);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/generate/:materialId', verifyToken, async (req, res) => {
  let tempFile = null;

  try {
    const material = await Material.findOne({ _id: req.params.materialId, userId: req.user.id });
    if (!material) return res.status(404).json({ message: 'Material not found' });
    if (material.flashcardsGenerated) return res.status(400).json({ message: 'Flashcards already generated' });

    let text = '';
    let filePath = material.fileUrl;

    if (material.fileUrl.includes('res.cloudinary.com') && material.cloudinaryPublicId) {
      filePath = cloudinary.url(material.cloudinaryPublicId, {
        resource_type: material.cloudinaryResourceType || 'auto',
        sign_url: true,
      });
    }

    console.log(`[Generate] Material: ${material.title}, Type: ${material.fileType}, URL: ${filePath}`);

    // If the file is a remote URL, download it first
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      const ext = material.fileType === 'pdf' ? '.pdf' : material.fileType === 'image' ? '.png' : '.txt';
      tempFile = path.join(__dirname, '../uploads', `temp_${Date.now()}${ext}`);

      // Ensure uploads dir exists
      const uploadsDir = path.join(__dirname, '../uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      console.log(`[Generate] Downloading from Cloudinary to: ${tempFile}`);
      await downloadFile(filePath, tempFile);

      // Verify the downloaded file
      const stats = fs.statSync(tempFile);
      console.log(`[Generate] Downloaded file size: ${stats.size} bytes`);

      if (stats.size === 0) {
        return res.status(400).json({ message: 'Downloaded file is empty. Please re-upload the material.' });
      }

      filePath = tempFile;
    } else {
      // Local file - check if it exists
      if (!fs.existsSync(filePath)) {
        return res.status(400).json({ message: 'File not found on server. Please re-upload the material.' });
      }
    }

    // Extract text based on file type
    console.log(`[Generate] Extracting text from ${material.fileType} file...`);

    if (material.fileType === 'pdf') {
      text = await extractTextFromPDF(filePath);
    } else if (material.fileType === 'image') {
      text = await extractTextFromImage(filePath);
    } else {
      text = fs.readFileSync(filePath, 'utf8');
    }

    // Clean up temp file
    if (tempFile && fs.existsSync(tempFile)) {
      fs.unlinkSync(tempFile);
      tempFile = null;
    }

    console.log(`[Generate] Extracted text length: ${text ? text.length : 0}`);

    if (!text || text.trim() === '') {
      return res.status(400).json({ message: 'Could not extract text from file. The file may be empty or unreadable.' });
    }

    // Generate flashcards and summary with Gemini
    console.log(`[Generate] Calling Gemini API for flashcards...`);
    const cardsData = await generateFlashcards(text, material.subject);
    console.log(`[Generate] Got ${cardsData.length} flashcards from Gemini`);

    console.log(`[Generate] Calling Gemini API for summary...`);
    const summary = await generateSummary(text, material.subject);

    const flashcardsToInsert = cardsData.map(card => ({
      materialId: material._id,
      userId: req.user.id,
      subject: material.subject,
      question: card.question,
      answer: card.answer,
      difficulty: card.difficulty || 'medium',
    }));

    await Flashcard.insertMany(flashcardsToInsert);

    material.summary = summary;
    material.flashcardsGenerated = true;
    await material.save();

    console.log(`[Generate] Successfully generated flashcards for material: ${material.title}`);
    res.status(201).json({ message: 'Flashcards generated successfully' });
  } catch (error) {
    // Clean up temp file on error
    if (tempFile && fs.existsSync(tempFile)) {
      fs.unlinkSync(tempFile);
    }

    console.error('[Generate] Flashcard Generation Error:', error.message);
    console.error('[Generate] Stack:', error.stack);

    // Return more specific error messages
    if (error.message?.includes('PERMISSION_DENIED') || error.message?.includes('API_KEY')) {
      return res.status(500).json({ message: 'Gemini API key is invalid or expired. Check server configuration.' });
    }
    if (error.message?.includes('RESOURCE_EXHAUSTED') || error.message?.includes('quota')) {
      return res.status(429).json({ message: 'Gemini API rate limit reached. Please try again later.' });
    }
    if (error.message?.includes('JSON')) {
      return res.status(500).json({ message: 'Failed to parse Gemini response. Please try again.' });
    }

    res.status(500).json({ message: `Generation failed: ${error.message}` });
  }
});

router.patch('/:id/difficulty', verifyToken, async (req, res) => {
  try {
    const flashcard = await Flashcard.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { difficulty: req.body.difficulty },
      { new: true }
    );
    res.json(flashcard);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/:id/reviewed', verifyToken, async (req, res) => {
  try {
    const flashcard = await Flashcard.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: { isReviewed: true }, $inc: { reviewCount: 1 } },
      { new: true }
    );
    res.json(flashcard);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
