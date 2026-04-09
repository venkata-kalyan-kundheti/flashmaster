const fs = require('fs');

let PDFParseClass = null;
let PDFParseFunction = null;
let pdfParseModule;
try {
  pdfParseModule = require('pdf-parse');
} catch (err) {
  pdfParseModule = null;
}

if (pdfParseModule) {
  if (typeof pdfParseModule === 'function') {
    PDFParseFunction = pdfParseModule;
  }
  PDFParseClass = pdfParseModule.PDFParse || pdfParseModule.default?.PDFParse || null;
  if (!PDFParseClass && typeof pdfParseModule.default === 'function') {
    PDFParseFunction = pdfParseModule.default;
  }
}

if (!PDFParseClass && !PDFParseFunction) {
  try {
    pdfParseModule = require('pdf-parse/node');
    if (typeof pdfParseModule === 'function') {
      PDFParseFunction = pdfParseModule;
    }
    PDFParseClass = pdfParseModule.PDFParse || pdfParseModule.default?.PDFParse || null;
    if (!PDFParseClass && typeof pdfParseModule.default === 'function') {
      PDFParseFunction = pdfParseModule.default;
    }
  } catch (err) {
    PDFParseClass = null;
    PDFParseFunction = null;
  }
}

if (!PDFParseClass && !PDFParseFunction) {
  throw new Error('Unable to load pdf-parse parser. Please install pdf-parse and verify the package version.');
}

// Load mammoth for DOCX parsing
let mammoth = null;
try {
  mammoth = require('mammoth');
} catch (err) {
  console.warn('Mammoth not available for DOCX parsing:', err.message);
}

// Helper to clean and normalize extracted text
function cleanText(rawText) {
  if (!rawText) return '';
  
  return rawText
    // Normalize line breaks
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\f/g, '\n') // form feed to newline
    // ChatGPT PDFs often have line breaks within sentences - fix them
    .replace(/(\w)\n(\w)/g, '$1 $2') // Join lines that are broken mid-sentence
    .replace(/(\w)-\n(\w)/g, '$1-$2') // Fix hyphenated words split across lines
    // Remove excessive blank lines (more than 2 consecutive)
    .replace(/\n\n\n+/g, '\n\n')
    // Remove common PDF artifacts and headers/footers
    .replace(/^Page \d+.*$/gm, '') // Remove "Page X" headers
    .replace(/^[\s]*---[\s]*$/gm, '') // Remove separator lines
    .replace(/^[\s]*\d+[\s]*$/gm, '') // Remove page numbers
    // Remove control characters EXCEPT whitespace - replace with space
    .replace(/[\x00-\x08\x0B\x0E-\x1F\x7F]/g, ' ')
    // Fix smart quotes and special characters
    .replace(/[""]/g, '"')
    .replace(/['']/g, "'")
    .replace(/[–—]/g, '-')
    // Trim leading/trailing whitespace from each line
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n')
    // Remove multiple spaces
    .replace(/  +/g, ' ')
    .trim();
}

async function extractTextFromPDF(filePath) {
  try {
    console.log(`[PDF Parser] Starting to read PDF file at: ${filePath}`);
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found at path: ${filePath}`);
    }
    
    const buffer = fs.readFileSync(filePath);
    console.log(`[PDF Parser] Read buffer of length: ${buffer.length} bytes`);
    
    if (buffer.length === 0) {
      throw new Error('PDF file is empty (0 bytes)');
    }

    let data;

    if (PDFParseClass) {
      const parser = new PDFParseClass({ data: buffer });
      if (typeof parser.getText !== 'function') {
        throw new Error('PDFParse parser does not expose getText()');
      }
      data = await parser.getText();
      if (typeof parser.destroy === 'function') {
        await parser.destroy();
      }
    } else if (PDFParseFunction) {
      data = await PDFParseFunction(buffer);
    }

    if (!data) {
      throw new Error('pdf-parse returned no parsed data');
    }

    console.log(`[PDF Parser] Successfully parsed PDF`);
    console.log(`[PDF Parser] Raw text length: ${data.text?.length || 0}`);
    
    if (!data.text || data.text.length === 0) {
      throw new Error('PDF contains no extractable text - file may be image-only or corrupted');
    }
    
    // Log first 500 chars of raw text for debugging
    console.log(`[PDF Parser] Raw text preview (first 500 chars):\n${data.text.substring(0, 500)}`);
    
    // Clean the extracted text
    const cleanedText = cleanText(data.text);
    console.log(`[PDF Parser] Cleaned text length: ${cleanedText.length}`);
    console.log(`[PDF Parser] Cleaned text preview (first 500 chars):\n${cleanedText.substring(0, 500)}`);
    
    if (!cleanedText || cleanedText.length === 0) {
      throw new Error('PDF parsing resulted in empty text after cleaning');
    }
    
    // Split into sentences and join them properly
    const sentences = cleanedText.split('\n').filter(s => s.trim().length > 0).join(' ');
    
    // Slice to prevent token overflow (8000 chars ≈ 2000 tokens)
    const finalText = sentences.slice(0, 8000);
    console.log(`[PDF Parser] Final text length after truncation: ${finalText.length}`);
    console.log(`[PDF Parser] Final text preview (first 300 chars):\n${finalText.substring(0, 300)}`);
    
    return finalText;
  } catch (err) {
    console.error(`[PDF Parser] Error extracting text from ${filePath}:`, err.message);
    throw err;
  }
}

async function extractTextFromDOCX(filePath) {
  try {
    console.log(`[DOCX Parser] Starting to read DOCX file at: ${filePath}`);
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found at path: ${filePath}`);
    }

    if (!mammoth) {
      throw new Error('Mammoth library not available for DOCX parsing');
    }

    const buffer = fs.readFileSync(filePath);
    console.log(`[DOCX Parser] Read buffer of length: ${buffer.length} bytes`);
    
    if (buffer.length === 0) {
      throw new Error('DOCX file is empty (0 bytes)');
    }

    const result = await mammoth.extractRawText({ buffer });
    console.log(`[DOCX Parser] Successfully parsed DOCX`);
    console.log(`[DOCX Parser] Raw text length: ${result.value?.length || 0}`);
    
    if (!result.value || result.value.length === 0) {
      throw new Error('DOCX contains no extractable text - file may be corrupted');
    }

    // Log first 500 chars for debugging
    console.log(`[DOCX Parser] Raw text preview (first 500 chars):\n${result.value.substring(0, 500)}`);
    
    // Clean the extracted text
    const cleanedText = cleanText(result.value);
    console.log(`[DOCX Parser] Cleaned text length: ${cleanedText.length}`);
    console.log(`[DOCX Parser] Cleaned text preview (first 500 chars):\n${cleanedText.substring(0, 500)}`);
    
    if (!cleanedText || cleanedText.length === 0) {
      throw new Error('DOCX parsing resulted in empty text after cleaning');
    }
    
    // Split into sentences and join them properly
    const sentences = cleanedText.split('\n').filter(s => s.trim().length > 0).join(' ');
    
    // Slice to prevent token overflow
    const finalText = sentences.slice(0, 8000);
    console.log(`[DOCX Parser] Final text length after truncation: ${finalText.length}`);
    console.log(`[DOCX Parser] Final text preview (first 300 chars):\n${finalText.substring(0, 300)}`);
    
    return finalText;
  } catch (err) {
    console.error(`[DOCX Parser] Error extracting text from ${filePath}:`, err.message);
    throw err;
  }
}

module.exports = { extractTextFromPDF, extractTextFromDOCX };
