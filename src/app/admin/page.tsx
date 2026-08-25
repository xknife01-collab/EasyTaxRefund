"use client";

/** 
 * DESIGN_LOCK: DO NOT ALTER VISUAL LAYOUT, COLORS, OR ANIMATIONS.
 * 이 파일의 모든 디자인 요소 및 관리자 대시보드 로직은 고정되어 있습니다.
 */

import { useState, useMemo, useEffect, useRef } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Users as UsersIcon,
  FileText,
  Wallet,
  Trophy,
  ChevronRight,
  ChevronLeft,
  Loader2,
  FileSearch,
  Files,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Clock,
  AlertTriangle,
  LayoutDashboard,
  Download,
  Printer,
  BellRing,
  ShoppingBag
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { translateNotification } from "@/ai/flows/notification-translation-flow";
import { MessageSquare, Send, Trash2, Copy, Key, PenTool, EyeOff, ZoomIn, ZoomOut, Eye, FileImage, Cpu } from "lucide-react";
import { translateChatMessage } from "@/ai/flows/chat-translation-flow";
import { getDecryptedHometaxCredentialsMap } from "@/ai/flows/automated-refund-estimate";
import { useTranslation } from "@/components/LanguageContext";
import { cn } from "@/lib/utils";
import { getKstDateString } from "@/lib/tracking";


import { useToast } from "@/hooks/use-toast";
import { OmniChatDrawer } from "@/components/admin/chat/OmniChatDrawer";
import { LiveMessengerFeed } from "@/components/admin/LiveMessengerFeed";
import RefundChatTab from "@/components/admin/chat/RefundChatTab";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, doc, updateDoc, addDoc, serverTimestamp, deleteDoc, increment, writeBatch } from "firebase/firestore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

/** 
 * [데이터 격리 컴포넌트]
 * 보안 규칙이 전면 개방되었으므로, 관리자 확인 즉시 데이터를 렌더링합니다.
 */
function AdminDashboardContent({ isAdmin }: { isAdmin: boolean }) {
  const { toast } = useToast();
  const router = useRouter();

  const [reportApp, setReportApp] = useState<any>(null);
  const [isTaxReportOpen, setIsTaxReportOpen] = useState(false);
  const [isDocsViewerOpen, setIsDocsViewerOpen] = useState(false);
  const [activeDocPreview, setActiveDocPreview] = useState<any>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isNoteDrawerOpen, setIsNoteDrawerOpen] = useState(false);
  const [noteAppId, setNoteAppId] = useState<string | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [noteType, setNoteType] = useState<'Info' | 'ActionRequired'>('Info');
  const [isTranslating, setIsTranslating] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [activeView, setActiveView] = useState<'dashboard' | 'hometax' | 'aichat'>('dashboard');
  const [isHardDelete, setIsHardDelete] = useState(false);
  const [isTelegramDrawerOpen, setIsTelegramDrawerOpen] = useState(false);
  const [activeLiveChatId, setActiveLiveChatId] = useState<string | null>(null);

  // Chat States
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatAppId, setChatAppId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isSendingChat, setIsSendingChat] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const [isDocsLoading, setIsDocsLoading] = useState(false);
  const [internalMemo, setInternalMemo] = useState("");
  const [docRequestInput, setDocRequestInput] = useState("");
  const [isRequestingDoc, setIsRequestingDoc] = useState(false);
  const [isSavingMemo, setIsSavingMemo] = useState(false);
  const [kmarketFilter, setKmarketFilter] = useState<'all' | 'kmarket' | 'general'>('all');
  const [searchId, setSearchId] = useState("");
  const [searchName, setSearchName] = useState("");
  const [searchPhone, setSearchPhone] = useState("");
  const [sortBy, setSortBy] = useState<'dateDesc' | 'dateAsc' | 'nationality' | 'amountDesc' | 'amountAsc'>('dateDesc');
  const [apps, setApps] = useState<any[]>([]);
  const [appsLoading, setAppsLoading] = useState(true);
  
  const [credentialsMap, setCredentialsMap] = useState<Record<string, { hometaxId: string, hometaxPw: string, registrationNumber: string }>>({});
  const [credentialsLoading, setCredentialsLoading] = useState(false);

  const fetchCredentials = async () => {
    setCredentialsLoading(true);
    try {
      const res = await getDecryptedHometaxCredentialsMap();
      if (res.success && res.credentialsMap) {
        setCredentialsMap(res.credentialsMap);
      }
    } catch (err) {
      console.error("Failed to load credentials map from Supabase:", err);
    } finally {
      setCredentialsLoading(false);
    }
  };

  useEffect(() => {
    if (activeView === 'hometax') {
      fetchCredentials();
    }
  }, [activeView]);
  const [todayVisits, setTodayVisits] = useState(0);
  const [todayInstalls, setTodayInstalls] = useState(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkConfirmOpen, setIsBulkConfirmOpen] = useState(false);
  const [bulkActionType, setBulkActionType] = useState<'hide' | 'delete'>('hide');

  // Firestore 실시간 리스너
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const view = params.get("view");
      if (view === "hometax") {
        setActiveView("hometax");
      } else if (view === "dashboard") {
        setActiveView("dashboard");
      }
    }
  }, []);

  useEffect(() => {
    const fetchSupabaseApps = async () => {
      try {
        const { data, error } = await supabase
          .from('tax_applications')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          const formatted = data.map(d => {
            const isFromKmarket = d.metadata?.utmSource === 'kmarket' || 
                                  d.metadata?.referralSource === 'kmarket' || 
                                  d.metadata?.source === 'kmarket' || 
                                  d.metadata?.detectedSource === 'kmarket' || 
                                  !!d.metadata?.kmarketLeadId;
            return {
              id: d.id,
              fullName: d.full_name,
              phone: d.phone,
              registrationNumber: d.registration_number,
              telecom: d.telecom,
              language: d.language,
              status: d.status,
              step: d.step,
              estimatedRefundAmount: d.estimated_refund_amount,
              serviceFee: d.service_fee,
              isFromKmarket,
              createdAt: { seconds: Math.floor(new Date(d.created_at).getTime() / 1000) },
              updatedAt: { seconds: Math.floor(new Date(d.updated_at).getTime() / 1000) },
              ...(d.metadata || {})
            };
          });
          setApps(formatted);
          setAppsLoading(false);
        }
      } catch (err) {
        console.error('Supabase tax_applications 조회 오류:', err);
      }
    };

    fetchSupabaseApps();
    const interval = setInterval(fetchSupabaseApps, 5000);
    return () => clearInterval(interval);
  }, []);

  const filteredApps = useMemo(() => {
    let result = [...apps];
    if (activeView === 'dashboard') {
      result = result.filter(app => app.isDeleted !== true && app.deletedFromDashboard !== true);
    } else if (activeView === 'hometax') {
      result = result.filter(app => {
        const hasHometax = !!(credentialsMap[app.id]?.hometaxId || app.hometaxId);
        return hasHometax;
      });
    }
    if (kmarketFilter === 'kmarket') {
      result = result.filter(app => app.isFromKmarket);
    } else if (kmarketFilter === 'general') {
      result = result.filter(app => !app.isFromKmarket);
    }
    if (searchId.trim()) {
      const low = searchId.toLowerCase();
      result = result.filter(app => (app.id || "").toLowerCase().includes(low));
    }
    if (searchName.trim()) {
      const low = searchName.toLowerCase();
      result = result.filter(app => (app.fullName || "").toLowerCase().includes(low));
    }
    if (searchPhone.trim()) {
      const low = searchPhone.toLowerCase();
      result = result.filter(app => (app.phone || app.phoneNo || "").includes(low));
    }

    // Apply sorting
    result.sort((a, b) => {
      if (sortBy === 'dateDesc') {
        const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : new Date(a.createdAt || 0).getTime();
        const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : new Date(b.createdAt || 0).getTime();
        return timeB - timeA;
      }
      if (sortBy === 'dateAsc') {
        const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : new Date(a.createdAt || 0).getTime();
        const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : new Date(b.createdAt || 0).getTime();
        return timeA - timeB;
      }
      if (sortBy === 'nationality') {
        const langA = (a.userLanguage || "").toLowerCase();
        const langB = (b.userLanguage || "").toLowerCase();
        return langA.localeCompare(langB);
      }
      if (sortBy === 'amountDesc') {
        const amtA = a.estimatedRefundAmount ?? 0;
        const amtB = b.estimatedRefundAmount ?? 0;
        return amtB - amtA;
      }
      if (sortBy === 'amountAsc') {
        const amtA = a.estimatedRefundAmount ?? 0;
        const amtB = b.estimatedRefundAmount ?? 0;
        return amtA - amtB;
      }
      return 0;
    });

    return result;
  }, [apps, searchId, searchName, searchPhone, activeView, sortBy, credentialsMap]);

  // Pagination Logic
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    setCurrentPage(1);
    setSelectedIds([]);
  }, [searchId, searchName, searchPhone]);

  useEffect(() => {
    setSelectedIds([]);
  }, [activeView, currentPage]);

  const paginatedApps = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredApps.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredApps, currentPage]);

  const totalPages = Math.ceil(filteredApps.length / itemsPerPage);

  // Global Unread & Push Notification Logic
  const prevUnreadRef = useRef<number>(-1);
  
  useEffect(() => {
    if (appsLoading) return;
    
    const totalUnread = apps.reduce((acc, app) => acc + (app.unreadChatCountAdmin || 0), 0);
    
    // 1. 브라우저 탭 타이틀 알림 (다른 탭에 있어도 확인 가능하게)
    if (totalUnread > 0) {
      document.title = `(${totalUnread}) 새 메시지 - 이지텍스 관리자`;
    } else {
      document.title = `이지텍스 관리자`;
    }

    // 2. 새 메시지 수신 시 사운드 및 토스트 알람 푸시 (초기 로딩 시점의 울림 방지)
    if (prevUnreadRef.current >= 0 && totalUnread > prevUnreadRef.current) {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        // 맑고 경쾌한 알림음 (E5 -> A5)
        osc.frequency.setValueAtTime(659.25, audioCtx.currentTime);     
        osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.1); 
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.5);
      } catch(e) {
        console.log("Audio play failed: ", e);
      }

      const appWithNewMsg = apps.find(a => (a.unreadChatCountAdmin || 0) > 0);
      toast({
        title: "🔔 새로운 메시지 도착!",
        description: `${appWithNewMsg?.fullName || '가등록 고객'}님으로부터 새 메시지가 도착했습니다. 즉시 확인해주세요!`,
        duration: 8000,
        className: "bg-blue-600 text-white border-none shadow-2xl font-black rounded-2xl",
      });
    }
    
    prevUnreadRef.current = totalUnread;
  }, [apps, appsLoading, toast]);

  // Chat Real-time Listener
  useEffect(() => {
    if (!chatAppId || !isChatOpen) {
      setChatMessages([]);
      return;
    }
    
    // 유저 전환 시 이전 메시지 즉시 비우기
    setChatMessages([]);
    
    const chatQuery = query(
      collection(db, 'applications', chatAppId, 'chat_messages'),
      orderBy('timestamp', 'asc')
    );
    
    const unsubscribe = onSnapshot(chatQuery, (snapshot) => {
      const msgs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setChatMessages(msgs);
    }, (error) => {
      console.error('채팅 Firestore 오류:', error);
    });
    
    return () => unsubscribe();
  }, [chatAppId, isChatOpen]);

  // 자동 스크롤
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // users 컬렉션 대신 apps 데이터에서 직접 언어/채널 정보를 추출
  const usersError = null;

  const stats = useMemo(() => {
    if (!apps) return [];
    const today = getKstDateString();
    
    // Safely extract string representation of dates
    const safeDateString = (dateVal: any) => {
      if (!dateVal) return "";
      if (typeof dateVal === 'string') return dateVal;
      if (dateVal.toDate && typeof dateVal.toDate === 'function') {
        return getKstDateString(dateVal.toDate());
      }
      if (dateVal instanceof Date) {
        return getKstDateString(dateVal);
      }
      return String(dateVal);
    };

    const todayApps = apps.filter(a => safeDateString(a.createdAt).startsWith(today)).length;
    
    // Revenue calculations
    const totalEstimatedRefund = apps.reduce((acc, app) => acc + (app.estimatedRefundAmount || 0), 0);
    const expectedRevenue = Math.floor(totalEstimatedRefund * 0.22); // 22% fee
    
    // Revenue based on manual payment confirmation
    const completedAppsList = apps.filter(a => a.status === 'RefundCompleted');
    const completedApps = completedAppsList.length;
    
    const paidAppsList = apps.filter(a => a.paymentStatus === 'paid');
    const paidRevenue = paidAppsList.reduce((acc, app) => acc + Math.floor((app.estimatedRefundAmount || 0) * 0.22), 0);
    
    // Unpaid revenue is expected revenue minus already paid revenue
    const unpaidRevenue = expectedRevenue - paidRevenue;
    
    // Settlement: Partner gets flat 50,000 KRW per paid case
    const settlementTaxAccountant = paidAppsList.length * 50000;
    const settlementCompany = paidRevenue - settlementTaxAccountant;

    const successRate = apps.length > 0 ? ((completedApps / apps.length) * 100).toFixed(1) : "0.0";

    const kmarketAppsList = apps.filter(a => a.isFromKmarket);
    const kmarketCount = kmarketAppsList.length;
    const kmarketRefundTotal = kmarketAppsList.reduce((acc, a) => acc + (a.estimatedRefundAmount || 0), 0);

    return [
      { label: "오늘 방문자", value: `${todayVisits}명`, icon: <RotateCcw className="h-5 w-5" /> },
      { label: "오늘 PWA 설치", value: `${todayInstalls}건`, icon: <Download className="h-5 w-5 text-indigo-500" /> },
      { label: "오늘 신청 수", value: `${todayApps}건`, icon: <FileText className="h-5 w-5" /> },
      { label: "🛍️ 케이마켓 연계", value: `${kmarketCount}건 (₩${kmarketRefundTotal.toLocaleString()})`, icon: <ShoppingBag className="h-5 w-5 text-amber-500" /> },
      { label: "누적 예상 수수료", value: `₩ ${expectedRevenue.toLocaleString()}`, icon: <Wallet className="h-5 w-5" /> },
      { label: "결제 완료 수익", value: `₩ ${paidRevenue.toLocaleString()}`, icon: <ShieldCheck className="h-5 w-5 text-green-500" /> },
      { label: "미결제 예정액", value: `₩ ${unpaidRevenue > 0 ? unpaidRevenue.toLocaleString() : 0}`, icon: <Clock className="h-5 w-5 text-amber-500" /> },
      { label: "당사 순수익 (정산)", value: `₩ ${settlementCompany.toLocaleString()}`, icon: <Wallet className="h-5 w-5 text-indigo-500" /> },
      { label: "파트너 정산 (건당 5만)", value: `₩ ${settlementTaxAccountant.toLocaleString()}`, icon: <Wallet className="h-5 w-5 text-slate-500" /> },
      { label: "환급 성공률", value: `${successRate}%`, icon: <Trophy className="h-5 w-5" /> },
    ];
  }, [apps, todayVisits, todayInstalls]);

  const LANG_LABEL: Record<string, string> = {
    'ko': '🇰🇷 한국어', 'vi': '🇻🇳 베트남어', 'zh': '🇨🇳 중국어',
    'km': '🇰🇭 캄보디아어', 'ne': '🇳🇵 네팔어', 'uz': '🇺🇿 우즈베크어',
    'my': '🇲🇲 미얀마어', 'id': '🇮🇩 인도네시아어', 'th': '🇹🇭 태국어',
    'en': '🇵🇭 영어(필리핀)', 'si': '🇱🇰 스리랑카어', 'mn': '🇲🇳 몽골어',
    'bn': '🇧🇩 방글라데시어', 'kk': '🇰🇿 카자흐어', 'ur': '🇵🇰 우르두어'
  };

  const marketingStats = useMemo(() => {
    if (!apps) return { byLanguage: [], byUtm: [], funnel: {} };

    // 언어별 집계 (apps에서 직접 추출)
    const byLang: Record<string, { total: number, paid: number, revenue: number }> = {};
    const byUtm: Record<string, { total: number, paid: number, revenue: number }> = {};
    const funnel: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0 };

    apps.forEach(app => {
      // 언어별 통계
      const lang = app.userLanguage || 'ko';
      const langLabel = LANG_LABEL[lang] || lang.toUpperCase();
      if (!byLang[langLabel]) byLang[langLabel] = { total: 0, paid: 0, revenue: 0 };
      byLang[langLabel].total++;
      if (app.paymentStatus === 'paid') {
        byLang[langLabel].paid++;
        byLang[langLabel].revenue += Math.floor((app.estimatedRefundAmount || 0) * 0.22);
      }

      // UTM 채널별 통계
      let source = app.utmSource;
      if (app.isFromKmarket) {
        source = '🛍️ 케이마켓 (K-Market)';
      } else if (!source || source === 'direct' || source === 'null' || source === 'undefined') {
        source = '직접유입 (Direct)';
      } else if (source === 'facebook' || source === 'fb') {
        source = '페이스북 (Facebook)';
      } else if (source === 'instagram' || source === 'ig') {
        source = '인스타그램 (Instagram)';
      }
      if (!byUtm[source]) byUtm[source] = { total: 0, paid: 0, revenue: 0 };
      byUtm[source].total++;
      if (app.paymentStatus === 'paid') {
        byUtm[source].paid++;
        byUtm[source].revenue += Math.floor((app.estimatedRefundAmount || 0) * 0.22);
      }

      let statusInferredStep = 1;
      const status = app.status;
      if (status === 'RefundCompleted' || app.paymentStatus === 'paid') {
        statusInferredStep = 9;
      } else if (status === 'NTSReviewing' || status === 'NTSDocumentReceipt') {
        statusInferredStep = 9;
      } else if (status === 'TaxOfficeReviewing' || status === 'TaxAccountantReceiving') {
        statusInferredStep = 8;
      } else if (status === 'AdditionalDocsNeeded') {
        statusInferredStep = 8;
      } else if (status === 'Applying') {
        statusInferredStep = 8;
      } else if (status === 'InquiryCompleted') {
        statusInferredStep = 7;
      } else if (status === 'bank_verification') {
        statusInferredStep = 8;
      } else if (status === 'document_submitted') {
        statusInferredStep = 6;
      } else if (status === 'identity_verified') {
        statusInferredStep = 3;
      } else if (status === 'welcome') {
        statusInferredStep = 1;
      }

      const maxStep = Math.max(app.lastStep || 0, statusInferredStep);
      for (let i = 1; i <= Math.min(maxStep, 8); i++) {
        funnel[i] = (funnel[i] || 0) + 1;
      }
    });

    return {
      byLanguage: Object.entries(byLang)
        .sort((a, b) => b[1].total - a[1].total)
        .map(([name, data]) => ({ name, ...data })),
      byUtm: Object.entries(byUtm)
        .sort((a, b) => b[1].total - a[1].total)
        .map(([name, data]) => ({ name, ...data })),
      funnel
    };
  }, [apps]);

  const statusFlow = ['InquiryCompleted', 'Applying', 'AdditionalDocsNeeded', 'TaxAccountantReceiving', 'TaxOfficeReviewing', 'NTSDocumentReceipt', 'NTSReviewing', 'RefundCompleted'];

  const handleStatusChange = async (app: any, direction: 1 | -1 = 1) => {
    const currentIdx = statusFlow.indexOf(app.status);
    let nextIdx = currentIdx + direction;
    nextIdx = Math.max(0, Math.min(nextIdx, statusFlow.length - 1));
    const nextStatus = statusFlow[nextIdx];
    
    if (nextStatus === app.status) {
      toast({ title: direction === 1 ? "이미 최종 단계입니다." : "이미 첫 단계입니다." });
      return;
    }
    try {
      await updateDoc(doc(db, 'applications', app.id), { status: nextStatus });
      toast({ title: "상태 업데이트 완료", description: `→ ${nextStatus}` });
    } catch (error) {
      toast({ variant: "destructive", title: "업데이트 실패" });
    }
  };

  const handleSendNotification = async () => {
    if (!noteAppId || !adminNote.trim() || isTranslating) return;
    
    setIsTranslating(true);
    try {
      const appRef = doc(db, 'applications', noteAppId);
      const appDoc = apps.find(a => a.id === noteAppId);
      const userLanguage = appDoc?.userLanguage || 'ko';
      const existingNotifs = appDoc?.notifications || [];
      
      let translatedMessage = null;
      if (userLanguage !== 'ko') {
        try {
          const res = await translateNotification({ message: adminNote, targetLanguage: userLanguage });
          translatedMessage = res.translatedMessage;
        } catch (err) {
          console.error("번역 실패:", err);
        }
      }

      const newNotif = {
        id: Date.now().toString(),
        message: adminNote,
        translatedMessage,
        type: noteType,
        sentAt: new Date().toISOString()
      };
      
      await updateDoc(appRef, {
        notifications: [newNotif, ...existingNotifs],
        status: noteType === 'ActionRequired' ? 'AdditionalDocsNeeded' : appDoc.status,
        unreadNotificationCountUser: increment(1)
      });
      
      toast({ title: "알림 전송 성공", description: translatedMessage ? `${userLanguage} 번역과 함께 전송되었습니다.` : "사용자에게 즉시 전달되었습니다." });
      setAdminNote("");
      setIsNoteDrawerOpen(false);
    } catch (error) {
      toast({ variant: "destructive", title: "전송 실패" });
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSendChatMessage = async (macroOverrideText?: string | React.MouseEvent | React.KeyboardEvent) => {
    const textToSend = typeof macroOverrideText === 'string' ? macroOverrideText : chatInput;
    if (!chatAppId || !textToSend.trim() || isSendingChat) return;
    
    setIsSendingChat(true);
    if (typeof macroOverrideText !== 'string') setChatInput(""); // Clear immediately for UX

    try {
      const appDoc = apps.find(a => a.id === chatAppId);
      const userLanguage = appDoc?.userLanguage || 'ko';
      
      let translatedText = null;
      if (userLanguage !== 'ko') {
        try {
          const res = await translateChatMessage({ 
            message: textToSend, 
            sourceLanguage: 'ko', 
            targetLanguage: userLanguage 
          });
          translatedText = res.translatedMessage;
        } catch (err) {
          console.error("채팅 번역 실패:", err);
        }
      }

      await addDoc(collection(db, 'applications', chatAppId, 'chat_messages'), {
        sender: 'Admin',
        text: textToSend,
        translatedText,
        timestamp: serverTimestamp()
      });
      
      // 사용자용 읽지 않은 메시지 카운트 증가 및 마지막 메시지 시간 갱신
      await updateDoc(doc(db, 'applications', chatAppId), {
        unreadChatCountUser: increment(1),
        lastMessageAt: serverTimestamp(),
        lastMessageText: textToSend.substring(0, 50)
      });
    } catch (error) {
      toast({ variant: "destructive", title: "발송 실패", description: "메시지를 보내지 못했습니다." });
      if (typeof macroOverrideText !== 'string') setChatInput(textToSend); // Restore if failed
    } finally {
      setIsSendingChat(false);
    }
  };

  const handlePaymentToggle = async (app: any) => {
    const isCurrentlyPaid = app.paymentStatus === 'paid';
    const newStatus = isCurrentlyPaid ? 'pending' : 'paid';
    
    try {
      await updateDoc(doc(db, 'applications', app.id), { paymentStatus: newStatus });
      toast({ 
        title: "입금 상태 변경", 
        description: newStatus === 'paid' ? "✅ 결제 완료 처리됨" : "⏳ 미확인(미납) 처리됨" 
      });
    } catch (error) {
      toast({ variant: "destructive", title: "입금 상태 업데이트 실패" });
    }
  };

  const handleDeleteApplicant = async (appId: string) => {
    try {
      if (isHardDelete) {
        console.log("Permanently deleting applicant:", appId);
        await deleteDoc(doc(db, 'applications', appId));
        toast({ title: "영구 삭제 완료", description: "신청자 데이터가 시스템에서 완전히 삭제되었습니다." });
      } else {
        console.log("Soft deleting applicant from dashboard:", appId);
        await updateDoc(doc(db, 'applications', appId), { 
          isDeleted: true,
          deletedFromDashboard: true 
        });
        toast({ title: "숨김 처리 완료", description: "대시보드 목록에서 숨김 처리되었습니다. 고객 홈택스 정보 뷰에서 계속 확인 가능합니다." });
      }
      setIsDeleteDialogOpen(false);
      setIsDetailOpen(false);
      setSelectedApp(null);
    } catch (error) {
      console.error("삭제/숨김 오류:", error);
      toast({ variant: "destructive", title: "처리 실패", description: "권한이 없거나 서버 오류가 발생했습니다." });
    }
  };

  const triggerBulkHide = () => {
    if (selectedIds.length === 0) return;
    setBulkActionType('hide');
    setIsBulkConfirmOpen(true);
  };

  const triggerBulkDelete = () => {
    if (selectedIds.length === 0) return;
    setBulkActionType('delete');
    setIsBulkConfirmOpen(true);
  };

  const executeBulkAction = async () => {
    if (selectedIds.length === 0) return;
    setIsBulkConfirmOpen(false);

    try {
      const batch = writeBatch(db);
      if (bulkActionType === 'hide') {
        selectedIds.forEach((id) => {
          const docRef = doc(db, 'applications', id);
          batch.update(docRef, { 
            isDeleted: true,
            deletedFromDashboard: true 
          });
        });
        await batch.commit();
        toast({ title: "일괄 숨김 처리 완료", description: `선택한 ${selectedIds.length}명의 신청자가 대시보드에서 숨겨졌습니다.` });
      } else {
        selectedIds.forEach((id) => {
          const docRef = doc(db, 'applications', id);
          batch.delete(docRef);
        });
        await batch.commit();
        toast({ title: "영구 삭제 완료", description: `선택한 ${selectedIds.length}명의 데이터가 완전히 삭제되었습니다.` });
      }
      setSelectedIds([]);
    } catch (error) {
      console.error("일괄 처리 오류:", error);
      toast({ variant: "destructive", title: "일괄 처리 실패", description: "권한이 없거나 서버 오류가 발생했습니다." });
    }
  };

  const handleSaveMemo = async () => {
    if (!selectedApp) return;
    setIsSavingMemo(true);
    try {
      await updateDoc(doc(db, 'applications', selectedApp.id), {
        internalMemo: internalMemo
      });
      toast({ title: "메모 저장 완료", description: "내부 전용 메모가 성공적으로 업데이트되었습니다." });
    } catch (error) {
      console.error("메모 저장 실패:", error);
      toast({ variant: "destructive", title: "메모 저장 실패", description: "서버 통신 오류가 발생했습니다." });
    } finally {
      setIsSavingMemo(false);
    }
  };

  const handleRequestDoc = async () => {
    if (!selectedApp || !docRequestInput.trim()) return;
    setIsRequestingDoc(true);
    try {
      let translatedName = null;
      // 사용자가 선택한 언어가 한국어가 아니면 자동 번역
      if (selectedApp.userLanguage && selectedApp.userLanguage !== 'ko') {
        try {
          const res = await translateChatMessage({
            message: docRequestInput,
            sourceLanguage: 'ko',
            targetLanguage: selectedApp.userLanguage
          });
          translatedName = res.translatedMessage;
        } catch (err) {
          console.error("서류명 번역 실패:", err);
        }
      }

      const newRequest = {
        id: `REQ-${Date.now()}`,
        name: docRequestInput,
        translatedName,
        status: 'pending',
        requestedAt: new Date().toISOString()
      };
      
      const currentRequests = selectedApp.pendingDocRequests || [];
      await updateDoc(doc(db, 'applications', selectedApp.id), {
        pendingDocRequests: [...currentRequests, newRequest],
        status: 'AdditionalDocsNeeded'
      });
      
      setDocRequestInput("");
      const successMsg = translatedName ? `'${docRequestInput}' (${translatedName}) 보완 요청이 전달되었습니다.` : `'${docRequestInput}' 보완 요청이 전달되었습니다.`;
      toast({ title: "서류 요청 완료", description: successMsg });
    } catch (error) {
      console.error("서류 요청 실패:", error);
      toast({ variant: "destructive", title: "요청 실패", description: "서버 통신 오류가 발생했습니다." });
    } finally {
      setIsRequestingDoc(false);
    }
  };

  const handleRemoveDocRequest = async (requestId: string) => {
    if (!selectedApp || !window.confirm("이 서류 요청을 취소하시겠습니까?")) return;
    try {
      const updatedRequests = (selectedApp.pendingDocRequests || []).filter((r: any) => r.id !== requestId);
      await updateDoc(doc(db, 'applications', selectedApp.id), {
        pendingDocRequests: updatedRequests
      });
    } catch (error) {
      toast({ variant: "destructive", title: "취소 실패" });
    }
  };

  const openAppDetail = (app: any) => {
    setSelectedApp(app);
    setInternalMemo(app.internalMemo || "");
    setIsDetailOpen(true);
    if (Object.keys(credentialsMap).length === 0) {
      fetchCredentials();
    }
  };

  const handlePrintConsentForm = (app: any) => {
    setSelectedApp(app);
    if (Object.keys(credentialsMap).length === 0) {
      getDecryptedHometaxCredentialsMap().then(res => {
        if (res.success && res.credentialsMap) {
          setCredentialsMap(res.credentialsMap);
        }
        setTimeout(() => {
          window.print();
        }, 150);
      });
    } else {
      setTimeout(() => {
        window.print();
      }, 150);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'RefundCompleted': return { label: '환급 완료', class: 'bg-green-100 text-green-700' };
      case 'NTSReviewing': return { label: '국세청 검토중', class: 'bg-indigo-100 text-indigo-700' };
      case 'NTSDocumentReceipt': return { label: '국세청 서류접수', class: 'bg-blue-100 text-blue-700' };
      case 'TaxOfficeReviewing': return { label: '세무서 검토 중', class: 'bg-amber-100 text-amber-700' };
      case 'TaxAccountantReceiving': return { label: '세무사 자료 접수중', class: 'bg-teal-100 text-teal-700' };
      case 'Applying': return { label: '신청 중', class: 'bg-primary/10 text-primary' };
      case 'AdditionalDocsNeeded': return { label: '서류 보완 필요', class: 'bg-red-100 text-red-600 font-black' };
      default: return { label: '조회 완료', class: 'bg-slate-100 text-slate-500' };
    }
  };

  const handleOpenLiveChat = (chatId: string) => {
    setActiveLiveChatId(chatId);
    setActiveView('aichat'); // Switch directly to Centralized AI Chat 관제 탭!
  };

  const handleExportCsv = () => {
    if (!apps.length) {
      toast({ variant: "destructive", title: "추출할 자료가 없습니다." });
      return;
    }
    
    const headers = ["신청ID", "성명", "사업자명", "사업자번호", "근무연도", "결정세액", "지급처", "지급계좌", "상태", "휴대폰번호", "신청일"];
    
    const rows = apps.map(app => [
      app.id,
      app.fullName || "N/A",
      app.companyName || "N/A",
      app.resCompanyIdentityNo1 || "N/A",
      app.resAttrYear || "N/A",
      app.estimatedRefundAmount || 0,
      app.bankName || "N/A",
      app.bankAccount || app.accountNumber || "N/A",
      app.status || "InquiryCompleted",
      app.phone || app.phoneNo || "N/A",
      app.updatedAt?.toDate ? app.updatedAt.toDate().toLocaleString('ko-KR') : String(app.updatedAt || app.createdAt || "")
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.map(v => {
        const val = String(v).replace(/"/g, '""');
        return `"${val}"`;
      }).join(","))
    ].join("\n");

    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `이지텍스_추출자료_${getKstDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({ title: "자료 추출 성공", description: "세무사 제출용 CSV 자료가 다운로드되었습니다." });
  };


  const copyToClipboard = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast({ title: `${label} 복사 완료`, description: `클립보드에 복사되었습니다: ${text}` });
  };

  return (
    <>
      <div className="space-y-10 animate-fade-in-up print:hidden">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Sidebar Menu */}
        <div className="w-full lg:w-64 shrink-0 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 h-fit space-y-6">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">이지텍스 관리자</p>
            <h2 className="text-lg font-black text-slate-900">메뉴 바로가기</h2>
          </div>
          
          <div className="flex flex-col gap-1.5">
            <Button
              variant="ghost"
              onClick={() => setActiveView('dashboard')}
              className={cn(
                "w-full justify-start h-12 rounded-xl font-bold gap-3 px-4 transition-all",
                activeView === 'dashboard'
                  ? "bg-primary/10 text-primary hover:bg-primary/15"
                  : "text-slate-600 hover:bg-slate-50"
              )}
            >
              <LayoutDashboard className="h-4 w-4" /> 대시보드 홈
            </Button>

            <Button
              variant="ghost"
              onClick={() => setActiveView('hometax')}
              className={cn(
                "w-full justify-start h-12 rounded-xl font-bold gap-3 px-4 transition-all",
                activeView === 'hometax'
                  ? "bg-primary/10 text-primary hover:bg-primary/15"
                  : "text-slate-600 hover:bg-slate-50"
              )}
            >
              <ShieldCheck className="h-4 w-4 text-emerald-600" /> 고객 홈택스 정보
            </Button>

            <Button
              variant="ghost"
              onClick={() => setActiveView('aichat')}
              className={cn(
                "w-full justify-start h-12 rounded-xl font-bold gap-3 px-4 transition-all shadow-sm",
                activeView === 'aichat'
                  ? "bg-violet-600/10 text-violet-600 hover:bg-violet-600/15 border border-violet-200/50"
                  : "text-sky-600 bg-sky-50 hover:bg-sky-100 border border-sky-200/80"
              )}
            >
              <MessageSquare className="h-4 w-4 text-sky-500 animate-pulse" /> 💬 통합 실시간 상담 센터
            </Button>

            <Button
              variant="ghost"
              onClick={() => router.push('/admin/stats')}
              className="w-full justify-start h-12 rounded-xl font-bold gap-3 px-4 text-slate-600 hover:bg-slate-50"
            >
              📊 통계 분석
            </Button>

            <Button
              variant="ghost"
              onClick={handleExportCsv}
              className="w-full justify-start h-12 rounded-xl font-bold gap-3 px-4 text-slate-600 hover:bg-slate-50"
            >
              <Download className="h-4 w-4 text-emerald-600" /> CSV 자료 추출
            </Button>

            <Button
              variant="ghost"
              onClick={() => {
                setSearchId("");
                setSearchName("");
                setSearchPhone("");
                setSortBy("dateDesc");
                window.location.reload();
              }}
              className="w-full justify-start h-12 rounded-xl font-bold gap-3 px-4 text-slate-600 hover:bg-slate-50"
            >
              <RefreshCw className={cn("h-4 w-4", appsLoading && "animate-spin")} /> 화면 새로고침
            </Button>
          </div>
        </div>

        {/* Right Main Content Area */}
        <div className="flex-1 min-w-0 space-y-10">
          {activeView === 'dashboard' ? (
            <>
              <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-primary/10 text-primary border-none font-black">ADMIN LIVE CONTROL</Badge>
                  </div>
                  <h1 className="text-3xl font-black font-headline text-slate-900">대표님 대시보드</h1>
                </div>
                <div className="text-slate-400 font-bold text-xs">
                  실시간 통계 및 실시간 신청 현황
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6">
                {stats.map((stat, i) => (
                  <Card key={i} className="premium-card rounded-2xl sm:rounded-3xl border-none shadow-sm bg-white overflow-hidden transition-all hover:-translate-y-1 hover:shadow-md">
                    <CardContent className="p-6 sm:p-8 space-y-3 sm:space-y-4">
                      <div className="h-10 w-10 sm:h-12 sm:w-12 bg-slate-50 rounded-xl sm:rounded-2xl flex items-center justify-center text-primary">{stat.icon}</div>
                      <div className="space-y-1">
                        <div className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</div>
                        <div className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">{stat.value}</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {/* Search & Filter Bar - Directly above the table */}
              <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 mb-[-1.5rem] relative z-10 transition-all hover:shadow-md">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="relative group">
                    <ShieldCheck className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-primary transition-colors" />
                    <input 
                      type="text" 
                      placeholder="고객번호 (ID) 검색" 
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-14 pr-4 h-14 font-bold text-slate-900 placeholder:text-slate-300 focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/20 outline-none transition-all text-sm"
                      value={searchId}
                      onChange={(e) => setSearchId(e.target.value)}
                    />
                  </div>
                  <div className="relative group">
                    <UsersIcon className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-primary transition-colors" />
                    <input 
                      type="text" 
                      placeholder="고객 이름 검색" 
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-14 pr-4 h-14 font-bold text-slate-900 placeholder:text-slate-300 focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/20 outline-none transition-all text-sm"
                      value={searchName}
                      onChange={(e) => setSearchName(e.target.value)}
                    />
                  </div>
                  <div className="relative group">
                    <BellRing className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-primary transition-colors" />
                    <input 
                      type="text" 
                      placeholder="연락처 검색" 
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-14 pr-4 h-14 font-bold text-slate-900 placeholder:text-slate-300 focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/20 outline-none transition-all text-sm"
                      value={searchPhone}
                      onChange={(e) => setSearchPhone(e.target.value)}
                    />
                  </div>
                  <div className="relative group">
                    <select
                      value={kmarketFilter}
                      onChange={(e) => setKmarketFilter(e.target.value as any)}
                      className={cn(
                        "w-full border rounded-2xl px-4 h-14 font-black outline-none focus:ring-4 transition-all appearance-none cursor-pointer text-sm",
                        kmarketFilter === 'kmarket' 
                          ? "bg-amber-100 border-amber-300 text-amber-900 focus:ring-amber-500/20" 
                          : "bg-slate-50 border-slate-100 text-slate-900 focus:bg-white focus:ring-primary/5"
                      )}
                    >
                      <option value="all">🌐 전체 유입 채널</option>
                      <option value="kmarket">🛍️ 케이마켓 유입만</option>
                      <option value="general">📱 일반/직접 유입만</option>
                    </select>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <ChevronRight className="h-4 w-4 rotate-90" />
                    </div>
                  </div>
                  <div className="relative group">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 h-14 font-black text-slate-900 outline-none focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all appearance-none cursor-pointer text-sm"
                    >
                      <option value="dateDesc">📅 최신 등록순</option>
                      <option value="dateAsc">📅 과거 등록순</option>
                      <option value="nationality">🇺🇳 국적순</option>
                      <option value="amountDesc">💰 환급금 높은순</option>
                      <option value="amountAsc">🪙 환급금 낮은순</option>
                    </select>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <ChevronRight className="h-4 w-4 rotate-90" />
                    </div>
                  </div>
                </div>
              </div>

              <Card className="premium-card rounded-[2.5rem] border-none overflow-hidden bg-white shadow-sm">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-slate-50/50">
                      <TableRow>
                        <TableHead className="w-12 pl-8 py-5">
                          <input 
                            type="checkbox"
                            className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                            checked={paginatedApps.length > 0 && paginatedApps.every(app => selectedIds.includes(app.id))}
                            onChange={(e) => {
                              if (e.target.checked) {
                                const currentIds = paginatedApps.map(a => a.id);
                                setSelectedIds(prev => [...new Set([...prev, ...currentIds])]);
                              } else {
                                const currentIds = paginatedApps.map(a => a.id);
                                setSelectedIds(prev => prev.filter(id => !currentIds.includes(id)));
                              }
                            }}
                          />
                        </TableHead>
                        <TableHead className="font-bold pl-2 py-5">신청번호 / 고객</TableHead>
                        <TableHead className="font-bold">신청 일자</TableHead>
                        <TableHead className="font-bold">국적</TableHead>
                        <TableHead className="font-bold">예상 환급액</TableHead>
                        <TableHead className="font-bold text-amber-600">수수료 (22%)</TableHead>
                        <TableHead className="font-bold">진행 단계</TableHead>
                        <TableHead className="font-bold">사전 진단액</TableHead>
                        <TableHead className="font-bold text-indigo-600">리포트</TableHead>
                        <TableHead className="font-bold text-emerald-600">연락처 / 서류</TableHead>
                        <TableHead className="font-bold pr-8 text-right">상태 제어</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedApps?.map((app) => {
                        const statusBadge = getStatusBadge(app.status);
                        const isSelected = selectedIds.includes(app.id);
                        return (
                          <TableRow key={app.id} className={cn("hover:bg-slate-50 border-b border-slate-50 transition-colors", isSelected && "bg-slate-50/80")}>
                            <TableCell className="pl-8 py-5 w-12">
                              <input 
                                type="checkbox"
                                className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                                checked={isSelected}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedIds(prev => [...prev, app.id]);
                                  } else {
                                    setSelectedIds(prev => prev.filter(id => id !== app.id));
                                  }
                                }}
                              />
                            </TableCell>
                            {/* 신청번호 / 고객 */}
                            <TableCell 
                              className="pl-2 py-5 cursor-pointer hover:bg-slate-100/50 transition-all group"
                              onClick={() => openAppDetail(app)}
                            >
                              <div className="font-black text-slate-900 group-hover:text-primary flex items-center gap-2 transition-colors">
                                {app.id.substring(0, 8)}...
                                <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-all -translate-x-1 group-hover:translate-x-0" />
                              </div>
                              <div className="text-xs text-slate-400 font-bold flex items-center gap-1.5 mt-0.5">
                                <span>{app.fullName || "이름 없음"}</span>
                                {app.isFromKmarket && (
                                  <Badge className="bg-amber-100 text-amber-900 border-amber-300 text-[9px] font-black px-1.5 py-0 rounded inline-flex items-center gap-0.5 shadow-none">
                                    <ShoppingBag className="h-2.5 w-2.5 text-amber-600" /> 케이마켓
                                  </Badge>
                                )}
                              </div>
                            </TableCell>

                            {/* 신청 일자 */}
                            <TableCell className="font-bold text-slate-600 text-xs">
                              {app.createdAt?.toDate ? app.createdAt.toDate().toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : String(app.createdAt || "N/A")}
                            </TableCell>

                            {/* 국적 */}
                            <TableCell>
                              {app.userLanguage ? (
                                <Badge variant="outline" className="text-[10px] px-2 h-5 border-slate-200 text-slate-600 font-black bg-slate-100 uppercase">
                                  {app.userLanguage === 'ko' ? '한국 (KO)' : 
                                   app.userLanguage === 'en' ? '미국 (EN)' : 
                                   app.userLanguage === 'vi' ? '베트남 (VI)' : 
                                   app.userLanguage === 'uz' ? '우즈벡 (UZ)' : 
                                   app.userLanguage === 'zh' ? '중국 (ZH)' : 
                                   app.userLanguage.toUpperCase()}
                                </Badge>
                              ) : (
                                <span className="text-xs font-bold text-slate-400">N/A</span>
                              )}
                            </TableCell>

                            {/* 예상 환급액 */}
                            <TableCell className={cn("font-black", app.estimatedRefundAmount !== undefined ? "text-emerald-600 font-extrabold" : "text-slate-400 font-medium")}>
                              {app.estimatedRefundAmount !== undefined ? `₩ ${app.estimatedRefundAmount.toLocaleString()}` : "미조회"}
                            </TableCell>

                            {/* 수수료 (22%) */}
                            <TableCell className="font-black text-amber-600">
                              ₩ {Math.round((app.estimatedRefundAmount ?? 0) * 0.22).toLocaleString()}
                            </TableCell>

                            {/* 진행 단계 */}
                            <TableCell><Badge className={`rounded-lg font-bold ${statusBadge.class}`}>{statusBadge.label}</Badge></TableCell>

                            {/* 사전 진단액 */}
                            <TableCell>
                              <div className="font-bold text-slate-900">₩ {(app.preFilterEstimate || 0).toLocaleString()}</div>
                            </TableCell>

                            {/* 리포트 */}
                            <TableCell>
                              <Button variant="outline" size="sm" className="rounded-xl font-black text-indigo-600 bg-indigo-50 border-indigo-100" onClick={() => { setReportApp(app); setIsTaxReportOpen(true); }}>
                                <FileSearch className="h-4 w-4 mr-2" /> 자료
                              </Button>
                            </TableCell>

                            {/* 연락처 / 서류 */}
                            <TableCell>
                              <div className="flex flex-col gap-1">
                                <div className="text-[11px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-100 w-fit">
                                   {app.phoneNo || app.phone || "No Phone"}
                                </div>
                                <Button variant="outline" size="sm" className="h-7 w-fit rounded-lg font-black text-[10px] text-emerald-600 bg-emerald-50 border-emerald-100" onClick={async () => {
                                  setIsDocsLoading(true);
                                  setSelectedApp(app); try { setIsDocsViewerOpen(true); } finally { setIsDocsLoading(false); }
                                }}>
                                  현장 서류
                                </Button>
                              </div>
                            </TableCell>

                            {/* 상태 제어 */}
                            <TableCell className="pr-8 text-right">
                              <div className="flex justify-end gap-2">
                                <div className="flex flex-col items-end gap-1.5">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="rounded-xl text-indigo-500 hover:bg-indigo-50 relative group"
                                    onClick={async () => {
                                      setChatAppId(app.id);
                                      setIsChatOpen(true);
                                      if (app.unreadChatCountAdmin > 0) {
                                        await updateDoc(doc(db, 'applications', app.id), { unreadChatCountAdmin: 0 });
                                      }
                                    }}
                                  >
                                    <MessageSquare className={cn("h-4 w-4 mr-1", app.unreadChatCountAdmin > 0 && "animate-bounce")} />
                                    상담
                                    {app.unreadChatCountAdmin > 0 && (
                                      <span className="absolute -top-2 -right-2 h-8 w-8 bg-red-500 text-white rounded-full border-2 border-white flex items-center justify-center text-[11px] font-black animate-bounce shadow-lg z-10">
                                        {app.unreadChatCountAdmin > 9 ? '9+' : app.unreadChatCountAdmin}
                                      </span>
                                    )}
                                  </Button>
                                  {app.unreadChatCountAdmin > 0 && app.lastMessageAt && (
                                    <div className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100 flex items-center gap-1 max-w-[150px]">
                                      <Clock className="w-3.5 h-3.5 shrink-0" />
                                      <span className="shrink-0">{app.lastMessageAt?.toDate ? app.lastMessageAt.toDate().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : "방금 전"}</span>
                                    </div>
                                  )}
                                </div>
                                <select
                                  className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-black text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm cursor-pointer hover:border-slate-300 transition-all h-9 shrink-0"
                                  value={app.status}
                                  onChange={async (e) => {
                                    const newStatus = e.target.value;
                                    try {
                                      await updateDoc(doc(db, 'applications', app.id), { status: newStatus });
                                      toast({ title: "상태 업데이트 완료", description: `→ ${getStatusBadge(newStatus).label}` });
                                    } catch (err) {
                                      toast({ variant: "destructive", title: "업데이트 실패" });
                                    }
                                  }}
                                >
                                  {statusFlow.map((status) => (
                                    <option key={status} value={status}>
                                      {getStatusBadge(status).label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                  
                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 py-8 border-t border-slate-50 bg-white/50">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl font-bold h-10 px-4"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" /> 이전
                      </Button>
                      
                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                          // Only show 5 pages around current page if there are many pages
                          const shouldShow = totalPages <= 7 || 
                                            Math.abs(page - currentPage) <= 2 || 
                                            page === 1 || 
                                            page === totalPages;
                          
                          if (!shouldShow) {
                            if (page === 2 || page === totalPages - 1) {
                              return <span key={page} className="text-slate-300 px-1">...</span>;
                            }
                            return null;
                          }

                          return (
                            <Button
                              key={page}
                              variant={currentPage === page ? "default" : "outline"}
                              size="sm"
                              className={cn(
                                "rounded-xl font-bold w-10 h-10 transition-all",
                                currentPage === page 
                                  ? "bg-primary text-white shadow-lg shadow-primary/20 scale-110" 
                                  : "text-slate-500 hover:text-primary hover:border-primary/30"
                              )}
                              onClick={() => setCurrentPage(page)}
                            >
                              {page}
                            </Button>
                          );
                        })}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl font-bold h-10 px-4"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                      >
                        다음 <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <LiveMessengerFeed onOpenChat={handleOpenLiveChat} />
            </>
          ) : activeView === 'hometax' ? (
            <>
              <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-emerald-600/10 text-emerald-700 border-none font-black">HOMETAX CREDENTIALS</Badge>
                  </div>
                  <h1 className="text-3xl font-black font-headline text-slate-900">고객 홈택스 정보</h1>
                </div>
                <div className="text-slate-400 font-bold text-xs">
                  홈택스 로그인 계정 및 외국인등록번호 조회
                </div>
              </div>

              {/* Search & Filter Bar - Reuse same search state for Hometax view */}
              <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 mb-[-1.5rem] relative z-10 transition-all hover:shadow-md">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="relative group">
                    <ShieldCheck className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-primary transition-colors" />
                    <input 
                      type="text" 
                      placeholder="고객번호 (ID) 검색" 
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-14 pr-4 h-14 font-bold text-slate-900 placeholder:text-slate-300 focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/20 outline-none transition-all"
                      value={searchId}
                      onChange={(e) => setSearchId(e.target.value)}
                    />
                  </div>
                  <div className="relative group">
                    <UsersIcon className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-primary transition-colors" />
                    <input 
                      type="text" 
                      placeholder="고객 이름 검색" 
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-14 pr-4 h-14 font-bold text-slate-900 placeholder:text-slate-300 focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/20 outline-none transition-all"
                      value={searchName}
                      onChange={(e) => setSearchName(e.target.value)}
                    />
                  </div>
                  <div className="relative group">
                    <BellRing className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-primary transition-colors" />
                    <input 
                      type="text" 
                      placeholder="연락처 검색" 
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-14 pr-4 h-14 font-bold text-slate-900 placeholder:text-slate-300 focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/20 outline-none transition-all"
                      value={searchPhone}
                      onChange={(e) => setSearchPhone(e.target.value)}
                    />
                  </div>
                  <div className="relative group">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold pointer-events-none text-xs">정렬</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-14 pr-10 h-14 font-black text-slate-900 outline-none focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all appearance-none cursor-pointer text-sm"
                    >
                      <option value="dateDesc">📅 최신 등록순</option>
                      <option value="dateAsc">📅 과거 등록순</option>
                      <option value="nationality">🇺🇳 국적순</option>
                      <option value="amountDesc">💰 환급금 높은순</option>
                      <option value="amountAsc">🪙 환급금 낮은순</option>
                    </select>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <ChevronRight className="h-4 w-4 rotate-90" />
                    </div>
                  </div>
                </div>
              </div>

              <Card className="premium-card rounded-[2.5rem] border-none overflow-hidden bg-white shadow-sm">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-slate-50/50">
                      <TableRow>
                        <TableHead className="w-12 pl-8 py-5">
                          <input 
                            type="checkbox"
                            className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                            checked={paginatedApps.length > 0 && paginatedApps.every(app => selectedIds.includes(app.id))}
                            onChange={(e) => {
                              if (e.target.checked) {
                                const pageIds = paginatedApps.map(a => a.id);
                                setSelectedIds(prev => [...new Set([...prev, ...pageIds])]);
                              } else {
                                const pageIds = paginatedApps.map(a => a.id);
                                setSelectedIds(prev => prev.filter(id => !pageIds.includes(id)));
                              }
                            }}
                          />
                        </TableHead>
                        <TableHead className="font-bold pl-2 py-5">고객명 / ID</TableHead>
                        <TableHead className="font-bold">신청 일자</TableHead>
                        <TableHead className="font-bold">국적</TableHead>
                        <TableHead className="font-bold">연락처</TableHead>
                        <TableHead className="font-bold text-indigo-600">홈택스 ID</TableHead>
                        <TableHead className="font-bold text-indigo-600">홈택스 PW</TableHead>
                        <TableHead className="font-bold">외국인 등록번호</TableHead>
                        <TableHead className="font-bold">수령 계좌</TableHead>
                        <TableHead className="font-bold">예상 환급액</TableHead>
                        <TableHead className="font-bold text-amber-600">수수료 (22%)</TableHead>
                        <TableHead className="font-bold pr-8 text-right">상세</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedApps?.map((app) => {
                        const isSelected = selectedIds.includes(app.id);
                        const resolvedHId = credentialsMap[app.id]?.hometaxId || app.hometaxId || "";
                        const resolvedHPw = credentialsMap[app.id]?.hometaxPw || app.hometaxPw || "";
                        const resolvedRegNum = credentialsMap[app.id]?.registrationNumber || app.registrationNumber || "";
                        return (
                          <TableRow key={app.id} className={cn("hover:bg-slate-50 border-b border-slate-50 transition-colors", isSelected && "bg-slate-50/80")}>
                            <TableCell className="pl-8 py-5 w-12">
                              <input 
                                type="checkbox"
                                className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                                checked={isSelected}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedIds(prev => [...prev, app.id]);
                                  } else {
                                    setSelectedIds(prev => prev.filter(id => id !== app.id));
                                  }
                                }}
                              />
                            </TableCell>
                            <TableCell 
                              className="pl-2 py-5 cursor-pointer hover:bg-slate-100/50 transition-all group font-black text-slate-900"
                              onClick={() => openAppDetail(app)}
                            >
                              <div className="font-black text-slate-900 group-hover:text-primary flex items-center gap-2 transition-colors">
                                <span>{app.fullName || "이름 없음"}</span>
                                {app.isFromKmarket && (
                                  <Badge className="bg-amber-100 text-amber-900 border-amber-300 text-[9px] font-black px-1.5 py-0 rounded inline-flex items-center gap-0.5 shadow-none">
                                    <ShoppingBag className="h-2.5 w-2.5 text-amber-600" /> 케이마켓
                                  </Badge>
                                )}
                                <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-all -translate-x-1 group-hover:translate-x-0" />
                              </div>
                              <div className="text-[10px] text-slate-400 font-bold uppercase">{app.id.substring(0, 8)}...</div>
                            </TableCell>

                            {/* 신청 일자 */}
                            <TableCell className="font-bold text-slate-600 text-xs">
                              {app.createdAt?.toDate ? app.createdAt.toDate().toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : String(app.createdAt || "N/A")}
                            </TableCell>

                            {/* 국적 */}
                            <TableCell>
                              {app.userLanguage ? (
                                <Badge variant="outline" className="text-[10px] px-2 h-5 border-slate-200 text-slate-600 font-black bg-slate-100 uppercase">
                                  {app.userLanguage === 'ko' ? '한국 (KO)' : 
                                   app.userLanguage === 'en' ? '미국 (EN)' : 
                                   app.userLanguage === 'vi' ? '베트남 (VI)' : 
                                   app.userLanguage === 'uz' ? '우즈벡 (UZ)' : 
                                   app.userLanguage === 'zh' ? '중국 (ZH)' : 
                                   app.userLanguage.toUpperCase()}
                                </Badge>
                              ) : (
                                <span className="text-xs font-bold text-slate-400">N/A</span>
                              )}
                            </TableCell>

                            <TableCell className="font-bold text-slate-600">{app.phone || app.phoneNo || "N/A"}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-800">{resolvedHId || "N/A"}</span>
                                {resolvedHId && (
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-6 w-6 p-0 text-slate-400 hover:text-primary" 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      copyToClipboard(resolvedHId, "홈택스 ID");
                                    }}
                                  >
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono font-bold text-slate-800">{resolvedHPw || "N/A"}</span>
                                {resolvedHPw && (
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-6 w-6 p-0 text-slate-400 hover:text-primary" 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      copyToClipboard(resolvedHPw, "홈택스 PW");
                                    }}
                                  >
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-800">{resolvedRegNum || "N/A"}</span>
                                {resolvedRegNum && (
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-6 w-6 p-0 text-slate-400 hover:text-primary" 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      copyToClipboard(resolvedRegNum, "외국인 등록번호");
                                    }}
                                  >
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="font-bold text-slate-700">
                              {app.bankName ? `${app.bankName} (${app.bankAccount || app.accountNumber || '계좌미지정'})` : "N/A"}
                            </TableCell>
                            <TableCell className={cn("font-black", app.estimatedRefundAmount !== undefined ? "text-emerald-600 font-extrabold" : "text-slate-400 font-medium")}>
                              {app.estimatedRefundAmount !== undefined ? `₩ ${app.estimatedRefundAmount.toLocaleString()}` : "미조회"}
                            </TableCell>

                            {/* 수수료 (22%) */}
                            <TableCell className="font-black text-amber-600">
                              ₩ {Math.round((app.estimatedRefundAmount ?? 0) * 0.22).toLocaleString()}
                            </TableCell>

                            <TableCell className="pr-8 text-right">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="rounded-xl font-bold" 
                                onClick={() => openAppDetail(app)}
                              >
                                보기
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                  
                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 py-8 border-t border-slate-50 bg-white/50">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl font-bold h-10 px-4"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" /> 이전
                      </Button>
                      <div className="text-sm font-bold text-slate-500 px-4">
                        {currentPage} / {totalPages} 페이지
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl font-bold h-10 px-4"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                      >
                        다음 <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : activeView === 'aichat' ? (
            <RefundChatTab defaultRoomId={activeLiveChatId} />
          ) : null}
        </div>
      </div>

      {/* Applicant Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
          {selectedApp && (
            <div className="flex flex-col h-full max-h-[90vh]">
              <div className="bg-slate-900 p-8 text-white relative">
                <DialogHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-primary hover:bg-primary border-none text-white font-black text-[10px]">APPLICANT DOSSIER</Badge>
                      <span className="text-slate-400 font-bold text-[10px] tracking-widest uppercase">{selectedApp.id}</span>
                    </div>
                    <Button
                      onClick={() => handlePrintConsentForm(selectedApp)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs h-9 rounded-xl flex items-center gap-1.5 px-3.5 border-none shadow-md"
                    >
                      <Printer className="h-3.5 w-3.5" /> 📄 수임동의서 (별지 제4호) 인쇄/PDF
                    </Button>
                  </div>
                  <DialogTitle className="text-3xl font-black">{selectedApp.fullName || "성명 미입력"}</DialogTitle>
                </DialogHeader>

                {/* Header info only */}

              </div>

              <div className="p-8 overflow-y-auto bg-white space-y-8">
                {/* Status Summary */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">진행 단계</p>
                    <Badge className={cn("rounded-lg font-bold", getStatusBadge(selectedApp.status).class)}>
                      {getStatusBadge(selectedApp.status).label}
                    </Badge>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">입금 상태</p>
                    <Badge className={cn("rounded-lg font-bold", selectedApp.paymentStatus === 'paid' ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700")}>
                      {selectedApp.paymentStatus === 'paid' ? "결제 완료" : "미확인 (보류)"}
                    </Badge>
                  </div>
                </div>

                {/* Personal & Basic Info */}
                <div className="space-y-4">
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <UsersIcon className="h-4 w-4 text-primary" /> 기본 인적 사항
                  </h3>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-4 p-6 bg-slate-50/50 rounded-3xl border border-slate-100">
                    {[
                      { label: "휴대폰 번호", value: selectedApp.phoneNo || selectedApp.phone || "미입력" },
                      { label: "사용 언어", value: selectedApp.userLanguage?.toUpperCase() || "한국어" },
                      { label: "신청 일시", value: selectedApp.createdAt?.toDate ? selectedApp.createdAt.toDate().toLocaleString('ko-KR') : String(selectedApp.createdAt || "N/A") },
                      { label: "신청 채널 (UTM)", value: selectedApp.utmSource || "Direct / 기타" },
                    ].map((item, i) => (
                      <div key={i} className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">{item.label}</p>
                        <p className="font-bold text-slate-900">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Hometax Credentials Info (Option A - Decrypted from Supabase) */}
                {(credentialsMap[selectedApp.id]?.hometaxId || selectedApp.hometaxId) && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                      <Key className="h-4 w-4 text-indigo-600" /> 국세청 보안 계정 정보
                    </h3>
                    <div className="grid grid-cols-3 gap-4 p-6 bg-indigo-50/20 rounded-3xl border border-indigo-100/50">
                      {[
                        { label: "홈택스 ID", value: credentialsMap[selectedApp.id]?.hometaxId || selectedApp.hometaxId || "N/A" },
                        { label: "홈택스 PW", value: credentialsMap[selectedApp.id]?.hometaxPw || selectedApp.hometaxPw || "N/A" },
                        { label: "외국인 등록번호", value: credentialsMap[selectedApp.id]?.registrationNumber || selectedApp.registrationNumber || "N/A" },
                      ].map((item, i) => (
                        <div key={i} className="space-y-1">
                          <p className="text-[10px] font-bold text-indigo-400 uppercase">{item.label}</p>
                          <p className="font-bold text-slate-900">{item.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}


                {/* Business Info */}
                <div className="space-y-4">
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <FileSearch className="h-4 w-4 text-indigo-500" /> 세무/사업자 정보
                  </h3>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-4 p-6 bg-indigo-50/30 rounded-3xl border border-indigo-100/50">
                    {[
                      { label: "사업자명 (회사)", value: selectedApp.companyName || "미입력" },
                      { label: "사업자 등록번호", value: selectedApp.resCompanyIdentityNo1 || "미입력" },
                      { label: "근무 연도 (귀속)", value: selectedApp.resAttrYear && selectedApp.resAttrYear !== 'N/A' ? `${selectedApp.resAttrYear}년` : "미입력" },
                      { label: "결정 세액", value: selectedApp.resIncomeTax !== undefined && selectedApp.resIncomeTax !== null ? `₩ ${Number(selectedApp.resIncomeTax).toLocaleString()}` : "미입력" },
                    ].map((item, i) => (
                      <div key={i} className="space-y-1">
                        <p className="text-[10px] font-bold text-indigo-400 uppercase">{item.label}</p>
                        <p className="font-bold text-slate-900">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bank / Payment Info */}
                <div className="space-y-4">
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-emerald-500" /> 환급금 수령 계좌
                  </h3>
                  <div className="p-6 bg-emerald-50/30 rounded-3xl border border-emerald-100/50 flex justify-between items-center">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-emerald-400 uppercase">지급 은행 / 계좌번호</p>
                      <p className="text-xl font-black text-slate-900">{selectedApp.bankName || "미정"} | {selectedApp.bankAccount || selectedApp.accountNumber || "계좌정보 없음"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-emerald-400 uppercase">예상 환급액 (90% 적용)</p>
                      <p className="text-2xl font-black text-emerald-600">₩ {(selectedApp.estimatedRefundAmount ?? 0).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* E-Signature / Contract Agreement Section */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <PenTool className="h-4 w-4 text-indigo-600" /> 모바일 서명 솔루션 이용 및 후불 정산 계약서
                  </h3>
                  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-6 text-xs text-slate-700 leading-relaxed font-sans">
                    <div className="text-center border-b border-slate-200 pb-4">
                      <h4 className="text-base font-black text-slate-900">소득세 환급 자동 분석 솔루션 이용 및 후불 정산 계약서</h4>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Platform Service & CMS Deferred Settlement Agreement</p>
                    </div>
 
                    <div className="space-y-2">
                      <p className="font-bold text-slate-900 text-[10px] border-b border-slate-200 pb-1 uppercase tracking-wider">1. 이용자 (고객) 및 계약 정보</p>
                      <div className="grid grid-cols-2 gap-2 text-slate-600">
                        <div>• 성명: <span className="font-bold text-slate-900">{selectedApp.fullName || "미입력"}</span></div>
                        <div>• 휴대폰: <span className="font-bold text-slate-900">{selectedApp.phoneNo || selectedApp.phone || "미입력"}</span></div>
                        <div>• 국적: <span className="font-bold text-slate-900">{selectedApp.userLanguage?.toUpperCase() || "KO"}</span></div>
                        <div>• 신청 날짜: <span className="font-bold text-slate-900">{selectedApp.createdAt?.toDate ? selectedApp.createdAt.toDate().toLocaleDateString('ko-KR') : "N/A"}</span></div>
                        <div>• 예상 환급액: <span className="font-bold text-slate-900">₩ {(selectedApp.estimatedRefundAmount ?? 0).toLocaleString()}</span></div>
                        <div>• 수수료 금액 (22%): <span className="font-black text-amber-600">₩ {Math.round((selectedApp.estimatedRefundAmount ?? 0) * 0.22).toLocaleString()}</span></div>
                        <div className="col-span-2">• 환급 및 정산 계좌: <span className="font-bold text-slate-900">{selectedApp.bankName ? `${selectedApp.bankName} / ${selectedApp.bankAccount || selectedApp.accountNumber || ''}` : "미지정"}</span></div>
                        <div className="col-span-2">• 서명 상태: <span className={cn("font-bold", selectedApp.signatureDataUri ? "text-green-600" : "text-amber-600")}>{selectedApp.signatureDataUri ? "서명 완료" : "미서명"}</span></div>
                      </div>
                    </div>
 
                    <div className="space-y-2">
                      <p className="font-bold text-slate-900 text-[10px] border-b border-slate-200 pb-1 uppercase tracking-wider">2. 서비스 제공자 (회사) 정보</p>
                      <div className="grid grid-cols-2 gap-2 text-slate-600">
                        <div>• 상호: 주식회사 펫에이앤씨</div>
                        <div>• 대표자: 전기창</div>
                        <div>• 사업자번호: 229-86-03034</div>
                        <div>• 소재지: 서울특별시 광진구 광나루로 436, 5층(화양동, 에듀킨빌딩)</div>
                      </div>
                    </div>
 
                    <div className="space-y-2">
                      <p className="font-bold text-slate-900 text-[10px] border-b border-slate-200 pb-1 uppercase tracking-wider">3. 주요 정산 및 법적 조항 요약</p>
                      <p className="text-slate-500 text-[10px] leading-relaxed text-justify">
                        본 계약은 이용자가 주식회사 펫에이앤씨의 Korea Tax Refund Service 솔루션을 이용하여 환급을 신청하고, 실제 환급이 완료된 후 실지급액의 22%(성공보수)를 후불로 CMS(대행기관: 효성CMS 등) 자동이체 인출하는 계약입니다. 본 플랫폼은 솔루션 프로그램 제공업자(통신판매업)로서 실제 대리 신고 업무는 대한민국 국가공인 제휴 세무사/세무법인이 대행함을 상호 인지합니다.
                      </p>
                    </div>
 
                    <div className="pt-4 border-t border-slate-200 flex flex-col items-center gap-3">
                      <p className="font-bold text-slate-400 text-[9px]">
                        계약 날짜: {selectedApp.createdAt?.toDate ? selectedApp.createdAt.toDate().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }) : "N/A"}
                      </p>
                      <div className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm w-full justify-center">
                        <span className="font-bold text-slate-500">이용자 (인/서명) :</span>
                        {selectedApp.signatureDataUri ? (
                          <img src={selectedApp.signatureDataUri} alt="User Signature" className="h-12 max-w-[150px] object-contain bg-white" />
                        ) : (
                          <span className="text-slate-300 font-bold italic">서명 데이터 없음</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Internal Admin Memo */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-indigo-500" /> 관리자 내부 메모
                  </h3>
                  <div className="space-y-3">
                    <textarea 
                      value={internalMemo}
                      onChange={(e) => setInternalMemo(e.target.value)}
                      placeholder="신청자에 대한 특이사항이나 진행 메모를 입력하세요 (사용자에게 보이지 않음)"
                      className="w-full h-32 p-4 rounded-2xl border border-slate-200 bg-white font-medium text-slate-700 placeholder:text-slate-300 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none resize-none text-sm"
                    />
                    <Button 
                      onClick={handleSaveMemo}
                      disabled={isSavingMemo}
                      className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow-md gap-2"
                    >
                      {isSavingMemo ? <Loader2 className="animate-spin h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                      메모 저장하기
                    </Button>
                  </div>
                </div>

                {/* Specific Document Request Section */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <Files className="h-4 w-4 text-amber-500" /> 서류 보완 요청 (사용자 노출)
                  </h3>
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <input 
                        type="text"
                        value={docRequestInput}
                        onChange={(e) => setDocRequestInput(e.target.value)}
                        placeholder="예: 2023년 성적증명서, 주민등록초본 등"
                        className="flex-1 h-12 px-4 rounded-xl border border-slate-200 bg-white font-medium text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                      <Button 
                        onClick={handleRequestDoc}
                        disabled={isRequestingDoc || !docRequestInput.trim()}
                        className="h-12 px-6 bg-slate-900 text-white font-bold rounded-xl whitespace-nowrap"
                      >
                        {isRequestingDoc ? <Loader2 className="animate-spin h-4 w-4" /> : "요청"}
                      </Button>
                    </div>

                    {selectedApp.pendingDocRequests && selectedApp.pendingDocRequests.length > 0 && (
                      <div className="space-y-2">
                        {selectedApp.pendingDocRequests.map((req: any) => (
                          <div key={req.id} className="flex items-center justify-between p-3 bg-amber-50/50 border border-amber-100/50 rounded-xl">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={cn("text-[8px] h-5", req.status === 'completed' ? "bg-green-100 text-green-600 border-none" : "bg-amber-100 text-amber-600 border-none")}>
                                {req.status === 'completed' ? "완료" : "대기중"}
                              </Badge>
                              <span className="text-xs font-bold text-slate-700">{req.name}</span>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => handleRemoveDocRequest(req.id)} className="h-8 w-8 p-0 text-slate-400 hover:text-red-500">
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <Button variant="outline" className="flex-1 h-14 rounded-2xl font-bold border-slate-200" onClick={() => setIsDetailOpen(false)}>닫기</Button>
                  <Button 
                    className="flex-1 h-14 rounded-2xl font-black bg-indigo-600 hover:bg-indigo-700 text-white"
                    onClick={() => {
                        setIsDetailOpen(false);
                        setReportApp(selectedApp);
                        setIsTaxReportOpen(true);
                    }}
                  >
                    정밀 리포트 보기
                  </Button>
                </div>
                  {/* Danger Zone */}
                  <div className="pt-10 border-t border-slate-100 mt-8">
                    <div className="p-6 bg-red-50 rounded-[2rem] border border-red-100 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-red-500 rounded-xl flex items-center justify-center">
                          <AlertTriangle className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-red-900">{activeView === 'hometax' ? "Danger Zone" : "대시보드 정리"}</p>
                          <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest">{activeView === 'hometax' ? "데이터 영구 삭제 처리" : "대시보드 목록에서 제외"}</p>
                        </div>
                      </div>
                      <p className="text-xs font-bold text-red-600/70 leading-relaxed">
                        {activeView === 'hometax' 
                          ? "신청자를 영구적으로 삭제하면 복구가 불가능합니다. 모든 개인정보와 계정 데이터가 파기됩니다." 
                          : "이 목록에서 제외하면 메인 대시보드 화면에서는 보이지 않게 되지만, '고객 홈택스 정보' 탭에서는 언제든지 조회할 수 있습니다."}
                      </p>
                      <Button 
                        variant="destructive" 
                        onClick={() => {
                          setIsHardDelete(activeView === 'hometax');
                          setIsDeleteDialogOpen(true);
                        }}
                        className="w-full h-14 rounded-xl font-black bg-red-500 hover:bg-red-600 shadow-lg shadow-red-200"
                      >
                        <Trash2 className="h-4 w-4 mr-2" /> {activeView === 'hometax' ? "신청자 영구 삭제하기" : "대시보드 목록에서 숨기기"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md rounded-[2.5rem] p-8 border-none shadow-2xl">
          <DialogHeader className="mb-6">
            <div className="h-16 w-16 bg-red-100 rounded-2xl flex items-center justify-center mb-4">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <DialogTitle className="text-2xl font-black text-slate-900">
              {isHardDelete ? "정말로 영구 삭제하시겠습니까?" : "목록에서 숨기시겠습니까?"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <p className="text-slate-500 font-bold leading-relaxed">
              {isHardDelete ? (
                <>
                  이 작업은 즉시 실행되며 되돌릴 수 없습니다.<br />
                  <span className="text-red-600 font-black">신청번호: {selectedApp?.id}</span><br />
                  모든 신청 내역과 개인정보가 시스템에서 영구적으로 파기됩니다.
                </>
              ) : (
                <>
                  대시보드 화면 목록에서 숨김 처리합니다.<br />
                  <span className="text-primary font-black">신청번호: {selectedApp?.id}</span><br />
                  데이터는 유실되지 않으며 '고객 홈택스 정보' 뷰에서 언제든지 다시 확인하실 수 있습니다.
                </>
              )}
            </p>
            <div className="flex gap-4">
              <Button variant="ghost" className="flex-1 h-14 rounded-xl font-bold" onClick={() => setIsDeleteDialogOpen(false)}>취소</Button>
              <Button 
                variant="destructive" 
                className={cn(
                  "flex-[2] h-14 rounded-xl font-black text-white shadow-lg",
                  isHardDelete ? "bg-red-500 hover:bg-red-600" : "bg-slate-900 hover:bg-slate-800"
                )} 
                onClick={() => handleDeleteApplicant(selectedApp.id)}
              >
                {isHardDelete ? "네, 영구 삭제합니다" : "네, 숨김 처리합니다"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Action Confirmation Dialog */}
      <Dialog open={isBulkConfirmOpen} onOpenChange={setIsBulkConfirmOpen}>
        <DialogContent className="max-w-md rounded-[2.5rem] p-8 border-none shadow-2xl">
          <DialogHeader className="mb-6">
            <div className="h-16 w-16 bg-rose-100 rounded-2xl flex items-center justify-center mb-4">
              <AlertTriangle className="h-8 w-8 text-rose-600" />
            </div>
            <DialogTitle className="text-2xl font-black text-slate-900">
              {bulkActionType === 'delete' ? "선택한 고객을 영구 삭제하시겠습니까?" : "선택한 고객을 숨기시겠습니까?"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <p className="text-slate-500 font-bold leading-relaxed">
              {bulkActionType === 'delete' ? (
                <>
                  선택한 <span className="text-rose-600 font-black">{selectedIds.length}명</span>의 고객 정보를 시스템에서 영구적으로 삭제합니다.<br />
                  이 작업은 즉시 실행되며 절대로 되돌릴 수 없습니다.
                </>
              ) : (
                <>
                  선택한 <span className="text-primary font-black">{selectedIds.length}명</span>의 신청자를 대시보드 목록에서 숨김 처리합니다.<br />
                  데이터는 유실되지 않으며 '고객 홈택스 정보' 뷰에서 언제든지 다시 확인하실 수 있습니다.
                </>
              )}
            </p>
            <div className="flex gap-4">
              <Button variant="ghost" className="flex-1 h-14 rounded-xl font-bold" onClick={() => setIsBulkConfirmOpen(false)}>취소</Button>
              <Button 
                variant="destructive" 
                className={cn(
                  "flex-[2] h-14 rounded-xl font-black text-white shadow-lg",
                  bulkActionType === 'delete' ? "bg-rose-500 hover:bg-rose-600" : "bg-slate-900 hover:bg-slate-800"
                )} 
                onClick={executeBulkAction}
              >
                {bulkActionType === 'delete' ? "네, 영구 삭제합니다" : "네, 숨김 처리합니다"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isTaxReportOpen} onOpenChange={setIsTaxReportOpen}>
        <DialogContent className="max-w-3xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
          {reportApp && (
            <>
              <div className="bg-indigo-600 p-8 text-white">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black">세무사 제출용 정밀 리포트</DialogTitle>
                </DialogHeader>
              </div>
              <div className="p-8 space-y-6 bg-white">
                <div className="grid grid-cols-2 gap-6">
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">결정세액</p>
                    <p className="text-2xl font-black text-indigo-600">₩ {(reportApp.resIncomeTax ?? 0).toLocaleString()}</p>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">사업자번호</p>
                    <p className="text-2xl font-black text-slate-900">{reportApp.resCompanyIdentityNo1 || "N/A"}</p>
                  </div>
                </div>
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">근무 기간</p>
                  <p className="text-lg font-black text-slate-900">{reportApp.resAttrYear || "N/A"}</p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isDocsViewerOpen} onOpenChange={(open) => {
        setIsDocsViewerOpen(open);
        if (!open) {
          setActiveDocPreview(null);
          setZoomLevel(1);
        }
      }}>
        <DialogContent className="max-w-5xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl bg-white">
          {selectedApp ? (
            <div className="flex flex-col md:flex-row h-[75vh] min-h-[550px]">
              {/* Left Column: Documents list & status */}
              <div className="w-full md:w-80 border-r border-slate-100 flex flex-col bg-slate-50/50 p-6 overflow-y-auto shrink-0">
                <div className="mb-6">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SUBMITTED BY</span>
                  <h3 className="text-xl font-black text-slate-900 mt-1">{selectedApp.fullName || "이름 미입력"}</h3>
                  <p className="text-xs text-slate-400 font-medium uppercase mt-0.5">ID: {selectedApp.id.substring(0, 8)}</p>
                </div>

                <div className="space-y-6 flex-1">
                  <div>
                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3">문서/서류 목록</h4>
                    <div className="space-y-2">
                      {/* Virtual document: Signature */}
                      {selectedApp.signatureDataUri && (
                        <button
                          onClick={() => {
                            setActiveDocPreview({
                              id: 'signature',
                              name: '환급 신청서 서명본',
                              dataUri: selectedApp.signatureDataUri,
                              type: 'image/png',
                              uploadedAt: selectedApp.applicationDate || selectedApp.createdAt
                            });
                            setZoomLevel(1);
                          }}
                          className={cn(
                            "w-full p-4 rounded-2xl text-left border flex items-center gap-3 transition-all",
                            activeDocPreview?.id === 'signature'
                              ? "bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-900/10"
                              : "bg-white border-slate-100 text-slate-700 hover:border-slate-300"
                          )}
                        >
                          <PenTool className={cn("h-5 w-5 shrink-0", activeDocPreview?.id === 'signature' ? "text-primary" : "text-slate-400")} />
                          <div className="truncate">
                            <p className="text-sm font-black truncate">환급 신청서 서명본</p>
                            <p className="text-[10px] opacity-60 font-bold">서명 수집 완료</p>
                          </div>
                        </button>
                      )}

                      {/* Actual Uploaded Documents */}
                      {selectedApp.uploadedDocs && selectedApp.uploadedDocs.length > 0 ? (
                        selectedApp.uploadedDocs.map((doc: any) => {
                          const isImg = doc.type?.startsWith('image/') || doc.dataUri?.startsWith('data:image/');
                          return (
                            <button
                              key={doc.id}
                              onClick={() => {
                                setActiveDocPreview(doc);
                                setZoomLevel(1);
                              }}
                              className={cn(
                                "w-full p-4 rounded-2xl text-left border flex items-center gap-3 transition-all",
                                activeDocPreview?.id === doc.id
                                  ? "bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-900/10"
                                  : "bg-white border-slate-100 text-slate-700 hover:border-slate-300"
                              )}
                            >
                              {isImg ? (
                                <FileImage className={cn("h-5 w-5 shrink-0", activeDocPreview?.id === doc.id ? "text-primary" : "text-slate-400")} />
                              ) : (
                                <FileText className={cn("h-5 w-5 shrink-0", activeDocPreview?.id === doc.id ? "text-primary" : "text-slate-400")} />
                              )}
                              <div className="truncate">
                                <p className="text-sm font-black truncate">{doc.name}</p>
                                <p className="text-[10px] opacity-60 font-bold">
                                  {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : "업로드 완료"}
                                </p>
                              </div>
                            </button>
                          );
                        })
                      ) : (
                        !selectedApp.signatureDataUri && (
                          <div className="py-8 text-center bg-white rounded-2xl border border-dashed border-slate-100 text-slate-400 font-bold text-sm">
                            제출된 서류가 없습니다.
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  {/* Pending Doc Requests section */}
                  {selectedApp.pendingDocRequests && selectedApp.pendingDocRequests.length > 0 && (
                    <div>
                      <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3">서류 요청 상태</h4>
                      <div className="space-y-1.5">
                        {selectedApp.pendingDocRequests.map((req: any) => (
                          <div key={req.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100 text-xs">
                            <span className="font-bold text-slate-700 truncate max-w-[150px]">{req.name}</span>
                            <Badge className={cn("text-[9px] font-black border-none", req.status === 'completed' ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600")}>
                              {req.status === 'completed' ? "완료" : "대기"}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-6 border-t border-slate-100 mt-auto">
                  <Button onClick={() => setIsDocsViewerOpen(false)} className="w-full rounded-2xl h-12 bg-slate-200 text-slate-700 hover:bg-slate-300 font-bold">닫기</Button>
                </div>
              </div>

              {/* Right Column: Preview Pane */}
              <div className="flex-1 flex flex-col bg-slate-900 text-white relative">
                {activeDocPreview ? (
                  <>
                    {/* Toolbar */}
                    <div className="h-16 border-b border-white/10 px-6 flex justify-between items-center shrink-0 bg-slate-950/80 backdrop-blur-md z-10">
                      <div className="flex items-center gap-3">
                        <span className="font-black text-sm text-white/90 truncate max-w-[250px]">{activeDocPreview.name}</span>
                        <Badge className="bg-white/10 text-white text-[9px] border-none font-bold uppercase">{activeDocPreview.type?.split('/')[1] || 'DOC'}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Zoom controls (only for images) */}
                        {(activeDocPreview.type?.startsWith('image/') || activeDocPreview.dataUri?.startsWith('data:image/')) && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setZoomLevel(prev => Math.max(0.5, prev - 0.25))}
                              className="text-white/60 hover:text-white hover:bg-white/10 h-10 w-10 rounded-xl"
                            >
                              <ZoomOut className="h-5 w-5" />
                            </Button>
                            <span className="text-xs font-bold text-white/60 min-w-[40px] text-center">{Math.round(zoomLevel * 100)}%</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setZoomLevel(prev => Math.min(3, prev + 0.25))}
                              className="text-white/60 hover:text-white hover:bg-white/10 h-10 w-10 rounded-xl"
                            >
                              <ZoomIn className="h-5 w-5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setZoomLevel(1)}
                              className="text-white/60 hover:text-white hover:bg-white/10 h-10 w-10 rounded-xl"
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <a
                          href={activeDocPreview.dataUri}
                          download={activeDocPreview.fileName || activeDocPreview.name}
                          className="flex items-center justify-center bg-primary hover:bg-primary/95 text-white font-bold h-10 px-4 rounded-xl text-xs gap-1.5 transition-colors"
                        >
                          <Download className="h-4 w-4" /> 다운로드
                        </a>
                      </div>
                    </div>

                    {/* Image/PDF view */}
                    <div className="flex-1 overflow-auto p-8 flex items-center justify-center bg-slate-950/40 relative">
                      {activeDocPreview.type?.startsWith('image/') || activeDocPreview.dataUri?.startsWith('data:image/') ? (
                        <div 
                          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }} 
                          className="transition-transform duration-200 ease-out max-w-full max-h-full"
                        >
                          <img
                            src={activeDocPreview.dataUri}
                            alt={activeDocPreview.name}
                            className="max-h-[50vh] object-contain rounded-lg shadow-2xl border border-white/5"
                          />
                        </div>
                      ) : activeDocPreview.type === 'application/pdf' ? (
                        <object
                          data={activeDocPreview.dataUri}
                          type="application/pdf"
                          className="w-full h-full rounded-lg shadow-2xl"
                        >
                          <div className="text-center p-8 bg-slate-800 rounded-xl max-w-md">
                            <FileText className="h-16 w-16 mx-auto text-slate-500 mb-4" />
                            <p className="font-bold text-white mb-4">PDF 미리보기를 로드할 수 없습니다.</p>
                            <a
                              href={activeDocPreview.dataUri}
                              download={activeDocPreview.name}
                              className="inline-flex items-center justify-center bg-white text-slate-900 font-black h-12 px-6 rounded-xl text-sm"
                            >
                              PDF 다운로드하여 보기
                            </a>
                          </div>
                        </object>
                      ) : (
                        <div className="text-center p-8 bg-slate-800/50 border border-white/5 rounded-2xl max-w-sm">
                          <FileText className="h-16 w-16 mx-auto text-slate-500 mb-4" />
                          <p className="font-bold text-white mb-2">미리보기가 지원되지 않는 형식입니다.</p>
                          <p className="text-xs text-slate-400 mb-6">아래 버튼을 눌러 파일을 다운로드하여 확인해 주세요.</p>
                          <a
                            href={activeDocPreview.dataUri}
                            download={activeDocPreview.name}
                            className="inline-flex items-center justify-center bg-primary hover:bg-primary/95 text-white font-black h-12 px-6 rounded-xl text-sm gap-2"
                          >
                            <Download className="h-4 w-4" /> 파일 다운로드
                          </a>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-10 text-center text-slate-500">
                    <Eye className="h-12 w-12 text-slate-600 mb-4 opacity-50" />
                    <p className="font-black text-lg text-slate-400">선택된 서류가 없습니다.</p>
                    <p className="text-sm text-slate-500 mt-1">왼쪽 목록에서 확인하실 서류를 클릭해 주세요.</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500">
              <Loader2 className="animate-spin h-10 w-10 mx-auto mb-4" />
              로딩 중...
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isNoteDrawerOpen} onOpenChange={setIsNoteDrawerOpen}>
        <DialogContent className="max-w-md rounded-[2.5rem] p-8 border-none shadow-2xl">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-black">사용자 알림 및 서류 보완 요청</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">메시지 내용</p>
              <textarea 
                className="w-full h-32 p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-primary outline-none text-slate-900 font-medium"
                placeholder="예: 신분증 사진이 흔들렸습니다. 다시 업로드해 주세요."
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
              />
            </div>
            <div className="flex gap-4 p-2 bg-slate-100 rounded-2xl">
              <button 
                onClick={() => setNoteType('Info')}
                className={`flex-1 rounded-xl py-3 font-bold transition-all ${noteType === 'Info' ? 'bg-white text-slate-900 shadow-sm' : 'bg-transparent text-slate-400 hover:text-slate-600'}`}>
                일반 안내
              </button>
              <button 
                onClick={() => setNoteType('ActionRequired')}
                className={`flex-1 rounded-xl py-3 font-bold transition-all ${noteType === 'ActionRequired' ? 'bg-red-500 text-white shadow-lg shadow-red-200' : 'bg-transparent text-slate-400 hover:text-red-500'}`}>
                서류 보완 요청
              </button>
            </div>
            <div className="pt-4 flex gap-3">
              <Button variant="ghost" className="flex-1 rounded-xl font-bold" onClick={() => setIsNoteDrawerOpen(false)} disabled={isTranslating}>취소</Button>
              <Button className="flex-[2] rounded-xl font-black bg-slate-900 text-white" onClick={handleSendNotification} disabled={isTranslating}>
                {isTranslating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> 자동 번역 중...</> : "메시지 전송하기"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
        <DialogContent className="max-w-xl h-[80vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl rounded-[2.5rem]">
          <div className="bg-slate-900 p-8 text-white flex flex-col gap-1">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black flex items-center gap-3">
                <MessageSquare className="h-7 w-7 text-primary" />
                관리자 1:1 상담
              </DialogTitle>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-widest opacity-60">ADMIN LIVE LINE</p>
            </DialogHeader>
          </div>
          
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/50 scroll-smooth"
          >
            {chatMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-30">
                <MessageSquare className="h-16 w-16" />
                <p className="font-bold">메시지를 보내 상담을 시작하세요.</p>
              </div>
            ) : (
              chatMessages.map((msg) => (
                <div key={msg.id} className={cn("flex flex-col max-w-[85%]", msg.sender === 'Admin' ? "ml-auto items-end" : "mr-auto items-start")}>
                  <div className={cn(
                    "relative p-5 rounded-3xl font-bold shadow-sm text-sm lg:text-base", 
                    msg.sender === 'Admin' ? "bg-primary text-white" : "bg-white text-slate-800 border border-slate-100"
                  )}>
                    {msg.sender === 'Admin' ? msg.text : (msg.translatedText || msg.text)}
                    {msg.sender === 'Admin' && msg.translatedText && (
                      <div className="mt-2 text-[10px] opacity-60 font-medium italic border-t border-white/20 pt-2">
                        Translation: {msg.translatedText}
                      </div>
                    )}
                    {msg.sender !== 'Admin' && msg.translatedText && (
                      <div className="mt-2 text-[10px] text-slate-400 font-medium italic border-t border-slate-50 pt-2">
                        Original: {msg.text}
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-2 font-black px-2">
                    {msg.timestamp?.toDate ? msg.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "보내는 중..."}
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="p-8 bg-white border-t border-slate-100 flex flex-col gap-3">
            {isSendingChat && (
              <div className="flex items-center gap-2 text-[10px] font-bold text-primary animate-pulse px-2">
                <Loader2 className="h-3 w-3 animate-spin" /> AI가 상대방의 언어로 전문 번역 중...
              </div>
            )}
            
            {/* Macro Action Buttons */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              <Button 
                variant="outline" size="sm" 
                className="h-9 rounded-full text-xs font-bold whitespace-nowrap bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100"
                onClick={() => handleSendChatMessage("신분증(ARC) 사진이 흐립니다. 빛 반사가 없도록 다시 촬영하여 업로드해 주세요.")}
                disabled={isSendingChat}
              >
                📸 신분증 재요청
              </Button>
              <Button 
                variant="outline" size="sm" 
                className="h-9 rounded-full text-xs font-bold whitespace-nowrap bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                onClick={() => handleSendChatMessage("입력하신 은행 계좌번호가 올바르지 않습니다. 정확히 확인 후 다시 알려주세요.")}
                disabled={isSendingChat}
              >
                🏦 계좌번호 오류
              </Button>
              <Button 
                variant="outline" size="sm" 
                className="h-9 rounded-full text-xs font-bold whitespace-nowrap bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                onClick={() => handleSendChatMessage("현재 귀하의 환급 서류가 관할 세무서에서 안전하게 검토 중입니다. 조금만 기다려주시면 환급 처리가 완료됩니다.")}
                disabled={isSendingChat}
              >
                ✅ 진행상황 안내
              </Button>
              <Button 
                variant="outline" size="sm" 
                className="h-9 rounded-full text-xs font-bold whitespace-nowrap bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
                onClick={() => handleSendChatMessage("안녕하세요! 이지텍스 관리자입니다. 더 궁금하신 점이 있으시면 편하게 남겨주세요.")}
                disabled={isSendingChat}
              >
                👋 기본 인사
              </Button>
            </div>

            <div className="flex gap-4">
              <input 
                className="flex-1 bg-slate-50 border-none rounded-2xl px-6 h-16 font-bold outline-none focus:ring-2 focus:ring-primary/20 text-slate-900"
                placeholder="답변을 입력하세요... (한국어로 입력 시 자동 번역)"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                    handleSendChatMessage();
                  }
                }}
                disabled={isSendingChat}
              />
              <Button 
                  onClick={handleSendChatMessage} 
                  className="h-16 w-16 rounded-2xl p-0 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20" 
                  disabled={isSendingChat || !chatInput.trim()}
              >
                {isSendingChat ? <Loader2 className="h-6 w-6 text-white animate-spin" /> : <Send className="h-6 w-6 text-white" />}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Floating Bulk Action Bar */}
      <div 
        className={cn(
          "fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 backdrop-blur-xl border border-slate-800/80 text-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.4)] px-8 py-5 flex items-center justify-between gap-8 transition-all duration-300 transform w-[90%] max-w-2xl",
          selectedIds.length > 0 ? "translate-y-0 opacity-100 scale-100" : "translate-y-12 opacity-0 scale-95 pointer-events-none"
        )}
      >
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 rounded-full bg-primary animate-pulse" />
          <span className="font-bold text-sm tracking-tight text-slate-200">
            총 <span className="text-primary text-base font-black ml-1 mr-1">{selectedIds.length}</span>명의 고객 선택됨
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            className="rounded-2xl text-slate-300 hover:text-white hover:bg-slate-800/80 gap-2 h-12 px-5 text-xs sm:text-sm font-bold transition-all border border-slate-800"
            onClick={triggerBulkHide}
          >
            <EyeOff className="w-4 h-4 text-slate-400" />
            목록에서 숨기기
          </Button>
          <Button 
            variant="destructive" 
            className="rounded-2xl bg-rose-600 hover:bg-rose-500 text-white gap-2 h-12 px-5 text-xs sm:text-sm font-black shadow-lg shadow-rose-900/30 transition-all"
            onClick={triggerBulkDelete}
          >
            <Trash2 className="w-4 h-4" />
            영구 삭제
          </Button>
          <div className="h-6 w-[1px] bg-slate-800 self-center hidden sm:block" />
          <Button 
            variant="ghost" 
            className="rounded-2xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 h-12 px-4 text-xs font-bold transition-all hidden sm:block"
            onClick={() => setSelectedIds([])}
          >
            선택 해제
          </Button>
        </div>
      </div>
      </div>

      {/* PRINT TEMPLATE FOR FORM 4 */}
      {selectedApp && (
        <div id="print-consent-form" className="hidden print:block fixed inset-0 bg-white z-[9999] p-[20mm] w-[210mm] h-[297mm] box-border text-black font-sans leading-relaxed text-[13px]">
          <div className="w-full text-right text-[10px] font-bold text-slate-500 mb-4">【별지 제4호 서식】</div>
          
          <div className="w-full text-center my-6">
            <h1 className="text-3xl font-extrabold tracking-widest border-b-2 border-black pb-2 inline-block px-10">세무정보 이용 동의서</h1>
          </div>

          <div className="mt-8">
            <h2 className="text-sm font-bold mb-2">■ 동의자 인적사항</h2>
            <table className="w-full border-collapse border border-black text-center text-xs">
              <tbody>
                <tr>
                  <td className="border border-black bg-slate-50 font-bold p-2.5 w-[20%]">성명(대표자)</td>
                  <td className="border border-black p-2.5 text-left w-[30%] font-semibold">{selectedApp.fullName || ""}</td>
                  <td className="border border-black bg-slate-50 font-bold p-2.5 w-[20%]">상호(법인명)</td>
                  <td className="border border-black p-2.5 text-left w-[30%]">{selectedApp.companyName || ""}</td>
                </tr>
                <tr>
                  <td className="border border-black bg-slate-50 font-bold p-2.5">주민등록번호<br/>(외국인등록번호)</td>
                  <td className="border border-black p-2.5 text-left font-semibold">{credentialsMap[selectedApp.id]?.registrationNumber || selectedApp.registrationNumber || ""}</td>
                  <td className="border border-black bg-slate-50 font-bold p-2.5">사업자등록번호</td>
                  <td className="border border-black p-2.5 text-left">{selectedApp.resCompanyIdentityNo1 || ""}</td>
                </tr>
                <tr>
                  <td className="border border-black bg-slate-50 font-bold p-2.5">사업장소재지</td>
                  <td className="border border-black p-2.5 text-left" colSpan={3}>
                    {selectedApp.businessAddress || ""} {selectedApp.businessPhone ? `(전화 : ${selectedApp.businessPhone})` : ""}
                  </td>
                </tr>
                <tr>
                  <td className="border border-black bg-slate-50 font-bold p-2.5">주소</td>
                  <td className="border border-black p-2.5 text-left" colSpan={3}>
                    {selectedApp.address || ""} {selectedApp.phoneNo || selectedApp.phone ? `(전화 : ${selectedApp.phoneNo || selectedApp.phone})` : ""}
                  </td>
                </tr>
                <tr>
                  <td className="border border-black bg-slate-50 font-bold p-2.5">e-mail 주소</td>
                  <td className="border border-black p-2.5 text-left">{selectedApp.email || ""}</td>
                  <td className="border border-black bg-slate-50 font-bold p-2.5">핸드폰 번호</td>
                  <td className="border border-black p-2.5 text-left">{selectedApp.phoneNo || selectedApp.phone || ""}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-8 text-justify text-xs leading-relaxed space-y-4">
            <p className="indent-4">
              상기인은 당해 세무대리인이 좀더 나은 세무서비스의 제공과 효율적인 회계 및 세무업무의 처리를 위한 목적으로 국세청의 홈택스에서 제공하는 세무정보를 이용하도록 하는데 동의합니다.
            </p>
            <div className="pl-6 space-y-1.5 font-semibold">
              <p>○ 세무정보 이용 대상 : 세무대리인에게 기장/신고 의뢰한 업체</p>
              <p>○ 세무정보 이용 기간 : 수임 시부터 해임 시까지</p>
              <p>○ 세무정보 이용 범위 : 『홈택스 이용에 관한 규정』 제40조의 정보</p>
            </div>
          </div>

          <div className="mt-16 flex flex-col items-center">
            <p className="text-sm font-bold tracking-widest">
              {(() => {
                const appDate = selectedApp.createdAt?.toDate ? selectedApp.createdAt.toDate() : new Date(selectedApp.createdAt || Date.now());
                return `${appDate.getFullYear()}년 ${appDate.getMonth() + 1}월 ${appDate.getDate()}일`;
              })()}
            </p>
            
            <div className="relative w-full max-w-md flex justify-between items-center mt-10 h-16 px-6 border border-slate-100 rounded-xl bg-slate-50/20">
              <span className="font-bold text-sm">동 의 인 : {selectedApp.fullName || ""}</span>
              <span className="text-slate-400 text-xs font-bold mr-12">(서명 또는 인)</span>
              {selectedApp.signatureDataUri && (
                <img 
                  src={selectedApp.signatureDataUri} 
                  alt="Signature" 
                  className="absolute right-4 top-[-16px] w-28 h-20 object-contain mix-blend-multiply" 
                />
              )}
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-base font-extrabold tracking-wider">이지텍스 세무회계 사무소 귀중</p>
          </div>

          <div className="mt-12 pt-6 border-t border-dashed border-slate-300 text-xs">
            <p className="font-semibold text-slate-700">
              ※ 당해 세무대리인은 지득한 세무정보를 세무업무처리를 위한 목적 외에 다른 용도로 사용하지 못하며, 이를 위반 시 모든 책임을 진다.
            </p>
            
            <div className="flex justify-between items-center mt-8">
              <p className="font-bold text-slate-500">
                {(() => {
                  const appDate = selectedApp.createdAt?.toDate ? selectedApp.createdAt.toDate() : new Date(selectedApp.createdAt || Date.now());
                  return `${appDate.getFullYear()}년 ${appDate.getMonth() + 1}월 ${appDate.getDate()}일`;
                })()}
              </p>
              <p className="font-extrabold">
                세무대리인 : 이지텍스 세무회계 <span className="text-slate-400 font-bold ml-4">(서명 또는 인)</span>
              </p>
            </div>
          </div>
        </div>
      )}
          <OmniChatDrawer
        isOpen={isTelegramDrawerOpen}
        onClose={() => {
          setIsTelegramDrawerOpen(false);
          setActiveLiveChatId(null);
        }}
        initialChatId={activeLiveChatId}
      />
    </>
  );
}

function AdminDashboardWrapper() {
  const { isReady, language, setLanguage } = useTranslation();
  const [isMounted, setIsMounted] = useState(false);
  const [adminVerified, setAdminVerified] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
    // 관리자 페이지는 항상 한국어로 표시하도록 강제 설정
    if (language !== 'ko') {
      setLanguage('ko', false);
    }
  }, [language, setLanguage]);

  useEffect(() => {
    if (!isMounted) return;

    const isLoggedIn = sessionStorage.getItem("admin_logged_in") === "true";

    if (!isLoggedIn) {
      router.replace("/admin/login");
    } else {
      setAdminVerified(true);
    }
  }, [isMounted, router]);

  if (!isMounted || !isReady) return null;

  return (
    <div className="min-h-screen flex flex-col font-body bg-slate-50/50">
      <Navbar />
      <main className="flex-1 w-full px-4 sm:px-6 lg:px-12 py-8 lg:py-16">
        <div className="w-full mx-auto">
          {!adminVerified ? (
             <div className="min-h-[400px] flex items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
             </div>
          ) : (
            <AdminDashboardContent isAdmin={adminVerified} />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default AdminDashboardWrapper;
