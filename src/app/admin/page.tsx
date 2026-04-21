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
  BellRing
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { translateNotification } from "@/ai/flows/notification-translation-flow";
import { MessageSquare, Send, Trash2 } from "lucide-react";
import { translateChatMessage } from "@/ai/flows/chat-translation-flow";
import { useTranslation } from "@/components/LanguageContext";
import { cn } from "@/lib/utils";


import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, doc, updateDoc, addDoc, serverTimestamp, deleteDoc, increment } from "firebase/firestore";
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
  const [isNoteDrawerOpen, setIsNoteDrawerOpen] = useState(false);
  const [noteAppId, setNoteAppId] = useState<string | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [noteType, setNoteType] = useState<'Info' | 'ActionRequired'>('Info');
  const [isTranslating, setIsTranslating] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

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
  const [searchId, setSearchId] = useState("");
  const [searchName, setSearchName] = useState("");
  const [searchPhone, setSearchPhone] = useState("");
  const [apps, setApps] = useState<any[]>([]);
  const [appsLoading, setAppsLoading] = useState(true);
  const [todayVisits, setTodayVisits] = useState(0);

  // Firestore 실시간 리스너
  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const visitUnsubscribe = onSnapshot(doc(db, 'daily_stats', todayStr), (doc) => {
      if (doc.exists()) setTodayVisits(doc.data().visitCount || 0);
    });

    console.log("Requesting Applications Snapshot...");
    const q = query(collection(db, 'applications'), orderBy('updatedAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log("Snapshot Received! Count:", snapshot.size);
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setApps(data);
      setAppsLoading(false);
    }, (error) => {
      console.error('Firestore 오류:', error);
      setAppsLoading(false);
    });
    return () => {
      unsubscribe();
      visitUnsubscribe();
    };
  }, []);

  const filteredApps = useMemo(() => {
    let result = apps;
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
    return result;
  }, [apps, searchId, searchName, searchPhone]);

  // Pagination Logic
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchId, searchName, searchPhone]);

  const paginatedApps = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredApps.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredApps, currentPage]);

  const totalPages = Math.ceil(filteredApps.length / itemsPerPage);

  // Global Unread & Push Notification Logic
  const prevUnreadRef = useRef<number>(0);
  
  useEffect(() => {
    const totalUnread = apps.reduce((acc, app) => acc + (app.unreadChatCountAdmin || 0), 0);
    
    // 1. 브라우저 탭 타이틀 알림 (다른 탭에 있어도 확인 가능하게)
    if (totalUnread > 0) {
      document.title = `(${totalUnread}) 새 메시지 - 이지텍스 관리자`;
    } else {
      document.title = `이지텍스 관리자`;
    }

    // 2. 새 메시지 수신 시 사운드 및 토스트 알람 푸시
    if (totalUnread > prevUnreadRef.current) {
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
  }, [apps, toast]);

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
    const today = new Date().toISOString().split('T')[0];
    
    // Safely extract string representation of dates
    const safeDateString = (dateVal: any) => {
      if (!dateVal) return "";
      if (typeof dateVal === 'string') return dateVal;
      if (dateVal.toDate && typeof dateVal.toDate === 'function') {
        const d = dateVal.toDate();
        // Return local YYYY-MM-DD instead of strict UTC ISO string
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      }
      if (dateVal instanceof Date) {
        return `${dateVal.getFullYear()}-${String(dateVal.getMonth() + 1).padStart(2, '0')}-${String(dateVal.getDate()).padStart(2, '0')}`;
      }
      return String(dateVal);
    };

    const todayApps = apps.filter(a => safeDateString(a.createdAt).startsWith(today)).length;
    
    // Revenue calculations
    const totalEstimatedRefund = apps.reduce((acc, app) => acc + (app.estimatedRefundAmount || 0), 0);
    const expectedRevenue = Math.floor(totalEstimatedRefund * 0.2); // 20% fee
    
    // Revenue based on manual payment confirmation
    const completedAppsList = apps.filter(a => a.status === 'RefundCompleted');
    const completedApps = completedAppsList.length;
    
    const paidAppsList = apps.filter(a => a.paymentStatus === 'paid');
    const paidRevenue = paidAppsList.reduce((acc, app) => acc + Math.floor((app.estimatedRefundAmount || 0) * 0.2), 0);
    
    // Unpaid revenue is expected revenue minus already paid revenue
    const unpaidRevenue = expectedRevenue - paidRevenue;
    
    // Settlement: Partner gets flat 50,000 KRW per paid case
    const settlementTaxAccountant = paidAppsList.length * 50000;
    const settlementCompany = paidRevenue - settlementTaxAccountant;

    const successRate = apps.length > 0 ? ((completedApps / apps.length) * 100).toFixed(1) : "0.0";

    return [
      { label: "오늘 방문자", value: `${todayVisits}명`, icon: <RotateCcw className="h-5 w-5" /> },
      { label: "오늘 신청 수", value: `${todayApps}건`, icon: <FileText className="h-5 w-5" /> },
      { label: "누적 예상 수수료", value: `₩ ${expectedRevenue.toLocaleString()}`, icon: <Wallet className="h-5 w-5" /> },
      { label: "결제 완료 수익", value: `₩ ${paidRevenue.toLocaleString()}`, icon: <ShieldCheck className="h-5 w-5 text-green-500" /> },
      { label: "미결제 예정액", value: `₩ ${unpaidRevenue > 0 ? unpaidRevenue.toLocaleString() : 0}`, icon: <Clock className="h-5 w-5 text-amber-500" /> },
      { label: "당사 순수익 (정산)", value: `₩ ${settlementCompany.toLocaleString()}`, icon: <Wallet className="h-5 w-5 text-indigo-500" /> },
      { label: "파트너 정산 (건당 5만)", value: `₩ ${settlementTaxAccountant.toLocaleString()}`, icon: <Wallet className="h-5 w-5 text-slate-500" /> },
      { label: "환급 성공률", value: `${successRate}%`, icon: <Trophy className="h-5 w-5" /> },
    ];
  }, [apps, todayVisits]);

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
        byLang[langLabel].revenue += Math.floor((app.estimatedRefundAmount || 0) * 0.2);
      }

      // UTM 채널별 통계
      const source = app.utmSource || '직접유입 (Direct)';
      if (!byUtm[source]) byUtm[source] = { total: 0, paid: 0, revenue: 0 };
      byUtm[source].total++;
      if (app.paymentStatus === 'paid') {
        byUtm[source].paid++;
        byUtm[source].revenue += Math.floor((app.estimatedRefundAmount || 0) * 0.2);
      }

      // 퍼널 추적
      const maxStep = app.lastStep || 1;
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
      console.log("Deleting applicant:", appId);
      await deleteDoc(doc(db, 'applications', appId));
      toast({ title: "삭제 완료", description: "신청자 데이터가 시스템에서 영구적으로 제거되었습니다." });
      setIsDeleteDialogOpen(false);
      setIsDetailOpen(false);
      setSelectedApp(null);
    } catch (error) {
      console.error("삭제 오류:", error);
      toast({ variant: "destructive", title: "삭제 실패", description: "권한이 없거나 서버 오류가 발생했습니다." });
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
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'RefundCompleted': return { label: '환급 완료', class: 'bg-green-100 text-green-700' };
      case 'NTSReviewing': return { label: '국세청 검토중', class: 'bg-indigo-100 text-indigo-700' };
      case 'NTSDocumentReceipt': return { label: '국세청 서류접수', class: 'bg-blue-100 text-blue-700' };
      case 'TaxOfficeReviewing': return { label: '세무서 검토 중', class: 'bg-amber-100 text-amber-700' };
      case 'Applying': return { label: '신청 중', class: 'bg-primary/10 text-primary' };
      case 'AdditionalDocsNeeded': return { label: '서류 보완 필요', class: 'bg-red-100 text-red-600 font-black' };
      default: return { label: '조회 완료', class: 'bg-slate-100 text-slate-500' };
    }
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
    link.setAttribute("download", `이지텍스_추출자료_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({ title: "자료 추출 성공", description: "세무사 제출용 CSV 자료가 다운로드되었습니다." });
  };


  return (
    <div className="space-y-10 animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-primary/10 text-primary border-none font-black">ADMIN LIVE CONTROL</Badge>
          </div>
          <h1 className="text-3xl font-black font-headline text-slate-900">대표님 대시보드</h1>
        </div>
        <div className="flex flex-wrap lg:justify-end gap-2">
          <Button onClick={handleExportCsv} variant="default" className="h-12 rounded-xl font-bold gap-2 bg-emerald-600 hover:bg-emerald-700 shadow-md">
            <Download className="h-4 w-4" /> CSV 추출
          </Button>
          <Button onClick={() => router.push('/admin/stats')} variant="outline" className="h-12 rounded-xl font-bold gap-2 text-indigo-600 border-indigo-100 hover:bg-indigo-50">
            📊 통계
          </Button>
          <Button onClick={() => {
            setSearchId("");
            setSearchName("");
            setSearchPhone("");
            window.location.reload();
          }} variant="outline" className="h-12 w-12 rounded-xl font-bold">
            <RefreshCw className={cn("h-4 w-4", appsLoading && "animate-spin")} />
          </Button>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
        </div>
      </div>

      <Card className="premium-card rounded-[2.5rem] border-none overflow-hidden bg-white shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="font-bold pl-8 py-5">신청번호 / 고객</TableHead>
                <TableHead className="font-bold">예상 환급액</TableHead>
                <TableHead className="font-bold">진행 단계</TableHead>
                <TableHead className="font-bold">사전 진단액</TableHead>
                <TableHead className="font-bold text-indigo-600">리포트</TableHead>
                <TableHead className="font-bold text-emerald-600">문서 / 연락처</TableHead>
                <TableHead className="font-bold pr-8 text-right">상태 제어</TableHead>
              </TableRow>
            </TableHeader>
                      <TableBody>
                        {paginatedApps?.map((app) => {
                          const statusBadge = getStatusBadge(app.status);
                          return (
                            <TableRow key={app.id} className="hover:bg-slate-50 border-b border-slate-50 transition-colors">
                              <TableCell 
                                className="pl-8 py-5 cursor-pointer hover:bg-slate-100/50 transition-all group"
                                onClick={() => openAppDetail(app)}
                              >
                                <div className="font-black text-slate-900 group-hover:text-primary flex items-center gap-2 transition-colors">
                                  {app.id.substring(0, 8)}...
                                  <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-all -translate-x-1 group-hover:translate-x-0" />
                                </div>
                                <div className="flex items-center gap-1">
                                  <div className="text-xs text-slate-400 font-bold">{app.fullName || "이름 없음"}</div>
                                  {app.userLanguage && (
                                    <Badge variant="outline" className="text-[9px] px-1 h-4 border-slate-200 text-slate-400 font-bold bg-slate-50 uppercase">
                                      {app.userLanguage}
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="font-black">₩ {app.estimatedRefundAmount?.toLocaleString()}</TableCell>
                              <TableCell><Badge className={`rounded-lg font-bold ${statusBadge.class}`}>{statusBadge.label}</Badge></TableCell>
                              <TableCell>
                                <div className="font-bold text-slate-900">₩ {(app.preFilterEstimate || 0).toLocaleString()}</div>
                              </TableCell>
                              <TableCell>
                                <Button variant="outline" size="sm" className="rounded-xl font-black text-indigo-600 bg-indigo-50 border-indigo-100" onClick={() => { setReportApp(app); setIsTaxReportOpen(true); }}>
                                  <FileSearch className="h-4 w-4 mr-2" /> 자료
                                </Button>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col gap-1">
                                  <div className="text-[11px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-100 w-fit">
                                     {app.phoneNo || app.phone || "No Phone"}
                                  </div>
                                  <Button variant="outline" size="sm" className="h-7 w-fit rounded-lg font-black text-[10px] text-emerald-600 bg-emerald-50 border-emerald-100" onClick={async () => {
                                    setIsDocsLoading(true);
                                    try { setIsDocsViewerOpen(true); } finally { setIsDocsLoading(false); }
                                  }}>
                                    현장 서류
                                  </Button>
                                </div>
                              </TableCell>
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
                                        <Clock className="w-3 h-3 shrink-0" />
                                        <span className="shrink-0">{app.lastMessageAt?.toDate ? app.lastMessageAt.toDate().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : "방금 전"}</span>
                                      </div>
                                    )}
                                  </div>
                                  <Button variant="outline" size="sm" className="rounded-xl font-black" onClick={() => handleStatusChange(app, 1)}>
                                    단계 제어 <ChevronRight className="h-4 w-4 ml-1" />
                                  </Button>
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

      {/* Applicant Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
          {selectedApp && (
            <div className="flex flex-col h-full max-h-[90vh]">
              <div className="bg-slate-900 p-8 text-white relative">
                <DialogHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <Badge className="bg-primary hover:bg-primary border-none text-white font-black text-[10px]">APPLICANT DOSSIER</Badge>
                    <span className="text-slate-400 font-bold text-[10px] tracking-widest uppercase">{selectedApp.id}</span>
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
                      { label: "휴대폰 번호", value: selectedApp.phoneNo || "미입력" },
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

                {/* Business Info */}
                <div className="space-y-4">
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <FileSearch className="h-4 w-4 text-indigo-500" /> 세무/사업자 정보
                  </h3>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-4 p-6 bg-indigo-50/30 rounded-3xl border border-indigo-100/50">
                    {[
                      { label: "사업자명 (회사)", value: selectedApp.companyName || "미입력" },
                      { label: "사업자 등록번호", value: selectedApp.resCompanyIdentityNo1 || "미입력" },
                      { label: "근무 연도 (귀속)", value: `${selectedApp.resAttrYear}년` || "미입력" },
                      { label: "결정 세액", value: `₩ ${(selectedApp.resIncomeTax ?? 0).toLocaleString()}` },
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
                          <p className="text-sm font-black text-red-900">Danger Zone</p>
                          <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest">데이터 영구 삭제 처리</p>
                        </div>
                      </div>
                      <p className="text-xs font-bold text-red-600/70 leading-relaxed">
                        신청자를 삭제하면 복구가 불가능합니다. 모든 채팅 내역과 개인정보가 즉시 파기됩니다.
                      </p>
                      <Button 
                        variant="destructive" 
                        onClick={() => setIsDeleteDialogOpen(true)}
                        className="w-full h-14 rounded-xl font-black bg-red-500 hover:bg-red-600 shadow-lg shadow-red-200"
                      >
                        <Trash2 className="h-4 w-4 mr-2" /> 신청자 영구 삭제하기
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
            <DialogTitle className="text-2xl font-black text-slate-900">정말로 삭제하시겠습니까?</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <p className="text-slate-500 font-bold leading-relaxed">
              이 작업은 즉시 실행되며 되돌릴 수 없습니다.<br />
              <span className="text-red-600 font-black">신청번호: {selectedApp?.id}</span><br />
              모든 신청 내역과 개인정보가 시스템에서 영구적으로 파기됩니다.
            </p>
            <div className="flex gap-4">
              <Button variant="ghost" className="flex-1 h-14 rounded-xl font-bold" onClick={() => setIsDeleteDialogOpen(false)}>취소</Button>
              <Button 
                variant="destructive" 
                className="flex-[2] h-14 rounded-xl font-black bg-red-500 text-white shadow-lg" 
                onClick={() => handleDeleteApplicant(selectedApp.id)}
              >
                네, 영구 삭제합니다
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

      <Dialog open={isDocsViewerOpen} onOpenChange={setIsDocsViewerOpen}>
        <DialogContent className="max-w-xl rounded-[2.5rem] p-8 border-none shadow-2xl">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-black">증빙 서류 확인</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 text-center py-10">
            <div className="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Files className="h-10 w-10 text-slate-400" />
            </div>
            <p className="text-slate-500 font-bold">
              현재 해당 기능(서류 이미지 뷰어)은 세무 보안 서버와 동기화 중입니다.<br />
              급한 확인이 필요하실 경우 DB 관리자에게 문의하세요.
            </p>
            <Button onClick={() => setIsDocsViewerOpen(false)} className="rounded-xl px-10">닫기</Button>
          </div>
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
      {/* VIP Priority Monitoring Section */}
      <div className="pt-20 border-t-2 border-slate-100 pb-20">
        <div className="flex items-center gap-4 mb-10">
          <div className="h-14 w-14 bg-amber-400 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-200">
             <Trophy className="h-8 w-8 text-amber-950" />
          </div>
          <div>
            <h2 className="text-4xl font-black text-slate-900 font-headline tracking-tight">🔥 VIP 실시간 우선 모니터링 (집중 관리)</h2>
            <p className="text-slate-500 font-bold text-lg">잠재 환급액 40만 원 이상의 고액 대상자 우선 순위 리스트입니다.</p>
          </div>
        </div>

        <Card className="premium-card rounded-[2.5rem] border-4 border-amber-400 shadow-2xl overflow-hidden bg-white">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-amber-400/10">
                <TableRow className="hover:bg-amber-400/5 transition-colors border-b border-amber-400/20">
                  <TableHead className="font-black text-amber-950 pl-8 py-6">VIP 고객 정보</TableHead>
                  <TableHead className="font-black text-amber-950">잠재 환급액</TableHead>
                  <TableHead className="font-black text-amber-950">현재 단계</TableHead>
                  <TableHead className="font-black text-amber-950">연락처</TableHead>
                  <TableHead className="font-black text-amber-950 pr-8 text-right">실시간 우선 상담</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                 {apps.filter(app => (app.preFilterEstimate || 0) >= 400000).slice(0, 50).map((app) => {
                   const statusBadge = getStatusBadge(app.status);
                   return (
                     <TableRow key={app.id} className="hover:bg-amber-400/5 transition-colors border-b border-amber-400/10">
                        <TableCell className="pl-8 py-6 cursor-pointer" onClick={() => openAppDetail(app)}>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-amber-400 text-amber-950 rounded-xl flex items-center justify-center font-black shadow-sm shrink-0">VIP</div>
                            <div>
                               <div className="font-black text-slate-900 text-lg leading-none mb-1">{app.fullName || "이름 없음"}</div>
                               <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">ID: {app.id.substring(0, 8)}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-2xl font-black text-amber-600 tracking-tighter">₩ {(app.preFilterEstimate || 0).toLocaleString()}</div>
                        </TableCell>
                        <TableCell>
                           <Badge className={`rounded-xl px-3 font-black ${statusBadge.class} border-none shadow-sm`}>{statusBadge.label}</Badge>
                        </TableCell>
                        <TableCell>
                           <div className="font-black text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 inline-block text-sm">
                             {app.phoneNo || app.phone || "No Phone"}
                           </div>
                        </TableCell>
                        <TableCell className="pr-8 text-right">
                          <div className="flex justify-end items-center gap-4">
                            <Button
                              variant="ghost"
                              size="lg"
                              className="rounded-2xl text-amber-600 hover:bg-amber-50 h-16 w-16"
                              onClick={() => {
                                setNoteAppId(app.id);
                                setIsNoteDrawerOpen(true);
                              }}
                            >
                              <BellRing className="h-7 w-7" />
                            </Button>
                            <div className="flex flex-col items-end gap-2">
                              <Button 
                                className="rounded-2xl h-16 px-8 bg-amber-400 text-amber-950 font-black shadow-lg shadow-amber-200 hover:bg-amber-500 scale-100 hover:scale-105 transition-all relative overflow-hidden group"
                                onClick={async () => {
                                  setChatAppId(app.id);
                                  setIsChatOpen(true);
                                  if (app.unreadChatCountAdmin > 0) {
                                    await updateDoc(doc(db, 'applications', app.id), { unreadChatCountAdmin: 0 });
                                  }
                                }}
                              >
                                 <MessageSquare className="h-6 w-6 mr-3 animate-bounce" />
                                 VIP 우선 상담 시작하기
                                 {app.unreadChatCountAdmin > 0 && (
                                    <span className="absolute -top-3 -right-3 h-[42px] w-[42px] bg-red-600 text-white rounded-full border-4 border-white flex items-center justify-center text-sm font-black shadow-2xl animate-bounce z-10 transition-all">
                                      {app.unreadChatCountAdmin > 99 ? '99+' : app.unreadChatCountAdmin}
                                    </span>
                                 )}
                              </Button>
                              {app.unreadChatCountAdmin > 0 && app.lastMessageAt && (
                                <div className="text-[12px] font-black text-red-600 bg-red-50/80 px-3 py-1.5 rounded-xl border border-red-200 flex items-center gap-1.5 animate-pulse max-w-[240px] shadow-sm">
                                  <Clock className="w-3.5 h-3.5 shrink-0" />
                                  <span className="shrink-0">{app.lastMessageAt?.toDate ? app.lastMessageAt.toDate().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : "방금 전"}</span>
                                  <span className="text-slate-500 truncate block border-l border-red-200 pl-2 ml-0.5">"{app.lastMessageText || '새로 받은 메시지'}"</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                     </TableRow>
                   );
                 })}
              </TableBody>
            </Table>
            {apps.filter(app => (app.preFilterEstimate || 0) >= 400000).length === 0 && (
              <div className="py-32 text-center bg-slate-50/50">
                <p className="text-2xl font-black text-slate-300">현재 집중 모니터링 대상인 VIP가 없습니다.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
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
      <main className="flex-1 container mx-auto px-4 py-8 lg:py-16">
        <div className="max-w-7xl mx-auto">
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
