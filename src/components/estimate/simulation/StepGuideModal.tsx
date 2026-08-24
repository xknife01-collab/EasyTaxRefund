import React from 'react';
import dynamic from 'next/dynamic';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Loader2 } from "lucide-react";
import { useTranslation } from "@/components/LanguageContext";

const TaxRefundSimulator = dynamic(
  () => import("@/components/TaxRefundSimulator"),
  { ssr: false, loading: () => <div className="p-8 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /></div> }
);

interface StepGuideModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  step: number;
}

export function StepGuideModal({
  isOpen,
  onOpenChange,
  step
}: StepGuideModalProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl bg-[#0b192c] text-white border-2 border-[#e2b659]/50 rounded-3xl p-6 max-h-[92vh] overflow-y-auto shadow-2xl">
        <DialogHeader className="flex flex-row items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#e2b659] text-slate-950 font-black flex items-center justify-center text-sm shadow-md">
              {t('김준현')}
            </div>
            <div>
              <DialogTitle className="text-xl font-black text-white flex items-center gap-2">
                <span>🛠️ {t('15개국어 시뮬레이션 제어판')} (Step {typeof step === 'number' ? Math.floor(step) : step})</span>
                <Badge className="bg-[#e2b659] text-slate-950 hover:bg-[#e2b659] font-bold">{t('1:1 AI 매니저 가이드')}</Badge>
              </DialogTitle>
              <DialogDescription className="text-xs text-amber-200/90 font-medium">
                {t('환급 단계에서 어느 부분을 눌러야 하는지 보여주는 가상 화면입니다.')}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-2">
          <TaxRefundSimulator initialStep={step} />
        </div>

        <DialogFooter className="pt-3 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-slate-300 font-medium">
            💡 {t('가이드를 모두 확인하셨으면 아래 버튼을 눌러 바로 신청을 재개해 주세요.')}
          </p>
          <Button
            onClick={() => onOpenChange(false)}
            className="bg-[#e2b659] text-slate-950 font-black hover:bg-[#f0c870] px-6 rounded-xl text-sm h-11 shadow-lg"
          >
            {t('이어서 신청 진행하기')} <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
