const express = require('express');
const router = express.Router();
const { generateQuestions } = require('../services/agentService');

// POST /agent/generate-questions/:subjectId
router.post('/generate-questions/:subjectId', async (req, res) => {
  try {
    const questions = await generateQuestions(req.params.subjectId);
    res.json({ generated: questions.length, questions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
