const express = require('express');
const cors = require('cors');
const { getLatestDraw, getLottoStats, fetchDraw } = require('./lottoService');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// 헬스체크
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// 최신 회차 당첨 번호 조회
app.get('/api/lotto/latest', async (req, res) => {
  try {
    const data = await getLatestDraw();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 특정 회차 조회
app.get('/api/lotto/round/:round', async (req, res) => {
  try {
    const data = await fetchDraw(req.params.round);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 최근 N회차(기본 30회, 20~50회) 통계 데이터 조회
app.get('/api/lotto/stats', async (req, res) => {
  try {
    const count = parseInt(req.query.count, 10) || 30;
    const stats = await getLottoStats(count);
    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`[Lotto Server] Server running on http://localhost:${PORT}`);
});
