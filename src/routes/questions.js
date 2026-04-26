const express = require('express');
const router = express.Router();
const Question = require('../models/Question');

// GET /questions/:subjectId/next
router.get('/:subjectId/next', async (req, res) => {
  try {
    const question = await Question.findOne({
      subjectId: req.params.subjectId,
      status: 'pending',
    }).sort({ createdAt: 1 });

    if (!question) return res.json(null);
    res.json(question);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
