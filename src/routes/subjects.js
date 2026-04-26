const express = require('express');
const router = express.Router();
const Subject = require('../models/Subject');
const { generateQuestions } = require('../services/agentService');

// POST /subjects
router.post('/', async (req, res) => {
  try {
    const { name, dob, birthplace } = req.body;
    const subject = await Subject.create({ name, dob, birthplace });
    // Seed initial questions after creating a subject
    generateQuestions(subject._id).catch((err) =>
      console.error('Initial question generation failed:', err)
    );
    res.status(201).json(subject);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /subjects/:id
router.get('/:id', async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) return res.status(404).json({ error: 'Subject not found' });
    res.json(subject);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
