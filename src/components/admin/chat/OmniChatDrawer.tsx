"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bot, RefreshCw } from "lucide-react";
import { useOmniChat } from "@/hooks/useOmniChat";
import { ChatSidebar } from "./ChatSidebar";
import { ChatWindow } from "./ChatWindow";
import { ChatMacros } from "./ChatMacros";

interface OmniChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialChatId?: string | null;
}

export function OmniChatDrawer({ isOpen, onClose, initialChatId }: OmniChatDrawerProps) {
  const {
    chats,
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
    refreshChats
  } = useOmniChat(isOpen, initialChatId);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[85vh] p-0 overflow-hidden bg-[#0f172a] text-slate-100 border border-slate-800 rounded-3xl flex flex-col shadow-2xl">
        {/* Top Header Panel */}
        <DialogHeader className="px-6 py-4 border-b border-slate-800 bg-[#0b1329] flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-sky-500/10 border border-sky-500/30 rounded-2xl flex items-center justify-center text-sky-400">
              <Bot className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <DialogTitle className="text-lg font-black text-white flex items-center gap-2">
                옴니채널 통합 실시간 AI 번역 상담 센터
                <Badge className="bg-sky-500/20 text-sky-400 border border-sky-500/30 text-[10px] font-black">
                  Omni Translate Hub
                </Badge>
              </DialogTitle>
              <p className="text-xs text-slate-400 font-medium">
                텔레그램, 카카오톡, 왓츠앱, 페이스북 문의를 한곳에서 한국어로 상담
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={refreshChats}
            className="text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </DialogHeader>

        {/* Master Details Split Container */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden min-h-0">
          {/* Left Session Sidebar */}
          <div className="md:col-span-4 flex flex-col overflow-hidden min-h-0">
            <ChatSidebar
              chats={chats}
              selectedChat={selectedChat}
              onSelectChat={setSelectedChat}
              isLoading={isLoadingChats}
              activeFilter={activeChannelFilter}
              onFilterChange={setActiveChannelFilter}
            />
          </div>

          {/* Right Active Room Area */}
          <div className="md:col-span-8 flex flex-col overflow-hidden min-h-0">
            <ChatWindow
              selectedChat={selectedChat}
              messages={messages}
              inputText={inputText}
              onChangeInput={setInputText}
              onSend={() => sendAdminReply()}
              isSending={isSending}
              isLoadingMessages={isLoadingMessages}
              messagesEndRef={messagesEndRef}
            />

            {selectedChat && (
              <ChatMacros
                onSelectMacro={(macro) => sendAdminReply(macro)}
                disabled={isSending}
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
