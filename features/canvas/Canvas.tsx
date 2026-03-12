"use client";

import Experience from "./core/Experience";
import { useEffect, useRef } from "react";
import { useStore } from "@/store/store";

export default function Canvas() {
  const canvasWrapper = useRef<HTMLDivElement>(null);
  const experience = useRef<Experience | null>(null);
  const setIsMobile = useStore((state) => state.setIsMobile);
  const setQualityTier = useStore((state) => state.setQualityTier);
  const setNextSceneId = useStore((state) => state.setNextSceneId);
  const setActiveSceneId = useStore((state) => state.setActiveSceneId);
  const setSceneTransitionProgress = useStore(
    (state) => state.setSceneTransitionProgress
  );
  const setIsTransitioning = useStore((state) => state.setIsTransitioning);

  useEffect(() => {
    const updateDeviceState = () => {
      const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
      const isSmallViewport = window.innerWidth <= 768;
      const isMobile = isCoarsePointer || isSmallViewport;
      const dpr = window.devicePixelRatio;

      setIsMobile(isMobile);

      if (isMobile || dpr >= 3) {
        setQualityTier("low");
        return;
      }

      if (dpr >= 2) {
        setQualityTier("medium");
        return;
      }

      setQualityTier("high");
    };

    updateDeviceState();
    window.addEventListener("resize", updateDeviceState);

    const wrapper = canvasWrapper.current;
    if (wrapper) {
      experience.current = new Experience(wrapper);
    }

    return () => {
      window.removeEventListener("resize", updateDeviceState);
      experience.current?.destroy();
    };
  }, [
    setIsMobile,
    setQualityTier,
    setNextSceneId,
    setActiveSceneId,
    setSceneTransitionProgress,
    setIsTransitioning,
  ]);
  return (
    <div ref={canvasWrapper} className="w-full h-full contain-strict"></div>
  );
}
