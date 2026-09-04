import React from 'react';
import LottoBall from './LottoBall';
import { Trophy, Calendar, Users, RefreshCw } from 'lucide-react';

export default function LatestDraw({
  latestData,
  loading,
  selectedCount,
  onCountChange,
  onRefresh
}) {
  if (loading && !latestData) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 animate-pulse text-center">
        <div className="h-6 w-48 bg-slate-800 rounded mx-auto mb-4"></div>
        <div className="flex justify-center gap-3 my-4">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="w-10 h-10 rounded-full bg-slate-800"></div>
          ))}
        </div>
        <div className="h-4 w-64 bg-slate-800 rounded mx-auto"></div>
      </div>
    );
  }

  if (!latestData) {
    return (
      <div className="bg-slate-900/80 border border-red-900/40 rounded-2xl p-6 text-center text-slate-400">
        최신 당첨 정보를 불러오지 못했습니다.
        <button
          onClick={onRefresh}
          className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-sm"
        >
          <RefreshCw className="w-4 h-4" /> 다시 시도
        </button>
      </div>
    );
  }

  const { drwNo, drwNoDate, numbers, bnusNo, firstWinamnt, firstPrzwnerCo } = latestData;

  return (
    <div className="bg-gradient-to-br from-slate-900/90 via-slate-900 to-indigo-950/40 border border-slate-800/80 rounded-2xl p-6 shadow-xl relative overflow-hidden backdrop-blur">
      {/* 장식용 은은한 빛 효과 */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800/60 pb-5 mb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              최신 회차
            </span>
            <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
              제 <span className="text-amber-400">{drwNo}</span>회 당첨 결과
            </h2>
            <button
              onClick={onRefresh}
              disabled={loading}
              title="새로고침"
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/60 transition"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <div className="flex items-center gap-4 mt-1.5 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              추첨일: {drwNoDate || '정보 없음'}
            </span>
            {firstPrzwnerCo > 0 && (
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-slate-500" />
                1등 당첨: {firstPrzwnerCo}명
              </span>
            )}
          </div>
        </div>

        {/* 통계 집계 회차 선택기 */}
        <div className="flex items-center gap-1.5 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800 text-xs">
          <span className="text-slate-400 px-2 font-medium">통계 분석 기준:</span>
          {[20, 30, 50].map(count => (
            <button
              key={count}
              onClick={() => onCountChange(count)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                selectedCount === count
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              최근 {count}회
            </button>
          ))}
        </div>
      </div>

      {/* 당첨 번호 볼 영역 */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
          {numbers?.map(num => (
            <LottoBall key={num} number={num} size="lg" />
          ))}

          <span className="text-slate-500 text-2xl font-bold px-1 select-none">+</span>

          <div className="flex flex-col items-center">
            <LottoBall number={bnusNo} size="lg" />
            <span className="text-[11px] font-medium text-amber-400 mt-1">보너스</span>
          </div>
        </div>

        {/* 1등 당첨금 정보 */}
        {firstWinamnt > 0 && (
          <div className="w-full lg:w-auto bg-slate-950/60 border border-slate-800/80 rounded-xl px-4 py-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-medium">1등 당첨 금액 (1인당)</div>
              <div className="text-lg font-black text-amber-400">
                {firstWinamnt.toLocaleString()}
                <span className="text-sm font-normal text-slate-300 ml-1">원</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
