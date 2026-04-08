const express = require('express');
const { ActionSchema } = require('../env/schemas');
const EnvLogic = require('../env/logic');

const router = express.Router();
const env = new EnvLogic();

const sessionId = "session_" + Date.now();

router.get('/state', (req, res) => {
  res.json(env.state());
});

router.post('/reset', (req, res) => {
  const state = env.reset();
  res.json(state);
});

router.post('/step', async (req, res) => {
  try {
    const action = ActionSchema.parse(req.body);
    const previousState = env.state();

    // Skipped DB logging locally
    const result = env.step(action);
    res.json(result);
  } catch (err) {
    if (err.name === 'ZodError') {
      res.status(400).json({ error: 'Invalid action format', details: err.errors });
    } else {
      res.status(500).json({ error: 'Internal server error', details: err.message });
    }
  }
});

module.exports = router;
