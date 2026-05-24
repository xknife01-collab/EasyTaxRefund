"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "@/components/LanguageContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  Info,
  Smartphone,
  ExternalLink
} from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselApi
} from "@/components/ui/carousel";
import { PASS_GUIDE_STEPS } from "./PassGuideModal";
import { KAKAO_GUIDE_STEPS } from "./KakaoGuideModal";
import { HANA_GUIDE_STEPS } from "./HanaGuideModal";

interface EmbeddedAuthGuideProps {
  authMethod: "app" | "kakao" | "hana";
  mode?: "auth" | "registration";
  onClick?: () => void;
}

export function EmbeddedAuthGuide({ authMethod, mode = "auth", onClick }: EmbeddedAuthGuideProps) {
  const { t } = useTranslation();
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  // Extract steps based on mode
  const stepsToRender = useMemo(() => {
    if (authMethod === "kakao") {
      return mode === "registration" 
        ? KAKAO_GUIDE_STEPS.slice(0, 5) 
        : KAKAO_GUIDE_STEPS.slice(32, 37);
    } else if (authMethod === "hana") {
      return mode === "registration" 
        ? HANA_GUIDE_STEPS.slice(0, 5) 
        : HANA_GUIDE_STEPS.slice(27, 33);
    } else {
      // default: PASS ('app')
      return mode === "registration" 
        ? PASS_GUIDE_STEPS.slice(0, 5) 
        : PASS_GUIDE_STEPS.slice(23, 28);
    }
  }, [authMethod, mode]);

  // Sync scroll snap index
  useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    const onSelect = () => {
      setCurrent(api.selectedScrollSnap());
    };
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  // Autoplay slides every 4 seconds
  useEffect(() => {
    if (!api || stepsToRender.length <= 1) return;
    const interval = setInterval(() => {
      const nextIndex = (api.selectedScrollSnap() + 1) % stepsToRender.length;
      api.scrollTo(nextIndex);
    }, 4500);
    return () => clearInterval(interval);
  }, [api, stepsToRender]);

  const methodColorClass = useMemo(() => {
    if (authMethod === "kakao") return "border-[#FEE500]";
    if (authMethod === "hana") return "border-[#008485]";
    return "border-red-600";
  }, [authMethod]);

  const methodBadgeClass = useMemo(() => {
    if (authMethod === "kakao") return "bg-[#FEE500] text-amber-950";
    if (authMethod === "hana") return "bg-[#008485] text-white";
    return "bg-red-600 text-white";
  }, [authMethod]);

  // Get Store Download links based on method
  const storeLinks = useMemo(() => {
    if (authMethod === "kakao") {
      return {
        playStore: "https://play.google.com/store/search?q=%EC%B9%B4%EC%B9%B4%EC%98%A4%ED%86%A1&c=apps",
        appStore: "https://apps.apple.com/kr/iphone/search?term=%EC%B9%B4%EC%B9%B4%EC%98%A4%ED%86%A1"
      };
    } else if (authMethod === "hana") {
      return {
        playStore: "https://play.google.com/store/search?q=%ED%95%98%EB%82%98%EC%9B%90%ED%81%90&c=apps",
        appStore: "https://apps.apple.com/kr/iphone/search?term=%ED%95%98%EB%82%98%EC%9B%90%ED%81%90"
      };
    } else {
      return {
        playStore: "https://play.google.com/store/search?q=PASS&c=apps",
        appStore: "https://apps.apple.com/kr/iphone/search?term=%ED%8C%A8%EC%8A%A4"
      };
    }
  }, [authMethod]);

  return (
    <div 
      onClick={onClick}
      className={cn(
        "w-full bg-slate-50/70 rounded-3xl p-4 sm:p-6 border border-slate-200/60 shadow-md transition-all duration-300 flex flex-col gap-5",
        onClick ? "cursor-pointer hover:border-slate-300 hover:shadow-lg active:scale-[0.99] group/guide" : ""
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={cn("text-[10px] font-black py-1 px-2.5 rounded-full uppercase tracking-wider", methodBadgeClass)}>
            {authMethod === "kakao" ? t("카카오톡") : authMethod === "hana" ? t("하나은행") : t("PASS")}
          </span>
          <h4 className="text-sm font-black text-slate-800">
            {mode === "registration" ? t("인증서 발급/가입 미리보기") : t("인증 승인 따라하기 가이드")}
          </h4>
        </div>
        
        {/* Slide Indicators */}
        <div className="flex gap-1.5">
          {stepsToRender.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                api?.scrollTo(idx);
              }}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                current === idx ? "w-5 bg-slate-800" : "w-2 bg-slate-200"
              )}
              aria-label={`Go to step ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      <div className="relative w-full overflow-hidden flex flex-col items-center min-h-[260px] sm:min-h-[300px]">
        <Carousel
          setApi={setApi}
          className="w-full max-w-[340px]"
          opts={{ align: "start", loop: true }}
        >
          <CarouselContent className="ml-0">
            {stepsToRender.map((step, index) => (
              <CarouselItem key={index} className="pl-0 relative flex flex-col items-center">
                <div className={cn(
                  "relative w-full max-w-[240px] sm:max-w-[260px] shadow-xl rounded-[2rem] border-[8px] bg-white ring-4 ring-white/10 overflow-hidden transition-transform duration-300",
                  methodColorClass,
                  onClick ? "group-hover/guide:scale-[1.01]" : ""
                )}>
                  <img
                    src={step.image}
                    alt={`Auth Guide Step ${index + 1}`}
                    className="w-full h-auto block rounded-[1.4rem]"
                  />
                  
                  {/* Highlight box overlays */}
                  <div className="absolute inset-0 pointer-events-none">
                    {step.markers.map((marker: any, mId: number) => (
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
                            }}
                          >
                            <div
                              className={cn(
                                "transition-all duration-300 w-full h-full",
                                marker.isMask
                                  ? "bg-white border-none opacity-100 shadow-[0_0_10px_rgba(255,255,255,1)]"
                                  : cn(
                                      !marker.width && (marker.isLarge
                                        ? "w-[60vw] h-[45vw] max-w-[240px] max-h-[160px]"
                                        : marker.isSmall ? "w-[10vw] h-[10vw] max-w-[35px] max-h-[35px]" : "w-[15vw] h-[15vw] max-w-[70px] max-h-[70px] min-w-[35px] min-h-[35px]"),
                                      "border-[3px] border-dashed rounded-xl sm:rounded-2xl animate-pulse border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.6)] bg-amber-400/20"
                                    )
                              )}
                            />
                          </div>
                        )}

                        {marker.text && (
                          <div
                            className="absolute pointer-events-auto z-[60]"
                            style={{
                              left: `${marker.textX !== undefined ? marker.textX : marker.x}%`,
                              top: `${marker.textY !== undefined ? marker.textY : marker.y}%`,
                              transform: "translate(-50%, -50%)",
                            }}
                          >
                            {marker.isLabel ? (
                              <div className="bg-black/75 text-white font-black px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] whitespace-nowrap backdrop-blur-sm border border-white/10">
                                {t(marker.text)}
                              </div>
                            ) : marker.isBridge ? (
                              <div className="bg-indigo-600/90 text-white font-black px-3 py-1.5 rounded-xl shadow-lg flex flex-col items-center gap-1 text-center w-[65vw] max-w-[200px] relative animate-in fade-in zoom-in duration-300">
                                <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center mb-0.5">
                                  <Smartphone className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-[10px] leading-relaxed break-keep">{t(marker.text)}</span>
                              </div>
                            ) : (
                              <div className="bg-amber-400 text-slate-900 font-black px-2 py-1 rounded-lg shadow-lg flex items-center gap-1 border border-white ring-2 ring-amber-400/20 text-[9px] w-max max-w-[160px] relative">
                                <span className="leading-tight break-keep">{t(marker.text)}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          {/* Navigation Arrows */}
          <div className="absolute top-[40%] left-0 right-0 flex justify-between px-2 pointer-events-none">
            <Button
              variant="outline"
              size="icon"
              onClick={(e) => { e.stopPropagation(); api?.scrollPrev(); }}
              className="h-9 w-9 rounded-full shadow-lg pointer-events-auto bg-white/90 border-slate-200/50 hover:bg-white text-slate-800 active:scale-95 transition-transform"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              onClick={(e) => { e.stopPropagation(); api?.scrollNext(); }}
              className="h-9 w-9 rounded-full shadow-lg pointer-events-auto bg-white/90 border-slate-200/50 hover:bg-white text-slate-800 active:scale-95 transition-transform"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </Carousel>
      </div>

      {/* Actionable Hint / Store links depending on mode */}
      <div className="space-y-4 text-center mt-2 border-t border-slate-200/50 pt-4">
        {mode === "registration" && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={storeLinks.playStore}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black shadow-md transition-all active:scale-95 w-full sm:w-auto"
            >
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>Google Play {t("설치")}</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
            <a
              href={storeLinks.appStore}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center justify-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 rounded-xl text-xs font-black shadow-md transition-all active:scale-95 w-full sm:w-auto"
            >
              <Smartphone className="w-4 h-4 text-blue-500" />
              <span>App Store {t("설치")}</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
          </div>
        )}

        <div>
          {onClick ? (
            <p className="text-xs font-black text-[#008485] animate-pulse flex items-center justify-center gap-1.5">
              <span>💡</span> {t("이 영역을 누르시면 전체 단계 상세 가이드가 열립니다.")}
            </p>
          ) : (
            <p className="text-xs font-bold text-slate-400">
              {t("이미지를 터치하여 넘기거나 화살표를 눌러 가이드를 확인해 보세요.")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
