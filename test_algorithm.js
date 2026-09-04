const assert = require('assert');

// 가중치 추첨 알고리즘 함수
function generateSingleGame({
  fixedNumbers = [],
  excludedNumbers = [],
  weightMap = {},
  baseWeight = 1
} = {}) {
  const fixedSet = new Set(fixedNumbers.filter(n => n >= 1 && n <= 45));
  const excludedSet = new Set(excludedNumbers.filter(n => n >= 1 && n <= 45));
  const fixedList = Array.from(fixedSet).slice(0, 5);
  const safeExcludedSet = new Set([...excludedSet].filter(n => !fixedSet.has(n)));

  const result = [...fixedList];
  const candidates = [];
  for (let n = 1; n <= 45; n++) {
    if (!fixedSet.has(n) && !safeExcludedSet.has(n)) {
      const weight = (weightMap[n] !== undefined ? weightMap[n] : 0) + baseWeight;
      candidates.push({
        number: n,
        weight: Math.max(0.1, weight)
      });
    }
  }

  const neededCount = 6 - result.length;
  for (let step = 0; step < neededCount; step++) {
    if (candidates.length === 0) break;
    const totalWeight = candidates.reduce((sum, item) => sum + item.weight, 0);
    let rand = Math.random() * totalWeight;
    let selectedIndex = -1;
    for (let i = 0; i < candidates.length; i++) {
      rand -= candidates[i].weight;
      if (rand <= 0) {
        selectedIndex = i;
        break;
      }
    }
    if (selectedIndex === -1) {
      selectedIndex = candidates.length - 1;
    }
    const [selected] = candidates.splice(selectedIndex, 1);
    result.push(selected.number);
  }

  return result.sort((a, b) => a - b);
}

function generateFiveGames(options = {}) {
  const labels = ['A', 'B', 'C', 'D', 'E'];
  return labels.map(label => ({
    label,
    numbers: generateSingleGame(options)
  }));
}

console.log('=== 가중치 로또 알고리즘 1,000회 시뮬레이션 검증 시작 ===\n');

const testFixed = [7, 14, 21]; // 3개 고정
const testExcluded = [1, 2, 3, 4, 5, 41, 42, 43, 44, 45]; // 10개 제외
const testWeightMap = {
  7: 10,
  14: 8,
  21: 9,
  28: 15, // 높은 가중치
  35: 12, // 높은 가중치
  10: 0,  // 낮은 가중치
  11: 0   // 낮은 가중치
};

let totalRuns = 1000;
let passCount = 0;
const numberFrequency = {};
for (let i = 1; i <= 45; i++) numberFrequency[i] = 0;

for (let r = 0; r < totalRuns; r++) {
  const games = generateFiveGames({
    fixedNumbers: testFixed,
    excludedNumbers: testExcluded,
    weightMap: testWeightMap,
    baseWeight: 1
  });

  // 1. 게임 5세트 생성 확인
  assert.strictEqual(games.length, 5, '게임 세트는 5개(A~E)여야 합니다.');

  games.forEach((game, idx) => {
    // 2. 각 게임은 중복 없는 6개 번호여야 함
    assert.strictEqual(game.numbers.length, 6, '게임당 번호는 6개여야 합니다.');
    const uniqueSet = new Set(game.numbers);
    assert.strictEqual(uniqueSet.size, 6, '게임 내 중복 번호가 없어야 합니다.');

    // 3. 오름차순 정렬 확인
    for (let k = 0; k < game.numbers.length - 1; k++) {
      assert.ok(game.numbers[k] < game.numbers[k + 1], '번호는 오름차순 정렬되어야 합니다.');
    }

    // 4. 고정 번호 포함 확인
    testFixed.forEach(f => {
      assert.ok(game.numbers.includes(f), `고정 번호 ${f}는 게임에 반드시 포함되어야 합니다.`);
    });

    // 5. 제외 번호 불포함 확인
    testExcluded.forEach(e => {
      assert.ok(!game.numbers.includes(e), `제외 번호 ${e}는 게임에 절대 포함되지 않아야 합니다.`);
    });

    // 빈도 집계
    game.numbers.forEach(num => {
      numberFrequency[num]++;
    });
  });

  passCount++;
}

console.log(`[PASS] 1,000회 시뮬레이션 (${totalRuns * 5}개 게임) 전수 검사 통과!`);
console.log(' - 고정 번호(7, 14, 21) 출현율: 100%');
console.log(' - 제외 번호(1~5, 41~45) 출현율: 0%');
console.log(' - 중복 없음 & 오름차순 정렬 무결성: 100%');

console.log('\n[가중치 효과 분석]');
console.log(` - 높은 가중치 번호 28 (가중치 16): ${numberFrequency[28]}회 출현`);
console.log(` - 높은 가중치 번호 35 (가중치 13): ${numberFrequency[35]}회 출현`);
console.log(` - 기본 가중치 번호 10 (가중치 1): ${numberFrequency[10]}회 출현`);
console.log(` - 기본 가중치 번호 11 (가중치 1): ${numberFrequency[11]}회 출현`);

const ratio = numberFrequency[28] / (numberFrequency[10] || 1);
console.log(` - 가중치 반영 비율: 약 ${ratio.toFixed(1)}배 더 자주 출현`);
assert.ok(ratio > 3, '가중치가 높은 번호가 더 자주 나와야 합니다.');

console.log('\n모든 알고리즘 요구사항 검증 완료!');
