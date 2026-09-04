import React from 'react';

/**
 * 로또 공 색상 반환
 * 1~10: 노란색(#FBC400)
 * 11~20: 파란색(#69C8F2)
 * 21~30: 빨간색(#FF7272)
 * 31~40: 회색(#AAAAAA)
 * 41~45: 초록색(#B0D840)
 */
export function getBallColorInfo(number) {
  const n = parseInt(number, 10);
  if (n >= 1 && n <= 10) {
    return {
      bg: '#FBC400',
      text: '#452A03',
      border: '#E0AE00',
      gradient: 'from-amber-300 via-amber-400 to-yellow-500',
      tag: 'yellow'
    };
  }
  if (n >= 11 && n <= 20) {
    return {
      bg: '#69C8F2',
      text: '#0C3547',
      border: '#53B7E4',
      gradient: 'from-sky-300 via-sky-400 to-blue-400',
      tag: 'blue'
    };
  }
  if (n >= 21 && n <= 30) {
    return {
      bg: '#FF7272',
      text: '#4A0C0C',
      border: '#E85A5A',
      gradient: 'from-rose-300 via-red-400 to-rose-500',
      tag: 'red'
    };
  }
  if (n >= 31 && n <= 40) {
    return {
      bg: '#AAAAAA',
      text: '#222222',
      border: '#949494',
      gradient: 'from-slate-200 via-slate-400 to-zinc-500',
      tag: 'gray'
    };
  }
  return {
    bg: '#B0D840',
    text: '#213B03',
    border: '#98C22A',
    gradient: 'from-lime-300 via-lime-400 to-green-500',
    tag: 'green'
  };
}

export default function LottoBall({
  number,
  size = 'md',
  isBonus = false,
  status = 'none', // 'none', 'fixed', 'excluded'
  onClick,
  className = ''
}) {
  const color = getBallColorInfo(number);

  const sizeClasses = {
    xs: 'w-7 h-7 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg font-extrabold',
    xl: 'w-14 h-14 text-xl font-black'
  };

  const statusRing = {
    none: '',
    fixed: 'ring-4 ring-blue-500 ring-offset-2 ring-offset-slate-900 scale-105',
    excluded: 'opacity-30 grayscale ring-2 ring-red-500 ring-offset-2 ring-offset-slate-900'
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      <div
        onClick={onClick}
        style={{
          backgroundColor: color.bg,
          color: color.text
        }}
        className={`lotto-ball cursor-pointer select-none font-bold ${sizeClasses[size] || sizeClasses.md} ${statusRing[status]} ${className}`}
        title={`번호 ${number}`}
      >
        <span>{number}</span>
      </div>

      {isBonus && (
        <span className="absolute -top-1 -right-2 bg-amber-500 text-white text-[10px] font-bold px-1 rounded-full shadow">
          +보너스
        </span>
      )}
    </div>
  );
}
