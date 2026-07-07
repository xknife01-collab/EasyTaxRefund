/** FINAL_TRANSLATION_LOCK: VI_ZH_DONE_DO_NOT_MODIFY **/

"use client";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, 
  ShieldCheck, 
  UserCheck, 
  Scale, 
  RotateCcw, 
  ArrowRight,
  Gem,
  AlertCircle,
  Coins,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/components/LanguageContext";

export default function PricingPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col font-body bg-slate-50/50">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-20 lg:py-32">
        <div className="max-w-5xl mx-auto space-y-16">
          <div className="bg-slate-900 text-white rounded-[3rem] p-10 lg:p-16 text-center space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
              <Gem className="h-48 w-48 text-white" />
            </div>
            <div className="relative z-10 space-y-6">
              <Badge className="bg-primary/20 text-primary border-none font-black px-4 py-1.5 text-sm uppercase tracking-widest">{t('가격 정책')}</Badge>
              <h1 className="text-4xl lg:text-6xl font-black font-headline tracking-tighter leading-tight text-white">
                {t('선결제 0원, 오직 환급 성공 시에만')}<br />
                <span className="text-primary">{t('후불제 자동 정산')}</span>
              </h1>
              <p className="text-xl text-slate-300 font-medium max-w-3xl mx-auto leading-relaxed">
                {t('대한민국 국가공인 전문 세무법인 제휴 및 정밀 분석 솔루션으로 안전하고 확실하게 지난 세금을 돌려받으세요.')}
              </p>
            </div>
          </div>

          {/* 3 Core Benefit Cards */}
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="premium-card rounded-[2.5rem] p-8 bg-white border border-slate-100 shadow-xl flex flex-col justify-between hover:shadow-2xl transition-all">
              <div className="space-y-6">
                <div className="h-14 w-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                  <Sparkles className="h-7 w-7" />
                </div>
                <div className="space-y-2">
                  <span className="text-primary font-black text-sm uppercase tracking-widest">{t('진행 리스크 0%')}</span>
                  <h3 className="text-2xl font-black text-slate-900 leading-snug">{t('초기 비용 0원, 완전 무료 시작')}</h3>
                </div>
                <p className="text-slate-500 font-medium leading-relaxed text-base">
                  {t('서비스 신청 시 필요한 비용은 전혀 없습니다. 예상 환급액 조회부터 전문 세무사의 전담 검토 단계까지, 신청 시점에 고객님이 내야 할 돈은 단 1원도 없습니다.')}
                </p>
              </div>
            </Card>

            <Card className="premium-card rounded-[2.5rem] p-8 bg-white border border-slate-100 shadow-xl flex flex-col justify-between hover:shadow-2xl transition-all">
              <div className="space-y-6">
                <div className="h-14 w-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center">
                  <RotateCcw className="h-7 w-7" />
                </div>
                <div className="space-y-2">
                  <span className="text-red-500 font-black text-sm uppercase tracking-widest">{t('성공 보수 100%')}</span>
                  <h3 className="text-2xl font-black text-slate-900 leading-snug">{t('환급 거절/실패 시 수수료 0원')}</h3>
                </div>
                <p className="text-slate-500 font-medium leading-relaxed text-base">
                  {t('세무서 심사 결과 환급액이 나오지 않으면 서비스 수수료도 청구되지 않습니다. 고객님은 비용 손실이나 리스크가 0%이므로 안심하고 권리를 찾으세요.')}
                </p>
              </div>
            </Card>

            <Card className="premium-card rounded-[2.5rem] p-8 bg-white border border-slate-100 shadow-xl flex flex-col justify-between hover:shadow-2xl transition-all">
              <div className="space-y-6">
                <div className="h-14 w-14 bg-green-50 text-green-500 rounded-2xl flex items-center justify-center">
                  <Coins className="h-7 w-7" />
                </div>
                <div className="space-y-2">
                  <span className="text-green-500 font-black text-sm uppercase tracking-widest">{t('후불 자동 정산')}</span>
                  <h3 className="text-2xl font-black text-slate-900 leading-snug">{t('환급금 입금된 후 후불 정산')}</h3>
                </div>
                <p className="text-slate-500 font-medium leading-relaxed text-base">
                  {t('국세청에서 고객님 명의의 은행 계좌로 환급금을 직접 입금해 드리면, 나중에 후불 정산합니다.')}
                </p>
              </div>
            </Card>
          </div>

          {/* 4. Why 25% Fee? & Compliance Disclaimer Section */}
          <div className="grid md:grid-cols-5 gap-8">
            <Card className="premium-card rounded-[3rem] p-10 lg:p-12 bg-white border border-slate-100 shadow-xl md:col-span-3 space-y-8">
              <div className="space-y-3">
                <div className="h-14 w-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                  <Scale className="h-7 w-7" />
                </div>
                <h3 className="text-2xl lg:text-3xl font-black text-slate-900">{t('왜 25%의 플랫폼 이용료(수수료)가 발생하나요?')}</h3>
                <p className="text-slate-500 font-medium">{t('외국인 세금 환급은 한국인보다 과정이 훨씬 까다롭습니다.')}</p>
              </div>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <CheckCircle2 className="h-6 w-6 text-primary shrink-0 mt-1" />
                  <div>
                    <h4 className="font-black text-slate-900 text-lg">{t('국가공인 제휴 세무사의 전 과정 책임 대행')}</h4>
                    <p className="text-slate-500 font-medium text-sm leading-relaxed">{t('환급 신청서 작성부터 환급금이 고객님의 통장에 안전하게 입금되는 마지막 순간까지, 제휴된 대한민국 국가공인 전문 세무사가 모든 심사와 행정 과정을 전담하여 책임 처리합니다.')}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <CheckCircle2 className="h-6 w-6 text-primary shrink-0 mt-1" />
                  <div>
                    <h4 className="font-black text-slate-900 text-lg">{t('제휴 세무사의 1:1 맞춤 정밀 검토')}</h4>
                    <p className="text-slate-500 font-medium text-sm leading-relaxed">{t('단순 계산 오류나 비자 타입(E-9, E-7 등) 누락을 최소화하여 환급 성공률을 극대화합니다.')}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <UserCheck className="h-6 w-6 text-primary shrink-0 mt-1" />
                  <div>
                    <h4 className="font-black text-slate-900 text-lg">{t('비대면 자동화 세무 서류 생성 솔루션')}</h4>
                    <p className="text-slate-500 font-medium text-sm leading-relaxed">{t('지난 5년 치의 소득세 납부 데이터를 안전하게 암호화하여 처리하는 독자적인 기술 솔루션을 제공합니다.')}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <ShieldCheck className="h-6 w-6 text-primary shrink-0 mt-1" />
                  <div>
                    <h4 className="font-black text-slate-900 text-lg">{t('국세청 공식 절차(경정청구) 전담 마크')}</h4>
                    <p className="text-slate-500 font-medium text-sm leading-relaxed">{t('접수부터 국세청 심사관 대응까지 환급금이 통장에 최종 입금되는 순간까지 모든 프로세스를 밀착 케어합니다.')}</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="premium-card rounded-[3rem] p-10 lg:p-12 bg-slate-900 text-white md:col-span-2 flex flex-col justify-between shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                <Gem className="h-48 w-48 text-white" />
              </div>
              <div className="space-y-6 relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-5 w-5 text-primary" />
                  <Badge className="bg-primary/20 text-primary border-none font-black px-4 py-1">{t('준수 사항 (COMPLIANCE)')}</Badge>
                </div>
                <h3 className="text-2xl font-black font-headline text-white leading-tight">{t('합법적인 세무 프로세스')}</h3>
                <p className="text-slate-400 font-medium text-sm leading-relaxed">
                  {t('* 본 서비스는 대한민국 국가공인 전문 세무법인과의 공식 기술 제휴를 통해 운영되며, 세무 분석 및 신청 지원 솔루션을 제공합니다. 고객님의 실제 세무 신고 및 환급 대행 업무는 제휴 세무법인의 책임 하에 안전하고 적법하게 처리되므로 안심하셔도 됩니다.')}
                </p>
              </div>

              <div className="space-y-4 pt-8 relative z-10">
                <Button className="w-full h-16 rounded-2xl bg-primary text-white hover:bg-primary/90 border-none font-black text-lg transition-all hover:scale-[1.02] shadow-xl shadow-primary/20" asChild>
                  <Link href="/estimate" className="flex items-center justify-center">
                    {t('지금 무료로 조회하기')} <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </Card>
          </div>

          <div className="text-center pt-10">
            <div className="inline-flex items-center gap-6 px-10 py-6 rounded-[2rem] bg-slate-900 text-white shadow-2xl">
              <div className="text-left">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{t('신뢰 보장')}</p>
                <p className="text-xl font-black italic">{t('\"전문적인 서비스, 리스크 제로.\"')}</p>
              </div>
              <div className="h-10 w-px bg-white/10 hidden sm:block" />
              <p className="text-sm font-medium text-slate-300 hidden sm:block max-w-[200px] leading-relaxed">{t('전문적인 서비스,')}<br />{t('리스크는 제로.')}</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
