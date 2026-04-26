const express = require('express');
const router = express.Router();
const { synthesizeStory } = require('../services/agentService');

// GET /story/:subjectId
router.get('/:subjectId', async (req, res) => {
  try {
    const narrative = await synthesizeStory(req.params.subjectId);
    res.json({ story: narrative });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
