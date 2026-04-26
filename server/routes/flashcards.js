const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const verifyToken = require('../middleware/auth');
const Material = require('../models/Material');
const Flashcard = require('../models/Flashcard');
const { extractTextFromPDF } = require('../utils/pdfParser');
const { extractTextFromImage } = require('../utils/ocrHelper');
const { generateFlashcards, generateSummary } = require('../utils/geminiHelper');
const fs = require('fs');
// Cloudinary disabled - using local files only

// Download function removed - using local files only

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

// Temporary test route — verify Gemini API works in isolation
router.get('/test-gemini', verifyToken, async (req, res) => {
  try {
    const testText = `A linked list is a linear data structure where elements are stored in nodes. 
    Each node contains data and a pointer to the next node. Types include singly linked, 
    doubly linked, and circular linked lists. Operations include insertion, deletion, traversal. 
    Time complexity for search is O(n), insertion at head is O(1). Arrays vs linked lists: 
    arrays have O(1) random access but O(n) insertion, while linked lists have O(n) access but O(1) insertion at head.`;
    
    console.log('=== TEST GEMINI ROUTE ===');
    const cards = await generateFlashcards(testText, 'Data Structures');
    res.json({ success: true, count: cards.length, sample: cards[0] });
  } catch (err) {
    console.error('TEST GEMINI ERROR:', err.message);
    res.status(500).json({ success: false, error: err.message, stack: err.stack });
  }
});

router.post('/generate/:materialId', verifyToken, async (req, res) => {
  try {
    console.log(`[Generate] Starting flashcard generation for material ID: ${req.params.materialId}, user: ${req.user.id}`);

    // Validate material exists and belongs to user
    const material = await Material.findOne({ _id: req.params.materialId, userId: req.user.id });
    if (!material) {
      console.log(`[Generate] Material not found: ${req.params.materialId}`);
      return res.status(404).json({ message: 'Material not found' });
    }

    if (material.flashcardsGenerated) {
      console.log(`[Generate] Flashcards already generated for material: ${material.title}`);
      return res.status(400).json({ message: 'Flashcards already generated' });
    }

    console.log(`[Generate] Processing material: ${material.title} (${material.fileType})`);
    
    // Use local file path directly (Cloudinary disabled)
    const filePath = material.fileUrl;
    console.log(`[Generate] Using local file: ${filePath}`);

    // Validate local file exists
    if (!fs.existsSync(filePath)) {
      console.error(`[Generate] Local file not found: ${filePath}`);
      return res.status(400).json({ message: 'File not found on server. Please re-upload the material.' });
    }

    // Extract text based on file type
    console.log(`[Generate] Extracting text from ${material.fileType} file...`);

    let text = '';
    try {
      if (material.fileType === 'pdf') {
        console.log('[Generate] Using PDF extraction');
        text = await extractTextFromPDF(filePath);
      } else if (material.fileType === 'image') {
        console.log('[Generate] Using OCR extraction');
        text = await extractTextFromImage(filePath);
      } else if (material.fileType === 'text') {
        // For text files
        console.log('[Generate] Using text file extraction');
        const rawText = fs.readFileSync(filePath, 'utf8');
        console.log(`[Generate] Raw text file size: ${rawText.length} bytes`);
        
        if (!rawText || rawText.length === 0) {
          throw new Error('Text file is empty');
        }
        
        // Clean text files - use same logic as PDF/OCR
        text = rawText
          .replace(/\r\n/g, '\n')
          .replace(/\r/g, '\n')
          .replace(/\f/g, '\n')
          .replace(/\n\n\n+/g, '\n\n')
          .replace(/[\x00-\x08\x0B\x0E-\x1F\x7F]/g, ' ')
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0)
          .join('\n')
          .replace(/  +/g, ' ')
          .trim()
          .slice(0, 8000);
        
        console.log(`[Generate] Text file processed, length: ${text.length}`);
        
        if (!text || text.length === 0) {
          throw new Error('Text file contains no valid content after cleaning');
        }
      } else {
        throw new Error(`Unsupported file type: ${material.fileType}`);
      }
    } catch (extractionError) {
      console.error('[Generate] Text extraction error:', extractionError.message);
      return res.status(500).json({ message: `Failed to extract text from ${material.fileType} file: ${extractionError.message}` });
    }

    console.log(`[Generate] Extracted text length: ${text ? text.length : 0}`);

    if (!text || text.trim().length === 0) {
      console.error('[Generate] Text extraction resulted in empty content');
      return res.status(400).json({ message: 'Could not extract text from file. The file may be empty, image-only (no OCR), unreadable, or in an unsupported format. Try uploading a PDF with text or a TXT file.' });
    }

    // Generate flashcards with Gemini
    console.log(`[Generate] Calling Gemini API for flashcards...`);
    let cardsData;
    try {
      console.log(`[Generate] Text ready for Gemini, length: ${text.length} chars`);
      cardsData = await generateFlashcards(text, material.subject);
      console.log(`[Generate] Successfully got ${cardsData.length} flashcards from Gemini`);
    } catch (geminiError) {
      console.error('[Generate] Gemini flashcards error:', geminiError.message);
      console.error('[Generate] Error stack:', geminiError.stack);
      
      // Provide more specific error messages
      let errorMsg = geminiError.message;
      if (geminiError.message.includes('Invalid text') || geminiError.message.includes('empty')) {
        errorMsg = 'Text extraction failed: The file might be corrupted, encrypted, image-only (no OCR), or in an unsupported format. Try uploading a plain text file to test.';
      } else if (geminiError.message.includes('API') || geminiError.message.includes('GEMINI_API_KEY')) {
        errorMsg = 'Gemini API error: Check your API key in .env and make sure it\'s valid. Check the server logs for details.';
      } else if (geminiError.message.includes('429') || geminiError.message.includes('RESOURCE_EXHAUSTED')) {
        errorMsg = 'Gemini API rate limited: Too many requests. Please wait a moment and try again.';
      } else if (geminiError.message.includes('parse')) {
        errorMsg = 'Failed to parse Gemini response: The API response was not valid JSON. This might be a temporary issue - try again.';
      }
      
      return res.status(500).json({ message: `Failed to generate flashcards: ${errorMsg}` });
    }

    // Generate summary with Gemini
    console.log(`[Generate] Calling Gemini API for summary...`);
    let summary;
    try {
      summary = await generateSummary(text, material.subject);
      console.log(`[Generate] Successfully got summary from Gemini`);
    } catch (summaryError) {
      console.error('[Generate] Gemini summary error:', summaryError.message);
      // Continue without summary - it's not critical
      summary = 'Summary generation failed, but flashcards were created successfully.';
    }

    // Save flashcards to database
    try {
      const flashcardsToInsert = cardsData.map(card => ({
        materialId: material._id,
        userId: req.user.id,
        subject: material.subject,
        topic: card.topic || '',
        question: card.question,
        answer: card.answer,
        difficulty: card.difficulty || 'medium',
      }));

      await Flashcard.insertMany(flashcardsToInsert);
      console.log(`[Generate] Saved ${flashcardsToInsert.length} flashcards to database`);
    } catch (dbError) {
      console.error('[Generate] Database save error:', dbError);
      return res.status(500).json({ message: `Failed to save flashcards: ${dbError.message}` });
    }

    // Update material
    try {
      material.summary = summary;
      material.flashcardsGenerated = true;
      await material.save();
      console.log(`[Generate] Updated material: ${material.title}`);
    } catch (updateError) {
      console.error('[Generate] Material update error:', updateError);
      // Don't fail the request if update fails, flashcards are already saved
    }

    console.log(`[Generate] SUCCESS: Generated flashcards for material: ${material.title}`);
    res.status(201).json({
      message: 'Flashcards generated successfully',
      count: cardsData.length
    });

  } catch (error) {
    console.error('[Generate] UNEXPECTED ERROR:', error.message);
    console.error('[Generate] Stack trace:', error.stack);

    // Return generic error for unexpected issues
    res.status(500).json({
      message: 'An unexpected error occurred during flashcard generation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
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
    const markedForRevision = req.body?.markedForRevision;

    if (typeof markedForRevision === 'boolean') {
      const flashcard = await Flashcard.findOneAndUpdate(
        { _id: req.params.id, userId: req.user.id },
        { $set: { markedForRevision } },
        { new: true }
      );

      if (!flashcard) {
        return res.status(404).json({ message: 'Flashcard not found' });
      }

      return res.json(flashcard);
    }

    const flashcard = await Flashcard.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: { isReviewed: true }, $inc: { reviewCount: 1 } },
      { new: true }
    );

    if (!flashcard) {
      return res.status(404).json({ message: 'Flashcard not found' });
    }

    res.json(flashcard);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/:id/revision', verifyToken, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid flashcard id' });
    }

    const flashcard = await Flashcard.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: { markedForRevision: !!req.body.markedForRevision } },
      { new: true }
    );

    if (!flashcard) {
      return res.status(404).json({ message: 'Flashcard not found' });
    }

    res.json(flashcard);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
