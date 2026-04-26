const express = require('express');
const router = express.Router();
const Answer = require('../models/Answer');
const Question = require('../models/Question');
const { generateQuestions } = require('../services/agentService');

// POST /answers
router.post('/', async (req, res) => {
  try {
    const { questionId, subjectId, answeredBy, text } = req.body;

    const answer = await Answer.create({ questionId, subjectId, answeredBy, text });

    await Question.findByIdAndUpdate(questionId, { status: 'answered' });

    // Trigger async question generation to fill remaining gaps
    generateQuestions(subjectId).catch((err) =>
      console.error('Question generation after answer failed:', err)
    );

    res.status(201).json(answer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
