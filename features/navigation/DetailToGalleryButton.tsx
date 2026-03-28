"use client";

import { useRouterStore, useStore } from "@/store/store";
import { playSfx } from "../audio/sfx";
import { useRef } from "react";

export default function DetailToGalleryButton() {
  const onBackToGallery = useRouterStore((state) => state.onBackToGallery);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const onClick = () => {
    onBackToGallery?.();
    playSfx("click");
  };
  const onKeyDown = useStore((state) => state.onKeyDown);
  return (
    <button
      ref={buttonRef}
      data-cursor-hover
      data-cursor-text="< back"
      onClick={onClick}
      onKeyDown={(e) => onKeyDown(e)}
      className="fixed bottom-4 right-0 left-0 mx-auto grid grid-cols-1 grid-rows-1 place-items-center rounded-full size-12 sm:size-14 bg-foreground cursor-pointer pointer-events-auto opacity-80 hover:opacity-100 transition-opacity duration-300"
      aria-label="galleryへ戻る"
    >
      <span className="col-start-1 row-start-1 col-span-1 row-span-1 block w-1/2 h-px bg-background rotate-45"></span>
      <span className="col-start-1 row-start-1 col-span-1 row-span-1 block w-1/2 h-px bg-background -rotate-45"></span>
    </button>
  );
}
