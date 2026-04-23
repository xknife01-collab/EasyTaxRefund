"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Send,
  Sparkles,
  User,
  Loader2,
  X,
  MessageCircle,
  ChevronDown,
} from "lucide-react";
import { askFaqQuestion } from "@/ai/flows/ai-powered-faq-flow";
import { useTranslation } from "@/components/LanguageContext";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "ai";
  content: string;
}

export function FloatingAiChat() {
  const pathname = usePathname();

  // /estimate 페이지에서는 숨김 (VIP 상담 아이콘이 이미 존재)
  if (pathname?.startsWith("/estimate")) return null;

  return <FloatingAiChatInner />;
}

function FloatingAiChatInner() {
  const { t, language } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 웰컴 말풍선 - 5초 후 표시, 8초 뒤 숨김
  useEffect(() => {
    const showTimer = setTimeout(() => setShowBubble(true), 5000);
    const hideTimer = setTimeout(() => setShowBubble(false), 13000);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  // 채팅 열릴 때 초기 메시지 설정
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          role: "ai",
          content: t(
            "안녕하세요! Easy Tax Refund AI 상담사입니다. 중소기업 취업자 소득세 감면과 핸드폰 본인 인증 방법에 대해 궁금한 점이 있으신가요?"
          ),
        },
      ]);
    }
  }, [isOpen]);

  // 메시지 추가 시 자동 스크롤
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const result = await askFaqQuestion({ question: userMsg, language });
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: result.answer },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: t(
            "죄송합니다. 현재 상담원이 부재 중이거나 연결이 원활하지 않습니다. 잠시 후 다시 시도해 주세요."
          ),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const unread = !isOpen && messages.filter((m) => m.role === "ai").length > 1;

  return (
    <div className="fixed bottom-24 lg:bottom-6 right-6 z-[200] flex flex-col items-end gap-3 print:hidden">
      {/* 채팅 창 */}
      <div
        className={cn(
          "w-[360px] bg-white rounded-[2rem] shadow-2xl border border-slate-100 flex flex-col overflow-hidden transition-all duration-500 origin-bottom-right",
          isOpen
            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
            : "opacity-0 scale-95 translate-y-4 pointer-events-none"
        )}
        style={{ height: isOpen ? "520px" : "0px" }}
      >
        {/* 헤더 */}
        <div className="bg-slate-900 px-6 py-4 flex items-center gap-3 shrink-0">
          <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-white font-black text-sm">
              {t("실시간 AI 세무 비서")}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                Online · Active Now
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-all"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>

        {/* 메시지 영역 */}
        <div className="flex-1 overflow-hidden bg-slate-50/60 p-4">
          <ScrollArea className="h-full pr-2">
            <div className="space-y-4">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex animate-in fade-in slide-in-from-bottom-2 duration-300",
                    msg.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "flex gap-2 max-w-[85%]",
                      msg.role === "user" ? "flex-row-reverse" : "flex-row"
                    )}
                  >
                    <div
                      className={cn(
                        "h-7 w-7 rounded-lg flex items-center justify-center shrink-0 shadow-sm mt-0.5",
                        msg.role === "user"
                          ? "bg-slate-200"
                          : "bg-primary text-white"
                      )}
                    >
                      {msg.role === "user" ? (
                        <User className="h-3.5 w-3.5 text-slate-600" />
                      ) : (
                        <Sparkles className="h-3.5 w-3.5" />
                      )}
                    </div>
                    <div
                      className={cn(
                        "px-4 py-3 rounded-2xl text-[13px] font-medium leading-relaxed",
                        msg.role === "user"
                          ? "bg-slate-900 text-white rounded-tr-none"
                          : "bg-white text-slate-800 shadow-sm border border-slate-100 rounded-tl-none"
                      )}
                    >
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start animate-pulse">
                  <div className="flex gap-2">
                    <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center shrink-0">
                      <Sparkles className="h-3.5 w-3.5 text-white" />
                    </div>
                    <div className="px-4 py-3 bg-white rounded-2xl rounded-tl-none shadow-sm border border-slate-100">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>
        </div>

        {/* 입력창 */}
        <form
          onSubmit={handleSend}
          className="p-4 bg-white border-t border-slate-100 flex gap-2 items-center shrink-0"
        >
          <Input
            placeholder={t("상담 내용을 입력하세요...")}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 h-11 rounded-xl bg-slate-50 border-none focus-visible:ring-primary font-medium text-sm"
            disabled={loading}
          />
          <Button
            type="submit"
            size="icon"
            className="h-11 w-11 rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 shrink-0"
            disabled={loading}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>

      {/* 말풍선 */}
      {showBubble && !isOpen && (
        <div
          className="bg-slate-900 text-white text-sm font-bold px-4 py-3 rounded-2xl rounded-br-none shadow-xl max-w-[220px] animate-in slide-in-from-bottom-2 fade-in duration-500 cursor-pointer hover:scale-[1.02] transition-transform"
          onClick={() => {
            setShowBubble(false);
            setIsOpen(true);
          }}
        >
          {t("세금 환급 궁금하신가요? 바로 물어보세요! 😊")}
          <div className="absolute -bottom-2 right-14 w-0 h-0 border-l-8 border-r-0 border-t-8 border-l-transparent border-t-slate-900" />
        </div>
      )}

      {/* 플로팅 버튼 */}
      <button
        onClick={() => {
          setIsOpen((prev) => !prev);
          setShowBubble(false);
        }}
        className={cn(
          "h-16 w-16 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 relative group",
          isOpen
            ? "bg-slate-700 shadow-slate-700/30"
            : "bg-primary shadow-primary/30"
        )}
      >
        {isOpen ? (
          <X className="h-7 w-7 text-white" />
        ) : (
          <>
            <MessageCircle className="h-7 w-7 text-white" />
            {/* 안읽은 메시지 뱃지 */}
            {unread && (
              <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
                <span className="text-[9px] font-black text-white">1</span>
              </span>
            )}
            {/* 온라인 표시 */}
            <span className="absolute bottom-1 right-1 h-3 w-3 bg-green-400 rounded-full border-2 border-white" />
          </>
        )}

        {/* 호버 툴팁 */}
        {!isOpen && (
          <span className="absolute right-full mr-3 whitespace-nowrap bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-lg">
            {t("1:1 AI 상담")}
          </span>
        )}
      </button>
    </div>
  );
}
