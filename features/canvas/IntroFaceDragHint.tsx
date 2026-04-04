"use client";

import { useStore } from "@/store/store";
import { useShallow } from "zustand/react/shallow";

export default function IntroFaceDragHint() {
  const { phase, isTransitioning, isMobile, introFaceDragHintDismissed } =
    useStore(
      useShallow((s) => ({
        phase: s.phase,
        isTransitioning: s.isTransitioning,
        isMobile: s.isMobile,
        introFaceDragHintDismissed: s.introFaceDragHintDismissed,
      }))
    );

  const visible =
    phase === "introReady" &&
    !isTransitioning &&
    !isMobile &&
    !introFaceDragHintDismissed;

  return (
    <div
      id="face-drag-hint"
      className={`absolute flex -translate-x-1/2 flex-col items-center gap-2 text-center pointer-events-none transition-[opacity,visibility] ${
        visible ? "opacity-100 visible" : "opacity-0 invisible"
      } duration-700 delay-300`}
    >
      <div className="intro-face-drag-hint-icon">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12.586 12.586 19 19" />
          <path d="M3.688 3.037a.497.497 0 0 0-.651.651l6.5 15.999a.501.501 0 0 0 .947-.062l1.569-6.083a2 2 0 0 1 1.448-1.479l6.124-1.579a.5.5 0 0 0 .063-.947z" />
        </svg>
      </div>
    </div>
  );
}
