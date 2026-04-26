const Question = require('./models/Question');
const Subject = require('./models/Subject');

const PREMADE_QUESTIONS = [
  { text: 'Where did you grow up, and what was it like?', topic: 'childhood' },
  { text: 'What is your earliest memory?', topic: 'childhood' },
  { text: 'What games or activities did you love as a child?', topic: 'childhood' },
  { text: 'Who were the most important people in your family growing up?', topic: 'family' },
  { text: 'How would you describe your relationship with your parents?', topic: 'family' },
  { text: 'Do you have siblings? What was your relationship with them like?', topic: 'family' },
  { text: 'What school did you attend, and what stands out most about that time?', topic: 'education' },
  { text: 'Who was a teacher that had a lasting impact on you?', topic: 'education' },
  { text: 'What was your favourite subject, and why?', topic: 'education' },
  { text: 'How did you end up in the career path you chose?', topic: 'career' },
  { text: 'What was your first job, and what did you learn from it?', topic: 'career' },
  { text: 'What has been the most meaningful work you have done in your life?', topic: 'career' },
  { text: 'How did you meet the most important person in your life?', topic: 'relationships' },
  { text: 'Who is a friend who has meant the most to you, and why?', topic: 'relationships' },
  { text: 'What has love taught you over the years?', topic: 'relationships' },
  { text: 'What values guide the way you live your life?', topic: 'beliefs' },
  { text: 'Has your faith or spirituality shaped who you are?', topic: 'beliefs' },
  { text: 'What do you believe is the purpose of a good life?', topic: 'beliefs' },
  { text: 'What accomplishment are you most proud of?', topic: 'achievements' },
  { text: 'Was there a moment when you surprised yourself with what you could do?', topic: 'achievements' },
  { text: 'What is something you built, created, or contributed that you hope endures?', topic: 'achievements' },
  { text: 'What has been the hardest period of your life, and how did you get through it?', topic: 'challenges' },
  { text: 'Is there a mistake you made that taught you something important?', topic: 'challenges' },
  { text: 'What would you tell your younger self about facing adversity?', topic: 'challenges' },
  { text: 'What do you hope people remember about you?', topic: 'legacy' },
  { text: 'What lessons do you most want to pass on to the next generation?', topic: 'legacy' },
  { text: 'If you could leave one piece of wisdom behind, what would it be?', topic: 'legacy' },
];

async function seedPremadeQuestions() {
  const subjects = await Subject.find({});
  for (const subject of subjects) {
    const existing = await Question.countDocuments({ subjectId: subject._id });
    if (existing > 0) continue;

    const questions = PREMADE_QUESTIONS.map((q) => ({
      subjectId: subject._id,
      text: q.text,
      topic: q.topic,
      generatedFrom: 'seed',
    }));
    await Question.insertMany(questions);
    console.log(`Seeded ${questions.length} questions for subject "${subject.name}"`);
  }
}

module.exports = { seedPremadeQuestions };
