const pdfParse = require('pdf-parse');
const fs = require('fs');

async function extractTextFromPDF(filePath) {
  try {
    console.log(`Starting to read PDF file at: ${filePath}`);
    const buffer = fs.readFileSync(filePath);
    console.log(`Read buffer of length: ${buffer.length}`);
    const data = await pdfParse(buffer);
    console.log(`Successfully parsed PDF, text length: ${data.text.length}`);
    return data.text.slice(0, 8000); // limit to avoid token overflow
  } catch (err) {
    console.error(`Error in extractTextFromPDF for filePath: ${filePath}`, err);
    throw err;
  }
}

module.exports = { extractTextFromPDF };
