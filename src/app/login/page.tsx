/** FINAL_TRANSLATION_LOCK: VI_ZH_DONE_DO_NOT_MODIFY **/
"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldCheck, Loader2, Smartphone, Lock, UserCheck, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useTranslation } from "@/components/LanguageContext";
import { sendOtpSms, verifyOtpSms } from "@/ai/flows/aligo-sms";

export default function LoginPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [arcNumber, setArcNumber] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpStep, setOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState("");

  const router = useRouter();
  const { toast } = useToast();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 1000));
      router.push("/portal");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: t("로그인 실패"),
        description: t("이메일 또는 비밀번호를 확인해 주세요."),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
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
      const { success, error } = await sendOtpSms(phoneNumber);
      if (success) {
        setOtpStep(true);
        toast({ title: t("인증번호 발송 성공"), description: t("휴대폰으로 6자리 문자를 발송했습니다.") });
      } else {
        toast({ variant: "destructive", title: t("발송 실패"), description: error || t("문자 발송에 실패했습니다.") });
      }
    } catch (err: any) {
      toast({ variant: "destructive", title: t("서버 오류"), description: t("서버 접속에 실패했습니다.") });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtpAndLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { success, error } = await verifyOtpSms(phoneNumber, otpCode);
      if (success) {
        toast({ title: t("인증 확인됨"), description: t("환급 고객 포털로 안전하게 이동합니다.") });
        await new Promise(r => setTimeout(r, 500));
        router.push("/portal");
      } else {
        toast({ variant: "destructive", title: t("인증 실패"), description: error || t("인증번호가 틀렸습니다.") });
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: t("서버 오류"), description: t("인증 서버에 접근할 수 없습니다.") });
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

          <Card className="premium-card rounded-[2.5rem] border-none shadow-2xl overflow-hidden">
            <Tabs defaultValue="arc" className="w-full">
              <TabsList className="grid grid-cols-2 h-16 bg-slate-100/50 p-1 rounded-none">
                <TabsTrigger value="arc" className="rounded-none font-bold data-[state=active]:bg-white data-[state=active]:text-primary">{t('간편 인증 (ARC)')}</TabsTrigger>
                <TabsTrigger value="email" className="rounded-none font-bold data-[state=active]:bg-white data-[state=active]:text-primary">{t('이메일 로그인')}</TabsTrigger>
              </TabsList>

              <CardContent className="p-8 pt-10">
                <TabsContent value="arc" className="space-y-6 m-0">
                  {!otpStep ? (
                    <form onSubmit={handleRequestOtp} className="space-y-6">
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
                        {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : t("SMS 인증번호 받기")}
                      </Button>
                      <p className="text-center text-[10px] text-slate-400 font-bold">{t('본인 확인 및 데이터 보안을 위해 휴대폰 인증이 필수입니다.')}</p>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyOtpAndLogin} className="space-y-6 animate-fade-in-up">
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
                </TabsContent>

                <TabsContent value="email" className="space-y-6 m-0">
                  <form onSubmit={handleEmailLogin} className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t('이메일 주소')}</Label>
                        <Input
                          type="email"
                          placeholder="example@email.com"
                          className="h-14 rounded-xl bg-slate-50 border-none focus-visible:ring-primary px-4"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t('비밀번호')}</Label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                          <Input
                            type="password"
                            placeholder="••••••••"
                            className="h-14 pl-12 rounded-xl bg-slate-50 border-none focus-visible:ring-primary"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                    <Button type="submit" className="w-full h-16 text-lg font-black bg-primary rounded-2xl shadow-xl transition-all hover:scale-[1.02]" disabled={loading}>
                      {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : t("로그인")}
                    </Button>
                  </form>
                </TabsContent>
              </CardContent>
            </Tabs>
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
