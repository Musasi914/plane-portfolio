"use client";

import { useStore } from "@/store/store";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";
import { playSfx } from "../audio/sfx";

const CURSOR_SELECTOR = "[data-cursor-hover]";
const CURSOR_TEXT_SELECTOR = "data-cursor-text";

export default function CustomCursor() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const isMobile = useStore((state) => state.isMobile);
  const cursorVariant = useStore((state) => state.cursorVariant);
  const setCursorVariant = useStore((state) => state.setCursorVariant);
  const cursorText = useStore((state) => state.cursorText);
  const setCursorText = useStore((state) => state.setCursorText);

  useGSAP(
    (_, contextSafe) => {
      if (!contextSafe || isMobile || !wrapperRef.current) return;

      const el = wrapperRef.current;
      gsap.set(el, { xPercent: -50, yPercent: -50 });

      const xSetter = gsap.quickSetter(el, "x", "px");
      const ySetter = gsap.quickSetter(el, "y", "px");

      let hasMoved = false;
      const onMouseMove = contextSafe((e: MouseEvent) => {
        if (!hasMoved) {
          hasMoved = true;
          // gsap.set(el, { opacity: 1 });
        }
        xSetter(e.clientX);
        ySetter(e.clientY - 8);
      });
      const onMouseLeave = contextSafe(() => {
        if (!el) return;
        gsap.set(el, { opacity: 0 });
        hasMoved = false;
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
      document.documentElement.addEventListener("mouseleave", onMouseLeave);
      document.addEventListener("mouseover", onMouseOver);
      document.addEventListener("mouseout", onMouseOut);

      return () => {
        window.removeEventListener("mousemove", onMouseMove);
        document.documentElement.removeEventListener(
          "mouseleave",
          onMouseLeave
        );
        document.removeEventListener("mouseover", onMouseOver);
        document.removeEventListener("mouseout", onMouseOut);
      };
    },
    [isMobile, setCursorVariant]
  );

  const opacityTween = useRef<GSAPTween | null>(null);
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
        // backgroundColor: cursorVariant === "hover" ? "#ffffff" : "#000000",
        duration: 0.8,
        ease: "elastic.out",
      });

      if (cursorVariant === "hover") {
        gsap.fromTo(
          cursorRef.current,
          {
            boxShadow: "inset 0px 0px 5px 2px #ffffff",
          },
          {
            boxShadow: "inset 0px 0px 7px 4px #ffffff",
            duration: 1,
            repeat: -1,
            yoyo: true,
            ease: "none",
          }
        );

        gsap.set(wrapperRef.current, {
          // mixBlendMode: cursorVariant === "hover" ? "difference" : "normal",
          opacity: 1,
        });
      } else {
        opacityTween.current = gsap.to(wrapperRef.current, {
          // mixBlendMode: cursorVariant === "hover" ? "difference" : "normal",
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
        <span className="text-white text-[4px] tracking-wide text-center p-1">
          {cursorText}
        </span>
      </div>
    </div>
  );
}
