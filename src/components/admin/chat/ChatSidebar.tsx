"use client";

import { SupportChat } from "@/types/chat";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, ShieldCheck } from "lucide-react";

const CHANNEL_CONFIG: Record<string, { label: string; icon: string; bgClass: string; textClass: string }> = {
  telegram: { label: "Telegram", icon: "💬", bgClass: "bg-sky-500/10 border-sky-500/30", textClass: "text-sky-400" },
  kakao: { label: "카카오톡", icon: "🟡", bgClass: "bg-amber-500/10 border-amber-500/30", textClass: "text-amber-500" },
  whatsapp: { label: "WhatsApp", icon: "🟢", bgClass: "bg-emerald-500/10 border-emerald-500/30", textClass: "text-emerald-400" },
  facebook: { label: "Messenger", icon: "🔵", bgClass: "bg-blue-500/10 border-blue-500/30", textClass: "text-blue-400" }
};

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

interface ChatSidebarProps {
  chats: SupportChat[];
  selectedChat: SupportChat | null;
  onSelectChat: (chat: SupportChat) => void;
  isLoading: boolean;
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export function ChatSidebar({
  chats,
  selectedChat,
  onSelectChat,
  isLoading,
  activeFilter,
  onFilterChange
}: ChatSidebarProps) {
  const filterTabs = [
    { key: "all", label: "전체보기", count: chats.length },
    { key: "telegram", label: "Telegram", icon: "💬" },
    { key: "kakao", label: "카카오톡", icon: "🟡" },
    { key: "whatsapp", label: "WhatsApp", icon: "🟢" },
    { key: "facebook", label: "Messenger", icon: "🔵" }
  ];

  return (
    <div className="flex flex-col h-full border-r border-slate-800 bg-[#090f1d]">
      {/* Top Channel Quick Filter Pills */}
      <div className="p-3 border-b border-slate-800/80 bg-[#0d1627] flex gap-1.5 overflow-x-auto custom-scrollbar">
        {filterTabs.map((tab) => {
          const isActive = activeFilter === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onFilterChange(tab.key)}
              className={`shrink-0 text-[10px] font-black px-2.5 py-1.5 rounded-xl border transition-all flex items-center gap-1 ${
                isActive
                  ? "bg-sky-500/20 text-sky-400 border-sky-500/40"
                  : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200"
              }`}
            >
              {tab.icon && <span>{tab.icon}</span>}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Chats Room List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-800/50 custom-scrollbar">
        {isLoading ? (
          <div className="flex items-center justify-center h-40 text-slate-500 text-xs font-bold animate-pulse">
            상담 목록 불러오는 중...
          </div>
        ) : chats.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs font-medium space-y-2">
            <MessageSquare className="h-8 w-8 mx-auto text-slate-600 opacity-50" />
            <p>선택한 채널에 수신된 상담이 없습니다.</p>
          </div>
        ) : (
          chats.map((chat) => {
            const isSelected = selectedChat?.id === chat.id;
            const langInfo = LANG_FLAG_MAP[chat.detected_language || "ko"] || { flag: "🌐", label: chat.detected_language };
            const channelConf = CHANNEL_CONFIG[chat.channel] || { label: chat.channel, icon: "❓", bgClass: "bg-slate-800", textClass: "text-slate-400" };

            return (
              <button
                key={chat.id}
                onClick={() => onSelectChat(chat)}
                className={`w-full text-left p-4 transition-all flex items-start gap-3 hover:bg-slate-800/30 ${
                  isSelected ? "bg-slate-800/80 border-l-4 border-sky-500" : ""
                }`}
              >
                {/* Language Flag Avatar */}
                <div className="h-10 w-10 rounded-2xl bg-slate-800 flex items-center justify-center text-lg shrink-0 border border-slate-700 relative">
                  {langInfo.flag}
                  <span className="absolute -bottom-1 -right-1 text-[10px]">{channelConf.icon}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-black text-xs text-white truncate flex items-center gap-1.5">
                      {chat.user_name || `상담원 #${chat.external_chat_id}`}
                      {chat.unread_count > 0 && (
                        <span className="h-4 min-w-4 px-1 rounded-full bg-rose-600 text-white text-[9px] font-black flex items-center justify-center animate-bounce">
                          {chat.unread_count}
                        </span>
                      )}
                    </span>
                    <span className="text-[9px] text-slate-500 font-mono shrink-0">
                      {new Date(chat.last_message_at).toLocaleTimeString("ko-KR", {
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold">
                    <Badge className={`text-[8px] font-black px-1 py-0 border-none ${channelConf.bgClass} ${channelConf.textClass}`}>
                      {channelConf.label}
                    </Badge>
                    <span className="text-slate-500 font-mono text-[9px] truncate">
                      ID: {chat.external_chat_id}
                    </span>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
