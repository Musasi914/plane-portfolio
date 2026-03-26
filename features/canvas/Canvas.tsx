"use client";

import Experience from "./core/Experience";
import { useCallback, useEffect, useRef } from "react";
import { useRouterStore, useStore } from "@/store/store";
import { getHasMovedGallery } from "@/utils/storage";
import { playSfx } from "../audio/sfx";

export default function Canvas() {
  const canvasWrapper = useRef<HTMLDivElement>(null);
  const experience = useRef<Experience | null>(null);
  const setIsMobile = useStore((state) => state.setIsMobile);
  const isMobile = useStore((state) => state.isMobile);
  const setQualityTier = useStore((state) => state.setQualityTier);
  const setNextSceneId = useStore((state) => state.setNextSceneId);
  const setActiveSceneId = useStore((state) => state.setActiveSceneId);
  const phase = useStore((state) => state.phase);
  const isTransitioning = useStore((state) => state.isTransitioning);
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

  const onClickToTop = useCallback(() => {
    onGoToIntro?.();
    playSfx("scratch");
  }, [onGoToIntro]);
  const onClickToGallery = useCallback(() => {
    onGoToGallery?.();
    playSfx("scratch");
  }, [onGoToGallery]);

  const makeClickSound = useCallback(() => {
    playSfx("click");
  }, []);

  const enableSound = useStore((state) => state.enableSound);
  const setEnableSound = useStore((state) => state.setEnableSound);

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
            onClick={makeClickSound}
            data-cursor-text="click"
            className={`absolute -translate-x-full -translate-y-full pointer-events-auto p-4 text-xs md:text-base transition-opacity duration-700 tracking-widest ${
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
            onClick={makeClickSound}
            data-cursor-text="click"
            className={`absolute -translate-x-full pointer-events-auto p-4 text-xs md:text-base transition-opacity duration-700 tracking-widest ${
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
            onClick={makeClickSound}
            data-cursor-text="gallery >"
            className={`absolute pointer-events-auto p-1 -translate-x-1/2 -translate-y-[110%] [@media(min-aspect-ratio:1/1)]:translate-y-full text-sm md:text-base transition-opacity duration-700 tracking-widest ${
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
            className={`absolute z-10 bottom-4 left-12 p-2 md:p-4 pointer-events-auto transition-opacity duration-700 tracking-widest ${
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
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-fast-forward-icon lucide-fast-forward w-full h-full"
            >
              <path d="M12 6a2 2 0 0 1 3.414-1.414l6 6a2 2 0 0 1 0 2.828l-6 6A2 2 0 0 1 12 18z" />
              <path d="M2 6a2 2 0 0 1 3.414-1.414l6 6a2 2 0 0 1 0 2.828l-6 6A2 2 0 0 1 2 18z" />
            </svg>
          </button>
        </div>

        <div className="w-full h-full">
          <p
            className={`absolute bottom-8 left-1/2 -translate-x-1/2 text-xs md:text-sm transition-opacity duration-700 tracking-widest ${
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
            className={`absolute z-10 bottom-4 left-12 p-2 md:p-4 pointer-events-auto transition-opacity duration-700 tracking-widest ${
              phase === "gallery" && !isTransitioning
                ? "opacity-100 cursor-pointer"
                : "opacity-0 pointer-events-none"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 14 4 9l5-5" />
              <path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11" />
            </svg>
          </button>
        </div>

        {!isMobile && (
          <button
            data-cursor-hover
            data-cursor-text={`sound ${enableSound ? "off" : "on"}`}
            onClick={() => {
              setEnableSound(!enableSound);
              playSfx("click");
            }}
            className={`absolute bottom-4 right-12 p-2 md:p-4 pointer-events-auto transition-opacity duration-700 tracking-widest ${
              phase === "introPlaying" || phase === "detail" || isTransitioning
                ? "opacity-0 pointer-events-none"
                : "opacity-100 cursor-pointer"
            }`}
          >
            {!enableSound ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-volume-off-icon lucide-volume-off"
              >
                <path d="M16 9a5 5 0 0 1 .95 2.293" />
                <path d="M19.364 5.636a9 9 0 0 1 1.889 9.96" />
                <path d="m2 2 20 20" />
                <path d="m7 7-.587.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298V11" />
                <path d="M9.828 4.172A.686.686 0 0 1 11 4.657v.686" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-volume2-icon lucide-volume-2"
              >
                <path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z" />
                <path d="M16 9a5 5 0 0 1 0 6" />
                <path d="M19.364 18.364a9 9 0 0 0 0-12.728" />
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
