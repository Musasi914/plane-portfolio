"use client";

import Experience from "./core/Experience";
import { useEffect, useRef } from "react";
import { useRouterStore, useStore } from "@/store/store";
import { useGSAP } from "@gsap/react";
import { getHasMovedGallery } from "@/utils/storage";

export default function Canvas() {
  const canvasWrapper = useRef<HTMLDivElement>(null);
  const experience = useRef<Experience | null>(null);
  const setIsMobile = useStore((state) => state.setIsMobile);
  const setQualityTier = useStore((state) => state.setQualityTier);
  const setNextSceneId = useStore((state) => state.setNextSceneId);
  const setActiveSceneId = useStore((state) => state.setActiveSceneId);
  const phase = useStore((state) => state.phase);
  const isTransitioning = useStore((state) => state.isTransitioning);
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
  const onGoToGallery = useRouterStore((state) => state.onGoToGallery);

  const { contextSafe } = useGSAP({ scope: canvasWrapper });

  const onClickToTop = contextSafe(() => {
    onGoToIntro?.();
  });
  const onClickToGallery = contextSafe(() => {
    onGoToGallery?.();
  });

  const hasMovedGallery =
    typeof window !== "undefined" ? getHasMovedGallery() : false;

  return (
    <div ref={canvasWrapper} className="w-full h-full contain-strict">
      <div
        id="labels"
        className="absolute inset-0 pointer-events-none font-sora"
      >
        <div className="w-full h-full">
          <button
            id="face-rotate"
            data-cursor-hover
            data-cursor-text="click"
            className={`absolute -translate-x-full -translate-y-full pointer-events-auto p-4 transition-opacity duration-700 tracking-widest ${
              phase === "introReady" && !isTransitioning
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
            className={`absolute -translate-x-full pointer-events-auto p-4 transition-opacity duration-700 tracking-widest ${
              phase === "introReady" && !isTransitioning
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
            className={`absolute pointer-events-auto p-1 -translate-x-1/2 -translate-y-[110%] [@media(min-aspect-ratio:1/1)]:translate-y-full transition-opacity duration-700 tracking-widest ${
              phase === "introReady" && !isTransitioning
                ? "opacity-100 cursor-pointer"
                : "opacity-0 pointer-events-none"
            } `}
          >
            move to gallery
          </button>
          <button
            data-cursor-hover
            data-cursor-text="fast move to gallery >"
            onClick={onClickToGallery}
            className={`absolute z-10 bottom-4 left-12 p-4 pointer-events-auto transition-opacity duration-700 tracking-widest ${
              phase === "introReady" && !isTransitioning && hasMovedGallery
                ? "opacity-100 cursor-pointer"
                : "opacity-0 pointer-events-none"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="currentColor"
              stroke="none"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-fast-forward-icon lucide-fast-forward"
            >
              <path d="M12 6a2 2 0 0 1 3.414-1.414l6 6a2 2 0 0 1 0 2.828l-6 6A2 2 0 0 1 12 18z" />
              <path d="M2 6a2 2 0 0 1 3.414-1.414l6 6a2 2 0 0 1 0 2.828l-6 6A2 2 0 0 1 2 18z" />
            </svg>
          </button>
        </div>

        <div className="w-ful h-full">
          <p
            className={`absolute bottom-8 left-1/2 -translate-x-1/2 text-sm transition-opacity duration-700 tracking-widest ${
              phase === "gallery" && !isTransitioning
                ? "opacity-100"
                : "opacity-0"
            }`}
          >
            Scroll to Explore
          </p>

          <button
            data-cursor-hover
            data-cursor-text="< top"
            onClick={onClickToTop}
            className={`absolute z-10 bottom-4 left-12 p-4 pointer-events-auto transition-opacity duration-700 tracking-widest ${
              phase === "gallery" && !isTransitioning
                ? "opacity-100 cursor-pointer"
                : "opacity-0 pointer-events-none"
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
    </div>
  );
}
