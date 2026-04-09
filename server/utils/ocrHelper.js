const Tesseract = require('tesseract.js');

// Helper to clean and normalize extracted text
function cleanText(rawText) {
  if (!rawText) return '';
  
  return rawText
    // Normalize line breaks
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Remove excessive blank lines (more than 2 consecutive)
    .replace(/\n\n\n+/g, '\n\n')
    // Remove control characters EXCEPT whitespace - replace with space if between words
    .replace(/[\x00-\x08\x0B\x0E-\x1F\x7F]/g, ' ')
    // Trim leading/trailing whitespace from each line
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n')
    // Remove multiple spaces
    .replace(/  +/g, ' ')
    .trim();
}

async function extractTextFromImage(filePath) {
  try {
    console.log(`[OCR Helper] Starting Tesseract OCR on image: ${filePath}`);
    
    const { data: { text: rawText } } = await Tesseract.recognize(filePath, 'eng');
    console.log(`[OCR Helper] Raw OCR text length: ${rawText.length}`);
    
    if (!rawText || rawText.length === 0) {
      throw new Error('Image OCR resulted in no text - image may not contain readable text');
    }
    
    // Clean the extracted text
    const cleanedText = cleanText(rawText);
    console.log(`[OCR Helper] Cleaned text length: ${cleanedText.length}`);
    
    if (!cleanedText || cleanedText.length === 0) {
      throw new Error('Image OCR resulted in empty text after cleaning');
    }
    
    // Slice to prevent token overflow (8000 chars ≈ 2000 tokens)
    const finalText = cleanedText.slice(0, 8000);
    console.log(`[OCR Helper] Final text length after truncation: ${finalText.length}`);
    
    return finalText;
  } catch (err) {
    console.error(`[OCR Helper] Error extracting text from image ${filePath}:`, err.message);
    throw err;
  }
}

module.exports = { extractTextFromImage };
