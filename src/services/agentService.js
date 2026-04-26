const Anthropic = require('@anthropic-ai/sdk');
const Subject = require('../models/Subject');
const Question = require('../models/Question');
const Answer = require('../models/Answer');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

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
    if (topic && byTopic[topic]) {
      byTopic[topic].push(answer.text);
    }
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

async function generateQuestions(subjectId) {
  const subject = await Subject.findById(subjectId);
  if (!subject) throw new Error('Subject not found');

  const byTopic = await getAnswersByTopic(subjectId);
  const thinTopics = identifyThinTopics(byTopic);

  // Fetch existing question texts to avoid duplicates
  const existing = await Question.find({ subjectId }).select('text');
  const existingTexts = new Set(existing.map((q) => q.text.toLowerCase()));

  const prompt = `You are a biographical interviewer helping document someone's life story.
Here is what we know so far about ${subject.name}:

${formatAnswersForPrompt(byTopic)}

The following topics need more depth: ${thinTopics.join(', ')}

Generate 5 clarifying questions to fill the most important gaps.
Return ONLY valid JSON array: [{ "topic": "<topic>", "question": "<question text>", "why": "<brief reason>" }]`;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  });

  const raw = message.content[0].text.trim();

  // Extract JSON array even if Claude adds surrounding text
  const match = raw.match(/\[[\s\S]*\]/);
  if (!match) throw new Error('Claude did not return a JSON array');

  const parsed = JSON.parse(match[0]);

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

  const prompt = `You are a biographer. Based on the following interview answers about ${subject.name}, write a warm, flowing biographical narrative in third person. Organize it chronologically. Here are the answers by topic:

${formatAnswersForPrompt(byTopic)}

Write a cohesive biographical narrative. Do not include section headers — write it as flowing prose.`;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }],
  });

  return message.content[0].text.trim();
}

module.exports = { generateQuestions, synthesizeStory };
