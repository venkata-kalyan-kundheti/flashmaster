const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Models to try in order — if one is rate-limited, fall back to the next
const MODEL_FALLBACKS = [
  'gemini-3-flash-preview',
];
  

function extractJsonBlock(responseText) {
  const cleaned = responseText
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();

  const startIndex = cleaned.indexOf('{');
  const endIndex = cleaned.lastIndexOf('}');

  if (startIndex === -1 || endIndex === -1) {
    throw new Error('Gemini did not return a valid JSON object');
  }

  return cleaned.substring(startIndex, endIndex + 1);
}

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

function normalizeTopicLabel(topicValue, index) {
  if (typeof topicValue !== 'string') return `Topic ${index + 1}`;

  const words = topicValue
    .replace(/[^a-zA-Z0-9\s-]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (words.length === 0) return `Topic ${index + 1}`;

  return words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

async function generateFlashcards(text, subject) {
  console.log('geminiHelper: generateFlashcards called');
  console.log('geminiHelper: API key exists:', !!process.env.GEMINI_API_KEY);
  console.log('geminiHelper: text length:', text.length);
  console.log('geminiHelper: subject:', subject);

  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set in environment variables. Add it to your .env file.');
  }

  const prompt = `You are an expert study assistant and professor. Based on the following study material about "${subject}", generate exactly 10 detailed flashcards for exam preparation.

TOPIC NAME RULES:
- Generate a clear topic name for each flashcard in a "topic" field.
- Each topic must be specific, concise, and exam-relevant.
- Each topic must be exactly 1 or 2 words only.
- Do not use full questions or long phrases in the topic.
- All 10 topics should be distinct.

CRITICAL FORMATTING RULES FOR ANSWERS:
- Each answer MUST be structured as detailed bullet points with sub-points.
- Use "• " (bullet) for main points. Each main point should be a detailed explanation of 1-2 sentences.
- Use "  - " (indented dash) for sub-points that expand on the main point with examples, details, or clarifications.
- Each answer MUST have 5 to 8 main bullet points.
- Each main point should have 1-3 sub-points where relevant to add depth.
- Do NOT write short fragment-style points like "No node points to NULL". Instead write full explanatory sentences like "• Unlike singly linked lists, no node in a circular linked list points to NULL, because the last node connects back to the first node, forming a continuous loop."
- Make every point informative enough that a student can understand the concept just from reading the point.
- Do NOT write paragraph-style answers. Use the bullet + sub-point structure.

Example answer format:
"• A linked list is a linear data structure where each element (called a node) contains both data and a reference to the next node in the sequence\\n  - This makes linked lists dynamic in size, unlike arrays which have a fixed size\\n  - Each node is allocated separately in memory, so they don't need contiguous memory blocks\\n• Insertion and deletion operations are highly efficient at O(1) time complexity when done at the head\\n  - This is because only the pointer needs to be updated, unlike arrays where elements must be shifted\\n• Traversal requires O(n) time since you must visit each node sequentially from the head"

IMPORTANT: Return ONLY a raw JSON array. No markdown. No backticks. No explanation. No text before or after. Just the JSON array starting with [ and ending with ].

[
  {
    "topic": "Core Concept Topic",
    "question": "What is...",
    "answer": "• Detailed first key point with full explanation\\n  - Supporting sub-detail that adds depth\\n  - Another relevant sub-detail\\n• Detailed second key point explaining the concept clearly\\n  - Example or clarification\\n• Third detailed point with enough context for understanding",
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

  // Validate each card has required fields and normalize topic labels
  const valid = parsed.filter(card => card.question && card.answer).map((card, index) => {
    const normalizedTopic = normalizeTopicLabel(card.topic, index);

    return {
      topic: normalizedTopic,
      question: card.question,
      answer: card.answer,
      difficulty: ['easy', 'medium', 'hard'].includes(card.difficulty) ? card.difficulty : 'medium',
    };
  });

  if (valid.length === 0) throw new Error('Gemini returned cards with missing fields');

  console.log('geminiHelper: returning', valid.length, 'valid flashcards');
  return valid;
}

async function generateSummary(text, subject) {
  console.log('geminiHelper: generateSummary called');

  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set in environment variables');
  }

  const prompt = `Summarize this ${subject || 'study material'} in 8 bullet points. Be concise. Return plain text only.\n\n${text.slice(0, 7000)}`;
  return await callGeminiWithFallback(prompt);
}

async function generateStudyPlan(subject, examDate, dailyStudyHours, documentText) {
  console.log('geminiHelper: generateStudyPlan called');

  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set in environment variables');
  }

  const today = new Date().toISOString().split('T')[0];

  const prompt = `You are an expert learning planner.

Analyze the following study material text and create a practical study schedule for this student:
- Subject: ${subject}
- Current Date: ${today}
- Exam date: ${examDate}
- Daily study hours: ${dailyStudyHours}

Return ONLY a raw JSON object with this exact shape:
{
  "chapters": ["Topic 1 (X hours)", "Topic 2 (Y hours)"],
  "schedule": [
    {
      "date": "YYYY-MM-DD",
      "tasks": ["Read Topic 1 for X hours", "Practice questions"]
    }
  ]
}

Rules:
- Generate a schedule starting from ${today} up to the exam date (${examDate}).
- Make sure there is a sequential progression of days. Do NOT skip months or years.
- tasks must be concise and specific, indicating how much time to spend based on the document's topics.
- Include revision tasks near the exam date.
- Do not use markdown or extra text outside JSON.

Study Material Document Text:
${documentText.slice(0, 15000)}
`;

  const responseText = await callGeminiWithFallback(prompt);
  const jsonString = extractJsonBlock(responseText);
  const parsed = JSON.parse(jsonString);

  const normalizedChapters = Array.isArray(parsed.chapters)
    ? parsed.chapters.filter((c) => typeof c === 'string' && c.trim().length > 0).map((c) => c.trim())
    : [];

  const normalizedSchedule = Array.isArray(parsed.schedule)
    ? parsed.schedule
        .filter((day) => day && typeof day === 'object')
        .map((day) => ({
          date: day.date,
          tasks: Array.isArray(day.tasks)
            ? day.tasks.filter((task) => typeof task === 'string' && task.trim().length > 0).map((task) => task.trim())
            : [],
        }))
        .filter((day) => day.date && day.tasks.length > 0)
    : [];

  if (normalizedSchedule.length === 0) {
    throw new Error('Gemini returned an invalid study plan schedule');
  }

  return {
    chapters: normalizedChapters,
    schedule: normalizedSchedule,
  };
}

module.exports = { generateFlashcards, generateSummary, generateStudyPlan }; 
