"use client";

import { useStore } from "@/store/store";
import { startTransition, useEffect, useState } from "react";

export default function DetailContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const phase = useStore((state) => state.phase);
  const isTransitioning = useStore((state) => state.isTransitioning);
  useEffect(() => {
    if (
      (phase === "galleryDetail" && isTransitioning) ||
      (phase !== "loading" && !isTransitioning)
    ) {
      startTransition(() => {
        setIsVisible(true);
      });
    }
  }, [phase, isTransitioning]);
  return (
    <div
      className={`transition-opacity duration-300 opacity-0 ${
        isVisible ? "opacity-100" : ""
      }`}
    >
      {children}
    </div>
  );
}
