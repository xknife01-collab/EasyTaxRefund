"use client";

import React from "react";
import { SupportChat, SupportMessage } from "@/types/chat";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Send, Globe, Bot, User, MessageSquare } from "lucide-react";

const LANG_FLAG_MAP: Record<string, { flag: string; label: string }> = {
  vi: { flag: "🇻🇳", label: "베트남어" },
  zh: { flag: "🇨🇳", label: "중국어" },
  th: { flag: "🇹🇭", label: "태국어" },
  id: { flag: "🇮🇩", label: "인도네시아어" },
  en: { flag: "🇵🇭", label: "영어" },
  uz: { flag: "🇺🇿", label: "우즈베크어" },
  my: { flag: "🇲🇲", label: "미얀마어" },
  km: { flag: "🇰🇭", label: "캄보디아어" },
  mn: { flag: "🇲🇳", label: "몽골어" },
  ne: { flag: "🇳🇵", label: "네팔어" },
  si: { flag: "🇱🇰", label: "스리랑카어" },
  bn: { flag: "🇧🇩", label: "벵골어" },
  kk: { flag: "🇰🇿", label: "카자흐어" },
  ur: { flag: "🇵🇰", label: "우르두어" },
  ko: { flag: "🇰🇷", label: "한국어" },
};

interface ChatWindowProps {
  selectedChat: SupportChat | null;
  messages: SupportMessage[];
  inputText: string;
  onChangeInput: (val: string) => void;
  onSend: () => void;
  isSending: boolean;
  isLoadingMessages: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export function ChatWindow({
  selectedChat,
  messages,
  inputText,
  onChangeInput,
  onSend,
  isSending,
  isLoadingMessages,
  messagesEndRef
}: ChatWindowProps) {
  if (!selectedChat) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-xs space-y-3 bg-[#0b1329]">
        <MessageSquare className="h-12 w-12 opacity-30 text-sky-400" />
        <p>왼쪽 목록에서 실시간 상담방을 선택하세요.</p>
      </div>
    );
  }

  const langInfo = LANG_FLAG_MAP[selectedChat.detected_language || "ko"] || { flag: "🌐", label: selectedChat.detected_language };

  return (
    <div className="flex-1 flex flex-col bg-[#0b1329]">
      {/* Top Customer Info Bar */}
      <div className="px-6 py-3 border-b border-slate-800 bg-[#090f1d] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{langInfo.flag}</span>
          <div>
            <div className="font-black text-sm text-white flex items-center gap-2">
              {selectedChat.user_name || "이름 없음"}
              <Badge className="bg-sky-500/20 text-sky-300 text-[10px] font-black border-none">
                {langInfo.label} 사용 고객
              </Badge>
              {selectedChat.user_phone && (
                <Badge className="bg-slate-800 text-slate-400 text-[10px] font-mono border-none">
                  {selectedChat.user_phone}
                </Badge>
              )}
            </div>
            <p className="text-[10px] text-slate-500 font-mono">
              {selectedChat.channel.toUpperCase()} ID: {selectedChat.external_chat_id}
            </p>
          </div>
        </div>
      </div>

      {/* Messages Render Zone */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4 custom-scrollbar">
        {isLoadingMessages ? (
          <div className="flex items-center justify-center h-40 text-slate-500 gap-2 text-xs">
            <Loader2 className="h-4 w-4 animate-spin text-sky-400" />
            대화 내역 불러오는 중...
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-slate-500 text-xs space-y-2">
            <Globe className="h-8 w-8 opacity-40 text-sky-400" />
            <p>대화가 시작되면 AI 양방향 번역문과 원문이 실시간으로 표시됩니다.</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isCustomer = msg.sender_type === "customer";
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  isCustomer ? "items-start" : "items-end"
                }`}
              >
                {/* Meta Sender Tag */}
                <div className="flex items-center gap-1.5 mb-1 px-1">
                  <span className="text-[9px] font-black text-slate-500 flex items-center gap-1">
                    {isCustomer ? (
                      <>
                        <User className="h-3 w-3 text-sky-400" />
                        고객 ({langInfo.label})
                      </>
                    ) : (
                      <>
                        <Bot className="h-3 w-3 text-emerald-400" />
                        관리자 (한국어)
                      </>
                    )}
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono">
                    {new Date(msg.created_at).toLocaleTimeString("ko-KR", {
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </span>
                </div>

                {/* Text Bubble Card */}
                <div
                  className={`max-w-[80%] rounded-3xl p-4 space-y-2 border shadow-lg ${
                    isCustomer
                      ? "bg-slate-800/90 text-slate-100 border-slate-700/80 rounded-tl-sm"
                      : "bg-sky-600 text-white border-sky-500 rounded-tr-sm"
                  }`}
                >
                  <div className="space-y-1">
                    <Badge
                      className={`text-[8px] font-black px-1.5 py-0 border-none ${
                        isCustomer
                          ? "bg-sky-500/30 text-sky-300"
                          : "bg-emerald-500/30 text-emerald-200"
                      }`}
                    >
                      {isCustomer ? "🇰🇷 한국어 번역" : `${langInfo.flag} 모국어 역번역`}
                    </Badge>
                    <p className="text-sm font-black leading-relaxed whitespace-pre-wrap">
                      {isCustomer ? msg.translated_text : msg.translated_text}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-white/10 text-[11px] opacity-80 space-y-0.5">
                    <span className="text-[8px] font-black uppercase tracking-wider block opacity-70">
                      {isCustomer ? "원문 (Original)" : "입력 원문"}
                    </span>
                    <p className="whitespace-pre-wrap leading-normal text-slate-300">
                      {msg.original_text}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box Controls */}
      <div className="p-4 bg-[#090f1d] border-t border-slate-800 flex items-center gap-3">
        <Input
          value={inputText}
          onChange={(e) => onChangeInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
          placeholder={`한국어로 답장을 입력하세요. (${langInfo.label}로 자동 번역되어 전송)`}
          className="flex-1 bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 rounded-2xl h-12 text-sm font-medium focus-visible:ring-sky-500"
        />
        <Button
          onClick={onSend}
          disabled={isSending || !inputText.trim()}
          className="bg-sky-500 hover:bg-sky-400 text-white font-black rounded-2xl h-12 px-6 shadow-lg shadow-sky-500/20 shrink-0 gap-2"
        >
          {isSending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Send className="h-4 w-4" />
              <span>전송</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
