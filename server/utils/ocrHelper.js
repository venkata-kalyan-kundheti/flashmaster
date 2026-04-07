const Tesseract = require('tesseract.js');

async function extractTextFromImage(filePath) {
  const { data: { text } } = await Tesseract.recognize(filePath, 'eng');
  return text.slice(0, 8000);
}

module.exports = { extractTextFromImage };
