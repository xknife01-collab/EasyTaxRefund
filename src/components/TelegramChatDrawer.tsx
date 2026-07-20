"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Send,
  MessageSquare,
  Globe,
  Bot,
  User,
  CheckCheck,
  Loader2,
  RefreshCw,
  Sparkles
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

interface TelegramChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TelegramChatDrawer({ isOpen, onClose }: TelegramChatDrawerProps) {
  const { toast } = useToast();
  const [chats, setChats] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Load active chat sessions
  const fetchChats = async () => {
    try {
      setIsLoadingChats(true);
      const { data, error } = await supabase
        .from("telegram_chats")
        .select("*")
        .order("last_message_at", { ascending: false });

      if (error) throw error;
      setChats(data || []);
      if (data && data.length > 0 && !selectedChat) {
        setSelectedChat(data[0]);
      }
    } catch (err: any) {
      console.error("Failed to load telegram chats:", err);
    } finally {
      setIsLoadingChats(false);
    }
  };

  // 2. Load messages for selected chat
  const fetchMessages = async (chatId: string) => {
    try {
      setIsLoadingMessages(true);
      const { data, error } = await supabase
        .from("telegram_messages")
        .select("*")
        .eq("chat_id", chatId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages(data || []);

      // Mark unread messages as read
      await supabase
        .from("telegram_messages")
        .update({ is_read: true })
        .eq("chat_id", chatId)
        .eq("sender_type", "customer")
        .eq("is_read", false);
    } catch (err: any) {
      console.error("Failed to load telegram messages:", err);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchChats();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat.id);
    }
  }, [selectedChat]);

  // 3. Supabase Realtime Subscription for new incoming messages & session updates
  useEffect(() => {
    if (!isOpen) return;

    const channel = supabase
      .channel("telegram_realtime_channel")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "telegram_messages" },
        (payload) => {
          const newMsg = payload.new;
          // If message is for currently open chat, append immediately
          if (selectedChat && newMsg.chat_id === selectedChat.id) {
            setMessages((prev) => [...prev, newMsg]);
          }
          // Refresh chat session list so latest message timestamp & unread count updates
          fetchChats();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "telegram_chats" },
        () => {
          fetchChats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isOpen, selectedChat]);

  // Auto scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send Admin Korean Reply
  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || !selectedChat || isSending) return;

    setIsSending(true);
    if (!textToSend) setInputText("");

    try {
      const res = await fetch("/api/telegram/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId: selectedChat.id,
          telegramChatId: selectedChat.telegram_chat_id,
          koreanText: text,
          targetLang: selectedChat.detected_language || "en",
        }),
      });

      const data = await res.json();
      if (!data.ok) {
        throw new Error(data.error || "발송 실패");
      }

      toast({
        title: "✅ 텔레그램 모국어 역번역 전송 완료",
        description: `고객(${LANG_FLAG_MAP[selectedChat.detected_language]?.label || selectedChat.detected_language})에게 자동 역번역되어 전송되었습니다.`,
      });
    } catch (err: any) {
      console.error("Send error:", err);
      toast({
        variant: "destructive",
        title: "발송 실패",
        description: err.message || "서버 통신 오류가 발생했습니다.",
      });
      if (!textToSend) setInputText(text);
    } finally {
      setIsSending(false);
    }
  };

  const currentLangInfo = LANG_FLAG_MAP[selectedChat?.detected_language || "ko"] || {
    flag: "🌐",
    label: selectedChat?.detected_language || "외국어",
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[85vh] p-0 overflow-hidden bg-[#0f172a] text-slate-100 border border-slate-800 rounded-3xl flex flex-col shadow-2xl">
        {/* Top Bar Header */}
        <DialogHeader className="px-6 py-4 border-b border-slate-800 bg-[#0b1329] flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-sky-500/10 border border-sky-500/30 rounded-2xl flex items-center justify-center text-sky-400">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-black text-white flex items-center gap-2">
                텔레그램 실시간 양방향 자동 번역 상담
                <Badge className="bg-sky-500/20 text-sky-400 border border-sky-500/30 text-[10px] font-black">
                  AI Realtime Translate
                </Badge>
              </DialogTitle>
              <p className="text-xs text-slate-400 font-medium">
                고객은 모국어로 텔레그램 문의 ↔ 관리자는 한국어로 대화 및 답장
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={fetchChats}
            className="text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </DialogHeader>

        {/* Main Body: Grid Columns */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          {/* Left Column: Chat Sessions List */}
          <div className="md:col-span-4 border-r border-slate-800 bg-[#090f1d] flex flex-col">
            <div className="p-3.5 border-b border-slate-800/80 bg-[#0d1627] flex items-center justify-between text-xs font-black text-slate-400">
              <span>상담 대화방 ({chats.length})</span>
              <Badge className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                Live Connected
              </Badge>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-800/50 custom-scrollbar">
              {isLoadingChats ? (
                <div className="flex items-center justify-center h-40 text-slate-500 gap-2 text-xs font-bold">
                  <Loader2 className="h-4 w-4 animate-spin text-sky-400" />
                  대화 목록 불러오는 중...
                </div>
              ) : chats.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs font-medium space-y-2">
                  <MessageSquare className="h-8 w-8 mx-auto text-slate-600 opacity-50" />
                  <p>아직 수신된 텔레그램 상담이 없습니다.</p>
                </div>
              ) : (
                chats.map((chat) => {
                  const isSelected = selectedChat?.id === chat.id;
                  const langInfo = LANG_FLAG_MAP[chat.detected_language || "ko"] || {
                    flag: "🌐",
                    label: chat.detected_language,
                  };

                  return (
                    <button
                      key={chat.id}
                      onClick={() => setSelectedChat(chat)}
                      className={`w-full text-left p-4 transition-all flex items-start gap-3 hover:bg-slate-800/40 ${
                        isSelected
                          ? "bg-slate-800/80 border-l-4 border-sky-500"
                          : ""
                      }`}
                    >
                      <div className="h-10 w-10 rounded-2xl bg-slate-800 flex items-center justify-center text-lg shrink-0 border border-slate-700">
                        {langInfo.flag}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="font-black text-xs text-white truncate">
                            {chat.user_name || `Chat #${chat.telegram_chat_id}`}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono shrink-0">
                            {new Date(chat.last_message_at).toLocaleTimeString("ko-KR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-bold">
                          <Badge className="bg-slate-800 text-slate-300 text-[9px] px-1.5 py-0 border-none">
                            {langInfo.label}
                          </Badge>
                          <span className="text-slate-500 font-mono text-[10px]">
                            ID: {chat.telegram_chat_id}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Chat Room Area */}
          <div className="md:col-span-8 flex flex-col bg-[#0b1329]">
            {selectedChat ? (
              <>
                {/* Chat Room Top Bar */}
                <div className="px-6 py-3 border-b border-slate-800 bg-[#090f1d] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{currentLangInfo.flag}</span>
                    <div>
                      <div className="font-black text-sm text-white flex items-center gap-2">
                        {selectedChat.user_name}
                        <Badge className="bg-sky-500/20 text-sky-300 text-[10px] font-bold border-none">
                          {currentLangInfo.label} 사용 고객
                        </Badge>
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono">
                        Telegram ID: {selectedChat.telegram_chat_id}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages View Window */}
                <div className="flex-1 p-6 overflow-y-auto space-y-4 custom-scrollbar">
                  {isLoadingMessages ? (
                    <div className="flex items-center justify-center h-40 text-slate-500 gap-2 text-xs">
                      <Loader2 className="h-4 w-4 animate-spin text-sky-400" />
                      메시지 내역 로딩 중...
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-slate-500 text-xs space-y-2">
                      <Globe className="h-8 w-8 opacity-40 text-sky-400" />
                      <p>고객과의 대화가 시작되면 원문과 한국어 번역이 실시간 표시됩니다.</p>
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
                          <div className="flex items-center gap-1.5 mb-1 px-1">
                            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                              {isCustomer ? (
                                <>
                                  <User className="h-3 w-3 text-sky-400" />
                                  고객 (모국어 수신)
                                </>
                              ) : (
                                <>
                                  <Bot className="h-3 w-3 text-emerald-400" />
                                  관리자 (한국어 발송)
                                </>
                              )}
                            </span>
                            <span className="text-[9px] text-slate-500 font-mono">
                              {new Date(msg.created_at).toLocaleTimeString("ko-KR", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>

                          <div
                            className={`max-w-[80%] rounded-3xl p-4 space-y-2 border shadow-lg ${
                              isCustomer
                                ? "bg-slate-800/90 text-slate-100 border-slate-700/80 rounded-tl-sm"
                                : "bg-sky-600 text-white border-sky-500 rounded-tr-sm"
                            }`}
                          >
                            {/* Primary Translated Text for Admin ease */}
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5">
                                <Badge
                                  className={`text-[9px] font-black px-1.5 py-0 border-none ${
                                    isCustomer
                                      ? "bg-sky-500/30 text-sky-300"
                                      : "bg-emerald-500/30 text-emerald-200"
                                  }`}
                                >
                                  {isCustomer ? "🇰🇷 한국어 번역" : `${currentLangInfo.flag} 모국어 역번역`}
                                </Badge>
                              </div>
                              <p className="text-sm font-black leading-relaxed whitespace-pre-wrap">
                                {isCustomer ? msg.translated_text : msg.translated_text}
                              </p>
                            </div>

                            {/* Divider & Original Native / Korean Text */}
                            <div className="pt-2 border-t border-white/10 text-xs opacity-80 space-y-0.5">
                              <span className="text-[9px] font-bold uppercase tracking-wider block opacity-70">
                                {isCustomer ? "원문 (Native Text)" : "관리자 한국어 입력 원문"}
                              </span>
                              <p className="font-medium whitespace-pre-wrap leading-normal text-slate-200">
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

                {/* Preset Macro Quick Buttons */}
                <div className="px-6 py-2 bg-[#090f1d] border-t border-slate-800 flex items-center gap-2 overflow-x-auto text-xs">
                  <span className="text-slate-500 font-bold text-[10px] shrink-0 flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-amber-400" /> 빠른 매크로:
                  </span>
                  {[
                    "안녕하세요! 환급 신청 관련 문의이신가요?",
                    "네, 지난 5년치 소득세를 90%까지 돌려받으실 수 있습니다.",
                    "국세청 심사 후 환급금 입금까지 약 1~2개월 소요됩니다.",
                    "추가 보완 서류가 필요하니 확인 부탁드립니다.",
                  ].map((macro, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(macro)}
                      disabled={isSending}
                      className="shrink-0 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-3 py-1 rounded-full text-[11px] font-bold border border-slate-700/60 transition-all disabled:opacity-50"
                    >
                      {macro}
                    </button>
                  ))}
                </div>

                {/* Input Controls */}
                <div className="p-4 bg-[#090f1d] border-t border-slate-800 flex items-center gap-3">
                  <Input
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder={`한국어로 답장을 입력하세요. (${currentLangInfo.label}로 자동 역번역되어 텔레그램 발송)`}
                    className="flex-1 bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 rounded-2xl h-12 text-sm font-medium focus-visible:ring-sky-500"
                  />
                  <Button
                    onClick={() => handleSend()}
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
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-xs space-y-3">
                <MessageSquare className="h-12 w-12 opacity-30 text-sky-400" />
                <p>왼쪽 목록에서 텔레그램 대화방을 선택하세요.</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
