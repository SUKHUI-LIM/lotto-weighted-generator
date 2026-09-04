/**
 * 가중치 기반 로또 번호 생성 유틸리티
 */

/**
 * 1개 게임(6개 번호) 생성
 * @param {Object} options
 * @param {Array<number>} [options.fixedNumbers=[]] 고정 번호 (최대 5개)
 * @param {Array<number>} [options.excludedNumbers=[]] 제외 번호 (최대 10개)
 * @param {Object<number, number>} [options.weightMap={}] 번호별 가중치 맵 { 1: 5, 2: 1, ... }
 * @param {number} [options.baseWeight=1] 기본 가중치
 * @returns {Array<number>} 오름차순 정렬된 6개 번호
 */
export function generateSingleGame({
  fixedNumbers = [],
  excludedNumbers = [],
  weightMap = {},
  baseWeight = 1
} = {}) {
  // 중복 제거 및 유효 번호 검증 (1~45)
  const fixedSet = new Set(fixedNumbers.filter(n => n >= 1 && n <= 45));
  const excludedSet = new Set(excludedNumbers.filter(n => n >= 1 && n <= 45));

  // 고정 번호는 최대 5개
  const fixedList = Array.from(fixedSet).slice(0, 5);
  
  // 고정 번호에 이미 들어간 번호는 제외 번호에서 무시됨 (상호 배타)
  const safeExcludedSet = new Set([...excludedSet].filter(n => !fixedSet.has(n)));

  // 결과 배열 초기화: 고정 번호 먼저 포함
  const result = [...fixedList];

  // 후보 번호 풀 구성 (1~45 중 고정 번호와 제외 번호를 뺀 번호들)
  const candidates = [];
  for (let n = 1; n <= 45; n++) {
    if (!fixedSet.has(n) && !safeExcludedSet.has(n)) {
      const weight = (weightMap[n] !== undefined ? weightMap[n] : 0) + baseWeight;
      candidates.push({
        number: n,
        weight: Math.max(0.1, weight) // 최소 0.1 이상 가중치 보장
      });
    }
  }

  // 6개가 채워질 때까지 가중치 기반 비복원 추출
  const neededCount = 6 - result.length;

  for (let step = 0; step < neededCount; step++) {
    if (candidates.length === 0) break;

    // 현재 후보들의 전체 가중치 합산
    const totalWeight = candidates.reduce((sum, item) => sum + item.weight, 0);

    // 0 ~ totalWeight 사이의 랜덤 값
    let rand = Math.random() * totalWeight;

    // 누적 가중치 탐색
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

  // 오름차순 정렬
  return result.sort((a, b) => a - b);
}

/**
 * 5게임(A, B, C, D, E) 로또 조합 세트 생성
 * @param {Object} options
 * @param {Array<number>} [options.fixedNumbers=[]]
 * @param {Array<number>} [options.excludedNumbers=[]]
 * @param {Object<number, number>} [options.weightMap={}]
 * @param {number} [options.baseWeight=1]
 * @returns {Array<{ label: string, numbers: Array<number> }>}
 */
export function generateFiveGames(options = {}) {
  const labels = ['A', 'B', 'C', 'D', 'E'];
  return labels.map(label => ({
    label,
    numbers: generateSingleGame(options)
  }));
}
