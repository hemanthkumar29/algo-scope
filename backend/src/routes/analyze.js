const express = require('express');
const router = express.Router();
const { analyzeCode } = require('../analyzer');

router.post('/analyze', async (req, res) => {
  try {
    const { language, code } = req.body;

    if (!language || !code) {
      return res.status(400).json({
        error: 'Both "language" and "code" fields are required.',
      });
    }

    if (code.length > 50000) {
      return res.status(400).json({
        error: 'Code exceeds maximum length of 50,000 characters.',
      });
    }

    const result = await analyzeCode(language, code);
    res.json(result);
  } catch (err) {
    console.error('Analysis error:', err);
    res.status(500).json({
      error: 'Analysis failed. Please try again.',
    });
  }
});

module.exports = router;
