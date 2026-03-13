"use client";

import { useStore } from "@/store/store";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const isMobile = useStore((state) => state.isMobile);
  useGSAP((_, contextSafe) => {
    if (!contextSafe || isMobile || !cursorRef.current) return;

    const el = cursorRef.current;
    gsap.set(el, { xPercent: -50, yPercent: -50 });

    const xSetter = gsap.quickSetter(el, "x", "px");
    const ySetter = gsap.quickSetter(el, "y", "px");

    let hasMoved = false;
    const onMouseMove = contextSafe((e: MouseEvent) => {
      if (!hasMoved) {
        hasMoved = true;
        gsap.set(el, { opacity: 1 });
      }
      xSetter(e.clientX);
      ySetter(e.clientY);
    });

    window.addEventListener("mousemove", onMouseMove);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
    };
  });

  if (isMobile) return null;

  return (
    <div
      ref={cursorRef}
      className="opacity-0 w-4 h-4 bg-black rounded-full fixed top-0 left-0 z-50 pointer-events-none"
    ></div>
  );
}
