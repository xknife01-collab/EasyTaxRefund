"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { SupportChat, SupportMessage } from "@/types/chat";
import { useToast } from "@/hooks/use-toast";

export function useOmniChat(isOpen: boolean, initialChatId?: string | null) {
  const { toast } = useToast();
  const [chats, setChats] = useState<SupportChat[]>([]);
  const [selectedChat, setSelectedChat] = useState<SupportChat | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [activeChannelFilter, setActiveChannelFilter] = useState<string>("all");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevChatIdRef = useRef<string | null>(null);

  // 1. Fetch active support chat sessions
  const fetchChats = async () => {
    try {
      setIsLoadingChats(true);
      const { data, error } = await supabase
        .from("support_chats")
        .select("*")
        .order("last_message_at", { ascending: false });

      if (error) throw error;
      setChats(data || []);

      // If we have chats and none is currently selected, select the initial one or the first one
      if (data && data.length > 0 && !selectedChat) {
        const initialMatch = initialChatId ? data.find(c => c.id === initialChatId) : null;
        setSelectedChat(initialMatch || data[0]);
      }
    } catch (err: any) {
      console.error("Failed to fetch support chats:", err);
    } finally {
      setIsLoadingChats(false);
    }
  };

  // 2. Fetch message history for selected chat
  const fetchMessages = async (chatId: string) => {
    try {
      setIsLoadingMessages(true);
      const { data, error } = await supabase
        .from("support_messages")
        .select("*")
        .eq("chat_id", chatId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages(data || []);

      // Mark messages as read
      await supabase
        .from("support_messages")
        .update({ is_read: true })
        .eq("chat_id", chatId)
        .eq("sender_type", "customer")
        .eq("is_read", false);

      // Reset chat unread count locally and in DB
      await supabase
        .from("support_chats")
        .update({ unread_count: 0 })
        .eq("id", chatId);

    } catch (err: any) {
      console.error("Failed to load messages:", err);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  // Fetch chats on drawer open
  useEffect(() => {
    if (isOpen) {
      fetchChats();
    }
  }, [isOpen]);

  // Select initial chat when provided
  useEffect(() => {
    if (isOpen && initialChatId && chats.length > 0) {
      const match = chats.find(c => c.id === initialChatId);
      if (match && selectedChat?.id !== match.id) {
        setSelectedChat(match);
      }
    }
  }, [isOpen, initialChatId, chats]);

  // Fetch messages when active chat changes
  useEffect(() => {
    if (selectedChat) {
      if (prevChatIdRef.current !== selectedChat.id) {
        prevChatIdRef.current = selectedChat.id;
        fetchMessages(selectedChat.id);
      }
    } else {
      prevChatIdRef.current = null;
      setMessages([]);
    }
  }, [selectedChat]);

  // 3. Supabase Realtime Subscription
  useEffect(() => {
    if (!isOpen) return;

    const channel = supabase
      .channel("omnichannel_support_realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "support_messages" },
        (payload) => {
          const newMsg = payload.new as SupportMessage;
          if (selectedChat && newMsg.chat_id === selectedChat.id) {
            setMessages((prev) => [...prev, newMsg]);
            
            // Mark new incoming message as read immediately since we are in the room
            if (newMsg.sender_type === "customer") {
              supabase
                .from("support_messages")
                .update({ is_read: true })
                .eq("id", newMsg.id)
                .then(() => {
                  supabase
                    .from("support_chats")
                    .update({ unread_count: 0 })
                    .eq("id", selectedChat.id);
                });
            }
          }
          fetchChats();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "support_chats" },
        () => {
          fetchChats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isOpen, selectedChat]);

  // Scroll to bottom helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 4. Send admin reply (translates Korean reply into client native language)
  const sendAdminReply = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || !selectedChat || isSending) return;

    setIsSending(true);
    if (!textToSend) setInputText("");

    try {
      const res = await fetch("/api/support/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId: selectedChat.id,
          channel: selectedChat.channel,
          externalChatId: selectedChat.external_chat_id,
          koreanText: text,
          targetLang: selectedChat.detected_language || "en",
        }),
      });

      const data = await res.json();
      if (!data.ok) {
        throw new Error(data.error || "메시지 발송 실패");
      }

      // Local state update fallback (in case Supabase realtime replication is disabled or slow)
      const newAdminMsg: SupportMessage = {
        id: Math.random().toString(), // temporary client-side ID
        chat_id: selectedChat.id,
        sender_type: 'admin',
        original_text: text,
        translated_text: data.translatedText || text,
        source_lang: 'ko',
        target_lang: data.targetLang || 'en',
        is_read: true,
        created_at: new Date().toISOString()
      };
      
      setMessages((prev) => {
        // Prevent duplicate messages if realtime subscription already processed it
        if (prev.some(m => m.original_text === text && m.sender_type === 'admin')) {
          return prev;
        }
        return [...prev, newAdminMsg];
      });

      toast({
        title: "✅ 번역 메시지 발송 성공",
        description: `${selectedChat.channel.toUpperCase()} 고객에게 번역 전송되었습니다.`,
      });
    } catch (err: any) {
      console.error("Failed to send reply:", err);
      toast({
        variant: "destructive",
        title: "전송 오류",
        description: err.message || "서버 통신 중 오류가 발생했습니다.",
      });
      if (!textToSend) setInputText(text); // restore
    } finally {
      setIsSending(false);
    }
  };

  // Filtered chats based on left channel filter tab
  const filteredChats = chats.filter((chat) => {
    if (activeChannelFilter === "all") return true;
    return chat.channel === activeChannelFilter;
  });

  return {
    chats: filteredChats,
    allChatsRawCount: chats.length,
    selectedChat,
    setSelectedChat,
    messages,
    inputText,
    setInputText,
    isSending,
    isLoadingChats,
    isLoadingMessages,
    activeChannelFilter,
    setActiveChannelFilter,
    sendAdminReply,
    messagesEndRef,
    refreshChats: fetchChats
  };
}
