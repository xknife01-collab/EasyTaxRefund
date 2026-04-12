"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselApi,
} from "@/components/ui/carousel";
import { useTranslation } from "@/components/LanguageContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  ChevronLeft, 
  ChevronRight, 
  Info, 
  X, 
  Building2
} from "lucide-react";

interface GuideMarker {
  x: number; // percentage from left (0-100)
  y: number; // percentage from top (0-100)
  width?: number; // percentage width
  height?: number; // percentage height
  text: string;
  hideBox?: boolean;
  isMask?: boolean;
  isRed?: boolean;
  isSmall?: boolean;
  isLarge?: boolean;
  fontSize?: number;
  hideArrow?: boolean;
  position?: "top" | "bottom" | "center";
  textX?: number;
  textY?: number;
  isLabel?: boolean;
}

interface GuideStep {
  image: string;
  markers: GuideMarker[];
}

const HANA_GUIDE_STEPS: GuideStep[] = Array.from({ length: 32 }, (_, i) => ({
  image: `/images/guide/hana/${i < 20 ? i + 1 : i + 2}.jpg`,
  markers: []
}));

const CHAPTERS = [
  { title: "하나원큐 시작", start: 0, icon: "🚀" },
  { title: "회원가입", start: 6, icon: "📝" },
  { title: "인증서 발급", start: 16, icon: "🔐" },
];

// Define markers for Hana with precise coordinates based on renamed files
HANA_GUIDE_STEPS[0].markers = [{ 
  x: 43.5, 
  y: 38.7, 
  width: 78, 
  height: 5.5, 
  text: "Play 스토어에서 '하나원큐'를 검색하여 설치해 주세요.",
  textY: 30 
}];
HANA_GUIDE_STEPS[1].markers = [{ 
  x: 74, 
  y: 25, 
  width: 42, 
  height: 5.5, 
  text: "설치가 완료되었습니다. '열기'를 눌러 하나원큐를 실행해 주세요.",
  textY: 15
}];
HANA_GUIDE_STEPS[2].markers = [{ 
  x: 50, 
  y: 88, 
  width: 90, 
  height: 7, 
  text: "원활한 가입을 위해 안내 내용을 확인하신 후 '확인'을 눌러주세요.",
  textY: 75
}];
HANA_GUIDE_STEPS[3].markers = [{ 
  x: 50, 
  y: 81, 
  width: 30, 
  height: 6, 
  text: "알림 권한 '허용'을 눌러주세요.",
  textY: 70
}];
HANA_GUIDE_STEPS[4].markers = [{ 
  x: 50, 
  y: 81, 
  width: 30, 
  height: 6, 
  text: "전화 권한 '허용'을 눌러주세요.",
  textY: 70
}];
HANA_GUIDE_STEPS[5].markers = [{ 
  x: 90, 
  y: 7, 
  width: 12, 
  height: 6, 
  text: "인증서 발급을 위해 오른쪽 상단의 'X'를 눌러주세요.",
  textY: 15,
  position: "bottom"
}];
HANA_GUIDE_STEPS[6].markers = [{ 
  x: 50, 
  y: 85, 
  width: 90, 
  height: 8, 
  text: "하단의 '하나원큐 시작하기' 버튼을 눌러주세요.",
  textY: 75
}];
HANA_GUIDE_STEPS[7].markers = [{ 
  x: 50, 
  y: 58, 
  width: 85, 
  height: 6, 
  text: "인증서 발급을 위해 '휴대폰인증'을 선택해 주세요.",
  textY: 45
}];
HANA_GUIDE_STEPS[8].markers = [
  { 
    x: 50, 
    y: 10, 
    text: "성명, 외국인등록번호 앞 7자리, 통신사, 휴대폰번호를 정확히 입력해 주세요.", 
    hideBox: true 
  },
  { x: 40, y: 32, text: "성명 (Name)", isLabel: true },
  { x: 30, y: 47, text: "등록번호 앞 6자리", isLabel: true },
  { x: 60, y: 47, text: "7번째 자리", isLabel: true },
  { x: 45, y: 60, text: "통신사 선택", isLabel: true },
  { x: 45, y: 75, text: "휴대폰 번호 입력", isLabel: true }
];
HANA_GUIDE_STEPS[9].markers = [{ 
  x: 50, 
  y: 62, 
  width: 88, 
  height: 75, 
  text: "통신사를 선택하고 '인증번호 요청'을 눌러주세요.",
  textY: 28
}];
HANA_GUIDE_STEPS[10].markers = [{ 
  x: 50, 
  y: 89, 
  width: 90, 
  height: 8, 
  text: "선택한 통신사가 맞는지 확인하고, 하단의 '인증번호 요청' 버튼을 눌러주세요.",
  textY: 75
}];
HANA_GUIDE_STEPS[11].markers = [
  { 
    x: 14, 
    y: 53, 
    isSmall: true,
    text: "서비스 이용 약관에 '전체동의'를 체크해 주세요.",
    textY: 43,
    textX: 45
  },
  {
    x: 65,
    y: 89,
    width: 70,
    height: 8,
    text: "체크 후 하단의 '다음' 버튼을 클릭해 주세요.",
    textY: 78
  }
];
HANA_GUIDE_STEPS[12].markers = [
  { 
    x: 50, 
    y: 30, 
    width: 90, 
    height: 12, 
    text: "문자로 받은 인증번호 6자리를 입력해 주세요.",
    textY: 15
  },
  {
    x: 50,
    y: 90,
    width: 90,
    height: 8,
    text: "입력 후 하단의 '인증하기' 버튼을 눌러주세요.",
    textY: 77
  }
];
HANA_GUIDE_STEPS[13].markers = [
  { 
    x: 16, 
    y: 24, 
    isSmall: true,
    text: "약관에 체크해 주세요.",
    textY: 16
  },
  {
    x: 50,
    y: 89,
    width: 70,
    height: 8,
    text: "체크 후 하단의 '다음' 버튼을 클릭해 주세요.",
    textY: 78
  }
];
HANA_GUIDE_STEPS[14].markers = [{ 
  x: 50, 
  y: 87, 
  width: 90, 
  height: 8, 
  text: "약관에 동의하신 후 하단의 '확인' 혹은 '동의' 버튼을 눌러주세요.",
  textY: 79
}];
HANA_GUIDE_STEPS[15].markers = [
  { 
    x: 16, 
    y: 24, 
    isSmall: true,
    text: "약관에 체크해 주세요.",
    textY: 16
  },
  {
    x: 50,
    y: 89,
    width: 70,
    height: 8,
    text: "체크 후 하단의 '다음' 버튼을 클릭해 주세요.",
    textY: 78
  }
];
HANA_GUIDE_STEPS[16].markers = [{ 
  x: 50, 
  y: 75, 
  width: 90, 
  height: 8, 
  text: "본인 인증을 위해 사용하실 '여권(Passport)'을 선택해 주세요.",
  textY: 63
}];
HANA_GUIDE_STEPS[17].markers = [
  { 
    x: 50, 
    y: 55, 
    width: 90, 
    height: 35, 
    text: "사각형 가이드 라인에 맞춰 '여권(Passport)'을 촬영해 주세요.",
    textY: 30
  },
  {
    x: 50,
    y: 75,
    width: 80,
    isSmall: false,
    height: 10,
    text: "카메라 권한 팝업이 뜨면 '앱 사용 중에만 허용'을 눌러주세요.",
    textY: 65
  }
];
HANA_GUIDE_STEPS[18].markers = [
  { 
    x: 50, 
    y: 45, 
    width: 90, 
    height: 8, 
    text: "여권에서 인식된 이름이 자동으로 입력됩니다.",
    textY: 37
  },
  {
    x: 65,
    y: 89,
    width: 60,
    height: 8,
    text: "정보가 맞는지 확인한 후 하단의 '다음' 버튼을 눌러주세요.",
    textY: 80
  }
];
HANA_GUIDE_STEPS[19].markers = [
  { 
    x: 50, 
    y: 42, 
    width: 90, 
    height: 12, 
    text: "본인 인증을 진행할 '계좌'를 선택해 주세요.",
    textY: 30
  },
  {
    x: 50,
    y: 89,
    width: 60,
    height: 8,
    text: "선택 후 하단의 '다음' 버튼을 눌러주세요.",
    textY: 80
  }
];
HANA_GUIDE_STEPS[20].markers = [{ 
  x: 50, 
  y: 75, 
  width: 75, 
  height: 45, 
  text: "해당 계좌의 비밀번호 4자리를 키패드로 입력해 주세요.",
  textY: 35
}];
HANA_GUIDE_STEPS[21].markers = [
  { 
    x: 14, 
    y: 52, 
    isSmall: true,
    text: "클라우드 서비스 이용약관에 체크해 주세요.",
    textY: 40
  },
  { 
    x: 62, 
    y: 89, 
    width: 75, 
    height: 8, 
    text: "하단의 '저장' 버튼을 눌러주세요.",
    textY: 80
  }
];
HANA_GUIDE_STEPS[22].markers = [{ 
  x: 50, 
  y: 89, 
  width: 90, 
  height: 8, 
  text: "약관 내용을 확인하고 하단의 '동의'를 눌러주세요.",
  textY: 80
}];
HANA_GUIDE_STEPS[23].markers = [
  { 
    x: 14, 
    y: 52, 
    isSmall: true,
    text: "클라우드 서비스 이용약관에 체크해 주세요.",
    textY: 40
  },
  { 
    x: 62, 
    y: 89, 
    width: 75, 
    height: 8, 
    text: "하단의 '저장' 버튼을 눌러주세요.",
    textY: 80
  }
];
HANA_GUIDE_STEPS[24].markers = [{ 
  x: 50, 
  y: 43, 
  width: 44, 
  height: 6, 
  text: "인증서에서 사용할 비밀번호 6자리를 설정해 주세요.",
  textY: 40
}];
HANA_GUIDE_STEPS[25].markers = [{ 
  x: 20, 
  y: 88, 
  width: 22, 
  height: 6, 
  text: "축하합니다! 발급이 완료되었습니다. '다음에'를 누르면 메인 화면으로 돌아가 인증을 계속할 수 있습니다.",
  textY: 74
}];
HANA_GUIDE_STEPS[26].markers = [{ 
  x: 50, 
  y: 55, 
  width: 90, 
  height: 8, 
  text: "🎉 축하합니다! 하나인증서 발급이 완료되었습니다.\n\n'확인'을 눌러주세요.",
  textY: 45
}];

HANA_GUIDE_STEPS[27].markers = [{ 
  x: 50, 
  y: 12, 
  width: 90, 
  height: 12, 
  text: "국세청에서 인증 요청이 도착했습니다. 상단 알림을 눌러 하나원큐 앱을 열어주세요.",
  textY: 28,
  position: "bottom"
}];
HANA_GUIDE_STEPS[28].markers = [{ 
  x: 14, 
  y: 50, 
  isSmall: true,
  text: "개인정보 제3자 제공 동의 체크박스를 눌러주세요.",
  textY: 43
}];
HANA_GUIDE_STEPS[29].markers = [{ 
  x: 50, 
  y: 89, 
  width: 90, 
  height: 8, 
  text: "하단의 '인증하기' 버튼을 눌러 인증을 진행합니다.",
  textY: 78
}];
HANA_GUIDE_STEPS[30].markers = [{ 
  x: 50, 
  y: 57, 
  width: 44, 
  height: 6, 
  text: "하나인증서 비밀번호 6자리를 입력해 주세요.",
  textY: 47
}];
HANA_GUIDE_STEPS[31].markers = [{ 
  x: 50, 
  y: 90, 
  width: 88, 
  height: 8, 
  text: "인증이 완료되었습니다! '확인'을 눌러주세요.\n\n그 후 이지텍스리펀드 웹페이지로 돌아가 '인증 완료'를 누르세요!",
  textY: 78
}];

const FINAL_CELEBRATION_STEPS = [];
FINAL_CELEBRATION_STEPS.forEach(idx => {
  HANA_GUIDE_STEPS[idx].markers = [{
    x: 50,
    y: 35,
    text: "🎉 축하합니다 🎉\n이제 하나원큐에서의 모든 작업이 끝났습니다!\n\n열려있는 앱을 닫고 '텍스리펀 앱'으로 돌아가\n최종 '인증완료'를 누르세요!",
    hideBox: true,
    textX: 50,
    textY: 45
  }];
});

export function HanaGuideModal({ 
  isOpen, 
  onClose,
  mode = 'registration'
}: { 
  isOpen: boolean; 
  onClose: () => void;
  mode?: 'registration' | 'auth';
}) {
  const { t } = useTranslation();
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  const displaySteps = mode === 'auth' 
    ? HANA_GUIDE_STEPS.slice(27, 32) // Steps 28-32 (NTS Approval)
    : HANA_GUIDE_STEPS.slice(0, 27); // Steps 1-27 (Registration & Issuance)
    
  const displayChapters = mode === 'auth'
    ? [{ title: "인증 승인", start: 0, icon: "✅" }]
    : CHAPTERS;

  React.useEffect(() => {
    if (isOpen) {
      document.body.classList.add("guide-modal-open");
    } else {
      document.body.classList.remove("guide-modal-open");
    }
    return () => document.body.classList.remove("guide-modal-open");
  }, [isOpen]);

  React.useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const currentChapterIndex = displayChapters.findIndex((ch, i) => {
    const nextCh = displayChapters[i + 1];
    return current >= ch.start && (!nextCh || current < nextCh.start);
  });

  const goToChapter = (index: number) => {
    api?.scrollTo(displayChapters[index].start);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden bg-white/95 border-none h-[95vh] flex flex-col sm:rounded-[2.5rem]">
        <DialogHeader className="p-6 bg-white shrink-0 border-b z-50 relative pr-12">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            aria-label={t("가이드 닫기")}
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1 text-left">
              <DialogTitle className="text-xl font-black text-slate-900 flex items-center gap-2">
                <div className="w-8 h-8 bg-[#008485] rounded-lg flex items-center justify-center overflow-hidden">
                  <Building2 className="text-white h-5 w-5" />
                </div>
                {t("하나원큐 상세 가이드")}
              </DialogTitle>
              <DialogDescription className="font-bold text-slate-400 text-xs sm:text-sm">
                {t("하나은행 앱으로 10초 만에 끝내는 본인인증 가이드")}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl sm:rounded-full shrink-0 overflow-x-auto no-scrollbar">
                {displayChapters.map((ch, i) => (
                  <button
                    key={i}
                    onClick={() => goToChapter(i)}
                    className={cn(
                      "flex-1 sm:flex-none px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-full text-[10px] sm:text-xs font-black transition-all flex items-center justify-center gap-1.5 whitespace-nowrap",
                      currentChapterIndex === i 
                        ? "bg-[#008485] text-white shadow-lg scale-105" 
                        : "text-slate-400 hover:text-slate-600 hover:bg-slate-200"
                    )}
                  >
                    <span className="opacity-70">{ch.icon}</span>
                    {t(ch.title)}
                  </button>
                ))}
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 w-full bg-slate-50 relative overflow-hidden min-h-0">
          <Carousel 
            setApi={setApi} 
            className="w-full h-full"
            opts={{ align: "start", loop: false, watchDrag: false }}
          >
            <CarouselContent className="h-full ml-0">
              {displaySteps.map((step, index) => (
                <CarouselItem key={index} className="h-[calc(95vh-120px)] overflow-y-auto pl-0 relative flex-shrink-0 bg-slate-50">
                  <div className="flex flex-col items-center pt-8 px-4 pb-32 sm:pt-12 sm:px-8">
                    <div className="relative w-full max-w-[480px] shadow-2xl rounded-[2.5rem] border-[10px] sm:border-[16px] border-[#008485] bg-white ring-8 ring-white/10 ring-offset-2 ring-offset-slate-200">
                      <img
                        src={step.image}
                        alt={`Hana Guide Step ${mode === 'auth' ? index + 28 : index + 1}`}
                        className="w-full h-auto block rounded-[1.8rem] sm:rounded-[2.2rem]"
                      />
                      <div className="absolute inset-0 pointer-events-none">
                        {step.markers.map((marker, mId) => (
                          <React.Fragment key={mId}>
                            {!marker.hideBox && (
                              <div
                                className="absolute pointer-events-auto"
                                style={{
                                  left: `${marker.x}%`,
                                  top: `${marker.y}%`,
                                  width: marker.width ? `${marker.width}%` : undefined,
                                  height: marker.height ? `${marker.height}%` : undefined,
                                  transform: "translate(-50%, -50%)",
                                  zIndex: 50
                                }}
                              >
                                <div
                                  className={cn(
                                    "transition-all duration-300 w-full h-full",
                                    marker.isMask
                                      ? "bg-white border-none opacity-100 shadow-[0_0_15px_rgba(255,255,255,1)]"
                                      : cn(
                                          !marker.width && (marker.isLarge 
                                            ? "w-[80vw] h-[60vw] max-w-[420px] max-h-[280px]" 
                                            : marker.isSmall ? "w-[12vw] h-[12vw] max-w-[60px] max-h-[60px]" : "w-[18vw] h-[18vw] max-w-[100px] max-h-[100px] min-w-[50px] min-h-[50px]"),
                                          "border-[4px] sm:border-[6px] border-dashed rounded-2xl sm:rounded-[2.5rem] animate-pulse border-[#008485] shadow-[0_0_25px_rgba(0,132,133,0.8)] bg-[#008485]/20"
                                        )
                                  )}
                                />
                              </div>
                            )}

                            {marker.text && (
                              <div
                                className={cn(
                                  "absolute pointer-events-auto z-[60] transition-all duration-300",
                                  marker.isLabel 
                                    ? "" 
                                    : (marker.textX === undefined && marker.textY === undefined
                                        ? marker.position === "bottom"
                                          ? "translate-y-[15vw] sm:translate-y-32"
                                          : "-translate-y-full -mt-4"
                                        : "")
                                )}
                                style={{
                                  left: `${marker.textX !== undefined ? marker.textX : marker.x}%`,
                                  top: `${marker.textY !== undefined ? marker.textY : marker.y}%`,
                                  transform: "translate(-50%, -50%)",
                                }}
                              >
                                {marker.isLabel ? (
                                  <div className="bg-black/70 text-white font-black px-3 py-1 sm:px-4 sm:py-2 rounded-lg text-[10px] sm:text-sm whitespace-nowrap backdrop-blur-sm border border-white/20">
                                    {t(marker.text)}
                                  </div>
                                ) : (
                                  <div 
                                    className="bg-[#008485] text-white font-black px-4 py-2 sm:px-8 sm:py-4 rounded-xl sm:rounded-[2rem] shadow-xl sm:shadow-2xl flex items-center gap-2 sm:gap-4 border-2 border-white ring-2 sm:ring-4 ring-[#008485]/30 whitespace-normal sm:whitespace-nowrap w-max max-w-[70vw] sm:max-w-none relative"
                                    style={{ fontSize: marker.fontSize ? `${marker.fontSize}px` : 'clamp(11px,3.0vw,20px)' }}
                                  >
                                    <Info className="w-[4vw] h-[4vw] max-w-[24px] max-h-[24px] min-w-[14px] min-h-[14px] text-white flex-shrink-0" />
                                    <span className="leading-tight break-keep">{t(marker.text)}</span>
                                    
                                    {!marker.hideArrow && (
                                      marker.position === "bottom" ? (
                                        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-4 h-4 sm:w-6 sm:h-6 bg-[#008485] rotate-45 border-l-2 border-t-2 border-white" />
                                      ) : (
                                        <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-4 h-4 sm:w-6 sm:h-6 bg-[#008485] rotate-45 border-r-2 border-b-2 border-white" />
                                      )
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                    <div className="h-[120px] w-full shrink-0" />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            
            <div className="absolute bottom-10 left-0 right-0 flex justify-center items-center gap-6 px-8 pointer-events-none z-[100]">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={(e) => { e.stopPropagation(); api?.scrollPrev(); }} 
                disabled={current === 0} 
                className="h-14 w-14 sm:h-16 sm:w-16 rounded-full shadow-2xl pointer-events-auto bg-white border-black/5 hover:bg-slate-50 hover:scale-110 transition-transform"
              >
                <ChevronLeft className="h-8 w-8 sm:h-10 sm:w-10 text-[#008485]" />
              </Button>
              
              <div className="bg-[#008485] backdrop-blur-xl text-white px-6 py-2.5 sm:px-8 sm:py-4 rounded-full font-black text-base sm:text-xl pointer-events-auto shadow-2xl flex items-center gap-2">
                {currentChapterIndex !== -1 && (
                  <>
                    <span className="hidden sm:inline">{t(displayChapters[currentChapterIndex].title)}</span>
                    <span className="mx-2 opacity-50 hidden sm:inline">|</span>
                  </>
                )}
                <span className="">{current + 1}</span>
                <span className="mx-1 opacity-50">/</span>
                <span>{displaySteps.length}</span>
              </div>

              <Button 
                variant="outline" 
                size="icon" 
                onClick={(e) => { e.stopPropagation(); api?.scrollNext(); }} 
                disabled={current === displaySteps.length - 1} 
                className="h-14 w-14 sm:h-16 sm:w-16 rounded-full shadow-2xl pointer-events-auto bg-white border-black/5 hover:bg-slate-50 hover:scale-110 transition-transform"
              >
                <ChevronRight className="h-8 w-8 sm:h-10 sm:w-10 text-[#008485]" />
              </Button>
            </div>
          </Carousel>
        </div>
      </DialogContent>
    </Dialog>
  );
}
