import React from 'react';
import { Button } from "@/components/ui/button";
import { X, Smartphone, Building2 } from "lucide-react";
import { useTranslation } from "@/components/LanguageContext";

interface CarrierNameGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CarrierNameGuideModal({
  isOpen,
  onClose
}: CarrierNameGuideModalProps) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[3rem] shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
        <div className="p-8 sm:p-10 space-y-8 overflow-y-auto">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900 leading-tight">
                {t('내 이름이 통신사에 어떻게 등록되어 있나요?')}
              </h2>
              <p className="text-sm font-bold text-amber-600">
                {t('대부분의 외국인 이름 오류는 띄어쓰기 한 칸 차이로 발생합니다.')}
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full shrink-0">
              <X className="h-6 w-6" />
            </Button>
          </div>

          <div className="space-y-8">
            {/* Visual Guide Screenshot */}
            <div className="rounded-3xl border border-slate-100 overflow-hidden shadow-inner bg-slate-50 aspect-[4/3] relative group">
              <img
                src="/images/guide/name_check_guide.png"
                alt="Carrier App Name Check Guide"
                className="w-full h-full object-cover"
              />
              {/* Tooltip Overlay */}
              <div className="absolute top-[30%] right-[12%] animate-in slide-in-from-right-10 fade-in duration-1000">
                <div className="bg-emerald-500 text-white text-[10px] sm:text-xs font-black px-3 py-2 rounded-2xl shadow-2xl flex items-center gap-1.5 whitespace-nowrap">
                  <div className="bg-white/20 p-1 rounded-full">
                    <Smartphone className="h-3 w-3" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="opacity-70 text-[8px] uppercase tracking-tighter">{t('확인됨')}</span>
                    <span>{t('영어 이름 (English Name)')}</span>
                  </div>
                </div>
                <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[10px] border-t-emerald-500 ml-4 shadow-xl" />
              </div>

              {/* Highlight Ring */}
              <div className="absolute top-[40%] right-[35%] w-16 h-16 border-4 border-emerald-500/40 rounded-full animate-pulse blur-[1px]" />
              <div className="absolute top-[40%] right-[35%] w-16 h-16 border border-emerald-500/60 rounded-full animate-ping" />

              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/40 to-transparent p-4">
                <p className="text-[10px] text-white font-bold opacity-80 uppercase tracking-widest">{t('통신사 앱(T world 등) 마이페이지 예시')}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 space-y-3">
                <div className="flex items-center gap-2 text-blue-700">
                  <Building2 className="h-5 w-5" />
                  <h3 className="font-black italic">{t('은행 앱에서 확인하기')} (Pro Tip)</h3>
                </div>
                <p className="text-sm font-medium text-blue-600 leading-relaxed">
                  {t("카카오뱅크나 토스 등 은행 앱의 '내 정보'에 표시된 영문 성함이 통신사 등록 성함과 같을 확률이 매우 높습니다.")}
                </p>
              </div>

              <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100 space-y-3">
                <div className="flex items-center gap-2 text-emerald-700">
                  <Smartphone className="h-5 w-5" />
                  <h3 className="font-black">{t('통신사 앱에서 확인하기')}</h3>
                </div>
                <p className="text-sm font-medium text-emerald-600 leading-relaxed">
                  {t("통신사 고객센터 앱(T world, My KT, U+)의 마이페이지에서 정확한 성함(띄어쓰기 포함)을 확인하실 수 있습니다.")}
                </p>
              </div>
            </div>
          </div>

          <Button onClick={onClose} className="w-full h-18 bg-slate-900 text-xl font-black rounded-[1.5rem] shadow-xl hover:scale-[1.02] transition-all">
            {t('확인했습니다')}
          </Button>
        </div>
      </div>
    </div>
  );
}
