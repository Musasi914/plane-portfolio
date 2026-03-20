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
  const phase = useStore((state) => state.phase);

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
  }, [setIsMobile, setQualityTier, setNextSceneId, setActiveSceneId]);

  return (
    <div ref={canvasWrapper} className="w-full h-full contain-strict">
      <div
        id="labels"
        className="absolute inset-0 pointer-events-none font-sora"
      >
        <button
          id="face-rotate"
          data-cursor-hover
          data-cursor-text="click"
          className={`absolute -translate-x-full -translate-y-full pointer-events-auto p-4 transition-opacity tracking-widest ${
            phase === "introReady"
              ? "opacity-100 cursor-pointer"
              : "opacity-0 pointer-events-none"
          } `}
        >
          rotate: <span>ON</span>
        </button>
        <button
          id="face-smile"
          data-cursor-hover
          data-cursor-text="click"
          className={`absolute -translate-x-full pointer-events-auto p-4 transition-opacity tracking-widest ${
            phase === "introReady"
              ? "opacity-100 cursor-pointer"
              : "opacity-0 pointer-events-none"
          } `}
        >
          smile: <span>OFF</span>
        </button>

        <p
          className={`absolute bottom-4 left-1/2 -translate-x-1/2 text-sm transition-opacity tracking-widest ${
            phase === "gallery" ? "opacity-100" : "opacity-0"
          }`}
        >
          Scroll to Explore
        </p>
      </div>
    </div>
  );
}
