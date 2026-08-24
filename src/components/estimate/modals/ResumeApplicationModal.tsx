import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { useTranslation } from "@/components/LanguageContext";

interface ResumeApplicationModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onStartFresh: () => void;
  onResume: () => void;
}

export function ResumeApplicationModal({
  isOpen,
  onOpenChange,
  onStartFresh,
  onResume
}: ResumeApplicationModalProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[400px] rounded-[2.5rem] p-8 border-none shadow-2xl bg-white overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-indigo-500" />
        <DialogHeader className="space-y-4 pt-4">
          <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-2">
            <RotateCcw className="h-8 w-8 animate-spin-slow" />
          </div>
          <DialogTitle className="text-2xl font-black text-center text-slate-900 leading-tight">
            {t("이어서 진행할까요?")}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 mt-6">
          <p className="text-slate-500 text-center font-bold leading-relaxed">
            {t("이전에 진행하던 정보가 있습니다. 아까 하던 곳부터 바로 이어서 할 수 있어요.")}
          </p>
          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button
              onClick={onStartFresh}
              variant="outline"
              className="h-14 rounded-2xl font-bold border-slate-100 hover:bg-slate-50 text-slate-400"
            >
              {t("새로 시작하기")}
            </Button>
            <Button
              onClick={onResume}
              className="h-14 rounded-2xl font-black bg-slate-900 text-white shadow-lg hover:bg-slate-800 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {t("이어서 하기")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
