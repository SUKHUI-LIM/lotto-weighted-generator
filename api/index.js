const express = require('express');
const cors = require('cors');
const { getLatestDraw, getLottoStats, fetchDraw } = require('../server/lottoService');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.get('/api/lotto/latest', async (req, res) => {
  try {
    const data = await getLatestDraw();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/lotto/round/:round', async (req, res) => {
  try {
    const data = await fetchDraw(req.params.round);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/lotto/stats', async (req, res) => {
  try {
    const count = parseInt(req.query.count, 10) || 30;
    const stats = await getLottoStats(count);
    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = app;
