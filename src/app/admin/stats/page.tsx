"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  FileText, 
  Wallet, 
  ArrowLeft,
  PieChart,
  RefreshCw,
  Trophy,
  Globe2,
  Target,
  Zap,
  Download,
  LayoutDashboard,
  ShieldCheck,
  Bot,
  BrainCircuit,
  ShoppingBag
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { getKstDateString } from "@/lib/tracking";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useTranslation } from "@/components/LanguageContext";

const LANGUAGE_TO_COUNTRY: Record<string, string> = {
  'ko': '한국',
  'vi': '베트남',
  'zh': '중국',
  'km': '캄보디아',
  'ne': '네팔',
  'uz': '우즈베키스탄',
  'my': '미얀마',
  'id': '인도네시아',
  'th': '태국',
  'en': '필리핀',
  'si': '스리랑카',
  'mn': '몽골',
  'bn': '방글라데시',
  'kk': '카자흐스탄',
  'ur': '파키스탄'
};

const normalizeChannel = (src: string): string => {
  const s = String(src).toLowerCase().trim();
  if (s === 'kmarket' || s === 'k-market' || s === 'k_market' || s === '케이마켓') return 'K-Market';
  if (s === 'fb' || s === 'facebook') return 'Facebook';
  if (s === 'ig' || s === 'instagram') return 'Instagram';
  if (s === 'direct' || s === 'undefined' || !s || s === 'null') return 'Direct';
  if (s === 'referral') return 'Referral';
  return src;
};

const CHANNEL_LABELS: Record<string, string> = {
  'K-Market': '🛍️ 케이마켓 (K-Market 제휴)',
  'Facebook': '페이스북 (Facebook)',
  'Instagram': '인스타그램 (Instagram)',
  'Direct': '직접 유입 (Direct / 개발)',
  'Referral': '추천 유입 (Referral)'
};

const TARGET_COUNTRY_LIST = Object.values(LANGUAGE_TO_COUNTRY);

type TimeRange = 'today' | 'week' | 'month' | 'total';

export default function AdminStatsPage() {
  const { language, setLanguage } = useTranslation();
  const router = useRouter();
  const [apps, setApps] = useState<any[]>([]);
  const [dailyStats, setDailyStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('total');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [isMounted, setIsMounted] = useState(false);
  const { toast } = useToast();
  const [adminVerified, setAdminVerified] = useState(false);
  const [aiStats, setAiStats] = useState<any>(null);
  const [loadingAi, setLoadingAi] = useState(true);
  const [isEvolving, setIsEvolving] = useState(false);
  const [targetEvolveLang, setTargetEvolveLang] = useState('vi');

  const fetchAiStats = () => {
    setLoadingAi(true);
    fetch('/api/admin/stats/ai')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setAiStats(data.stats);
        }
        setLoadingAi(false);
      })
      .catch(err => {
        console.error('Failed to load AI stats:', err);
        setLoadingAi(false);
      });
  };

  const handleEvolveScripts = async () => {
    try {
      setIsEvolving(true);
      toast({
        title: "AI 신규 화법 자율 창작 시작",
        description: `선택하신 국적(${targetEvolveLang.toUpperCase()})의 전환율 데이터를 기반으로 Gemini AI가 신규 화법을 창작하고 임베딩합니다...`,
      });

      const res = await fetch('/api/admin/scripts/evolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetLanguage: targetEvolveLang,
          targetPersonality: 'all',
          targetStep: 'general',
          count: 3
        })
      });

      const data = await res.json();
      if (data.success) {
        toast({
          title: "자율 진화 완료! 🎉",
          description: `${data.generatedCount}개의 신규 고전환율 화법이 생성되어 Supabase에 자동 등록되었습니다.`,
        });
        fetchAiStats();
      } else {
        toast({
          variant: "destructive",
          title: "생성 실패",
          description: data.error || "알 수 없는 오류가 발생했습니다.",
        });
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "오류 발생",
        description: err.message,
      });
    } finally {
      setIsEvolving(false);
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
    link.setAttribute("download", `이지텍스_추출자료_${getKstDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({ title: "자료 추출 성공", description: "세무사 제출용 CSV 자료가 다운로드되었습니다." });
  };

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

  useEffect(() => {
    const fetchSupabaseData = async () => {
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
              userLanguage: d.language || 'ko',
              status: d.status,
              step: d.step,
              lastStep: d.step || d.metadata?.lastStep || 1,
              estimatedRefundAmount: d.estimated_refund_amount || 0,
              serviceFee: d.service_fee || Math.floor((d.estimated_refund_amount || 0) * 0.22),
              utmSource: isFromKmarket ? 'kmarket' : (d.metadata?.utmSource || d.metadata?.detectedSource || 'direct'),
              isFromKmarket,
              paymentStatus: d.metadata?.paymentStatus || (d.status === 'RefundCompleted' ? 'paid' : 'pending'),
              createdAt: d.created_at,
              updatedAt: d.updated_at,
              ...(d.metadata || {})
            };
          });
          setApps(formatted);
          setLoading(false);
        }
      } catch (err) {
        console.error("Stats Supabase load error:", err);
        setLoading(false);
      }
    };

    fetchSupabaseData();
    const interval = setInterval(fetchSupabaseData, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetch('/api/admin/stats/ai')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setAiStats(data.stats);
        }
        setLoadingAi(false);
      })
      .catch(err => {
        console.error('Failed to load AI stats:', err);
        setLoadingAi(false);
      });
  }, []);

  const availableCountries = useMemo(() => {
    return TARGET_COUNTRY_LIST;
  }, []);

  const filteredData = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(new Date().setHours(0, 0, 0, 0));
    const startOfWeek = new Date(new Date().setDate(now.getDate() - now.getDay()));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const filterByDate = (dateVal: any, start: Date) => {
      let d: Date;
      if (dateVal?.toDate) d = dateVal.toDate();
      else if (dateVal instanceof Date) d = dateVal;
      else d = new Date(dateVal);
      return d >= start;
    };

    const targetStart = 
      timeRange === 'today' ? startOfToday :
      timeRange === 'week' ? startOfWeek :
      timeRange === 'month' ? startOfMonth :
      null;

    const dateFilteredApps = targetStart ? apps.filter(a => filterByDate(a.createdAt, targetStart)) : apps;
    const dateFilteredDaily = targetStart ? dailyStats.filter(s => new Date(s.id) >= targetStart) : dailyStats;

    // First, filter by country if selected
    const countryFilteredApps = selectedCountry === 'all' 
      ? dateFilteredApps 
      : dateFilteredApps.filter(a => (LANGUAGE_TO_COUNTRY[a.userLanguage] || a.userLanguage) === selectedCountry);

    // Basic Metrics
    const totalVisits = dateFilteredDaily.reduce((acc, s) => {
      if (selectedCountry === 'all') return acc + (s.visitCount || 0);
      
      const langCode = Object.keys(LANGUAGE_TO_COUNTRY).find(key => LANGUAGE_TO_COUNTRY[key] === selectedCountry);
      if (langCode) {
        return acc + (s.languageVisits?.[langCode] || 0);
      }
      return acc;
    }, 0);
    const countryApps = countryFilteredApps.length;
    const countryPaid = countryFilteredApps.filter(a => a.paymentStatus === 'paid').length;
    const countryRevenue = countryFilteredApps.filter(a => a.paymentStatus === 'paid').reduce((acc, a) => acc + Math.floor((a.estimatedRefundAmount || 0) * 0.22), 0);

    // K-Market Specific Stats
    const kmarketFilteredApps = countryFilteredApps.filter(a => a.isFromKmarket);
    const kmarketTotalCount = kmarketFilteredApps.length;
    const kmarketPaidCount = kmarketFilteredApps.filter(a => a.paymentStatus === 'paid').length;
    const kmarketEstimatedRefundTotal = kmarketFilteredApps.reduce((acc, a) => acc + (a.estimatedRefundAmount || 0), 0);
    const kmarketRevenueTotal = Math.floor(kmarketEstimatedRefundTotal * 0.22);
    const kmarketConversionRate = kmarketTotalCount > 0 ? ((kmarketPaidCount / kmarketTotalCount) * 100).toFixed(1) : "0.0";

    // Channel Stats (UTM)
    const channelStats: Record<string, { visits: number, applicants: number, paid: number, revenue: number }> = {};
    
    // 1. Aggregate visits by channel from daily_stats
    dateFilteredDaily.forEach(s => {
      Object.entries(s).forEach(([key, count]) => {
        if (key.startsWith('sourceVisits.')) {
          const rawSrc = key.split('.')[1];
          const cleanSrc = normalizeChannel(rawSrc);
          if (!channelStats[cleanSrc]) channelStats[cleanSrc] = { visits: 0, applicants: 0, paid: 0, revenue: 0 };
          channelStats[cleanSrc].visits += (count as number);
        }
      });
      
      if (s.sourceVisits && typeof s.sourceVisits === 'object') {
        Object.entries(s.sourceVisits).forEach(([src, count]) => {
          const cleanSrc = normalizeChannel(src);
          if (!channelStats[cleanSrc]) channelStats[cleanSrc] = { visits: 0, applicants: 0, paid: 0, revenue: 0 };
          channelStats[cleanSrc].visits += (count as number);
        });
      }
    });

    // 2. Aggregate application stats
    countryFilteredApps.forEach(app => {
      const src = normalizeChannel(app.utmSource);
      if (!channelStats[src]) channelStats[src] = { visits: 0, applicants: 0, paid: 0, revenue: 0 };
      channelStats[src].applicants++;
      if (app.paymentStatus === 'paid') {
        channelStats[src].paid++;
        channelStats[src].revenue += Math.floor((app.estimatedRefundAmount || 0) * 0.22);
      }
    });

    const sortedChannels = Object.entries(channelStats).sort((a, b) => b[1].applicants - a[1].applicants);

    // Detailed 10-Step Funnel
    const funnel: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
    
    funnel[0] = Math.max(totalVisits, countryApps);

    countryFilteredApps.forEach(app => {
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

      const max = Math.max(app.lastStep || 0, statusInferredStep);
      for (let i = 1; i <= Math.min(max, 9); i++) {
        funnel[i] = (funnel[i] || 0) + 1;
      }
    });

    // Global Stats for Ranking
    const nationalityRankMap: Record<string, number> = {};
    dateFilteredApps.forEach(app => {
        const c = LANGUAGE_TO_COUNTRY[app.userLanguage] || app.userLanguage || 'Unknown';
        nationalityRankMap[c] = (nationalityRankMap[c] || 0) + 1;
    });
    const nationalityRanking = Object.entries(nationalityRankMap).sort((a,b) => b[1] - a[1]);

    const totalInstalls = dateFilteredDaily.reduce((acc, s) => acc + (s.pwaInstallCount || 0), 0);

    return {
      totalVisits,
      totalInstalls,
      totalAppsGlobal: dateFilteredApps.length,
      countryApps,
      countryPaid,
      countryRevenue,
      kmarketTotalCount,
      kmarketPaidCount,
      kmarketEstimatedRefundTotal,
      kmarketRevenueTotal,
      kmarketConversionRate,
      byUtm: sortedChannels,
      funnel,
      topVolumeChannel: sortedChannels[0]?.[0] || 'direct',
      topYieldChannel: Object.entries(channelStats).sort((a,b) => b[1].revenue - a[1].revenue)[0]?.[0] || 'direct',
      nationalityRanking
    };
  }, [apps, dailyStats, timeRange, selectedCountry]);

  if (!isMounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <RefreshCw className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!adminVerified) return null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <Navbar />
      <main className="flex-1 w-full px-4 sm:px-6 lg:px-12 py-8 lg:py-16">
        <div className="w-full mx-auto space-y-10 animate-fade-in-up">
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
                  onClick={() => router.push('/admin?view=dashboard')}
                  className="w-full justify-start h-12 rounded-xl font-bold gap-3 px-4 text-slate-600 hover:bg-slate-50"
                >
                  <LayoutDashboard className="h-4 w-4" /> 대시보드 홈
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => router.push('/admin?view=hometax')}
                  className="w-full justify-start h-12 rounded-xl font-bold gap-3 px-4 text-slate-600 hover:bg-slate-50"
                >
                  <ShieldCheck className="h-4 w-4 text-emerald-600" /> 고객 홈택스 정보
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => router.push('/admin/stats')}
                  className="w-full justify-start h-12 rounded-xl font-bold gap-3 px-4 bg-primary/10 text-primary hover:bg-primary/15"
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
                  onClick={() => window.location.reload()}
                  className="w-full justify-start h-12 rounded-xl font-bold gap-3 px-4 text-slate-600 hover:bg-slate-50"
                >
                  <RefreshCw className="h-4 w-4" /> 화면 새로고침
                </Button>
              </div>
            </div>

            {/* Right Main Content Area */}
            <div className="flex-1 min-w-0 space-y-10">
              {/* Header & Filter */}
              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="space-y-2">
                    <Button onClick={() => router.push('/admin')} variant="ghost" className="pl-0 hover:bg-transparent text-slate-500 font-bold gap-2">
                      <ArrowLeft className="h-4 w-4" /> 대시보드로 돌아가기
                    </Button>
                    <h1 className="text-3xl font-black text-slate-900">Advanced Marketing Intel</h1>
                  </div>
                  <div className="flex bg-slate-100 p-1 rounded-2xl">
                    {['today', 'week', 'month', 'total'].map(range => (
                      <Button 
                        key={range}
                        onClick={() => setTimeRange(range as TimeRange)}
                        variant={timeRange === range ? 'default' : 'ghost'}
                        className={`rounded-xl px-5 font-bold ${timeRange === range ? 'bg-slate-900 text-white' : 'text-slate-500'}`}
                      >
                        {range === 'today' ? '오늘' : range === 'week' ? '주간' : range === 'month' ? '월간' : '전체'}
                      </Button>
                    ))}
                  </div>
                </div>

                <Separator className="bg-slate-100" />

                <div className="flex flex-col sm:flex-row items-center gap-6 text-sm">
                   <div className="flex items-center gap-3 shrink-0">
                      <div className="h-10 w-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                        <Globe2 className="h-5 w-5" />
                      </div>
                      <span className="font-black text-slate-900">분석 대상 명단 분리:</span>
                   </div>
                   <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                      <SelectTrigger className="w-full sm:w-[300px] h-14 rounded-2xl bg-white border border-slate-200 font-black text-indigo-600 shadow-sm transition-all hover:border-indigo-300">
                        <SelectValue placeholder="모든 국가 (Global)" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-none shadow-2xl">
                        <SelectItem value="all" className="font-bold py-3 cursor-pointer">모든 국가 (Global)</SelectItem>
                        {availableCountries.map(c => (
                          <SelectItem key={c} value={c} className="font-bold py-3 cursor-pointer">{c}</SelectItem>
                        ))}
                      </SelectContent>
                   </Select>
                   {selectedCountry !== 'all' && (
                     <Badge className="bg-indigo-600 text-white border-none py-2 px-4 rounded-xl font-black animate-in fade-in zoom-in">
                       {selectedCountry} 집중 분석 중
                     </Badge>
                   )}
                </div>
              </div>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="premium-card rounded-[2.5rem] border-none shadow-sm bg-white p-8 space-y-4">
                  <div className="h-12 w-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600"><Users /></div>
                  <div>
                    {selectedCountry === 'all' ? (
                      <>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">전체 방문자 (Global)</p>
                        <p className="text-3xl font-black text-slate-900">{filteredData.totalVisits.toLocaleString()}명</p>
                        <div className="mt-2 text-xs font-bold text-slate-500 flex items-center gap-1.5">
                          <Download className="w-3.5 h-3.5 text-indigo-500" />
                          PWA 앱 설치: {filteredData.totalInstalls.toLocaleString()}건
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{selectedCountry} 신청자</p>
                        <p className="text-3xl font-black text-slate-900">{filteredData.countryApps.toLocaleString()}명</p>
                        <p className="text-[10px] font-bold text-slate-400 mt-1">※ 방문자 통계는 국가별 분리 불가 (전체 기준)</p>
                      </>
                    )}
                  </div>
                </Card>
                <Card className="premium-card rounded-[2.5rem] border-none shadow-sm bg-white p-8 space-y-4">
                   <div className="h-12 w-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600"><FileText /></div>
                   <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">총 신청 건수</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-slate-900">{filteredData.countryApps.toLocaleString()}건</span>
                    </div>
                    {selectedCountry !== 'all' && (
                      <p className="text-xs font-bold text-slate-400 mt-1">Global 점유율: {((filteredData.countryApps / (filteredData.totalAppsGlobal || 1)) * 100).toFixed(1)}%</p>
                    )}
                  </div>
                </Card>
                <Card className="premium-card rounded-[2.5rem] border-none shadow-sm bg-white p-8 border-l-4 border-l-emerald-500">
                   <div className="h-12 w-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600"><Target /></div>
                   <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">최종 전환율 (Paid)</p>
                    <p className="text-3xl font-black text-emerald-600">
                      {filteredData.countryApps > 0 ? ((filteredData.countryPaid / filteredData.countryApps) * 100).toFixed(1) : 0}%
                    </p>
                  </div>
                </Card>
                <Card className="premium-card rounded-[2.5rem] border-none shadow-sm bg-white p-8 border-l-4 border-l-indigo-500">
                   <div className="h-12 w-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600"><Wallet /></div>
                   <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">기여 예상 수익</p>
                    <p className="text-3xl font-black text-indigo-600">₩ {filteredData.countryRevenue.toLocaleString()}</p>
                  </div>
                </Card>
              </div>

              {/* K-Market Dedicated Analytics Hero Card */}
              <Card className="premium-card rounded-[2.5rem] border-2 border-amber-300 shadow-md bg-gradient-to-br from-amber-50/80 via-white to-amber-50/40 p-8 space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-amber-200/60 pb-5">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 bg-amber-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                      <ShoppingBag className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-amber-500 text-white border-none font-black text-[10px] px-2 py-0.5">
                          제휴 연계 실시간 성과
                        </Badge>
                      </div>
                      <h3 className="text-xl font-black text-slate-900 mt-1">🛍️ 케이마켓(K-Market) 유입 및 환급 성과</h3>
                    </div>
                  </div>
                  <div className="text-xs font-bold text-amber-800 bg-amber-100/80 px-3.5 py-1.5 rounded-xl">
                    K-Market 앱/웹 경유 신청자 전용 집계
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-amber-200/60 shadow-sm space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">케이마켓 유입 신청자</p>
                    <p className="text-2xl font-black text-amber-600">{filteredData.kmarketTotalCount.toLocaleString()}명</p>
                    <p className="text-[11px] font-bold text-slate-400">전체 신청의 {((filteredData.kmarketTotalCount / (filteredData.countryApps || 1)) * 100).toFixed(1)}%</p>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-amber-200/60 shadow-sm space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">케이마켓 계약 완료</p>
                    <p className="text-2xl font-black text-emerald-600">{filteredData.kmarketPaidCount.toLocaleString()}건</p>
                    <p className="text-[11px] font-bold text-emerald-600">전환율 {filteredData.kmarketConversionRate}%</p>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-amber-200/60 shadow-sm space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">케이마켓 예상 환급액</p>
                    <p className="text-2xl font-black text-slate-900">₩ {filteredData.kmarketEstimatedRefundTotal.toLocaleString()}</p>
                    <p className="text-[11px] font-bold text-slate-400">국세청 조회 확정액</p>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-amber-200/60 shadow-sm space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">케이마켓 예상 수익(22%)</p>
                    <p className="text-2xl font-black text-indigo-600">₩ {filteredData.kmarketRevenueTotal.toLocaleString()}</p>
                    <p className="text-[11px] font-bold text-indigo-600">제휴 기여 매출</p>
                  </div>
                </div>
              </Card>

              {/* Ranking & Regional Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-1 premium-card rounded-[2.5rem] border-none shadow-sm bg-white p-8 space-y-6">
                    <div className="flex items-center gap-3">
                        <Trophy className="text-amber-500 h-6 w-6" />
                        <h3 className="text-xl font-black">글로벌 국가 순위</h3>
                    </div>
                    <div className="space-y-4">
                        {filteredData.nationalityRanking.slice(0, 5).map(([name, count], i) => (
                            <div key={name} className={cn("flex justify-between items-center p-4 rounded-2xl border transition-all", selectedCountry === name ? "bg-indigo-600 text-white border-indigo-600" : "bg-slate-50 border-slate-100 hover:bg-slate-100")}>
                                <div className="flex items-center gap-3">
                                    <span className={cn("font-black text-xs w-6 h-6 rounded-lg flex items-center justify-center", i === 0 ? "bg-amber-400 text-white" : i === 1 ? "bg-slate-300 text-slate-600" : "bg-slate-200 text-slate-500")}>{i + 1}</span>
                                    <span className="font-bold">{name}</span>
                                </div>
                                <span className="font-black">{count}건</span>
                            </div>
                        ))}
                    </div>
                    {filteredData.nationalityRanking.length > 5 && (
                        <div className="pt-4 border-t border-slate-100 text-center">
                            <p className="text-xs font-bold text-slate-400">최저 신청 국가: <span className="text-red-500">{filteredData.nationalityRanking[filteredData.nationalityRanking.length-1][0]}</span></p>
                        </div>
                    )}
                </Card>

                <Card className="lg:col-span-2 premium-card rounded-[2.5rem] border-none shadow-sm bg-white flex flex-col">
                    <CardHeader className="p-8 pb-4">
                        <CardTitle className="text-xl font-black flex items-center gap-2">
                            <Zap className="text-amber-500 h-5 w-5" /> {selectedCountry === 'all' ? 'Global Strategy Insight' : `${selectedCountry} 특화 마케팅 인사이트`}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 pt-0 flex-1 flex flex-col justify-between">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-3">
                                <p className="text-xs font-black text-slate-400 uppercase">최다 유입 채널 (Volume)</p>
                                <p className="text-2xl font-black text-slate-900">{filteredData.topVolumeChannel}</p>
                                <p className="text-[10px] text-slate-400">가장 많은 유입을 유도하고 있습니다.</p>
                            </div>
                            <div className="p-6 bg-indigo-50 rounded-[2rem] border border-indigo-100 space-y-3">
                                <p className="text-xs font-black text-indigo-400 uppercase">최고 효율 채널 (Yield)</p>
                                <p className="text-2xl font-black text-indigo-600">{filteredData.topYieldChannel}</p>
                                <p className="text-[10px] text-indigo-400">가장 높은 결제 전환 및 수익을 내고 있습니다.</p>
                            </div>
                        </div>
                        
                        <div className="mt-8 p-8 bg-slate-900 rounded-[2rem] text-white">
                            <h4 className="font-black text-lg mb-2">💡 마케팅 전략 제언</h4>
                            <p className="text-sm text-slate-400 leading-relaxed font-bold">
                                {selectedCountry === 'all' 
                                    ? "현재 글로벌 시장에서 가장 효율적인 채널은 " + filteredData.topYieldChannel + "입니다. 전반적인 캠페인을 이 채널 위주로 재편하세요."
                                    : selectedCountry + " 국가의 사용자들은 " + filteredData.topYieldChannel + " 채널에서 환불 신청에 대한 신뢰도가 가장 높습니다. " + selectedCountry + " 전용 광고 카피를 이 채널에 집중 배치하세요."
                                }
                            </p>
                        </div>
                    </CardContent>
                </Card>
              </div>

              {/* Detailed Tables */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 <Card className="lg:col-span-2 premium-card rounded-[2.5rem] border-none shadow-sm bg-white overflow-hidden">
                    <CardHeader className="bg-slate-50/50 p-8">
                        <CardTitle className="text-lg font-black">{selectedCountry === 'all' ? '글로벌' : selectedCountry} 채널별 세부 성과</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="pl-8">매체(UTM Source)</TableHead>
                                    <TableHead className="text-center">방문자(명)</TableHead>
                                    <TableHead className="text-center">신청(건)</TableHead>
                                    <TableHead className="text-center">전환율(%)</TableHead>
                                    <TableHead className="text-right pr-8">기여 수익</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredData.byUtm.map(([name, stat]) => (
                                    <TableRow key={name}>
                                        <TableCell className="pl-8 font-bold">{CHANNEL_LABELS[name] || name}</TableCell>
                                        <TableCell className="text-center font-bold text-slate-600">{(stat.visits || 0).toLocaleString()}명</TableCell>
                                        <TableCell className="text-center font-black">{stat.applicants}건</TableCell>
                                        <TableCell className="text-center font-bold text-emerald-600">
                                            {((stat.paid / (stat.applicants || 1)) * 100).toFixed(1)}%
                                        </TableCell>
                                        <TableCell className="text-right pr-8 font-black">₩ {stat.revenue.toLocaleString()}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                 </Card>

                 <Card className="lg:col-span-1 premium-card rounded-[2.5rem] border-none shadow-sm bg-white p-10 space-y-8">
                    <h3 className="text-xl font-black">사용자 퍼널 (Conversion)</h3>
                    <div className="space-y-10">
                        {[
                            { step: 0, label: '0단계: 사전 진단 (전체 유입)', color: 'bg-slate-400' },
                            { step: 1, label: '1단계: 인증 시작', color: 'bg-blue-400' },
                            { step: 2, label: '2단계: 신분증 판독', color: 'bg-blue-500' },
                            { step: 3, label: '3단계: 성명/정보 확인', color: 'bg-cyan-500' },
                            { step: 4, label: '4단계: 연락처/인증 선택', color: 'bg-indigo-400' },
                            { step: 5, label: '5단계: 간편인증 요청', color: 'bg-indigo-500' },
                            { step: 6, label: '6단계: 데이터 수집 중', color: 'bg-purple-500' },
                            { step: 7, label: '7단계: 환급액 결과 확인', color: 'bg-emerald-500' },
                            { step: 8, label: '8단계: 서비스 신청/결제', color: 'bg-amber-500' },
                            { step: 9, label: '9단계: 최종 신청 완료', color: 'bg-rose-500' }
                        ].map((item) => {
                            const count = filteredData.funnel[item.step] || 0;
                            const total = filteredData.funnel[0] || 1;
                            const startCount = filteredData.funnel[1] || 1;
                            
                            // 전체 유입(0단계) 대비 백분율
                            const pctOfTotal = (count / total) * 100;
                            // 신청 시작(1단계) 대비 백분율 (시각적 게이지 및 상대 전환율용)
                            const pctOfStart = item.step === 0 ? 100 : (count / startCount) * 100;
                            
                            const displayPercent = item.step === 0 
                              ? `${pctOfTotal.toFixed(0)}%`
                              : `${pctOfTotal.toFixed(1)}% (시작대비 ${Math.round(pctOfStart)}%)`;

                            // 시각적 게이지바 가로폭은 0단계면 100%, 1단계 이상이면 신청 시작(1단계) 대비 비율을 활용
                            const progressWidth = item.step === 0 ? 100 : pctOfStart;

                            return (
                                <div key={item.step} className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[11px] font-bold text-slate-500">{item.label}</span>
                                        <span className="text-[11px] font-black text-slate-700">{count.toLocaleString()}명 ({displayPercent})</span>
                                    </div>
                                    <div className="h-2 bg-slate-50 rounded-full overflow-hidden">
                                        <div 
                                          className={cn("h-full transition-all duration-700 rounded-full", item.color)} 
                                          style={{ width: `${progressWidth}%` }} 
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                  </Card>
              </div>

              {/* AI Chat Intel Dashboard Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 {/* Left: AI Stats & RAG scripts */}
                 <Card className="lg:col-span-2 premium-card rounded-[2.5rem] border-none shadow-sm bg-white p-8 space-y-6">
                    <div className="flex items-center justify-between pb-2">
                       <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-sky-50 rounded-xl flex items-center justify-center text-sky-600">
                             <Bot className="h-5 w-5" />
                          </div>
                          <div>
                             <h3 className="text-lg font-black text-slate-900">AI 상담 성과 및 성공 스크립트</h3>
                             <p className="text-xs font-bold text-slate-400">Genkit AI 매니저 실시간 상담 전환 실적</p>
                          </div>
                       </div>
                       {loadingAi && <RefreshCw className="h-4 w-4 animate-spin text-slate-400" />}
                    </div>

                    {aiStats ? (
                       <div className="space-y-6">
                          {/* Sub-Metrics Grid */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                             <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 uppercase">총 AI 상담 수</p>
                                <p className="text-xl font-black text-slate-900">{aiStats.totalChats.toLocaleString()}건</p>
                             </div>
                             <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                                <p className="text-[10px] font-black text-emerald-600 uppercase">AI 자가해결</p>
                                <p className="text-xl font-black text-emerald-700">{aiStats.aiActiveCount.toLocaleString()}건</p>
                             </div>
                             <div className="p-4 bg-rose-50/50 rounded-2xl border border-rose-100">
                                <p className="text-[10px] font-black text-rose-600 uppercase">관리자 개입(Takeover)</p>
                                <p className="text-xl font-black text-rose-700">{aiStats.takeoverCount.toLocaleString()}건</p>
                             </div>
                             <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                                <p className="text-[10px] font-black text-indigo-600 uppercase">상담 최종 전환율</p>
                                <p className="text-xl font-black text-indigo-700">
                                   {aiStats.totalChats > 0 
                                      ? `${((aiStats.signedCount / aiStats.totalChats) * 100).toFixed(1)}%` 
                                      : '0%'}
                                </p>
                             </div>
                          </div>

                          <Separator className="bg-slate-100" />

                          {/* Channel breakdown */}
                          <div className="space-y-3">
                             <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider">채널별 연동 대화수</h4>
                             <div className="flex flex-wrap gap-3">
                                {Object.entries(aiStats.chatsByChannel).map(([ch, count]: any) => (
                                   <Badge key={ch} className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-1.5 rounded-xl border-none">
                                      <span className="capitalize mr-1.5 font-black text-slate-400">{ch}:</span>
                                      {count}건
                                   </Badge>
                                ))}
                             </div>
                          </div>

                          <Separator className="bg-slate-100" />

                           {/* AI Self-Evolution & Matrix Optimizer Panel */}
                           <div className="p-5 bg-gradient-to-r from-indigo-50/70 via-purple-50/50 to-sky-50/70 rounded-3xl border border-indigo-100/80 space-y-4">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                 <div className="space-y-0.5">
                                    <div className="flex items-center gap-2">
                                       <Zap className="h-4 w-4 text-indigo-600 fill-indigo-600" />
                                       <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">AI 자율 화법 진화 엔진 (Self-Prompting)</h4>
                                    </div>
                                    <p className="text-[11px] font-bold text-slate-500">
                                       실시간 전환율 데이터를 기반으로 Gemini AI가 신규 세일즈 멘트를 스스로 창작하고 임베딩합니다.
                                    </p>
                                 </div>
                                 <div className="flex items-center gap-2">
                                    <Select value={targetEvolveLang} onValueChange={setTargetEvolveLang}>
                                       <SelectTrigger className="w-[120px] h-9 text-xs font-black bg-white rounded-xl border-indigo-200">
                                          <SelectValue placeholder="국적 선택" />
                                       </SelectTrigger>
                                       <SelectContent className="rounded-xl">
                                          <SelectItem value="vi">🇻🇳 베트남 (vi)</SelectItem>
                                          <SelectItem value="mn">🇲🇳 몽골 (mn)</SelectItem>
                                          <SelectItem value="uz">🇺🇿 우즈벡 (uz)</SelectItem>
                                          <SelectItem value="ne">🇳🇵 네팔 (ne)</SelectItem>
                                          <SelectItem value="km">🇰🇭 캄보디아 (km)</SelectItem>
                                          <SelectItem value="my">🇲🇲 미얀마 (my)</SelectItem>
                                          <SelectItem value="th">🇹🇭 태국 (th)</SelectItem>
                                          <SelectItem value="id">🇮🇩 인도네시아 (id)</SelectItem>
                                          <SelectItem value="all">🌐 글로벌 공통</SelectItem>
                                       </SelectContent>
                                    </Select>
                                    <Button
                                       onClick={handleEvolveScripts}
                                       disabled={isEvolving}
                                       className="h-9 px-4 text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md shadow-indigo-200 transition-all flex items-center gap-1.5"
                                    >
                                       {isEvolving ? (
                                          <>
                                             <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                             창작 중...
                                          </>
                                       ) : (
                                          <>
                                             <Zap className="h-3.5 w-3.5 fill-current" />
                                             화법 자율 창작 실행
                                          </>
                                       )}
                                    </Button>
                                 </div>
                              </div>
                           </div>

                           <Separator className="bg-slate-100" />

                           {/* Top scripts with Matrix metrics */}
                           <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                 <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider">💡 국적·성향별 실시간 영업 스크립트 성과 (Top 10)</h4>
                                 <span className="text-[10px] font-bold text-slate-400">다차원 MAB 랭킹 적용</span>
                              </div>
                              <div className="space-y-3">
                                 {aiStats.topScripts && aiStats.topScripts.length > 0 ? (
                                    aiStats.topScripts.map((script: any) => (
                                       <div key={script.id} className="p-4 bg-slate-50 hover:bg-slate-100/80 transition-colors rounded-2xl border border-slate-100 space-y-2">
                                          <div className="flex flex-wrap items-center justify-between gap-2">
                                             <div className="flex items-center gap-1.5">
                                                <Badge className="bg-indigo-100 text-indigo-700 border-none font-black text-[9px] rounded-lg">
                                                   {script.refund_step?.toUpperCase() || 'GENERAL'}
                                                </Badge>
                                                <Badge className="bg-slate-200 text-slate-700 border-none font-black text-[9px] rounded-lg uppercase">
                                                   🌍 {script.detected_language || 'ALL'}
                                                </Badge>
                                                {script.target_personality && script.target_personality !== 'all' && (
                                                   <Badge className="bg-amber-100 text-amber-800 border-none font-black text-[9px] rounded-lg">
                                                      🎯 {script.target_personality}
                                                   </Badge>
                                                )}
                                                {script.generation_origin === 'ai_self_generated' ? (
                                                   <Badge className="bg-purple-100 text-purple-700 border-none font-black text-[9px] rounded-lg flex items-center gap-1">
                                                      <Zap className="h-2.5 w-2.5 fill-purple-600 text-purple-600" />
                                                      AI 자율창작
                                                   </Badge>
                                                ) : (
                                                   <Badge className="bg-slate-100 text-slate-500 border border-slate-200 font-bold text-[9px] rounded-lg">
                                                      시드 멘트
                                                   </Badge>
                                                )}
                                             </div>
                                             <div className="flex items-center gap-3 text-[11px] font-black">
                                                <span className="text-slate-500">
                                                   노출: <span className="font-mono text-slate-800">{script.impressions_count || 0}</span>회
                                                </span>
                                                <span className="text-slate-500">
                                                   전환: <span className="font-mono text-emerald-600">{script.conversions_count || 0}</span>회
                                                </span>
                                                <span className="text-indigo-600 font-mono bg-indigo-50 px-2 py-0.5 rounded-md">
                                                   전환율: {Math.round((script.conversion_rate || 0) * 100)}%
                                                </span>
                                             </div>
                                          </div>
                                          <p className="text-xs font-bold text-slate-700 leading-relaxed">
                                             "{script.script_text}"
                                          </p>
                                          {script.target_psychology && (
                                             <p className="text-[10px] font-bold text-slate-400">
                                                💡 소구 심리: {script.target_psychology}
                                             </p>
                                          )}
                                       </div>
                                    ))
                                 ) : (
                                    <p className="text-xs font-bold text-slate-400 py-2">학습된 영업 RAG 스크립트가 아직 존재하지 않습니다.</p>
                                 )}
                              </div>
                           </div>
                        </div>
                     ) : (
                        <p className="text-xs font-bold text-slate-400 py-8 text-center">AI 통계 정보를 불러오지 못했습니다.</p>
                     )}
                  </Card>

                 {/* Right: AI Customer Personality Distribution */}
                 <Card className="lg:col-span-1 premium-card rounded-[2.5rem] border-none shadow-sm bg-white p-10 space-y-8">
                    <div className="flex items-center gap-3">
                       <div className="h-10 w-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                          <BrainCircuit className="h-5 w-5" />
                       </div>
                       <div>
                          <h3 className="text-lg font-black text-slate-900">고객 성향 판독 분포</h3>
                          <p className="text-xs font-bold text-slate-400">대화 분석 기반 성격 성향 성격군</p>
                       </div>
                    </div>

                    <div className="space-y-8">
                       {aiStats ? (
                          [
                             { key: 'driver', label: 'Driver (속전속결형)', color: 'bg-rose-500', desc: '결론 위주의 짧고 명확한 수치를 선호' },
                             { key: 'skeptical', label: 'Skeptical (신중/의심형)', color: 'bg-amber-500', desc: '보안성, 후불제 원칙 검증에 집중' },
                             { key: 'analytical', label: 'Analytical (이성/꼼꼼형)', color: 'bg-indigo-500', desc: '구체적인 세법 규정 및 논리적 근거 요구' },
                             { key: 'expressive', label: 'Expressive (사교/친근형)', color: 'bg-emerald-500', desc: '이모지 및 상냥하고 친근한 어투 선호' },
                             { key: 'unknown', label: '판독 전 / 기타', color: 'bg-slate-400', desc: '기본 친근 대화 모드로 매칭됨' }
                          ].map(item => {
                             const count = aiStats.personalityDistribution[item.key] || 0;
                             const total = Object.values(aiStats.personalityDistribution).reduce((a: any, b: any) => a + b, 0) as number || 1;
                             const pct = (count / total) * 100;

                             return (
                                <div key={item.key} className="space-y-2">
                                   <div className="flex justify-between items-baseline">
                                      <div>
                                         <span className="text-xs font-black text-slate-700 block">{item.label}</span>
                                         <span className="text-[10px] font-bold text-slate-400">{item.desc}</span>
                                      </div>
                                      <span className="text-xs font-black text-slate-900">{count}명 ({pct.toFixed(0)}%)</span>
                                   </div>
                                   <div className="h-2.5 bg-slate-50 rounded-full overflow-hidden">
                                      <div 
                                         className={cn("h-full transition-all duration-700 rounded-full", item.color)} 
                                         style={{ width: `${pct}%` }} 
                                      />
                                   </div>
                                </div>
                             );
                          })
                       ) : (
                          <p className="text-xs font-bold text-slate-400 py-8 text-center">성향 통계를 불러오지 못했습니다.</p>
                       )}
                    </div>
                 </Card>
              </div>
            </div> {/* Closes right main content area */}
          </div> {/* Closes flex-col lg:flex-row gap-8 */}
        </div>
      </main>
      <Footer />
    </div>
  );
}
