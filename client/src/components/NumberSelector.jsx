import React, { useState } from 'react';
import LottoBall from './LottoBall';
import { Pin, Ban, RotateCcw, Check, AlertCircle } from 'lucide-react';

export default function NumberSelector({
  fixedNumbers,
  setFixedNumbers,
  excludedNumbers,
  setExcludedNumbers
}) {
  // 현재 선택 모드: 'fixed'(고정 번호 선택 모드) 또는 'excluded'(제외 번호 선택 모드)
  const [selectMode, setSelectMode] = useState('fixed');
  const [alertMsg, setAlertMsg] = useState('');

  const showAlert = (msg) => {
    setAlertMsg(msg);
    setTimeout(() => setAlertMsg(''), 3000);
  };

  const handleBallClick = (num) => {
    if (selectMode === 'fixed') {
      // 이미 고정 번호에 있으면 해제
      if (fixedNumbers.includes(num)) {
        setFixedNumbers(fixedNumbers.filter(n => n !== num));
        return;
      }
      // 제외 번호에 있으면 제외 번호에서 해제하고 고정 번호로 이동
      if (excludedNumbers.includes(num)) {
        setExcludedNumbers(excludedNumbers.filter(n => n !== num));
      }
      // 고정 번호는 최대 5개
      if (fixedNumbers.length >= 5) {
        showAlert('고정 번호는 최대 5개까지 지정할 수 있습니다.');
        return;
      }
      setFixedNumbers([...fixedNumbers, num].sort((a, b) => a - b));
    } else {
      // 제외 모드
      // 이미 제외 번호에 있으면 해제
      if (excludedNumbers.includes(num)) {
        setExcludedNumbers(excludedNumbers.filter(n => n !== num));
        return;
      }
      // 고정 번호에 있으면 고정 번호에서 해제하고 제외 번호로 이동
      if (fixedNumbers.includes(num)) {
        setFixedNumbers(fixedNumbers.filter(n => n !== num));
      }
      // 제외 번호는 최대 10개
      if (excludedNumbers.length >= 10) {
        showAlert('제외 번호는 최대 10개까지 지정할 수 있습니다.');
        return;
      }
      setExcludedNumbers([...excludedNumbers, num].sort((a, b) => a - b));
    }
  };

  const removeFixed = (num) => {
    setFixedNumbers(fixedNumbers.filter(n => n !== num));
  };

  const removeExcluded = (num) => {
    setExcludedNumbers(excludedNumbers.filter(n => n !== num));
  };

  const resetAll = () => {
    setFixedNumbers([]);
    setExcludedNumbers([]);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-5">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            고정 번호 & 제외 번호 설정
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            반드시 포함할 고정 번호(최대 5개)와 제외할 번호(최대 10개)를 지정하세요.
          </p>
        </div>

        {/* 전체 초기화 버튼 */}
        {(fixedNumbers.length > 0 || excludedNumbers.length > 0) && (
          <button
            onClick={resetAll}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-400 px-3 py-1.5 bg-slate-950 hover:bg-slate-800 rounded-xl border border-slate-800 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            선택 번호 전체 초기화
          </button>
        )}
      </div>

      {/* 모드 전환 탭 */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <button
          onClick={() => setSelectMode('fixed')}
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border font-bold text-sm transition ${
            selectMode === 'fixed'
              ? 'bg-blue-600/20 border-blue-500 text-blue-400 shadow-md ring-1 ring-blue-500/50'
              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
          }`}
        >
          <Pin className="w-4 h-4" />
          고정 번호 지정 ({fixedNumbers.length}/5)
        </button>

        <button
          onClick={() => setSelectMode('excluded')}
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border font-bold text-sm transition ${
            selectMode === 'excluded'
              ? 'bg-red-600/20 border-red-500 text-red-400 shadow-md ring-1 ring-red-500/50'
              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
          }`}
        >
          <Ban className="w-4 h-4" />
          제외 번호 지정 ({excludedNumbers.length}/10)
        </button>
      </div>

      {/* 알림 메시지 */}
      {alertMsg && (
        <div className="mb-4 flex items-center gap-2 text-xs bg-amber-500/10 border border-amber-500/30 text-amber-300 px-3.5 py-2 rounded-xl animate-fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{alertMsg}</span>
        </div>
      )}

      {/* 현재 선택된 번호 뱃지 요약 */}
      <div className="space-y-3 mb-5 p-3.5 bg-slate-950/70 border border-slate-800/80 rounded-xl">
        {/* 고정 번호 목록 */}
        <div className="flex items-center gap-2 flex-wrap min-h-[32px]">
          <span className="text-xs font-semibold text-blue-400 flex items-center gap-1 w-20 shrink-0">
            <Pin className="w-3.5 h-3.5" /> 고정 ({fixedNumbers.length}):
          </span>
          {fixedNumbers.length === 0 ? (
            <span className="text-xs text-slate-600">지정된 고정 번호가 없습니다.</span>
          ) : (
            fixedNumbers.map(num => (
              <span
                key={num}
                onClick={() => removeFixed(num)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-950/70 border border-blue-800 text-blue-300 text-xs font-bold cursor-pointer hover:bg-red-950/70 hover:border-red-700 hover:text-red-300 transition group"
                title="클릭하여 고정 해제"
              >
                {num}
                <span className="text-blue-500 group-hover:text-red-400 text-[10px]">✕</span>
              </span>
            ))
          )}
        </div>

        <div className="border-t border-slate-800/60"></div>

        {/* 제외 번호 목록 */}
        <div className="flex items-center gap-2 flex-wrap min-h-[32px]">
          <span className="text-xs font-semibold text-red-400 flex items-center gap-1 w-20 shrink-0">
            <Ban className="w-3.5 h-3.5" /> 제외 ({excludedNumbers.length}):
          </span>
          {excludedNumbers.length === 0 ? (
            <span className="text-xs text-slate-600">지정된 제외 번호가 없습니다.</span>
          ) : (
            excludedNumbers.map(num => (
              <span
                key={num}
                onClick={() => removeExcluded(num)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-950/70 border border-red-800 text-red-300 text-xs font-bold cursor-pointer hover:bg-slate-800 hover:text-slate-300 transition group"
                title="클릭하여 제외 해제"
              >
                {num}
                <span className="text-red-500 group-hover:text-slate-400 text-[10px]">✕</span>
              </span>
            ))
          )}
        </div>
      </div>

      {/* 1~45 번호 선택 볼 그리드 */}
      <div className="grid grid-cols-5 sm:grid-cols-9 gap-2">
        {Array.from({ length: 45 }, (_, i) => i + 1).map(num => {
          const isFixed = fixedNumbers.includes(num);
          const isExcluded = excludedNumbers.includes(num);

          let status = 'none';
          if (isFixed) status = 'fixed';
          if (isExcluded) status = 'excluded';

          return (
            <div
              key={num}
              onClick={() => handleBallClick(num)}
              className={`p-2 rounded-xl border flex flex-col items-center justify-center cursor-pointer transition relative select-none ${
                isFixed
                  ? 'bg-blue-950/50 border-blue-500 ring-2 ring-blue-500/40'
                  : isExcluded
                    ? 'bg-red-950/40 border-red-800/60 opacity-40'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
              }`}
            >
              <LottoBall number={num} size="sm" />
              
              {/* 상태 뱃지 표시 */}
              <div className="h-4 flex items-center justify-center mt-1">
                {isFixed && (
                  <span className="text-[10px] font-extrabold text-blue-400 flex items-center gap-0.5">
                    <Pin className="w-2.5 h-2.5" /> 고정
                  </span>
                )}
                {isExcluded && (
                  <span className="text-[10px] font-extrabold text-red-400 flex items-center gap-0.5">
                    <Ban className="w-2.5 h-2.5" /> 제외
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
