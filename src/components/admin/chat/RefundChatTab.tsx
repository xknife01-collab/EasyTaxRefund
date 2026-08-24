"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Search, 
  MessageSquare, 
  Send, 
  User, 
  Bot, 
  ShieldAlert, 
  Cpu, 
  UserCheck, 
  Volume2, 
  VolumeX, 
  Sparkles,
  CheckCircle2,
  ChevronRight,
  Trash2
} from "lucide-react";

function parseRichCardFromText(text: string) {
  if (!text) return { text: "" };
  const regex = /\[RICH_CARD_JSON:\s*(\{.*?\})\]/;
  const match = text.match(regex);
  if (match) {
    try {
      const cardData = JSON.parse(match[1]);
      return {
        text: text.replace(regex, "").trim(),
        card: cardData
      };
    } catch (e) {
      // Ignore parsing fail
    }
  }
  return { text };
}

interface ChatRoom {
  id: string;
  name: string;
  created_at: string;
  channel?: string;
  detected_language?: string;
  // Join/Aggregated fields
  last_message?: string;
  last_message_at?: string;
  is_ai_active?: boolean;
  takeover_alert?: boolean;
  cumulative_pos?: number;
  cumulative_neg?: number;
  current_step?: string;
  personality_type?: string;
  user_facts?: Record<string, string>;
  last_action_score?: number;
  last_action_type?: string;
  typing_text?: string;
}

const CHANNEL_UI: Record<string, { label: string; icon: string; badgeClass: string }> = {
  web: { label: "웹사이트", icon: "🌐", badgeClass: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30" },
  facebook: { label: "페이스북", icon: "📘", badgeClass: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
  whatsapp: { label: "WhatsApp", icon: "🟢", badgeClass: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
  telegram: { label: "Telegram", icon: "✈️", badgeClass: "bg-sky-500/20 text-sky-300 border-sky-500/30" },
  kakao: { label: "카카오톡", icon: "🟡", badgeClass: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
};

const LANG_FLAG_MAP: Record<string, { flag: string; label: string }> = {
  vi: { flag: "🇻🇳", label: "베트남어" },
  zh: { flag: "🇨🇳", label: "중국어" },
  th: { flag: "🇹🇭", label: "태국어" },
  id: { flag: "🇮🇩", label: "인니" },
  en: { flag: "🇵🇭", label: "영어" },
  uz: { flag: "🇺🇿", label: "우즈벡" },
  my: { flag: "🇲🇲", label: "미얀마" },
  km: { flag: "🇰🇭", label: "캄보디아" },
  mn: { flag: "🇲🇳", label: "몽골" },
  ne: { flag: "🇳🇵", label: "네팔" },
  si: { flag: "🇱🇰", label: "스리랑카" },
  bn: { flag: "🇧🇩", label: "벵골" },
  kk: { flag: "🇰🇿", label: "카자흐" },
  ur: { flag: "🇵🇰", label: "우르두" },
  ko: { flag: "🇰🇷", label: "한국어" },
};

interface Message {
  id: string;
  room_id: string;
  sender_id: string;
  message: string;
  original_text?: string;
  translated_text?: string;
  source_lang?: string;
  target_lang?: string;
  created_at: string;
  sender_role: 'guest' | 'planner' | 'bot';
  pos_score?: number;
  neg_score?: number;
}

export default function RefundChatTab({ defaultRoomId }: { defaultRoomId?: string | null }) {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Real-time scores and scanner stats
  const [posScore, setPosScore] = useState(0);
  const [negScore, setNegScore] = useState(0);
  const [actionScore, setActionScore] = useState(1);
  const [actionType, setActionType] = useState("intro");
  
  const [isAiActive, setIsAiActive] = useState(true);
  const [takeoverAlert, setTakeoverAlert] = useState(false);
  const [personality, setPersonality] = useState("expressive (기본값)");
  const [facts, setFacts] = useState<Record<string, string>>({});
  const [summary, setSummary] = useState("대화 요약 없음");

  // Real-time typing scanner state
  const [isTypingScan, setIsTypingScan] = useState(false);
  const [typingScanText, setTypingScanText] = useState("");

  // Real-time Korean translation cache for foreign messages
  const [autoTranslations, setAutoTranslations] = useState<Record<string, string>>({});
  const [translatingIds, setTranslatingIds] = useState<Record<string, boolean>>({});

  const handleTranslateMessage = async (msgId: string, text: string) => {
    if (!msgId || !text || translatingIds[msgId]) return;
    setTranslatingIds(prev => ({ ...prev, [msgId]: true }));
    try {
      const res = await fetch("/api/support/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, messageId: msgId }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.translatedText) {
          setAutoTranslations(prev => ({ ...prev, [msgId]: data.translatedText }));
        }
      }
    } catch (err) {
      console.error("Translation error:", err);
    } finally {
      setTranslatingIds(prev => ({ ...prev, [msgId]: false }));
    }
  };

  const chatEndRef = useRef<HTMLDivElement>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const currentUserId = "88888888-8888-8888-8888-888888888888"; // Planner / Admin Mock UUID
  const dummyUserUuid = '11111111-1111-1111-1111-111111111111'; // Web Customer Mock UUID

  // Hoisted rule-based keyword analysis for real-time fast scanning
  const ruleBasedScore = (text: string) => {
    const txt = text.toLowerCase();
    let score = { actionScore: 1, actionType: 'pending', pos: 0, neg: 0 };

    // Expanded Emotional Analysis keywords
    const posKeywords = [
      '네', '응', '어', '웅', '맞아', '맞아요', '그래', '그래요', '할게요', '진행', '원해요', 
      '조회', '도와줘', '확인', '부탁', '오케이', 'ok', 'yes', '좋아', '좋아요', '고마워', '감사', 
      '해보죠', '환급액', '인증완료', '신청할게요', 'agree'
    ];
    
    const negKeywords = [
      '아니', '안해', '안해요', '사기', '의심', '스팸', '광고', '귀찮', '하지마', '해킹', 
      '개인정보', '불안', '유출', '털려', '무서워', '싫어', '싫어요', 'no', 'fake', 'spam', 
      '보이스피싱', '피싱', '믿을수', '광고성'
    ];

    posKeywords.forEach(k => { if (txt.includes(k)) score.pos = Math.min(score.pos + 2, 10); });
    negKeywords.forEach(k => { if (txt.includes(k)) score.neg = Math.min(score.neg + 2, 10); });

    // Expanded Action Progress Analysis keywords
    if (txt.includes('안녕') || txt.includes('hello') || txt.includes('halo') || txt.includes('반갑') || txt.includes('하이')) {
      score.actionScore = 1;
      score.actionType = 'intro';
    } else if (txt.includes('년도') || txt.includes('202') || txt.includes('201') || txt.includes('year') || txt.includes('조회') || txt.includes('돈') || txt.includes('돌려')) {
      score.actionScore = 2;
      score.actionType = 'select_year';
    } else if (txt.includes('인증서') || txt.includes('인증번호') || txt.includes('인증 요청') || txt.includes('link') || txt.includes('pass') || txt.includes('패스') || txt.includes('카카오') || txt.includes('문자')) {
      score.actionScore = 3;
      score.actionType = 'auth_link';
    } else if (txt.includes('완료') || txt.includes('성공') || txt.includes('complete') || txt.includes('success') || txt.includes('했어') || txt.includes('통과')) {
      score.actionScore = 5;
      score.actionType = 'auth_complete';
    } else if (txt.includes('수수료') || txt.includes('계약') || txt.includes('이용 동의') || txt.includes('detail') || txt.includes('비용') || txt.includes('약관') || txt.includes('동의')) {
      score.actionScore = 7;
      score.actionType = 'active_consult';
    } else if (txt.includes('서명') || txt.includes('신청 완료') || txt.includes('signed') || txt.includes('submit') || txt.includes('사인') || txt.includes('제출')) {
      score.actionScore = 10;
      score.actionType = 'signed';
    }

    return score;
  };

  // 1. Fetch Rooms list with aggregated state from support_chats and chat_rooms
  const fetchRooms = async () => {
    try {
      // Fetch support_chats to get current statuses
      const { data: chatsData, error: chatsErr } = await supabase
        .from("support_chats")
        .select("id, external_chat_id, user_name, channel, detected_language, metadata, cumulative_pos, cumulative_neg, last_message_at")
        .order("last_message_at", { ascending: false });

      if (chatsErr) throw chatsErr;

      const { data: roomsData } = await supabase
        .from("chat_rooms")
        .select("*");

      // Filter out system setup dummy rows (like GLOBAL_SYSTEM_SETTINGS) from real chat rooms list
      const filteredChats = (chatsData || []).filter(chat => chat.external_chat_id !== "GLOBAL_SYSTEM_SETTINGS");

      const mappedRooms: ChatRoom[] = filteredChats.map((chat) => {
        const roomInfo = (roomsData || []).find(r => r.id === chat.id);
        const meta = chat.metadata || {};
        
        return {
          id: chat.id,
          name: chat.user_name || roomInfo?.name || `상담방 - ${chat.external_chat_id?.substring(0, 8) || chat.id.substring(0, 8)}`,
          created_at: roomInfo?.created_at || chat.last_message_at || new Date().toISOString(),
          channel: chat.channel || "web",
          detected_language: chat.detected_language || "ko",
          is_ai_active: meta.is_ai_active !== false,
          takeover_alert: meta.takeover_alert === true || (chat.cumulative_neg || 0) >= 6,
          cumulative_pos: chat.cumulative_pos || 0,
          cumulative_neg: chat.cumulative_neg || 0,
          current_step: meta.current_step || "Step 0: Estimate (신청 준비 단계)",
          personality_type: meta.personality_type || "expressive (친근감 선호형)",
          user_facts: meta.user_facts || {},
          last_action_score: meta.last_action_score || 1,
          last_action_type: meta.last_action_type || (meta.last_action_score === 1 || !meta.last_action_score ? 'intro' : 'pending'),
          typing_text: meta.typing_text || ""
        };
      });

      setRooms(mappedRooms);
      
      // Auto select room: prioritize defaultRoomId from parent list, fallback to first room
      if (mappedRooms.length > 0) {
        if (defaultRoomId && mappedRooms.some(r => r.id === defaultRoomId)) {
          setSelectedRoomId(defaultRoomId);
        } else if (!selectedRoomId) {
          setSelectedRoomId(mappedRooms[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to load chat rooms:", err);
    }
  };

  const [isGlobalAiActive, setIsGlobalAiActive] = useState(true);

  // 0. React to defaultRoomId changes from parent LiveMessengerFeed selection
  useEffect(() => {
    if (defaultRoomId) {
      setSelectedRoomId(defaultRoomId);
    }
  }, [defaultRoomId]);

  const fetchGlobalAiSetting = async () => {
    try {
      const { data, error } = await supabase
        .from("support_chats")
        .select("metadata")
        .eq("external_chat_id", "GLOBAL_SYSTEM_SETTINGS")
        .maybeSingle();

      if (!error && data) {
        setIsGlobalAiActive(data.metadata?.is_ai_active !== false);
      } else if (!error && !data) {
        await supabase.from("support_chats").insert({
          channel: "web",
          external_chat_id: "GLOBAL_SYSTEM_SETTINGS",
          user_name: "GLOBAL SYSTEM SETTINGS",
          metadata: { is_ai_active: true }
        });
        setIsGlobalAiActive(true);
      }
    } catch (err) {
      console.error("Failed to fetch global AI setting:", err);
    }
  };

  const handleToggleGlobalAi = async () => {
    const nextState = !isGlobalAiActive;
    setIsGlobalAiActive(nextState);
    try {
      await supabase
        .from("support_chats")
        .update({
          metadata: { is_ai_active: nextState }
        })
        .eq("external_chat_id", "GLOBAL_SYSTEM_SETTINGS");
    } catch (err) {
      console.error("Failed to update global AI setting:", err);
    }
  };

  useEffect(() => {
    fetchRooms();
    fetchGlobalAiSetting();

    // Subscribe to support_chats updates to refresh scores & scan typing in real-time
    const chatSubscription = supabase
      .channel("realtime-rooms")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "support_chats" },
        (payload) => {
          const updatedChat = payload.new as any;
          if (updatedChat) {
            if (updatedChat.external_chat_id === 'GLOBAL_SYSTEM_SETTINGS') {
              setIsGlobalAiActive(updatedChat.metadata?.is_ai_active !== false);
              return; // Do NOT fetch rooms or re-render room details on global setting sync
            }
            if (updatedChat.id === selectedRoomId) {
              const typingText = updatedChat.metadata?.typing_text || "";
              if (typingText) {
                const score = ruleBasedScore(typingText);
                setPosScore(score.pos);
                setNegScore(score.neg);
                setActionScore(score.actionScore);
                setActionType(score.actionType);
                setIsTypingScan(true);
                setTypingScanText(typingText);
              } else {
                setIsTypingScan(false);
                setTypingScanText("");
                if (selectedRoomId) fetchRoomDetailsAndMessages(selectedRoomId);
              }
            }
          }
          fetchRooms();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(chatSubscription);
    };
  }, [selectedRoomId]);

  // Hoisted fetch room details and messages to share state update safely
  const fetchRoomDetailsAndMessages = async (roomId: string) => {
    if (!roomId) return;
    try {
      // Fetch latest metadata direct from DB to eliminate react async state lags
      const { data: chatRoomData } = await supabase
        .from("support_chats")
        .select("metadata, cumulative_neg")
        .eq("id", roomId)
        .maybeSingle();

      if (chatRoomData) {
        const meta = chatRoomData.metadata || {};
        setIsAiActive(meta.is_ai_active !== false);
        setTakeoverAlert(meta.takeover_alert === true || (chatRoomData.cumulative_neg || 0) >= 6);
        setPersonality(meta.personality_type || "expressive (친근감 선호형)");
        setFacts(meta.user_facts || {});
        setActionScore(meta.last_action_score || 1);
        setActionType(meta.last_action_type || 'intro');
      }

      // Retrieve messages from existing support_messages table
      const { data: dbMessages, error: msgErr } = await supabase
        .from("support_messages")
        .select("*")
        .eq("chat_id", roomId)
        .order("created_at", { ascending: true });

      if (msgErr) throw msgErr;

      // Extract current sentiment scores (0-10) from the latest customer message
      const customerMsgs = (dbMessages || []).filter(m => m.sender_type === 'customer');
      const latestCustomerMsg = customerMsgs[customerMsgs.length - 1];
      
      if (latestCustomerMsg) {
        setPosScore(latestCustomerMsg.pos_score ?? 0);
        setNegScore(latestCustomerMsg.neg_score ?? 0);
      } else {
        setPosScore(0);
        setNegScore(0);
      }

      // Ensure unique messages filter to prevent any data race overlaps
      const uniqueDbMessages = (dbMessages || []).filter((msg, idx, self) => 
        self.findIndex(m => m.id === msg.id) === idx
      );

      const mappedMessages: Message[] = uniqueDbMessages.map((m) => {
        const isUser = m.sender_type === 'customer';
        
        // Detect if original_text is a summary format, and restore full original answer using translated_text
        const isSummaryType = !isUser && m.original_text?.includes("질문:") && m.original_text?.includes("답변:");
        const displayMessageText = isSummaryType && m.translated_text ? m.translated_text : (m.original_text || "");

        const isBot = !isUser && (
          displayMessageText.includes("[RICH_CARD_JSON") || 
          displayMessageText.includes("김준현 매니저") ||
          (!displayMessageText.includes("(설계사 직접 메시지)"))
        );
        const role: Message['sender_role'] = isUser ? 'guest' : (isBot ? 'bot' : 'planner');

        const { text } = parseRichCardFromText(displayMessageText);
        const { text: origText } = parseRichCardFromText(m.original_text || "");
        const { text: transText } = parseRichCardFromText(m.translated_text || "");

        return {
          id: String(m.id),
          room_id: m.chat_id,
          sender_id: isUser ? dummyUserUuid : (isBot ? '00000000-0000-0000-0000-000000000000' : currentUserId),
          message: text || displayMessageText,
          original_text: origText,
          translated_text: transText,
          source_lang: m.source_lang,
          target_lang: m.target_lang,
          created_at: m.created_at,
          sender_role: role,
          pos_score: m.pos_score,
          neg_score: m.neg_score
        };
      });

      setMessages(mappedMessages);
      
      // Load latest summary from database scores/metadata
      const { data: scores } = await supabase
        .from("ai_conversation_scores")
        .select("ai_response")
        .eq("chat_room_id", roomId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (scores && scores.ai_response) {
        setSummary(scores.ai_response);
      }
    } catch (err) {
      console.error("Failed to load room details:", err);
    }
  };

  // 2. Fetch Messages and active room metadata details when selectedRoomId changes
  useEffect(() => {
    if (!selectedRoomId) return;

    fetchRoomDetailsAndMessages(selectedRoomId);

    // Subscribe to support_messages updates
    const messageSubscription = supabase
      .channel(`room-${selectedRoomId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "support_messages", filter: `chat_id=eq.${selectedRoomId}` },
        (payload) => {
          const newM = payload.new as any;
          const isUser = newM.sender_type === 'customer';
          
          const isSummaryType = !isUser && newM.original_text?.includes("질문:") && newM.original_text?.includes("답변:");
          const displayMessageText = isSummaryType && newM.translated_text ? newM.translated_text : (newM.original_text || "");

          const isBot = !isUser && (
            displayMessageText.includes("[RICH_CARD_JSON") || 
            displayMessageText.includes("김준현 매니저") ||
            (!displayMessageText.includes("(설계사 직접 메시지)"))
          );
          const role: Message['sender_role'] = isUser ? 'guest' : (isBot ? 'bot' : 'planner');
          const { text } = parseRichCardFromText(displayMessageText);
          const { text: origText } = parseRichCardFromText(newM.original_text || "");
          const { text: transText } = parseRichCardFromText(newM.translated_text || "");

          setMessages(prev => [...prev, {
            id: String(newM.id),
            room_id: newM.chat_id,
            sender_id: isUser ? dummyUserUuid : (isBot ? '00000000-0000-0000-0000-000000000000' : currentUserId),
            message: text || displayMessageText,
            original_text: origText,
            translated_text: transText,
            source_lang: newM.source_lang,
            target_lang: newM.target_lang,
            created_at: newM.created_at,
            sender_role: role
          }]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messageSubscription);
    };
  }, [selectedRoomId]);

  // Scroll chat window to bottom on updates using parent scrollTop to avoid window-level scroll jumps
  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Auto-translate untranslated foreign messages (for both AI and Guest) into Korean for Admin
  useEffect(() => {
    if (!messages || messages.length === 0) return;

    messages.forEach((m) => {
      if (autoTranslations[m.id]) return;

      const trans = m.translated_text?.trim() || "";
      const orig = m.message?.trim() || "";

      const hasKoreanTrans = trans && trans !== orig && /[가-힣]/.test(trans);
      const isAlreadyKorean = /[가-힣]/.test(orig);

      if (!hasKoreanTrans && !isAlreadyKorean && orig.length >= 2) {
        if (!translatingIds[m.id]) {
          handleTranslateMessage(m.id, orig);
        }
      }
    });
  }, [messages]);



  // 3. Toggle AI state (Manual Override Switch)
  const handleToggleAi = async () => {
    if (!selectedRoomId) return;
    const nextAiState = !isAiActive;
    
    // Instantly patch local react states for immediate zero-latency feedback
    setIsAiActive(nextAiState);
    setRooms(prev => prev.map(r => r.id === selectedRoomId ? { ...r, is_ai_active: nextAiState } : r));

    try {
      const { data: chatData } = await supabase
        .from("support_chats")
        .select("metadata")
        .eq("id", selectedRoomId)
        .single();

      const updatedMeta = {
        ...(chatData?.metadata || {}),
        is_ai_active: nextAiState
      };

      await supabase
        .from("support_chats")
        .update({ metadata: updatedMeta })
        .eq("id", selectedRoomId);

      fetchRooms();
    } catch (err) {
      console.error("Failed to update AI state:", err);
    }
  };

  // 5. Delete Chat Room (Manual Room Cleanup)
  const handleDeleteRoom = async (roomId: string) => {
    if (!confirm("⚠️ 경고: 이 대화방을 완전히 삭제하시겠습니까?\n고객과의 모든 대화 메시지 및 AI 분석 점수 기록이 영구히 삭제되며 복구할 수 없습니다.")) {
      return;
    }

    try {
      // Delete from support_chats (Cascade triggers will clear related messages)
      const { error: chatErr } = await supabase
        .from("support_chats")
        .delete()
        .eq("id", roomId);

      if (chatErr) throw chatErr;

      // Delete from chat_rooms
      const { error: roomErr } = await supabase
        .from("chat_rooms")
        .delete()
        .eq("id", roomId);

      if (roomErr) throw roomErr;

      // Clear local state lists
      setRooms(prev => prev.filter(r => r.id !== roomId));
      
      if (selectedRoomId === roomId) {
        setSelectedRoomId(null);
        setMessages([]);
        setPosScore(0);
        setNegScore(0);
        setActionScore(1);
        setActionType("intro");
        setSummary("대화 요약 없음");
      }

      console.log(`[Room Cleanup] Successfully deleted chat room and messages for ID: ${roomId}`);
      fetchRooms();
    } catch (err) {
      console.error("Failed to delete chat room:", err);
      alert("대화방 삭제 중 오류가 발생했습니다.");
    }
  };

  // AI Draft and Instant Action Handlers for Hybrid Manual Intervention
  const [isDrafting, setIsDrafting] = useState(false);

  const handleGenerateAiDraft = async (userMsgText: string) => {
    if (!selectedRoomId || isDrafting) return;
    setIsDrafting(true);
    try {
      const activeRoom = rooms.find(r => r.id === selectedRoomId);
      const chatHistory = messages.map(m => ({
        role: m.sender_id === dummyUserUuid ? 'user' : 'model',
        text: m.message
      }));

      const targetLang = activeRoom?.detected_language && activeRoom.detected_language !== 'ko' 
        ? activeRoom.detected_language 
        : 'ne';

      const res = await fetch("/api/chat/manager", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsgText,
          language: targetLang,
          history: chatHistory.slice(-10),
          chatId: activeRoom?.id,
          clientOs: 'web'
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.answer) {
          setInputText(data.answer);
        }
      }
    } catch (err) {
      console.error("Failed to generate AI draft:", err);
    } finally {
      setIsDrafting(false);
    }
  };

  const handleSendInstantAiReply = async (userMsgText: string) => {
    if (!selectedRoomId || isDrafting) return;
    setIsDrafting(true);
    try {
      const activeRoom = rooms.find(r => r.id === selectedRoomId);
      const chatHistory = messages.map(m => ({
        role: m.sender_id === dummyUserUuid ? 'user' : 'model',
        text: m.message
      }));

      const targetLang = activeRoom?.detected_language && activeRoom.detected_language !== 'ko' 
        ? activeRoom.detected_language 
        : 'ne';

      const res = await fetch("/api/chat/manager", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsgText,
          language: targetLang,
          history: chatHistory.slice(-10),
          chatId: activeRoom?.id,
          clientOs: 'web'
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.answer) {
          // Write directly to support_messages
          await supabase.from("support_messages").insert({
            chat_id: selectedRoomId,
            sender_type: "bot",
            original_text: data.answer,
            translated_text: data.answer,
            source_lang: "ko",
            target_lang: "ko",
            is_read: true,
            pos_score: data.posScore || 0,
            neg_score: data.negScore || 0
          });

          // Write directly to chat_messages
          await supabase.from("chat_messages").insert({
            room_id: selectedRoomId,
            sender_id: '00000000-0000-0000-0000-000000000000',
            message: data.answer,
            is_read: true
          });

          // Write directly to scores
          await supabase.from("ai_conversation_scores").insert({
            chat_room_id: selectedRoomId,
            message_text: userMsgText,
            ai_response: data.answer,
            action_type: data.actionType || 'pending',
            action_score: data.actionScore || 1,
            pos_score: data.posScore || 0,
            neg_score: data.negScore || 0
          });

          fetchRoomDetailsAndMessages(selectedRoomId);
        }
      }
    } catch (err) {
      console.error("Failed to send instant AI reply:", err);
    } finally {
      setIsDrafting(false);
    }
  };

  // 4. Send Manual Intervention Message
  const handleSendManualMessage = async () => {
    if (!selectedRoomId || !inputText.trim()) return;

    const textToSend = inputText.trim();
    setInputText("");

    try {
      const activeRoom = rooms.find(r => r.id === selectedRoomId);
      const targetLang = activeRoom?.detected_language || "ko";
      const channel = activeRoom?.channel || "web";

      // 1. Call translation & channel delivery endpoint (/api/support/send)
      let translatedMsg = textToSend;
      try {
        const res = await fetch("/api/support/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chatId: selectedRoomId,
            channel: channel,
            externalChatId: (activeRoom as any)?.external_chat_id || selectedRoomId,
            koreanText: textToSend,
            targetLang: targetLang,
          }),
        });
        const sendResData = await res.json().catch(() => ({}));
        if (sendResData.translatedText) {
          translatedMsg = sendResData.translatedText;
        }
      } catch (sendErr) {
        console.warn("[Manual Send API Error, fallback to direct save]:", sendErr);
      }

      // 2. Double write customer messages as 'admin' in support_messages
      await supabase.from("support_messages").insert({
        chat_id: selectedRoomId,
        sender_type: "admin",
        original_text: translatedMsg,
        translated_text: textToSend,
        source_lang: "ko",
        target_lang: targetLang,
        is_read: true
      });

      // 3. Write message to chat_messages
      const { error: msgErr } = await supabase.from("chat_messages").insert({
        room_id: selectedRoomId,
        sender_id: currentUserId,
        message: translatedMsg,
        is_read: true
      });

      if (msgErr) throw msgErr;

      // Analyze Sent Message
      const score = ruleBasedScore(textToSend);

      // Insert Log to ai_conversation_scores
      await supabase.from("ai_conversation_scores").insert({
        lead_id: 0,
        chat_room_id: selectedRoomId,
        planner_id: currentUserId,
        message_text: textToSend,
        ai_response: '(설계사 직접 메시지)',
        action_type: score.actionType,
        action_score: score.actionScore,
        pos_score: score.pos,
        neg_score: score.neg
      });

      // Update state live
      setActionScore(score.actionScore);
      setActionType(score.actionType);

      // RAG Self-learning loop: Boost scripts weight if manual intervention succeeded (auth completion)
      if (score.actionScore >= 5) {
        // Query if this specific response already exists in our script list
        const { data: existingScripts } = await supabase
          .from("refund_scripts")
          .select("id, success_weight, success_count")
          .eq("script_text", textToSend);

        if (existingScripts && existingScripts.length > 0) {
          const target = existingScripts[0];
          await supabase
            .from("refund_scripts")
            .update({
              success_weight: (target.success_weight || 0) + 25,
              success_count: (target.success_count || 0) + 1
            })
            .eq("id", target.id);
          console.log(`[Self-learning RAG] Incremented script success weight by +25.`);
        } else {
          // If not exists, insert as a new template planner_manual script
          await supabase.from("refund_scripts").insert({
            refund_step: 'step5_auth',
            target_psychology: 'trust_safety',
            script_text: textToSend,
            detected_language: targetLang || 'ko',
            success_weight: 25,
            success_count: 1,
            script_type: 'planner_manual'
          });
          console.log(`[Self-learning RAG] Inserted new manual speech template into RAG with success_weight = 25.`);
        }
      }

      try {
        const { data: chatData } = await supabase
          .from("support_chats")
          .select("metadata")
          .eq("id", selectedRoomId)
          .maybeSingle();
        
        const currentMeta = chatData?.metadata || {};
        const updatedMeta = {
          ...currentMeta,
          last_action_score: score.actionScore,
          last_action_type: score.actionType,
          last_message_text: textToSend
        };

        await supabase
          .from("support_chats")
          .update({
            last_message_at: new Date().toISOString(),
            metadata: updatedMeta
          })
          .eq("id", selectedRoomId);
      } catch (metaErr) {
        console.error("Failed to update parent metadata cache:", metaErr);
      }
 
      // Refresh room information
      fetchRooms();

    } catch (err) {
      console.error("Failed to send manual message:", err);
    }
  };

  const getFilteredRooms = () => {
    return rooms.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()));
  };

  // calculate success index: (pos_score * 1.5) + (action_score * 5.5) capped at 100%
  const successIndex = Math.min(Math.round((posScore * 1.5) + (actionScore * 5.5)), 100);

  return (
    <div className="w-full mt-24">
      {/* 🌐 전체 AI 자동 응답 마스터 컨트롤 패널 (사용자가 빨간색 박스로 지정한 명당자리!) */}
      <div className="mb-4 p-4 rounded-2xl bg-slate-900 border border-violet-500/30 flex items-center justify-between shadow-xl shadow-violet-950/10">
        <div className="flex items-center gap-3">
          <div className={`h-3 w-3 rounded-full ${isGlobalAiActive ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.6)] animate-pulse" : "bg-slate-650"}`} />
          <div className="flex flex-col">
            <span className="text-white text-xs font-black tracking-tight flex items-center gap-1.5">
              <span>🌐 EasyTax AI 세일즈 자동화 시스템 전체 마스터 제어 센터</span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-black ${isGlobalAiActive ? 'bg-violet-500/20 text-violet-300' : 'bg-slate-800 text-slate-400'}`}>
                {isGlobalAiActive ? "전체자동모드" : "수동상담모드"}
              </span>
            </span>
            <span className="text-[10px] text-slate-400 font-bold mt-1">
              {isGlobalAiActive 
                ? "현재 국세청 안전 연동 환급 세일즈 AI가 모든 대화방에서 고객들과 실시간으로 자동 대화를 이어가고 있습니다." 
                : "전체 대화방의 AI 자동 답변 기능이 전면 정지되었습니다. 모든 대화방이 세무사님의 수동 개입 모드로 가동됩니다."
              }
            </span>
          </div>
        </div>
        <button
          onClick={handleToggleGlobalAi}
          className={`px-5 py-2 rounded-xl border text-xs font-black transition-all cursor-pointer shadow-md hover:scale-[1.01] active:scale-[0.99] shrink-0 ${
            isGlobalAiActive 
              ? "bg-gradient-to-r from-violet-600 to-indigo-600 border-violet-500 text-white shadow-violet-950/20"
              : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
          }`}
        >
          {isGlobalAiActive ? "🔒 전체 AI 가동 중단 (일괄 수동 전환)" : "🔓 전체 AI 자동 가동 (일괄 자동화)"}
        </button>
      </div>

      {/* 3단 분할 관제 대시보드 본체 */}
      <div className="flex flex-col h-[600px] sm:h-[680px] bg-slate-950/80 rounded-2xl sm:rounded-3xl overflow-hidden border border-violet-500/20 shadow-2xl shadow-violet-950/10 transition-all duration-300">
        
        {/* HEADER */}
        <div className="flex justify-between items-center px-6 py-4 bg-slate-900/50 border-b border-slate-800/80 shrink-0">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-white text-sm font-black tracking-tight font-headline">
              EasyTax Refund AI 실시간 세일즈 관제 & RAG 자율학습
            </h2>
          </div>
          <div className="flex items-center gap-3">
            {/* Inner Dashboard Header - Cleaned up to avoid double toggle confusion */}
          </div>
        </div>

      <div className="flex-1 flex overflow-hidden">
        
        {/* 1단: 실시간 대화방 목록 (왼쪽 사이드바) */}
        <div className="w-full md:w-80 border-r border-slate-800/80 flex flex-col bg-slate-950/40 overflow-hidden">
          {/* Search bar */}
          <div className="p-3.5 border-b border-slate-800/80 relative">
            <Search className="absolute left-6 top-6 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="대화방 이름 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500"
            />
          </div>

          {/* Rooms list */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
            {getFilteredRooms().map((room) => {
              const isSelected = room.id === selectedRoomId;
              const hasAlert = room.takeover_alert;
              const chInfo = CHANNEL_UI[room.channel || "web"] || { label: room.channel || "웹", icon: "🌐", badgeClass: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30" };
              const langInfo = LANG_FLAG_MAP[room.detected_language || "ko"] || { flag: "🌐", label: room.detected_language };

              return (
                <div
                  key={room.id}
                  onClick={() => setSelectedRoomId(room.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer group relative ${
                    isSelected
                      ? "bg-violet-600/15 border-violet-500/40 shadow-sm"
                      : hasAlert
                        ? "bg-rose-500/5 border-rose-500/25 hover:bg-rose-500/10 hover:border-rose-500/40 shadow-[0_0_15px_rgba(239,68,68,0.03)]"
                        : "bg-transparent border-transparent hover:bg-slate-900/60 hover:border-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-2.5 overflow-hidden flex-1">
                    {/* Channel & Flag Mini Avatar */}
                    <div className="h-8 w-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 text-xs relative">
                      <span>{langInfo.flag}</span>
                      <span className="absolute -bottom-1 -right-1 text-[9px]">{chInfo.icon}</span>
                    </div>

                    <div className="flex flex-col gap-0.5 overflow-hidden flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-[9px] font-black px-1.5 py-0.2 rounded border flex items-center gap-0.5 shrink-0 ${chInfo.badgeClass}`}>
                          <span>{chInfo.icon}</span>
                          <span>{chInfo.label}</span>
                        </span>
                        <span className="text-xs font-black text-slate-100 truncate">
                          {room.name}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 truncate">
                        진행 단계: {room.current_step?.split(":")[0] || "Step 0"}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1.5 shrink-0 ml-1.5">
                    {hasAlert && (
                      <span className="bg-yellow-500 text-slate-950 border border-yellow-400 animate-pulse shadow-[0_0_12px_rgba(234,179,8,0.4)] px-1.5 py-0.5 rounded text-[9px] font-black uppercase flex items-center gap-1 select-none">
                        🚨 개입
                      </span>
                    )}

                    {/* Trash Delete Button: Visible on hover */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteRoom(room.id);
                      }}
                      title="대화방 삭제"
                      className="p-1.5 rounded-lg bg-slate-900/60 border border-slate-850 text-slate-500 hover:text-rose-450 hover:border-rose-500/30 opacity-0 group-hover:opacity-100 transition-all cursor-pointer shadow-sm"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              );
            })}
            {getFilteredRooms().length === 0 && (
              <div className="text-center py-12 text-slate-500 text-xs">
                상담 진행 중인 방이 없습니다.
              </div>
            )}
          </div>
        </div>

{/* 2단: 1:1 대화창 및 말풍선 정렬 (가운데) */}
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-950/20">
          {selectedRoomId ? (
            <>
              {/* Room Header with dynamic AI toggle switch (Large sticky banner right above the chat stream) */}
              <div className="px-6 py-4 bg-slate-900/80 border-b border-slate-800/80 flex items-center justify-between shrink-0 select-none">
                {(() => {
                  const currentRoom = rooms.find(r => r.id === selectedRoomId);
                  const chInfo = CHANNEL_UI[currentRoom?.channel || "web"] || { label: currentRoom?.channel || "웹", icon: "🌐", badgeClass: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30" };
                  const langInfo = LANG_FLAG_MAP[currentRoom?.detected_language || "ko"] || { flag: "🌐", label: currentRoom?.detected_language };

                  return (
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="h-2.5 w-2.5 rounded-full bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.6)] animate-pulse" />
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border flex items-center gap-1 shadow-sm ${chInfo.badgeClass}`}>
                          <span>{chInfo.icon}</span>
                          <span>{chInfo.label}</span>
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <span>{langInfo.flag}</span>
                          <span>{langInfo.label}</span>
                        </span>
                        <span className="text-white text-sm font-black tracking-tight">
                          {currentRoom?.name || "실시간 대화 관제 센터"}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold">
                        {isAiActive 
                          ? "🤖 AI 비서가 실시간으로 고객과 대화하며 세일즈를 리드 중입니다." 
                          : "👤 AI 응답 정지됨: 세무사님이 직접 수동으로 대화를 개입 관리하고 있습니다."
                        }
                      </span>
                    </div>
                  );
                })()}
                
                {/* Massive direct Toggle Switch Button */}
                <button
                  onClick={handleToggleAi}
                  className={`px-5 py-2.5 rounded-xl border text-xs font-black transition-all cursor-pointer shadow-lg hover:scale-[1.02] active:scale-[0.98] ${
                    isAiActive 
                      ? "bg-gradient-to-r from-violet-600 to-indigo-600 border-violet-500 text-white shadow-violet-950/20"
                      : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {isAiActive ? "🤖 이 대화방 AI 끄기 (수동)" : "⚡ 이 대화방 AI 켜기 (자동)"}
                </button>
              </div>

              {/* Golden Time Alert Banner */}
              {takeoverAlert && (
                <div className="mx-6 mt-3 p-3 bg-gradient-to-r from-amber-500/20 via-orange-500/25 to-yellow-500/20 border border-amber-500/30 rounded-xl flex items-center justify-between shadow-lg shadow-orange-950/20 animate-pulse select-none shrink-0">
                  <div className="flex items-center gap-2 text-amber-300">
                    <ShieldAlert className="h-4 w-4 animate-bounce" />
                    <span className="text-[11px] font-black tracking-tight">
                      [골든타임 경고] 고객의 부정 정서 임계치 도달! 세무사님의 수동 답변 개입이 시급합니다.
                    </span>
                  </div>
                </div>
              )}

              {/* Message Stream */}
              <div 
                ref={messageContainerRef}
                className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar"
              >
                {messages.map((msg, index) => {
                  const isUser = msg.sender_role === 'guest';
                  const isBot = msg.sender_role === 'bot';

                  return (
                    <div
                      key={`${msg.id}-${index}`}
                      className={`flex gap-2 max-w-[85%] ${isUser ? "mr-auto" : "ml-auto flex-row-reverse"}`}
                    >
                      {/* Avatar */}
                      <div className="h-7 w-7 rounded-full overflow-hidden border bg-slate-800 shrink-0 flex items-center justify-center text-xs">
                        {isUser ? (
                          <User className="h-3.5 w-3.5 text-slate-400" />
                        ) : isBot ? (
                          <Bot className="h-3.5 w-3.5 text-violet-400" />
                        ) : (
                          <UserCheck className="h-3.5 w-3.5 text-emerald-400" />
                        )}
                      </div>

                      {/* Bubble */}
                      <div className="flex flex-col max-w-md shrink-0">
                        <div
                          className={`px-4 py-2.5 rounded-2xl text-xs font-medium leading-relaxed break-keep whitespace-pre-wrap ${
                            isUser
                              ? "bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700/50"
                              : isBot
                                ? "bg-violet-600/25 text-violet-200 border border-violet-500/20 rounded-br-none shadow-md"
                                : "bg-violet-600 text-white rounded-br-none shadow-md shadow-violet-700/10"
                          }`}
                        >
                          {/* 1. 메인 텍스트 (원문 / 발송 모국어) */}
                          <div className="leading-relaxed">{msg.message}</div>

                          {/* 2. 한국어 실시간 번역 자막 (외국어 대화 시 항상 표시) */}
                          {(() => {
                            const cachedAuto = autoTranslations[msg.id];
                            const trans = cachedAuto || msg.translated_text?.trim();
                            const orig = msg.message?.trim() || "";
                            
                            // Check if valid Korean translation exists
                            const hasKoreanTranslation = Boolean(
                              trans && 
                              /[가-힣]/.test(trans) && 
                              (trans !== orig || Boolean(cachedAuto))
                            );

                            const isForeignWithoutTrans = !hasKoreanTranslation && !/[가-힣]/.test(orig);
                            const isCurrentlyTranslating = translatingIds[msg.id];

                            if (hasKoreanTranslation && trans) {
                              return (
                                <div className={`mt-2 pt-2 border-t flex flex-col gap-0.5 ${
                                  isUser 
                                    ? "border-slate-700 text-amber-200/90" 
                                    : "border-violet-500/30 text-emerald-200/90"
                                }`}>
                                  <div className="flex items-center justify-between gap-1 text-[9px] font-black tracking-tight">
                                    <span className={isUser ? "text-amber-400" : "text-emerald-400"}>
                                      🇰🇷 {isUser ? "고객 메시지 한국어 번역" : "AI 답변 한국어 번역"}
                                    </span>
                                  </div>
                                  <div className={`text-[11px] leading-snug font-normal p-1.5 rounded-lg ${
                                    isUser 
                                      ? "text-slate-200 bg-slate-950/60" 
                                      : "text-violet-100 bg-slate-950/60"
                                  }`}>
                                    {trans}
                                  </div>
                                </div>
                              );
                            }

                            if (isCurrentlyTranslating) {
                              return (
                                <div className="mt-2 pt-1.5 border-t border-slate-700/40 flex items-center gap-1.5 text-[9px] text-slate-400 font-bold animate-pulse">
                                  <Sparkles className="h-2.5 w-2.5 text-violet-400 animate-spin" />
                                  <span>한국어 번역 중...</span>
                                </div>
                              );
                            }

                            if (isForeignWithoutTrans && orig.length >= 2) {
                              return (
                                <button
                                  onClick={() => handleTranslateMessage(msg.id, orig)}
                                  className="mt-2 pt-1 border-t border-slate-700/40 text-[9px] text-violet-400 hover:text-violet-300 font-black flex items-center gap-1 cursor-pointer"
                                >
                                  <span>🇰🇷 한국어 번역 보기</span>
                                </button>
                              );
                            }

                            return null;
                          })()}
                        </div>
                        
                        {/* Time & Action Toolbar Line-broken to eliminate horizontal jitter */}
                        <div className="mt-1 px-1 flex flex-col gap-1 shrink-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[8.5px] text-slate-500 font-bold">
                              {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {isUser && (msg.pos_score !== undefined || msg.neg_score !== undefined) && (
                              <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800/80 flex items-center gap-1.5 select-none shrink-0">
                                <span className="text-emerald-400">🟢 신뢰 {msg.pos_score ?? 0}</span>
                                <span className="text-slate-700">|</span>
                                <span className={msg.neg_score && msg.neg_score >= 3 ? "text-rose-400 font-black animate-pulse" : "text-slate-400"}>
                                  🔴 의심 {msg.neg_score ?? 0}
                                </span>
                              </span>
                            )}
                          </div>

                          {/* Client-level AI single turn intervention quick options */}
                          {isUser && (
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <button
                                onClick={() => handleGenerateAiDraft(msg.message)}
                                disabled={isDrafting}
                                title="AI 답변 초안 불러오기"
                                className="h-5 px-1.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 transition-all text-[8px] font-black flex items-center gap-0.5 disabled:opacity-30 cursor-pointer"
                              >
                                <Sparkles className="h-2 w-2 text-amber-400" />
                                <span>초안</span>
                              </button>
                              <button
                                onClick={() => handleSendInstantAiReply(msg.message)}
                                disabled={isDrafting}
                                title="AI 답변 즉시 전송"
                                className="h-5 px-2 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 transition-all text-[8px] font-black flex items-center gap-0.5 disabled:opacity-30 cursor-pointer"
                              >
                                <Send className="h-2 w-2 text-emerald-400" />
                                <span>즉시전송</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>

              {/* Input Bar */}
              <div className="p-4 border-t border-slate-800/80 bg-slate-900/40 flex items-center gap-3 shrink-0">
                <input
                  type="text"
                  placeholder={
                    isDrafting
                      ? "AI 세일즈 비서가 고객 멘트 분석 및 초안 생성 중입니다..."
                      : isAiActive 
                        ? "AI 세일즈 비서가 자동 응답 중입니다... 수동 강제 개입 시 입력하세요."
                        : "고객에게 전송할 수동 영업 성공 멘트를 입력하세요..."
                  }
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendManualMessage()}
                  disabled={isDrafting}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500 font-bold disabled:opacity-50"
                />
                <button
                  onClick={handleSendManualMessage}
                  disabled={!inputText.trim() || isDrafting}
                  className="h-9 w-9 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-30 text-white flex items-center justify-center transition-all shrink-0 cursor-pointer shadow-md"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-xs">
              <MessageSquare className="h-8 w-8 text-slate-700 mb-2" />
              관제할 대화방을 선택해 주세요.
            </div>
          )}
        </div>

        {/* 3단: AI 관제 & 실시간 스캔 패널 (오른쪽 사이드바) */}
        <div className="w-80 border-l border-slate-800/80 bg-slate-950/40 p-5 flex flex-col gap-5 overflow-y-auto shrink-0 custom-scrollbar">
          <h3 className="text-white text-xs font-black tracking-wider uppercase border-b border-slate-800 pb-2">
            AI 실시간 분석 & 자율학습 스캔
          </h3>

          {/* Real-time client typing indicator scan */}
          {isTypingScan && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 flex flex-col gap-1.5 shadow-[0_0_15px_rgba(234,179,8,0.05)] animate-pulse shrink-0">
              <div className="flex items-center gap-1.5 text-yellow-500 text-[10px] font-black uppercase tracking-wider">
                <Sparkles className="h-3 w-3" />
                <span>실시간 유저 타이핑 감지됨</span>
              </div>
              <p className="text-[10px] text-slate-300 font-bold italic truncate break-all">
                "{typingScanText}"
              </p>
            </div>
          )}

          {/* 1. Donut circular chart */}
          <div className="flex flex-col items-center justify-center p-3 border border-slate-800/50 bg-slate-950/40 rounded-2xl">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
              환급 성공 예측 지수
            </span>
            <div className="relative w-28 h-28 flex items-center justify-center rounded-full bg-slate-900 border border-slate-800/80 shadow-lg shadow-violet-950/20">
              {/* Circle stroke */}
              <svg className="absolute w-full h-full transform -rotate-95" viewBox="0 0 100 100">
                <circle
                  className="text-slate-800"
                  strokeWidth="6"
                  stroke="currentColor"
                  fill="transparent"
                  r="38"
                  cx="50"
                  cy="50"
                />
                <circle
                  className="text-violet-500 transition-all duration-500"
                  strokeWidth="6"
                  strokeDasharray={`${2 * Math.PI * 38}`}
                  strokeDashoffset={`${2 * Math.PI * 38 * (1 - successIndex / 100)}`}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="38"
                  cx="50"
                  cy="50"
                />
              </svg>
              <div className="flex flex-col items-center justify-center">
                <span className="text-white text-lg font-black">{successIndex}%</span>
                <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">
                  {successIndex >= 80 ? "SUCCESS" : successIndex >= 50 ? "PROGRESS" : "INTRO"}
                </span>
              </div>
            </div>
          </div>

          {/* 2. Sentiment score bars */}
          <div className="space-y-4">
            {/* Positive Score */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[10px] font-black">
                <span className="text-emerald-400">동조/긍정 반응도</span>
                <span className="text-white">{posScore} / 10</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(posScore * 10, 100)}%` }}
                />
              </div>
            </div>

            {/* Negative Score */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[10px] font-black">
                <span className="text-rose-400">거부/의심 지수</span>
                <span className="text-white">{negScore} / 10</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-rose-500 to-rose-400 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(negScore * 10, 100)}%` }}
                />
              </div>
            </div>

            {/* Action score */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[10px] font-black">
                <span className="text-[#e2b659]">행동 진척도</span>
                <span className="text-white">{actionScore} / 10</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(actionScore * 10, 100)}%` }}
                />
              </div>
              <div className="text-[8px] text-slate-500 font-bold">
                타입: <span className="text-white uppercase">{actionType}</span>
              </div>
            </div>
          </div>

          {/* 3. User Fact Profiler & RAG learnings summary */}
          <div className="border-t border-slate-800 pt-4 space-y-4">
            {/* Profiler facts */}
            <div>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                고객 식별 데이터 스캔
              </h4>
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-3 space-y-1.5">
                {Object.keys(facts).length > 0 ? (
                  Object.entries(facts).map(([key, val]) => (
                    <div key={key} className="flex justify-between text-[10px]">
                      <span className="text-slate-500">{key}:</span>
                      <span className="text-slate-200 truncate font-semibold">{val}</span>
                    </div>
                  ))
                ) : (
                  <span className="text-[10px] text-slate-600 block text-center py-2">
                    추출된 신상 데이터가 없습니다.
                  </span>
                )}
              </div>
            </div>

            {/* AI Summary / Context */}
            <div>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                RAG 학습 성공 사례
              </h4>
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-3">
                <p className="text-[10px] text-slate-300 leading-relaxed break-keep font-medium">
                  {summary}
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
    </div>
  );
}
