const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Models to try in order — if one is rate-limited, fall back to the next
const MODEL_FALLBACKS = [
  'gemini-3-flash-preview',
];
  

async function callGeminiWithFallback(prompt) {
  let lastError = null;

  for (const modelName of MODEL_FALLBACKS) {
    try {
      console.log(`geminiHelper: Trying model "${modelName}"...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      console.log(`geminiHelper: Success with model "${modelName}", response length: ${text.length}`);
      return text;
    } catch (err) {
      console.warn(`geminiHelper: Model "${modelName}" failed: ${err.message.substring(0, 150)}`);
      lastError = err;

      // Only retry with next model on rate-limit (429) or not-found (404) errors
      const isRetryable = err.message.includes('429') ||
                          err.message.includes('404') ||
                          err.message.includes('RESOURCE_EXHAUSTED') ||
                          err.message.includes('not found');

      if (!isRetryable) {
        // For non-retryable errors (auth, bad request, etc.), don't try other models
        throw err;
      }
    }
  }

  throw lastError || new Error('All Gemini models failed');
}

async function generateFlashcards(text, subject) {
  console.log('geminiHelper: generateFlashcards called');
  console.log('geminiHelper: API key exists:', !!process.env.GEMINI_API_KEY);
  console.log('geminiHelper: API key starts with:', process.env.GEMINI_API_KEY?.substring(0, 10));
  console.log('geminiHelper: text length:', text.length);
  console.log('geminiHelper: subject:', subject);

  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set in environment variables. Add it to your .env file.');
  }

  const prompt = `You are an expert study assistant. Based on the following study material about "${subject || 'the given topic'}", generate exactly 10 flashcards for exam preparation.

IMPORTANT: Return ONLY a raw JSON array. No markdown. No backticks. No explanation. No text before or after. Just the JSON array starting with [ and ending with ].

[
  {
    "question": "What is...",
    "answer": "The answer is...",
    "difficulty": "easy"
  }
]

difficulty must be exactly one of: easy, medium, hard

Study material:
${text.slice(0, 7000)}`;

  const responseText = await callGeminiWithFallback(prompt);

  console.log('geminiHelper: raw response length:', responseText.length);
  console.log('geminiHelper: raw response first 300 chars:', responseText.substring(0, 300));

  // Aggressive cleaning — strip any markdown fences
  let cleaned = responseText
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();

  // Find the JSON array — extract just the [...] part
  const startIndex = cleaned.indexOf('[');
  const endIndex = cleaned.lastIndexOf(']');

  if (startIndex === -1 || endIndex === -1) {
    console.error('geminiHelper: No JSON array found in response');
    console.error('geminiHelper: Full response:', responseText);
    throw new Error('Gemini did not return a valid JSON array');
  }

  const jsonString = cleaned.substring(startIndex, endIndex + 1);
  console.log('geminiHelper: extracted JSON length:', jsonString.length);

  const parsed = JSON.parse(jsonString);
  console.log('geminiHelper: parsed successfully, cards:', parsed.length);

  // Validate each card has required fields
  const valid = parsed.filter(card => card.question && card.answer).map(card => ({
    question: card.question,
    answer: card.answer,
    difficulty: ['easy', 'medium', 'hard'].includes(card.difficulty) ? card.difficulty : 'medium',
  }));

  if (valid.length === 0) throw new Error('Gemini returned cards with missing fields');

  console.log('geminiHelper: returning', valid.length, 'valid flashcards');
  return valid;
}

async function generateSummary(text, subject) {
  console.log('geminiHelper: generateSummary called');

  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set in environment variables');
  }

  const prompt = `Summarize this ${subject || 'study material'} in 5 bullet points. Be concise. Return plain text only.\n\n${text.slice(0, 7000)}`;
  return await callGeminiWithFallback(prompt);
}

async function generateRoadmap(resumeText, jobRole) {
  console.log('geminiHelper: generateRoadmap called');
  console.log('geminiHelper: resumeText length:', resumeText.length);
  console.log('geminiHelper: jobRole:', jobRole);

  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set in environment variables. Add it to your .env file.');
  }

  if (!resumeText || !jobRole) {
    throw new Error('resumeText and jobRole are required');
  }

  const prompt = `You are a career development expert. Analyze the following resume and create a personalized learning roadmap for the target job role.

Resume Text:
${resumeText.slice(0, 8000)}

Target Job Role: ${jobRole}

IMPORTANT: Return ONLY valid JSON with this exact structure. No markdown. No backticks. No explanation. Just the JSON object.

{
  "skillsExtracted": ["skill1", "skill2", "skill3"],
  "missingSkills": ["skillA", "skillB", "skillC"],
  "suggestedProjects": ["project1", "project2", "project3"],
  "roadmap": "Detailed step-by-step learning plan with timeline",
  "estimatedTimeframe": "X months",
  "fitPercentage": 85
}

- skillsExtracted: Array of current skills from resume
- missingSkills: Array of skills needed for the job role but missing from resume
- suggestedProjects: Array of practical projects to build missing skills
- roadmap: Comprehensive learning plan with milestones
- estimatedTimeframe: Realistic time estimate (e.g., "3-6 months")
- fitPercentage: Number 0-100 indicating current fit for the role`;

  const responseText = await callGeminiWithFallback(prompt);

  console.log('geminiHelper: roadmap raw response length:', responseText.length);
  console.log('geminiHelper: roadmap raw response first 300 chars:', responseText.substring(0, 300));

  // Clean the response
  let cleaned = responseText
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();

  // Find the JSON object
  const startIndex = cleaned.indexOf('{');
  const endIndex = cleaned.lastIndexOf('}');

  if (startIndex === -1 || endIndex === -1) {
    console.error('geminiHelper: No JSON object found in roadmap response');
    console.error('geminiHelper: Full response:', responseText);
    throw new Error('Gemini did not return a valid JSON object for roadmap');
  }

  const jsonString = cleaned.substring(startIndex, endIndex + 1);
  console.log('geminiHelper: extracted roadmap JSON length:', jsonString.length);

  const parsed = JSON.parse(jsonString);
  console.log('geminiHelper: roadmap parsed successfully');

  // Validate required fields
  const requiredFields = ['skillsExtracted', 'missingSkills', 'suggestedProjects', 'roadmap', 'estimatedTimeframe', 'fitPercentage'];
  for (const field of requiredFields) {
    if (!(field in parsed)) {
      throw new Error(`Roadmap response missing required field: ${field}`);
    }
  }

  // Ensure arrays are arrays and fitPercentage is a number
  if (!Array.isArray(parsed.skillsExtracted) || !Array.isArray(parsed.missingSkills) || !Array.isArray(parsed.suggestedProjects)) {
    throw new Error('Roadmap response arrays are not properly formatted');
  }

  if (typeof parsed.fitPercentage !== 'number' || parsed.fitPercentage < 0 || parsed.fitPercentage > 100) {
    throw new Error('fitPercentage must be a number between 0 and 100');
  }

  console.log('geminiHelper: returning valid roadmap');
  return parsed;
}

module.exports = { generateFlashcards, generateSummary, generateRoadmap };
