const { Ollama } = require('ollama');
const Subject = require('../models/Subject');
const Question = require('../models/Question');
const Answer = require('../models/Answer');

const ollama = new Ollama({ host: process.env.OLLAMA_HOST || 'http://localhost:11434' });
const MODEL = process.env.OLLAMA_MODEL || 'llama3.2';

const ALL_TOPICS = [
  'childhood', 'family', 'education', 'career',
  'relationships', 'beliefs', 'achievements', 'challenges', 'legacy',
];

async function getAnswersByTopic(subjectId) {
  const answers = await Answer.find({ subjectId }).populate('questionId');
  const byTopic = {};
  for (const topic of ALL_TOPICS) byTopic[topic] = [];
  for (const answer of answers) {
    const topic = answer.questionId?.topic;
    if (topic && byTopic[topic]) byTopic[topic].push(answer.text);
  }
  return byTopic;
}

function formatAnswersForPrompt(byTopic) {
  return ALL_TOPICS.map((topic) => {
    const entries = byTopic[topic];
    if (entries.length === 0) return `${topic}: (no information yet)`;
    return `${topic}:\n${entries.map((t) => `  - ${t}`).join('\n')}`;
  }).join('\n\n');
}

function identifyThinTopics(byTopic) {
  return ALL_TOPICS.filter((t) => byTopic[t].length < 2);
}

function extractJsonArray(raw) {
  // Try direct parse first
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    // Some models wrap in { questions: [...] } or similar
    const first = Object.values(parsed).find(Array.isArray);
    if (first) return first;
  } catch (_) {}

  // Fall back to regex extraction
  const match = raw.match(/\[[\s\S]*\]/);
  if (match) {
    try { return JSON.parse(match[0]); } catch (_) {}
  }

  return null;
}

async function generateQuestions(subjectId) {
  const subject = await Subject.findById(subjectId);
  if (!subject) throw new Error('Subject not found');

  const byTopic = await getAnswersByTopic(subjectId);
  const thinTopics = identifyThinTopics(byTopic);

  const existing = await Question.find({ subjectId }).select('text');
  const existingTexts = new Set(existing.map((q) => q.text.toLowerCase()));

  const prompt = `You are a biographical interviewer helping document someone's life story.
Here is what we know so far about ${subject.name}:

${formatAnswersForPrompt(byTopic)}

The following topics need more depth: ${thinTopics.join(', ')}

Generate 5 clarifying questions to fill the most important gaps.
Return ONLY a JSON array with no extra text, using this exact structure:
[{"topic":"<one of: ${ALL_TOPICS.join('|')}>","question":"<question text>","why":"<brief reason>"}]`;

  const response = await ollama.chat({
    model: MODEL,
    format: 'json',
    messages: [{ role: 'user', content: prompt }],
    options: { temperature: 0.7 },
  });

  const raw = response.message.content.trim();
  const parsed = extractJsonArray(raw);

  if (!parsed) throw new Error(`Could not parse JSON from model response:\n${raw}`);

  const toInsert = parsed.filter(
    (item) =>
      item.topic &&
      item.question &&
      ALL_TOPICS.includes(item.topic) &&
      !existingTexts.has(item.question.toLowerCase())
  );

  const saved = await Question.insertMany(
    toInsert.map((item) => ({
      subjectId,
      text: item.question,
      topic: item.topic,
      generatedFrom: item.why || '',
      status: 'pending',
    }))
  );

  return saved;
}

async function synthesizeStory(subjectId) {
  const subject = await Subject.findById(subjectId);
  if (!subject) throw new Error('Subject not found');

  const byTopic = await getAnswersByTopic(subjectId);
  const hasAnyAnswers = ALL_TOPICS.some((t) => byTopic[t].length > 0);

  if (!hasAnyAnswers) {
    return `No answers have been recorded yet for ${subject.name}. Complete some interview questions first.`;
  }

  const prompt = `You are a biographer. Based on the following interview answers about ${subject.name}, write a warm, flowing biographical narrative in third person. Organize it chronologically. Do not include section headers — write it as flowing prose.

Here are the answers by topic:

${formatAnswersForPrompt(byTopic)}`;

  const response = await ollama.chat({
    model: MODEL,
    messages: [{ role: 'user', content: prompt }],
    options: { temperature: 0.8 },
  });

  return response.message.content.trim();
}

module.exports = { generateQuestions, synthesizeStory };
