"use client";

import Experience from "./core/Experience";
import { useEffect, useRef } from "react";
import { useRouterStore, useStore } from "@/store/store";
import { useGSAP } from "@gsap/react";

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

  const onGoToIntro = useRouterStore((state) => state.onGoToIntro);
  const { contextSafe } = useGSAP({ scope: canvasWrapper });

  const onClickToTop = contextSafe(() => {
    onGoToIntro?.();
  });
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
        <button
          id="move-to-detail"
          data-cursor-hover
          data-cursor-text="gallery >"
          className={`absolute pointer-events-auto p-1 -translate-x-1/2 -translate-y-[110%] [@media(min-aspect-ratio:1/1)]:translate-y-full transition-opacity tracking-widest ${
            phase === "introReady"
              ? "opacity-100 cursor-pointer"
              : "opacity-0 pointer-events-none"
          } `}
        >
          move to gallery
        </button>

        <p
          className={`absolute bottom-8 left-1/2 -translate-x-1/2 text-sm transition-opacity tracking-widest ${
            phase === "gallery" ? "opacity-100" : "opacity-0"
          }`}
        >
          Scroll to Explore
        </p>

        <button
          data-cursor-hover
          data-cursor-text="< top"
          onClick={onClickToTop}
          className={`absolute z-10 bottom-8 left-16 pointer-events-auto text-sm transition-opacity tracking-widest ${
            phase === "gallery" ? "opacity-100" : "opacity-0"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 14 4 9l5-5" />
            <path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11" />
          </svg>
        </button>
      </div>
    </div>
  );
}
