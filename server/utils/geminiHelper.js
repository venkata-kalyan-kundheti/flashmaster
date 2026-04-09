const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateFlashcards(text, subject) {
  const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });

  const prompt = `
You are an expert study assistant. Based on the following study material about "${subject}", 
generate exactly 10 high-quality flashcards for exam preparation.

Return ONLY a valid JSON array. No markdown, no explanation, no backticks, no code fences.
Format:
[
  {
    "question": "Clear, specific question",
    "answer": "Concise, accurate answer (2-4 sentences max)",
    "difficulty": "easy" | "medium" | "hard"
  }
]

Study material:
${text.slice(0, 7000)}
`;

  const result = await model.generateContent(prompt);
  const response = result.response.text();

  // Strip any accidental markdown fences and clean up
  let clean = response.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

  // Try to extract JSON array if there's extra text around it
  const jsonMatch = clean.match(/\[[\s\S]*\]/);
  if (jsonMatch) {
    clean = jsonMatch[0];
  }

  try {
    const parsed = JSON.parse(clean);
    if (!Array.isArray(parsed)) {
      throw new Error('Gemini response is not an array');
    }
    return parsed;
  } catch (parseErr) {
    console.error('[Gemini] Failed to parse flashcards JSON:', clean.substring(0, 200));
    throw new Error('Failed to parse Gemini flashcards response as JSON');
  }
}

async function generateSummary(text, subject) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  const prompt = `Summarize the following ${subject} study material in exactly 5 bullet points. Be concise.\n\n${text.slice(0, 7000)}`;
  const result = await model.generateContent(prompt);
  return result.response.text();
}

module.exports = { generateFlashcards, generateSummary };
