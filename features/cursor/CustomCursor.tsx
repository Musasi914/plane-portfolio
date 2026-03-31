"use client";

import { useClientDeviceStore, useStore } from "@/store/store";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";
import { useShallow } from "zustand/react/shallow";
import { playSfx } from "../audio/sfx";

const CURSOR_SELECTOR = "[data-cursor-hover]";
const CURSOR_TEXT_SELECTOR = "data-cursor-text";

export default function CustomCursor() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const {
    isMobile,
    cursorVariant,
    setCursorVariant,
    cursorText,
    setCursorText,
  } = useStore(
    useShallow((s) => ({
      isMobile: s.isMobile,
      cursorVariant: s.cursorVariant,
      setCursorVariant: s.setCursorVariant,
      cursorText: s.cursorText,
      setCursorText: s.setCursorText,
    }))
  );

  useGSAP(
    (_, contextSafe) => {
      if (!contextSafe || isMobile || !wrapperRef.current) return;

      const el = wrapperRef.current;
      gsap.set(el, { xPercent: -50, yPercent: -50 });

      const xTo = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3" });

      let hasMoved = false;
      const onMouseMove = contextSafe((e: MouseEvent) => {
        if (!hasMoved) {
          hasMoved = true;
          // gsap.set(el, { opacity: 1 });
        }
        xTo(e.clientX);
        yTo(e.clientY);
      });

      const onMouseOver = contextSafe((e: MouseEvent) => {
        const target = (e.target as Element)?.closest?.(CURSOR_SELECTOR);
        if (target) {
          setCursorVariant("hover");
          setCursorText(target.getAttribute(CURSOR_TEXT_SELECTOR) || "");
        }
      });
      const onMouseOut = contextSafe((e: MouseEvent) => {
        const relatedTarget = e.relatedTarget as Node | null;
        const isStillHovering =
          relatedTarget &&
          document.contains(relatedTarget) &&
          (relatedTarget as Element).closest?.(CURSOR_SELECTOR);
        if (!isStillHovering) setCursorVariant("default");
      });

      window.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseover", onMouseOver);
      document.addEventListener("mouseout", onMouseOut);

      return () => {
        window.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseover", onMouseOver);
        document.removeEventListener("mouseout", onMouseOut);
      };
    },
    [isMobile, setCursorVariant]
  );

  const opacityTween = useRef<GSAPTween | null>(null);
  const device = useClientDeviceStore((state) => state.device);
  useGSAP(
    () => {
      if (isMobile || !cursorRef.current) return;

      if (cursorVariant === "hover") {
        playSfx("hover");
      }

      opacityTween.current?.kill();

      document.body.style.cursor =
        cursorVariant === "hover" ? "pointer" : "default";

      gsap.to(cursorRef.current, {
        scale: cursorVariant === "hover" ? 3 : 1,
        duration: 0.8,
        ease: "elastic.out",
      });

      if (cursorVariant === "hover") {
        if (!(device === "safari" || device === "firefox")) {
          gsap.fromTo(
            cursorRef.current,
            {
              boxShadow: "inset 0rem 0rem 0.3125rem 0.125rem #ffffff",
            },
            {
              boxShadow: "inset 0rem 0rem 0.4375rem 0.25rem #ffffff",
              duration: 1,
              repeat: -1,
              yoyo: true,
              ease: "none",
            }
          );
        }

        gsap.set(wrapperRef.current, {
          opacity: 1,
        });
      } else {
        opacityTween.current = gsap.to(wrapperRef.current, {
          opacity: 0,
          duration: 0.2,
        });
      }
    },
    { dependencies: [cursorVariant] }
  );

  if (isMobile) return null;

  return (
    <div
      ref={wrapperRef}
      className="opacity-0 w-8 h-8 fixed z-50 pointer-events-none flex items-center justify-center"
    >
      <div
        ref={cursorRef}
        className="w-full h-full rounded-full origin-center bg-black/50 grid place-items-center"
      >
        <span className="text-white text-[0.25rem] tracking-wide text-center p-1">
          {cursorText}
        </span>
      </div>
    </div>
  );
}
