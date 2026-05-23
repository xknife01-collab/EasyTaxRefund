"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "@/components/LanguageContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  Info,
  Smartphone
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
}

export function EmbeddedAuthGuide({ authMethod }: EmbeddedAuthGuideProps) {
  const { t } = useTranslation();
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  // Extract auth approval steps for the current auth method
  const stepsToRender = useMemo(() => {
    if (authMethod === "kakao") {
      return KAKAO_GUIDE_STEPS.slice(32, 37);
    } else if (authMethod === "hana") {
      return HANA_GUIDE_STEPS.slice(27, 33);
    } else {
      // default: PASS ('app')
      return PASS_GUIDE_STEPS.slice(23, 28);
    }
  }, [authMethod]);

  // Sync scroll snap index
  useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  // Autoplay slides every 4 seconds to make the guide dynamic
  useEffect(() => {
    if (!api || stepsToRender.length <= 1) return;
    const interval = setInterval(() => {
      const nextIndex = (api.selectedScrollSnap() + 1) % stepsToRender.length;
      api.scrollTo(nextIndex);
    }, 4000);
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

  return (
    <div className="w-full bg-slate-50/50 rounded-3xl p-4 sm:p-6 border border-slate-100 shadow-inner space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={cn("text-[10px] font-black py-1 px-2.5 rounded-full uppercase tracking-wider", methodBadgeClass)}>
            {authMethod === "kakao" ? "카카오톡" : authMethod === "hana" ? "하나은행" : "PASS"}
          </span>
          <h4 className="text-sm font-black text-slate-700">
            {t("인증 승인 따라하기 가이드")}
          </h4>
        </div>
        
        {/* Slide Indicators */}
        <div className="flex gap-1.5">
          {stepsToRender.map((_, idx) => (
            <button
              key={idx}
              onClick={() => api?.scrollTo(idx)}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                current === idx ? "w-5 bg-slate-800" : "w-2 bg-slate-200"
              )}
              aria-label={`Go to step ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      <div className="relative w-full overflow-hidden flex flex-col items-center min-h-[300px]">
        <Carousel
          setApi={setApi}
          className="w-full max-w-[340px]"
          opts={{ align: "start", loop: true }}
        >
          <CarouselContent className="ml-0">
            {stepsToRender.map((step, index) => (
              <CarouselItem key={index} className="pl-0 relative flex flex-col items-center">
                <div className={cn(
                  "relative w-full max-w-[280px] shadow-xl rounded-[2rem] border-[8px] bg-white ring-4 ring-white/10 overflow-hidden",
                  methodColorClass
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
                                        ? "w-[60vw] h-[45vw] max-w-[300px] max-h-[200px]"
                                        : marker.isSmall ? "w-[10vw] h-[10vw] max-w-[40px] max-h-[40px]" : "w-[15vw] h-[15vw] max-w-[80px] max-h-[80px] min-w-[40px] min-h-[40px]"),
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
                              <div className="bg-black/75 text-white font-black px-2 py-0.5 rounded text-[9px] whitespace-nowrap backdrop-blur-sm border border-white/10">
                                {t(marker.text)}
                              </div>
                            ) : marker.isBridge ? (
                              <div className="bg-indigo-600/90 text-white font-black px-4 py-2 rounded-2xl shadow-lg flex flex-col items-center gap-2 text-center w-[75vw] max-w-[240px] relative animate-in fade-in zoom-in duration-300">
                                <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center mb-0.5">
                                  <Smartphone className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-[11px] leading-relaxed break-keep">{t(marker.text)}</span>
                              </div>
                            ) : (
                              <div className="bg-amber-400 text-slate-900 font-black px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5 border border-white ring-2 ring-amber-400/20 text-[10px] w-max max-w-[180px] relative">
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

          {/* Navigation Arrows inside the container */}
          <div className="absolute top-[40%] left-0 right-0 flex justify-between px-2 pointer-events-none">
            <Button
              variant="outline"
              size="icon"
              onClick={(e) => { e.stopPropagation(); api?.scrollPrev(); }}
              className="h-10 h-10 rounded-full shadow-lg pointer-events-auto bg-white/80 border-slate-200/50 hover:bg-white text-slate-800 active:scale-95 transition-transform"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              onClick={(e) => { e.stopPropagation(); api?.scrollNext(); }}
              className="h-10 h-10 rounded-full shadow-lg pointer-events-auto bg-white/80 border-slate-200/50 hover:bg-white text-slate-800 active:scale-95 transition-transform"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </Carousel>
      </div>

      <div className="text-center">
        <p className="text-xs font-bold text-slate-400">
          {t("이미지를 터치하여 넘기거나 화살표를 눌러 가이드를 확인해 보세요.")}
        </p>
      </div>
    </div>
  );
}
