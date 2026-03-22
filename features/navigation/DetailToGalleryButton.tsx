"use client";

import { useRouterStore } from "@/store/store";

export default function DetailToGalleryButton() {
  const onBackToGallery = useRouterStore((state) => state.onBackToGallery);
  const onClick = () => {
    onBackToGallery?.();
  };
  return (
    <button
      data-cursor-hover
      data-cursor-text="< back"
      onClick={onClick}
      className="fixed bottom-4 right-0 left-0 mx-auto grid grid-cols-1 grid-rows-1 place-items-center rounded-full w-16 h-16 bg-foreground cursor-pointer pointer-events-auto opacity-80 hover:opacity-100 transition-opacity duration-300"
    >
      <span className="col-start-1 row-start-1 col-span-1 row-span-1 block w-1/2 h-px bg-background rotate-45"></span>
      <span className="col-start-1 row-start-1 col-span-1 row-span-1 block w-1/2 h-px bg-background -rotate-45"></span>
    </button>
  );
}
