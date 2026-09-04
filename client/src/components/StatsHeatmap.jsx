import React, { useState } from 'react';
import LottoBall, { getBallColorInfo } from './LottoBall';
import { Flame, Snowflake, ArrowUpDown, BarChart2 } from 'lucide-react';

export default function StatsHeatmap({ statsData, loading }) {
  const [sortType, setSortType] = useState('number'); // 'number', 'count_desc', 'count_asc'

  if (loading || !statsData) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 text-center animate-pulse">
        <div className="h-6 w-40 bg-slate-800 rounded mx-auto mb-4"></div>
        <div className="grid grid-cols-5 sm:grid-cols-9 gap-2">
          {[...Array(45)].map((_, i) => (
            <div key={i} className="h-14 bg-slate-800/60 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  const { stats, hotNumbers, coldNumbers, totalDraws, roundRange } = statsData;

  // 최대 출현 횟수 (게이지 비율 계산용)
  const maxCount = Math.max(...stats.map(s => s.count), 1);

  // 정렬된 리스트
  const sortedStats = [...stats].sort((a, b) => {
    if (sortType === 'count_desc') return b.count - a.count || a.number - b.number;
    if (sortType === 'count_asc') return a.count - b.count || a.number - b.number;
    return a.number - b.number;
  });

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
      {/* 헤더 & 필터 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-bold text-white">번호별 출현 빈도 통계</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            최근 {totalDraws}회차 ({roundRange?.from}회 ~ {roundRange?.to}회 기준) 출현 빈도
          </p>
        </div>

        {/* 정렬 버튼 */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setSortType('number')}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              sortType === 'number' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            번호순
          </button>
          <button
            onClick={() => setSortType('count_desc')}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              sortType === 'count_desc' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            많이 나온 순
          </button>
          <button
            onClick={() => setSortType('count_asc')}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              sortType === 'count_asc' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            적게 나온 순
          </button>
        </div>
      </div>

      {/* Hot & Cold Numbers 배너 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Hot Numbers */}
        <div className="bg-gradient-to-r from-red-950/30 to-amber-950/20 border border-red-900/30 rounded-xl p-3.5">
          <div className="flex items-center gap-2 mb-2.5">
            <Flame className="w-4 h-4 text-red-400" />
            <span className="text-xs font-bold text-red-300">자주 나온 번호 (Hot TOP 6)</span>
          </div>
          <div className="flex items-center gap-2.5 flex-wrap">
            {hotNumbers?.map(item => (
              <div key={item.number} className="flex flex-col items-center">
                <LottoBall number={item.number} size="sm" />
                <span className="text-[11px] font-semibold text-red-300 mt-1">
                  {item.count}회
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Cold Numbers */}
        <div className="bg-gradient-to-r from-blue-950/30 to-cyan-950/20 border border-blue-900/30 rounded-xl p-3.5">
          <div className="flex items-center gap-2 mb-2.5">
            <Snowflake className="w-4 h-4 text-sky-400" />
            <span className="text-xs font-bold text-sky-300">적게 나온 번호 (Cold TOP 6)</span>
          </div>
          <div className="flex items-center gap-2.5 flex-wrap">
            {coldNumbers?.map(item => (
              <div key={item.number} className="flex flex-col items-center">
                <LottoBall number={item.number} size="sm" />
                <span className="text-[11px] font-semibold text-sky-300 mt-1">
                  {item.count}회
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 1~45번 빈도 히트맵 그리드 */}
      <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2.5">
        {sortedStats.map(item => {
          const ratio = item.count / maxCount;
          // 출현율에 따른 은은한 배경 강조
          const heatStyle = {
            backgroundColor: ratio > 0.7 
              ? 'rgba(239, 68, 68, 0.15)' 
              : ratio > 0.4 
                ? 'rgba(245, 158, 11, 0.1)' 
                : 'rgba(30, 41, 59, 0.5)'
          };

          return (
            <div
              key={item.number}
              style={heatStyle}
              className="border border-slate-800 hover:border-slate-700 rounded-xl p-2 flex flex-col items-center transition relative group"
            >
              <LottoBall number={item.number} size="sm" />
              
              <div className="mt-1.5 flex items-center justify-between w-full px-1 text-[11px]">
                <span className="text-slate-400 font-medium">{item.count}회</span>
                <span className="text-slate-500 text-[10px]">{item.percentage}%</span>
              </div>

              {/* 미니 게이지 바 */}
              <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden mt-1">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${(item.count / maxCount) * 100}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
