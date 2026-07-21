"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { SupportChat } from "@/types/chat";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MessageCircle, Clock, ArrowRight, ShieldCheck, HelpCircle, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LiveMessengerFeedProps {
  onOpenChat: (chatId: string) => void;
}

interface ChatWithLastMessage extends SupportChat {
  lastMessageText?: string;
  lastMessageSender?: string;
  isDemo?: boolean;
}

const CHANNEL_UI: Record<string, { label: string; icon: string; badgeClass: string }> = {
  telegram: { label: "Telegram", icon: "💬", badgeClass: "bg-sky-50 text-sky-600 border-sky-100" },
  kakao: { label: "카카오톡", icon: "🟡", badgeClass: "bg-amber-50 text-amber-600 border-amber-100" },
  whatsapp: { label: "WhatsApp", icon: "🟢", badgeClass: "bg-emerald-50 text-emerald-600 border-emerald-100" },
  facebook: { label: "Messenger", icon: "🔵", badgeClass: "bg-blue-50 text-blue-600 border-blue-100" },
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

// 3. Fallback Demo Data if Database table is empty
const DEMO_CHATS: ChatWithLastMessage[] = [
  {
    id: "demo-chat-1",
    channel: "telegram",
    external_chat_id: "@sobirov_tele",
    user_name: "SOBIROV BAHTIYOR OLIMJON UGLI",
    user_phone: "010-8240-9994",
    detected_language: "uz",
    last_message_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2 mins ago
    unread_count: 1,
    created_at: new Date().toISOString(),
    lastMessageText: "환급 신청 절차와 대행 수수료 22% 공제 조건에 대해 상세히 알고 싶습니다.",
    lastMessageSender: "customer",
    isDemo: true
  },
  {
    id: "demo-chat-2",
    channel: "facebook",
    external_chat_id: "fb_582910385",
    user_name: "TRAN THI MINH",
    user_phone: "010-1234-5678",
    detected_language: "vi",
    last_message_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 mins ago
    unread_count: 0,
    created_at: new Date().toISOString(),
    lastMessageText: "제출 서류 사전 조회가 완료되었다는 카드를 받았는데 실제 환급액 지급일은 언제인가요?",
    lastMessageSender: "customer",
    isDemo: true
  },
  {
    id: "demo-chat-3",
    channel: "whatsapp",
    external_chat_id: "wa_987654321",
    user_name: "JOHN SMITH",
    user_phone: "010-9876-5432",
    detected_language: "en",
    last_message_at: new Date(Date.now() - 120 * 60 * 1000).toISOString(), // 2 hours ago
    unread_count: 0,
    created_at: new Date().toISOString(),
    lastMessageText: "홈택스 로그인 인증이 계속 실패하는데 외국인등록번호 불일치 문제인가요?",
    lastMessageSender: "customer",
    isDemo: true
  }
];

export function LiveMessengerFeed({ onOpenChat }: LiveMessengerFeedProps) {
  const { toast } = useToast();
  const [liveChats, setLiveChats] = useState<ChatWithLastMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const getDeletedChatIds = (): string[] => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem("ktrs_deleted_chat_ids");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const addDeletedChatId = (chatId: string) => {
    if (typeof window === "undefined") return;
    try {
      const current = getDeletedChatIds();
      if (!current.includes(chatId)) {
        const updated = [...current, chatId];
        localStorage.setItem("ktrs_deleted_chat_ids", JSON.stringify(updated));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteChat = async (chatId: string, isDemo?: boolean) => {
    if (!confirm("이 상담 내역을 완전히 삭제하시겠습니까?")) return;

    // Track locally so it stays hidden across refetches/polling
    addDeletedChatId(chatId);

    if (isDemo) {
      setLiveChats(prev => prev.filter(c => c.id !== chatId));
      toast({
        title: "🗑️ 샘플 문의 삭제 완료",
        description: "샘플 데모 문의가 화면에서 제거되었습니다.",
      });
      return;
    }

    try {
      // 1. Delete associated messages first
      const { error: msgError } = await supabase
        .from("support_messages")
        .delete()
        .eq("chat_id", chatId);

      if (msgError) throw msgError;

      // 2. Delete the chat session
      const { error } = await supabase
        .from("support_chats")
        .delete()
        .eq("id", chatId);

      if (error) throw error;

      toast({
        title: "🗑️ 상담 삭제 완료",
        description: "선택한 상담 채널 내역이 성공적으로 삭제되었습니다.",
      });
      fetchLiveFeed();
    } catch (err: any) {
      console.error("Failed to delete support chat:", err);
      toast({
        variant: "destructive",
        title: "삭제 실패",
        description: err.message || "오류가 발생했습니다.",
      });
    }
  };

  const fetchLiveFeed = async () => {
    try {
      // Fetch support chats with their messages
      const { data, error } = await supabase
        .from("support_chats")
        .select(`
          *,
          support_messages (
            original_text,
            translated_text,
            sender_type,
            created_at
          )
        `)
        .order("last_message_at", { ascending: false })
        .limit(10);

      if (error) throw error;

      let fetchedChats: ChatWithLastMessage[] = [];

      if (!data || data.length === 0) {
        // Fallback to DEMO data if database is empty
        fetchedChats = DEMO_CHATS;
      } else {
        fetchedChats = data.map((chat: any) => {
          const msgs = chat.support_messages || [];
          const sortedMsgs = [...msgs].sort(
            (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
          const lastMsg = sortedMsgs[sortedMsgs.length - 1];

          let preview = "대화 내역 없음";
          let sender = "";
          if (lastMsg) {
            preview = lastMsg.sender_type === "customer" 
              ? (lastMsg.translated_text || lastMsg.original_text) 
              : lastMsg.original_text;
            sender = lastMsg.sender_type;
          }

          return {
            ...chat,
            lastMessageText: preview,
            lastMessageSender: sender,
          };
        });
      }

      // Filter out deleted chats (including demo chats)
      const deletedIds = getDeletedChatIds();
      const filtered = fetchedChats.filter(c => !deletedIds.includes(c.id));
      setLiveChats(filtered);
    } catch (err) {
      console.error("Failed to fetch live messenger feed:", err);
      // Fallback on error to keep the dashboard populated
      const deletedIds = getDeletedChatIds();
      const filtered = DEMO_CHATS.filter(c => !deletedIds.includes(c.id));
      setLiveChats(filtered);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveFeed();

    // Subscribe to changes in support tables to update feed in real time
    const channel = supabase
      .channel("live_messenger_feed_table_subscription")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "support_messages" },
        () => {
          fetchLiveFeed();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "support_chats" },
        () => {
          fetchLiveFeed();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getFormattedTime = (isoString: string) => {
    const date = new Date(isoString);
    const today = new Date();
    const isToday = date.getDate() === today.getDate() &&
                    date.getMonth() === today.getMonth() &&
                    date.getFullYear() === today.getFullYear();

    const timeStr = date.toLocaleTimeString("ko-KR", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    }); // e.g., "오후 1:23"

    if (isToday) {
      return timeStr;
    } else {
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${month}. ${day}. ${timeStr}`;
    }
  };

  return (
    <div className="pt-10 border-t border-slate-100 mt-10">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 bg-sky-500 rounded-2xl flex items-center justify-center shadow-lg shadow-sky-200 shrink-0">
            <MessageCircle className="h-8 w-8 text-white animate-pulse" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-headline tracking-tight flex items-center gap-2">
              💬 실시간 다국어 메신저 상담 현황
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </h2>
            <p className="text-slate-500 font-bold text-sm sm:text-base">
              텔레그램, 페이스북 메신저 등을 통해 수신된 실시간 번역 상담 내역입니다.
            </p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 text-center bg-white border border-slate-100 rounded-[2.5rem]">
          <p className="text-slate-400 font-bold animate-pulse text-sm">현황판 데이터 로딩 중...</p>
        </div>
      ) : (
        /* Unified Table Layout */
        <Card className="premium-card rounded-[2.5rem] border-none overflow-hidden bg-white shadow-sm">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="font-bold pl-8 py-5">메신저 / 고객</TableHead>
                  <TableHead className="font-bold">연락처</TableHead>
                  <TableHead className="font-bold">국적 / 언어</TableHead>
                  <TableHead className="font-bold">최근 문의 시간</TableHead>
                  <TableHead className="font-bold w-[45%]">실시간 대화 요약 (AI 한국어 번역)</TableHead>
                  <TableHead className="font-bold pr-8 text-right">상태 제어</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {liveChats.map((chat) => {
                  const lang = LANG_FLAG_MAP[chat.detected_language || "ko"] || { flag: "🌐", label: chat.detected_language };
                  const channel = CHANNEL_UI[chat.channel] || { label: chat.channel, icon: "❓", badgeClass: "bg-slate-100 text-slate-500" };

                  return (
                    <TableRow 
                      key={chat.id} 
                      className="hover:bg-slate-50/80 border-b border-slate-50 transition-colors"
                    >
                      {/* 메신저 / 고객 */}
                      <TableCell className="pl-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center text-lg border border-slate-100 shrink-0 relative">
                            {lang.flag}
                            <span className="absolute -bottom-1 -right-1 text-[10px]">{channel.icon}</span>
                          </div>
                          <div>
                            <div className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                              {chat.user_name || "이름 없음"}
                              {chat.unread_count > 0 && (
                                <span className="bg-rose-500 text-white text-[9px] font-black h-4 min-w-4 px-1 rounded-full flex items-center justify-center animate-pulse">
                                  {chat.unread_count}
                                </span>
                              )}
                              {chat.isDemo && (
                                <span className="bg-slate-100 text-slate-400 text-[8px] font-extrabold px-1 rounded border border-slate-200">
                                  샘플 데모
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              ID: {chat.external_chat_id}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* 연락처 */}
                      <TableCell>
                        {chat.user_phone ? (
                          <span className="font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-mono">
                            {chat.user_phone}
                          </span>
                        ) : (
                          <span className="text-slate-300 text-xs font-bold">-</span>
                        )}
                      </TableCell>

                      {/* 국적 / 언어 */}
                      <TableCell>
                        <Badge className="bg-slate-100 text-slate-700 font-bold border-none text-xs rounded-lg px-2.5 py-1 flex items-center gap-1.5 w-fit">
                          <span>{lang.flag}</span>
                          <span>{lang.label}</span>
                        </Badge>
                      </TableCell>

                      {/* 최근 문의 시간 */}
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-slate-500 text-xs font-bold">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{getFormattedTime(chat.last_message_at)}</span>
                        </div>
                      </TableCell>

                      {/* 실시간 대화 요약 (AI 번역) */}
                      <TableCell className="max-w-[300px]">
                        <div className="flex items-start gap-2 bg-sky-50/50 border border-sky-100/75 rounded-2xl px-4 py-2 text-xs">
                          <div className="flex-1">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <Badge className="text-[8px] font-black px-1.5 py-0 border-none bg-sky-500/10 text-sky-600">
                                {chat.lastMessageSender === "customer" ? "수신 번역" : "답변 완료"}
                              </Badge>
                            </div>
                            <p className="text-slate-700 font-bold leading-normal truncate whitespace-pre-wrap">
                              "{chat.lastMessageText}"
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      {/* 상태 제어 버튼 */}
                      <TableCell className="pr-8 text-right">
                        <div className="flex justify-end items-center gap-2">
                          <Button
                            onClick={() => {
                              if (chat.isDemo) {
                                // If they click on a demo row, open the first chat session for demonstration!
                                onOpenChat("demo-chat-1");
                              } else {
                                onOpenChat(chat.id);
                              }
                            }}
                            className="rounded-xl h-10 px-4 bg-slate-900 hover:bg-sky-500 text-white font-black text-xs transition-all gap-1.5 shrink-0"
                          >
                            <span>1:1 상담 시작</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteChat(chat.id, chat.isDemo)}
                            className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl h-10 w-10 shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
