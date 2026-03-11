const express = require('express');
const cors = require('cors');
const analyzeRoute = require('./routes/analyze');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json({ limit: '1mb' }));

app.use('/api', analyzeRoute);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

app.listen(PORT, () => {
  console.log(`Algo Scope backend running on port ${PORT}`);
});
