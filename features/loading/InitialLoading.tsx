"use client";

import { useStore } from "@/store/store";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef, useState } from "react";

export default function InitialLoading() {
  const [isLoading, setIsLoading] = useState(true);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const fadeStartedRef = useRef(false);
  const phase = useStore((state) => state.phase);
  useGSAP(
    () => {
      if (fadeStartedRef.current) return;
      if (phase !== "loading" && wrapperRef.current) {
        fadeStartedRef.current = true;
        gsap.to(wrapperRef.current, {
          opacity: 0,
          duration: 3,
          ease: "power4.inOut",
          onComplete: () => {
            setIsLoading(false);
          },
        });
      }
    },
    { dependencies: [phase] }
  );
  if (!isLoading) return null;
  return (
    <div
      ref={wrapperRef}
      className="fixed inset-0 z-40 flex items-center justify-center"
    >
      <h1 className="text-xl relative z-10">loading</h1>
    </div>
  );
}
