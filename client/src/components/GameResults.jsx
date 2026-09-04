import React, { useState } from 'react';
import LottoBall from './LottoBall';
import { Sparkles, Copy, Check, RefreshCw, Dices } from 'lucide-react';

export default function GameResults({
  games,
  onGenerate,
  onRegenerateSingle,
  isGenerating
}) {
  const [copied, setCopied] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  // 전체 복사
  const handleCopyAll = async () => {
    if (!games || games.length === 0) return;

    const formattedText = [
      '🎰 [로또 6/45 통계 기반 5게임 추천 조합]',
      ...games.map(
        g => `${g.label} 게임: ${g.numbers.map(n => String(n).padStart(2, '0')).join(', ')}`
      ),
      '\n* 본 조합은 최근 당첨 통계 출현 가중치 알고리즘으로 자동 생성되었습니다.'
    ].join('\n');

    try {
      await navigator.clipboard.writeText(formattedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('클립보드 복사 실패:', err);
    }
  };

  // 단일 게임 복사
  const handleCopySingle = async (game, index) => {
    const text = `${game.label} 게임: ${game.numbers.map(n => String(n).padStart(2, '0')).join(', ')}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('클립보드 복사 실패:', err);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/20 border border-slate-800 rounded-2xl p-6 shadow-2xl relative">
      {/* 헤더 & 추출 버튼 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="text-xl font-black text-white tracking-tight">
              가중치 기반 5게임 자동 추출
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            과거 빈도 가중치와 설정한 고정/제외 번호가 완벽히 반영된 추천 조합입니다.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* 5게임 생성 버튼 */}
          <button
            onClick={onGenerate}
            disabled={isGenerating}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black rounded-xl shadow-lg shadow-amber-500/20 active:scale-95 transition cursor-pointer disabled:opacity-50"
          >
            <Dices className={`w-5 h-5 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>5게임 번호 생성하기</span>
          </button>

          {/* 전체 복사 버튼 */}
          {games && games.length > 0 && (
            <button
              onClick={handleCopyAll}
              className={`flex items-center gap-1.5 px-4 py-3 rounded-xl border text-xs font-bold transition ${
                copied
                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                  : 'bg-slate-950 hover:bg-slate-800 border-slate-700 text-slate-200'
              }`}
              title="5개 게임 번호 전체 복사"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? '전체 복사 완료!' : '전체 복사'}</span>
            </button>
          )}
        </div>
      </div>

      {/* 게임 목록 (A, B, C, D, E) */}
      {!games || games.length === 0 ? (
        <div className="py-16 text-center border-2 border-dashed border-slate-800 rounded-xl bg-slate-950/40">
          <Dices className="w-12 h-12 text-slate-600 mx-auto mb-3 animate-bounce" />
          <p className="text-slate-300 font-semibold">아직 생성된 번호가 없습니다.</p>
          <p className="text-xs text-slate-500 mt-1">
            상단의 '5게임 번호 생성하기' 버튼을 눌러 번호를 추출하세요.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {games.map((game, idx) => (
            <div
              key={game.label}
              className="bg-slate-950/80 border border-slate-800/90 hover:border-slate-700 rounded-xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 transition group"
            >
              {/* 게임 라벨 (A, B, C, D, E) */}
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-black text-amber-400 text-sm shadow-inner">
                  {game.label}
                </div>
                <span className="text-xs text-slate-500 font-medium sm:hidden">
                  게임 {idx + 1}
                </span>
              </div>

              {/* 6개 로또 번호 볼 */}
              <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
                {game.numbers.map(num => (
                  <LottoBall key={num} number={num} size="md" />
                ))}
              </div>

              {/* 개별 작업 버튼 */}
              <div className="flex items-center gap-1.5 self-end sm:self-center">
                <button
                  onClick={() => onRegenerateSingle(idx)}
                  className="p-2 text-slate-500 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition"
                  title="이 게임만 다시 추첨"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleCopySingle(game, idx)}
                  className="p-2 text-slate-500 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
                  title="이 게임 번호 복사"
                >
                  {copiedIndex === idx ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
