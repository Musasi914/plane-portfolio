"use client";

import { useClientDeviceStore, useStore } from "@/store/store";
import { useEffect } from "react";
import { useShallow } from "zustand/shallow";

export default function ClientDeviceSync() {
  // デバイスの種類を取得
  const setDevice = useClientDeviceStore((state) => state.setDevice);
  useEffect(() => {
    const ua = navigator.userAgent;
    console.log(ua);
    if (ua.includes("Edg")) return setDevice("edge");
    if (ua.includes("Firefox")) return setDevice("firefox");
    if (ua.includes("Chrome")) return setDevice("chrome");
    if (ua.includes("Safari")) return setDevice("safari");
    setDevice("other");
  }, [setDevice]);

  // quality tier を設定
  const { setIsMobile, setPrefersReducedMotion, setQualityTier } = useStore(
    useShallow((s) => {
      return {
        setIsMobile: s.setIsMobile,
        setPrefersReducedMotion: s.setPrefersReducedMotion,
        setQualityTier: s.setQualityTier,
      };
    })
  );
  useEffect(() => {
    const updateDeviceState = () => {
      const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
      const isSmallViewport = window.innerWidth < 640;
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

    return () => {
      window.removeEventListener("resize", updateDeviceState);
    };
  }, [setIsMobile, setQualityTier]);

  // prefers-reduced-motion: reduce が有効かどうか
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setPrefersReducedMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [setPrefersReducedMotion]);

  return null;
}
