const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Material = require('../models/Material');
const Flashcard = require('../models/Flashcard');
const verifyToken = require('../middleware/auth');
const fs = require('fs');
const cloudinary = require('../config/cloudinary');

// Ensure uploads dir exists (temp storage before Cloudinary upload)
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({ storage });

router.get('/', verifyToken, async (req, res) => {
  try {
    const materials = await Material.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(materials);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/upload', verifyToken, upload.single('file'), async (req, res) => {
  try {
    const { subject, topic, title } = req.body;
    const localPath = req.file.path;
    let fileType = 'text';

    if (req.file.mimetype.includes('pdf')) fileType = 'pdf';
    else if (req.file.mimetype.includes('image')) fileType = 'image';

    // Upload to Cloudinary
    let cloudUrl = localPath; // fallback to local
    let uploadResult = null;
    try {
      uploadResult = await cloudinary.uploader.upload(localPath, {
        folder: 'flashmaster/materials',
        resource_type: 'auto',
      });
      cloudUrl = uploadResult.secure_url;

      // Remove local temp file after successful cloud upload
      if (fs.existsSync(localPath)) {
        fs.unlinkSync(localPath);
      }
    } catch (cloudErr) {
      console.warn('Cloudinary upload failed, using local file:', cloudErr.message);
      // Keep local file as fallback
    }

    const material = new Material({
      userId: req.user.id,
      subject,
      topic,
      title,
      fileUrl: cloudUrl,
      fileType,
      fileSize: req.file.size,
      cloudinaryPublicId: uploadResult?.public_id || '',
      cloudinaryResourceType: uploadResult?.resource_type || '',
    });

    await material.save();
    res.status(201).json(material);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const material = await Material.findOne({ _id: req.params.id, userId: req.user.id });
    if (!material) return res.status(404).json({ message: 'Material not found' });

    // Delete from Cloudinary if it's a cloud URL
    if (material.fileUrl && material.fileUrl.includes('cloudinary')) {
      try {
        // Extract public_id from URL
        const parts = material.fileUrl.split('/');
        const folderAndFile = parts.slice(parts.indexOf('flashmaster')).join('/');
        const publicId = folderAndFile.replace(/\.[^/.]+$/, ''); // remove extension
        await cloudinary.uploader.destroy(publicId, { resource_type: 'auto' });
      } catch (cloudErr) {
        console.warn('Cloudinary delete failed:', cloudErr.message);
      }
    } else if (fs.existsSync(material.fileUrl)) {
      // Delete local file
      fs.unlinkSync(material.fileUrl);
    }

    await Flashcard.deleteMany({ materialId: material._id });
    await Material.deleteOne({ _id: material._id });

    res.json({ message: 'Material and its flashcards removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
