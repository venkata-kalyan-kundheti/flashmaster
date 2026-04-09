import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Set the worker source for pdfjs
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export interface ParsedResume {
  text: string;
  fileName: string;
  fileSize: number;
  fileType: string;
}

export async function parseResumeFile(file: File): Promise<ParsedResume> {
  // Validate file type
  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  if (!allowedTypes.includes(file.type)) {
    throw new Error('Only PDF and DOCX files are supported');
  }

  // Validate file size (10MB max)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    throw new Error('File size must be less than 10MB');
  }

  let text = '';

  if (file.type === 'application/pdf') {
    text = await extractTextFromPDF(file);
  } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    text = await extractTextFromDOCX(file);
  }

  // Validate extracted text
  if (!text || text.trim().length < 50) {
    throw new Error('Could not extract sufficient text from the file. Please ensure the file contains readable text.');
  }

  return {
    text: text.trim(),
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type
  };
}

async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let fullText = '';

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();

    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(' ');

    fullText += pageText + '\n';
  }

  return cleanExtractedText(fullText);
}

async function extractTextFromDOCX(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return cleanExtractedText(result.value);
}

function cleanExtractedText(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\f/g, '\n')
    .replace(/(\w)\n(\w)/g, '$1 $2') // Join lines broken mid-sentence
    .replace(/(\w)-\n(\w)/g, '$1-$2') // Fix hyphenated words
    .replace(/\n\n\n+/g, '\n\n') // Remove excessive blank lines
    .replace(/^Page \d+.*$/gm, '') // Remove page headers
    .replace(/^[\s]*---[\s]*$/gm, '') // Remove separator lines
    .replace(/^[\s]*\d+[\s]*$/gm, '') // Remove page numbers
    .replace(/[\x00-\x08\x0B\x0E-\x1F\x7F]/g, ' ') // Remove control characters
    .replace(/[""]/g, '"')
    .replace(/['']/g, "'")
    .replace(/[–—]/g, '-')
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n')
    .replace(/  +/g, ' ')
    .trim();
}