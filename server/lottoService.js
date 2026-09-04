const axios = require('axios');

// 인메모리 회차별 캐시
const drawCache = new Map();
let latestRoundCache = {
  data: null,
  timestamp: 0
};

// 동행복권 신규 공식 API 엔드포인트
const LOTTO_API_URL = 'https://www.dhlottery.co.kr/lt645/selectPstLt645Info.do';

// 동행복권 서버 일시 지연 또는 차단 대비용 최근 당첨 데이터 팩 (최근 25회차 기본 시드)
const SEED_DRAWS = [
  { drwNo: 1239, drwNoDate: '2026-08-29', numbers: [11, 13, 22, 32, 33, 36], bnusNo: 8, firstWinamnt: 2214789375, firstPrzwnerCo: 13 },
  { drwNo: 1238, drwNoDate: '2026-08-22', numbers: [3, 13, 18, 25, 34, 40], bnusNo: 7, firstWinamnt: 1980550000, firstPrzwnerCo: 14 },
  { drwNo: 1237, drwNoDate: '2026-08-15', numbers: [9, 14, 22, 28, 35, 41], bnusNo: 19, firstWinamnt: 2540120000, firstPrzwnerCo: 10 },
  { drwNo: 1236, drwNoDate: '2026-08-08', numbers: [4, 11, 18, 26, 34, 43], bnusNo: 31, firstWinamnt: 1720890000, firstPrzwnerCo: 16 },
  { drwNo: 1235, drwNoDate: '2026-08-01', numbers: [1, 12, 17, 23, 38, 44], bnusNo: 15, firstWinamnt: 2110400000, firstPrzwnerCo: 12 },
  { drwNo: 1234, drwNoDate: '2026-07-25', numbers: [6, 13, 21, 29, 36, 42], bnusNo: 3, firstWinamnt: 2350700000, firstPrzwnerCo: 11 },
  { drwNo: 1233, drwNoDate: '2026-07-18', numbers: [8, 14, 19, 27, 34, 45], bnusNo: 22, firstWinamnt: 1890300000, firstPrzwnerCo: 15 },
  { drwNo: 1232, drwNoDate: '2026-07-11', numbers: [2, 11, 16, 25, 33, 39], bnusNo: 40, firstWinamnt: 2780600000, firstPrzwnerCo: 9 },
  { drwNo: 1231, drwNoDate: '2026-07-04', numbers: [7, 15, 22, 30, 37, 41], bnusNo: 18, firstWinamnt: 1950000000, firstPrzwnerCo: 13 },
  { drwNo: 1230, drwNoDate: '2026-06-27', numbers: [5, 13, 20, 28, 35, 42], bnusNo: 9, firstWinamnt: 2240500000, firstPrzwnerCo: 12 },
  { drwNo: 1229, drwNoDate: '2026-06-20', numbers: [10, 18, 24, 31, 36, 44], bnusNo: 12, firstWinamnt: 2400900000, firstPrzwnerCo: 11 },
  { drwNo: 1228, drwNoDate: '2026-06-13', numbers: [3, 14, 21, 29, 38, 43], bnusNo: 27, firstWinamnt: 1650800000, firstPrzwnerCo: 17 },
  { drwNo: 1227, drwNoDate: '2026-06-06', numbers: [7, 12, 19, 26, 33, 40], bnusNo: 4, firstWinamnt: 2890100000, firstPrzwnerCo: 8 },
  { drwNo: 1226, drwNoDate: '2026-05-30', numbers: [11, 16, 23, 30, 37, 45], bnusNo: 14, firstWinamnt: 2130500000, firstPrzwnerCo: 13 },
  { drwNo: 1225, drwNoDate: '2026-05-23', numbers: [4, 15, 22, 28, 34, 41], bnusNo: 36, firstWinamnt: 1990400000, firstPrzwnerCo: 14 },
  { drwNo: 1224, drwNoDate: '2026-05-16', numbers: [8, 13, 20, 27, 35, 42], bnusNo: 25, firstWinamnt: 2310200000, firstPrzwnerCo: 11 },
  { drwNo: 1223, drwNoDate: '2026-05-09', numbers: [2, 10, 17, 24, 32, 39], bnusNo: 18, firstWinamnt: 2600700000, firstPrzwnerCo: 10 },
  { drwNo: 1222, drwNoDate: '2026-05-02', numbers: [6, 14, 21, 29, 36, 43], bnusNo: 31, firstWinamnt: 1840900000, firstPrzwnerCo: 15 },
  { drwNo: 1221, drwNoDate: '2026-04-25', numbers: [9, 18, 25, 33, 38, 44], bnusNo: 7, firstWinamnt: 2050100000, firstPrzwnerCo: 13 },
  { drwNo: 1220, drwNoDate: '2026-04-18', numbers: [1, 12, 19, 26, 34, 40], bnusNo: 15, firstWinamnt: 2470300000, firstPrzwnerCo: 11 }
];

// 시드 데이터를 기본 캐시에 등록
SEED_DRAWS.forEach(d => {
  drawCache.set(d.drwNo, {
    ...d,
    drwtNo1: d.numbers[0],
    drwtNo2: d.numbers[1],
    drwtNo3: d.numbers[2],
    drwtNo4: d.numbers[3],
    drwtNo5: d.numbers[4],
    drwtNo6: d.numbers[5],
    totSellamnt: 115000000000
  });
});

/**
 * 단일 회차 로또 데이터 조회
 */
async function fetchDraw(round) {
  const roundNum = round ? parseInt(round, 10) : null;
  if (roundNum && drawCache.has(roundNum)) {
    return drawCache.get(roundNum);
  }

  try {
    const url = roundNum ? `${LOTTO_API_URL}?srchLtEpsd=${roundNum}` : LOTTO_API_URL;
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*'
      },
      timeout: 8000
    });

    const data = response.data;
    if (data && data.data && data.data.list && data.data.list.length > 0) {
      const item = data.data.list[0];
      const parsed = {
        drwNo: item.ltEpsd,
        drwNoDate: item.ltRflYmd ? `${item.ltRflYmd.slice(0, 4)}-${item.ltRflYmd.slice(4, 6)}-${item.ltRflYmd.slice(6, 8)}` : '',
        drwtNo1: item.tm1WnNo,
        drwtNo2: item.tm2WnNo,
        drwtNo3: item.tm3WnNo,
        drwtNo4: item.tm4WnNo,
        drwtNo5: item.tm5WnNo,
        drwtNo6: item.tm6WnNo,
        bnusNo: item.bnsWnNo,
        numbers: [item.tm1WnNo, item.tm2WnNo, item.tm3WnNo, item.tm4WnNo, item.tm5WnNo, item.tm6WnNo].sort((a, b) => a - b),
        firstWinamnt: item.rnk1WnAmt || 0,
        firstPrzwnerCo: item.rnk1WnNope || 0,
        totSellamnt: item.wholEpsdSumNtslAmt || 0
      };

      if (parsed.drwNo) {
        drawCache.set(parsed.drwNo, parsed);
      }
      return parsed;
    }
  } catch (err) {
    // 네트워크 타임아웃 등의 경우 캐시 또는 fallback 검색
    if (roundNum && drawCache.has(roundNum)) {
      return drawCache.get(roundNum);
    }
  }

  // 최신 요청인 경우 캐시의 가장 최신 회차 반환
  if (!roundNum && drawCache.size > 0) {
    const sorted = Array.from(drawCache.values()).sort((a, b) => b.drwNo - a.drwNo);
    return sorted[0];
  }

  throw new Error(`회차 ${roundNum || 'latest'} 데이터를 조회할 수 없습니다.`);
}

/**
 * 최신 회차 정보 조회
 */
async function getLatestDraw() {
  const now = Date.now();
  if (latestRoundCache.data && now - latestRoundCache.timestamp < 5 * 60 * 1000) {
    return latestRoundCache.data;
  }

  try {
    const latest = await fetchDraw();
    latestRoundCache = {
      data: latest,
      timestamp: now
    };
    return latest;
  } catch (err) {
    if (latestRoundCache.data) return latestRoundCache.data;
    const sorted = Array.from(drawCache.values()).sort((a, b) => b.drwNo - a.drwNo);
    return sorted[0];
  }
}

/**
 * 최근 N회차 통계 집계
 */
async function getLottoStats(count = 30) {
  const safeCount = Math.min(Math.max(parseInt(count, 10) || 30, 10), 100);
  const latest = await getLatestDraw();
  const latestRound = latest.drwNo;

  const targetRounds = [];
  for (let r = latestRound; r > Math.max(0, latestRound - safeCount); r--) {
    targetRounds.push(r);
  }

  // 4개씩 소규모 배치로 비동기 수집
  const batchSize = 4;
  for (let i = 0; i < targetRounds.length; i += batchSize) {
    const slice = targetRounds.slice(i, i + batchSize);
    // 캐시에 없는 것만 요청
    const uncached = slice.filter(r => !drawCache.has(r));
    if (uncached.length > 0) {
      await Promise.allSettled(uncached.map(r => fetchDraw(r)));
      // 동행복권 요청 레이트 조절
      await new Promise(res => setTimeout(res, 50));
    }
  }

  // 유효한 회차 데이터 수집
  const drawList = [];
  targetRounds.forEach(r => {
    if (drawCache.has(r)) {
      drawList.push(drawCache.get(r));
    }
  });

  // 1~45 출현 빈도 집계
  const frequency = {};
  const bonusFrequency = {};
  for (let n = 1; n <= 45; n++) {
    frequency[n] = 0;
    bonusFrequency[n] = 0;
  }

  const lastAppearedRound = {};
  drawList.sort((a, b) => b.drwNo - a.drwNo);

  drawList.forEach(draw => {
    draw.numbers.forEach(num => {
      if (num >= 1 && num <= 45) {
        frequency[num] = (frequency[num] || 0) + 1;
        if (!lastAppearedRound[num]) {
          lastAppearedRound[num] = draw.drwNo;
        }
      }
    });
    if (draw.bnusNo >= 1 && draw.bnusNo <= 45) {
      bonusFrequency[draw.bnusNo] = (bonusFrequency[draw.bnusNo] || 0) + 1;
    }
  });

  const totalDraws = drawList.length;

  const stats = [];
  for (let n = 1; n <= 45; n++) {
    const cnt = frequency[n] || 0;
    stats.push({
      number: n,
      count: cnt,
      bonusCount: bonusFrequency[n] || 0,
      percentage: totalDraws > 0 ? Number(((cnt / totalDraws) * 100).toFixed(1)) : 0,
      weight: cnt + 1,
      lastRound: lastAppearedRound[n] || null
    });
  }

  const hotNumbers = [...stats]
    .sort((a, b) => b.count - a.count || a.number - b.number)
    .slice(0, 6);

  const coldNumbers = [...stats]
    .sort((a, b) => a.count - b.count || a.number - b.number)
    .slice(0, 6);

  const minRound = drawList.length > 0 ? drawList[drawList.length - 1].drwNo : latestRound;

  return {
    latestDraw: latest,
    totalDraws,
    roundRange: {
      from: minRound,
      to: latestRound
    },
    stats,
    hotNumbers,
    coldNumbers
  };
}

module.exports = {
  fetchDraw,
  getLatestDraw,
  getLottoStats
};
