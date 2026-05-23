/** FINAL_TRANSLATION_LOCK: VI_ZH_DONE_DO_NOT_MODIFY **/
"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, Loader2, Smartphone, Lock, UserCheck, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useTranslation } from "@/components/LanguageContext";
import { sendOtpSms, verifyOtpSms } from "@/ai/flows/aligo-sms";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";

export default function LoginPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [arcNumber, setArcNumber] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  
  // Login flow states
  const [passwordStep, setPasswordStep] = useState(false);
  const [otpStep, setOtpStep] = useState(false);
  const [isSettingPassword, setIsSettingPassword] = useState(false);

  // Form inputs
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Target application references
  const [targetAppId, setTargetAppId] = useState("");
  const [targetAppName, setTargetAppName] = useState("");

  const router = useRouter();
  const { toast } = useToast();

  const handleFirstStepSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (arcNumber.length !== 13) {
      toast({ variant: "destructive", title: t("입력 오류"), description: t("외국인 등록번호 13자리를 입력해 주세요.") });
      return;
    }
    if (phoneNumber.length < 10) {
      toast({ variant: "destructive", title: t("입력 오류"), description: t("휴대폰 번호를 정확히 입력해 주세요.") });
      return;
    }
    
    setLoading(true);
    try {
      // 1. Query Firestore for application matching ARC and phone
      const q = query(
        collection(db, 'applications'),
        where('registrationNumber', '==', arcNumber),
        where('phone', '==', phoneNumber)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        toast({
          variant: "destructive",
          title: t("신청 정보 없음"),
          description: t("입력하신 정보로 등록된 환급 신청 내역이 없습니다. 환급 조회를 먼저 진행해 주세요.")
        });
        setLoading(false);
        return;
      }

      const appDoc = querySnapshot.docs[0];
      const appData = appDoc.data();
      setTargetAppId(appDoc.id);
      setTargetAppName(appData.fullName || "사용자");

      if (appData.password) {
        // Has password -> prompt password input
        setPasswordStep(true);
      } else {
        // No password -> prompt SMS verification
        const { success, error } = await sendOtpSms(phoneNumber);
        if (success) {
          setOtpStep(true);
          toast({ title: t("인증번호 발송 성공"), description: t("휴대폰으로 6자리 문자를 발송했습니다.") });
        } else {
          toast({ variant: "destructive", title: t("발송 실패"), description: error || t("문자 발송에 실패했습니다.") });
        }
      }
    } catch (err: any) {
      console.error(err);
      toast({ variant: "destructive", title: t("서버 오류"), description: t("서버 접속에 실패했습니다.") });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      toast({ variant: "destructive", title: t("입력 오류"), description: t("비밀번호를 입력해 주세요.") });
      return;
    }

    setLoading(true);
    try {
      const q = query(
        collection(db, 'applications'),
        where('registrationNumber', '==', arcNumber),
        where('phone', '==', phoneNumber)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        toast({ variant: "destructive", title: t("신청 정보 없음"), description: t("신청서 정보를 다시 확인해 주세요.") });
        setLoading(false);
        return;
      }

      const appDoc = querySnapshot.docs[0];
      const appData = appDoc.data();

      if (appData.password === password) {
        toast({ title: t("로그인 성공"), description: t("환급 고객 포털로 안전하게 이동합니다.") });
        sessionStorage.setItem('myApplicationId', appDoc.id);
        sessionStorage.setItem('myFullName', appData.fullName || "사용자");
        await new Promise(r => setTimeout(r, 500));
        router.push("/portal");
      } else {
        toast({ variant: "destructive", title: t("로그인 실패"), description: t("비밀번호가 올바르지 않습니다.") });
      }
    } catch (err: any) {
      toast({ variant: "destructive", title: t("서버 오류"), description: t("서버 접속에 실패했습니다.") });
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOtpFallback = async () => {
    setLoading(true);
    try {
      const { success, error } = await sendOtpSms(phoneNumber);
      if (success) {
        setPasswordStep(false);
        setOtpStep(true);
        toast({ title: t("인증번호 발송 성공"), description: t("휴대폰으로 6자리 문자를 발송했습니다.") });
      } else {
        toast({ variant: "destructive", title: t("발송 실패"), description: error || t("문자 발송에 실패했습니다.") });
      }
    } catch (err) {
      toast({ variant: "destructive", title: t("서버 오류"), description: t("서버 접속에 실패했습니다.") });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { success, error } = await verifyOtpSms(phoneNumber, otpCode);
      if (success) {
        toast({ title: t("인증 확인됨"), description: t("비밀번호 설정 단계로 이동합니다.") });
        setOtpStep(false);
        setIsSettingPassword(true);
      } else {
        toast({ variant: "destructive", title: t("인증 실패"), description: error || t("인증번호가 틀렸습니다.") });
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: t("서버 오류"), description: t("인증 서버에 접근할 수 없습니다.") });
    } finally {
      setLoading(false);
    }
  };

  const handleSetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 4) {
      toast({ variant: "destructive", title: t("입력 오류"), description: t("비밀번호는 최소 4자리 이상 입력해 주세요.") });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ variant: "destructive", title: t("입력 오류"), description: t("비밀번호가 서로 일치하지 않습니다.") });
      return;
    }

    setLoading(true);
    try {
      if (!targetAppId) {
        toast({ variant: "destructive", title: t("오류"), description: t("신청 정보를 찾을 수 없습니다. 다시 시도해 주세요.") });
        setLoading(false);
        return;
      }

      await updateDoc(doc(db, 'applications', targetAppId), {
        password: newPassword
      });

      toast({ title: t("비밀번호 설정 완료"), description: t("비밀번호가 성공적으로 설정되었습니다. 포털로 이동합니다.") });
      sessionStorage.setItem('myApplicationId', targetAppId);
      sessionStorage.setItem('myFullName', targetAppName || "사용자");
      await new Promise(r => setTimeout(r, 500));
      router.push("/portal");
    } catch (err) {
      toast({ variant: "destructive", title: t("서버 오류"), description: t("비밀번호 설정 중 오류가 발생했습니다.") });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-body bg-slate-50">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4 py-32">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-black font-headline text-slate-900">{t('외국인 사용자 로그인')}</h1>
            <p className="text-slate-500 font-medium">{t('Client Portal - 실시간 환급 상황 확인')}</p>
          </div>

          <Card className="premium-card rounded-[2.5rem] border-none shadow-2xl overflow-hidden bg-white">
            <CardContent className="p-8 pt-10">
              {!passwordStep && !otpStep && !isSettingPassword && (
                <form onSubmit={handleFirstStepSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t('외국인 등록번호 (ARC)')}</Label>
                      <div className="relative">
                        <UserCheck className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                        <Input
                          placeholder={t("13자리 숫자 입력")}
                          className="h-14 pl-12 rounded-xl bg-slate-50 border-none focus-visible:ring-primary font-bold"
                          maxLength={13}
                          value={arcNumber}
                          onChange={(e) => setArcNumber(e.target.value.replace(/[^0-9]/g, ''))}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t('휴대폰 번호')}</Label>
                      <div className="relative">
                        <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                        <Input
                          placeholder="01012345678"
                          className="h-14 pl-12 rounded-xl bg-slate-50 border-none focus-visible:ring-primary font-bold"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ''))}
                        />
                      </div>
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-16 text-lg font-black bg-slate-900 rounded-2xl shadow-xl transition-all hover:scale-[1.02]" disabled={loading || arcNumber.length < 13 || phoneNumber.length < 10}>
                    {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : t("본인 확인 및 로그인")}
                  </Button>
                  <p className="text-center text-[10px] text-slate-400 font-bold">{t('본인 확인 및 데이터 보안을 위해 휴대폰 인증이 필수입니다.')}</p>
                </form>
              )}

              {passwordStep && (
                <form onSubmit={handlePasswordLogin} className="space-y-6 animate-fade-in-up">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t('비밀번호 입력')}</Label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                      <Input
                        type="password"
                        placeholder="••••"
                        className="h-14 pl-12 rounded-xl bg-slate-50 border-none focus-visible:ring-primary font-bold"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                    <div className="flex justify-between items-center mt-3 px-1">
                      <p className="text-[10px] font-bold text-slate-400">{phoneNumber}</p>
                      <p className="text-[10px] font-black text-primary cursor-pointer hover:underline" onClick={() => { setPasswordStep(false); setPassword(""); }}>
                        {t('번호 수정하기')}
                      </p>
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-16 text-lg font-black bg-primary text-white rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.02]" disabled={loading || !password}>
                    {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : t("비밀번호로 로그인")}
                  </Button>
                  <div className="text-center">
                    <button
                      type="button"
                      className="text-xs font-black text-slate-400 hover:text-primary transition-colors underline"
                      onClick={handleRequestOtpFallback}
                    >
                      {t('인증번호로 로그인하기')}
                    </button>
                  </div>
                </form>
              )}

              {otpStep && (
                <form onSubmit={handleVerifyOtp} className="space-y-6 animate-fade-in-up">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t('인증번호 6자리')}</Label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                      <Input
                        placeholder="000000"
                        maxLength={6}
                        className="h-14 pl-12 rounded-xl bg-slate-50 border-none focus-visible:ring-primary text-center font-black tracking-[0.5em] text-xl"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                      />
                    </div>
                    <div className="flex justify-between items-center mt-3 px-1">
                      <p className="text-[10px] font-bold text-slate-400">{phoneNumber}</p>
                      <p className="text-[10px] font-black text-primary cursor-pointer hover:underline" onClick={() => { setOtpStep(false); setOtpCode(""); }}>
                        {t('번호 수정하기')}
                      </p>
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-16 text-lg font-black bg-primary text-white rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.02]" disabled={loading || otpCode.length < 6}>
                    {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : t("보안 로그인 완료")}
                  </Button>
                </form>
              )}

              {isSettingPassword && (
                <form onSubmit={handleSetPasswordSubmit} className="space-y-6 animate-fade-in-up">
                  <div className="space-y-4">
                    <div className="text-center space-y-1 mb-2">
                      <h3 className="text-lg font-black text-slate-800">{t('새로운 비밀번호 설정')}</h3>
                      <p className="text-xs font-medium text-slate-400">{t('다음 로그인부터 사용할 비밀번호를 입력해 주세요.')}</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t('비밀번호 (4자리 이상)')}</Label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                        <Input
                          type="password"
                          placeholder="••••"
                          className="h-14 pl-12 rounded-xl bg-slate-50 border-none focus-visible:ring-primary font-bold"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t('비밀번호 확인')}</Label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                        <Input
                          type="password"
                          placeholder="••••"
                          className="h-14 pl-12 rounded-xl bg-slate-50 border-none focus-visible:ring-primary font-bold"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-16 text-lg font-black bg-primary text-white rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.02]" disabled={loading || newPassword.length < 4 || confirmPassword.length < 4}>
                    {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : t("비밀번호 저장 및 로그인")}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          <div className="flex flex-col items-center gap-4">
            <p className="text-slate-400 text-sm font-bold flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" /> {t('256-bit Bank Grade Security')}
            </p>
            <Button variant="link" className="text-slate-400 font-bold" asChild>
              <Link href="/estimate">{t('환급액을 먼저 조회하고 싶으신가요?')} <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

