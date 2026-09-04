import React, { useState, useEffect, useMemo, useCallback } from 'react';
import LatestDraw from './components/LatestDraw';
import StatsHeatmap from './components/StatsHeatmap';
import NumberSelector from './components/NumberSelector';
import GameResults from './components/GameResults';
import { generateFiveGames, generateSingleGame } from './utils/lottoGenerator';
import { calculateClientStats } from './data/seedLottoData';
import { Sparkles, Info, ShieldCheck, BarChart3, HelpCircle } from 'lucide-react';

export default function App() {
  // 통계 기준 회차 수 (20, 30, 50)
  const [selectedCount, setSelectedCount] = useState(30);

  // 최신 당첨 데이터 & 통계 데이터
  const [latestData, setLatestData] = useState(null);
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);

  // 고정 번호 (최대 5개) & 제외 번호 (최대 10개)
  const [fixedNumbers, setFixedNumbers] = useState([]);
  const [excludedNumbers, setExcludedNumbers] = useState([]);

  // 생성된 5게임 목록
  const [games, setGames] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // 백엔드 API에서 데이터 불러오기 (실패 시 클라이언트 내장 데이터 즉시 전환)
  const fetchData = useCallback(async (count = selectedCount) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/lotto/stats?count=${count}`);
      if (!res.ok) throw new Error('API request failed');
      const json = await res.json();
      if (json.success && json.data) {
        setStatsData(json.data);
        setLatestData(json.data.latestDraw);
        return;
      }
      throw new Error('Invalid API response');
    } catch (err) {
      // GitHub Pages 등 정적 호스팅 환경인 경우 클라이언트 내장 통계 엔진 가동
      console.log('Using client fallback stats:', err.message);
      const fallback = calculateClientStats(count);
      setStatsData(fallback);
      setLatestData(fallback.latestDraw);
    } finally {
      setLoading(false);
    }
  }, [selectedCount]);

  useEffect(() => {
    fetchData(selectedCount);
  }, [selectedCount, fetchData]);

  // 번호별 가중치 맵 생성 { 1: count, 2: count, ... }
  const weightMap = useMemo(() => {
    if (!statsData || !statsData.stats) return {};
    const map = {};
    statsData.stats.forEach(s => {
      map[s.number] = s.count;
    });
    return map;
  }, [statsData]);

  // 5게임 번호 생성
  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const newGames = generateFiveGames({
        fixedNumbers,
        excludedNumbers,
        weightMap,
        baseWeight: 1
      });
      setGames(newGames);
      setIsGenerating(false);
    }, 200);
  };

  // 단일 게임 재생성
  const handleRegenerateSingle = (index) => {
    const labels = ['A', 'B', 'C', 'D', 'E'];
    const updated = [...games];
    updated[index] = {
      label: labels[index],
      numbers: generateSingleGame({
        fixedNumbers,
        excludedNumbers,
        weightMap,
        baseWeight: 1
      })
    };
    setGames(updated);
  };

  // 최초 로드 시 기본 5게임 1회 자동 생성
  useEffect(() => {
    if (statsData && games.length === 0) {
      handleGenerate();
    }
  }, [statsData]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      {/* 상단 네비게이션 헤더 */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20">
              6/45
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                동행복권 통계 기반 5게임 로또 생성기
              </h1>
              <p className="text-[11px] text-slate-400">
                출현 빈도 가중치 랜덤 알고리즘 & 고정/제외 필터 적용
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>가중치 추첨 알고리즘 적용됨</span>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 영역 */}
      <main className="max-w-6xl mx-auto px-4 py-6 w-full space-y-6 flex-1">
        {/* 1. 최신 당첨 번호 카드 */}
        <LatestDraw
          latestData={latestData}
          loading={loading}
          selectedCount={selectedCount}
          onCountChange={(cnt) => setSelectedCount(cnt)}
          onRefresh={() => fetchData(selectedCount)}
        />

        {/* 2. 5게임 결과 및 복사 영역 (핵심 기능 우선 배치) */}
        <GameResults
          games={games}
          onGenerate={handleGenerate}
          onRegenerateSingle={handleRegenerateSingle}
          isGenerating={isGenerating}
        />

        {/* 3. 고정 번호 & 제외 번호 설정 패널 */}
        <NumberSelector
          fixedNumbers={fixedNumbers}
          setFixedNumbers={setFixedNumbers}
          excludedNumbers={excludedNumbers}
          setExcludedNumbers={setExcludedNumbers}
        />

        {/* 4. 번호별 출현 빈도수 히트맵 */}
        <StatsHeatmap
          statsData={statsData}
          loading={loading}
        />

        {/* 로또 공 색상 범례 및 안내 카드 */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-slate-400 shrink-0" />
            <span>
              <strong>색상 구분:</strong> 1~10 노랑, 11~20 파랑, 21~30 빨강, 31~40 회색, 41~45 초록
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FBC400]"></span> 1~10
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#69C8F2]"></span> 11~20
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF7272]"></span> 21~30
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#AAAAAA]"></span> 31~40
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#B0D840]"></span> 41~45
            </span>
          </div>
        </div>
      </main>

      {/* 푸터 */}
      <footer className="border-t border-slate-900 bg-slate-950 py-5 text-center text-xs text-slate-600">
        <p>
          동행복권(dhlottery.co.kr) 실제 공식 당첨 데이터 연동 • 복권 과몰입에 주의하세요.
        </p>
      </footer>
    </div>
  );
}
