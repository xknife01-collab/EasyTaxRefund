import React from 'react';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Sliders, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/components/LanguageContext";

interface DevSimulatorPanelProps {
  isLocal: boolean;
  devPanelOpen: boolean;
  setDevPanelOpen: (open: boolean) => void;
  step: number;
  isSimulation: boolean;
  setIsSimulation: (sim: boolean) => void;
  onForceStep9: () => void;
  onStepJump: (step: number) => void;
}

export function DevSimulatorPanel({
  isLocal,
  devPanelOpen,
  setDevPanelOpen,
  step,
  isSimulation,
  setIsSimulation,
  onForceStep9,
  onStepJump
}: DevSimulatorPanelProps) {
  const { t } = useTranslation();

  if (!isLocal) return null;

  return (
    <div className="fixed bottom-2 right-3 sm:right-6 z-[190] font-sans">
      {!devPanelOpen ? (
        <button
          onClick={() => setDevPanelOpen(true)}
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs sm:text-sm px-4 py-3 rounded-full shadow-2xl border border-slate-700/50 hover:scale-105 active:scale-95 transition-all duration-200"
        >
          <Sliders className="h-4 w-4 text-emerald-400 animate-pulse" />
          <span>{t("🛠️ 시뮬레이션 제어판")}</span>
        </button>
      ) : (
        <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/50 w-[360px] sm:w-[380px] rounded-3xl p-6 shadow-2xl text-slate-100 flex flex-col gap-4 animate-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Sliders className="h-5 w-5 text-emerald-400" />
              <span className="font-black text-sm tracking-wide text-slate-200">DEV SIMULATOR PANEL</span>
            </div>
            <button
              onClick={() => setDevPanelOpen(false)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Force Jump to Step 9 */}
            <div>
              <Button
                onClick={onForceStep9}
                className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-emerald-500/20"
              >
                <Sparkles className="h-4 w-4" />
                <span>{t("환급 9단계 즉시 이동 (CMS 테스트)")}</span>
              </Button>
            </div>

            {/* Step pills */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t('단계별 빠른 이동')}</label>
              <div className="grid grid-cols-6 gap-1.5 text-center">
                {[0, 0.5, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((s) => (
                  <button
                    key={s}
                    onClick={() => onStepJump(s)}
                    className={cn(
                      "h-8 text-xs font-black rounded-lg transition-colors",
                      step === s
                        ? "bg-primary text-white"
                        : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* isSimulation Toggle */}
            <div className="flex items-center justify-between bg-slate-800/50 p-3 rounded-2xl border border-slate-800">
              <div className="flex flex-col">
                <span className="text-xs font-black text-slate-200">{t("시뮬레이션 모드 (isSimulation)")}</span>
                <span className="text-[10px] text-slate-400">{t("활성화 시 실명/본인인증을 모킹합니다.")}</span>
              </div>
              <Checkbox
                id="dev-sim-toggle"
                checked={isSimulation}
                onCheckedChange={(val) => setIsSimulation(!!val)}
                className="h-5 w-5 border-slate-600 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
              />
            </div>

            <div className="text-[10px] text-slate-500 leading-normal text-center pt-2 border-t border-slate-800">
              {t("인증 프로세스 우회 및 최종 9단계 CMS 서명 동의서 규제 준수(보기 팝업, 서명 가두기 및 전송 기능) 테스트용 도구입니다.")}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
