"use client";

import { Sparkles } from "lucide-react";

interface ChatMacrosProps {
  onSelectMacro: (macro: string) => void;
  disabled: boolean;
}

export function ChatMacros({ onSelectMacro, disabled }: ChatMacrosProps) {
  const macros = [
    "안녕하세요! 환급 신청 관련 문의이신가요?",
    "네, 지난 5년치 소득세를 90%까지 돌려받으실 수 있습니다.",
    "국세청 심사 후 환급금 입금까지 약 1~2개월 소요됩니다.",
    "추가 보완 서류가 필요하니 확인 부탁드립니다.",
  ];

  return (
    <div className="px-6 py-2 bg-[#090f1d] border-t border-slate-800 flex items-center gap-2 overflow-x-auto text-xs">
      <span className="text-slate-500 font-bold text-[10px] shrink-0 flex items-center gap-1">
        <Sparkles className="h-3 w-3 text-amber-400" /> 빠른 매크로:
      </span>
      {macros.map((macro, idx) => (
        <button
          key={idx}
          onClick={() => onSelectMacro(macro)}
          disabled={disabled}
          className="shrink-0 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-3 py-1 rounded-full text-[10px] font-bold border border-slate-700/60 transition-all disabled:opacity-50"
        >
          {macro}
        </button>
      ))}
    </div>
  );
}
