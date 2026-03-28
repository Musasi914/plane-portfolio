"use client";

import { useRouterStore, useStore } from "@/store/store";
import { startTransition, useEffect, useRef, useState } from "react";
import { galleryVideoSources } from "../canvas/core/source";
import { ScrollObserver } from "../canvas/core/world/scenes/gallery/ScrollObserver";
import GalleryPlanes from "../canvas/core/world/scenes/gallery/GalleryPlanes";
import { playSfx } from "../audio/sfx";

const TabButton = ({
  isActive,
  onClick,
  title,
}: {
  isActive: boolean;
  onClick: () => void;
  title: string;
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (isActive) {
      buttonRef.current?.focus();
    }
  }, [isActive]);
  return (
    <button
      ref={buttonRef}
      aria-label={title}
      onClick={onClick}
      tabIndex={isActive ? 0 : -1}
      className={`size-4 rounded-full border border-foreground/10 ${
        isActive ? "bg-foreground border-2 border-white size-6" : "bg-white"
      }`}
    ></button>
  );
};

export default function GalleryFocusPanel() {
  const [isVisible, setIsVisible] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const videoCount = useStore((state) => state.videoCount);
  const setCurrentWorkId = useStore((state) => state.setCurrentWorkId);
  const handleKeyDown = (e: React.KeyboardEvent<HTMLUListElement>) => {
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      setFocusedIndex(
        (prev) => (prev === null ? 0 : prev + 1) % (videoCount + 1)
      );
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      setFocusedIndex((prev) =>
        prev === null ? videoCount : prev - 1 < 0 ? videoCount : prev - 1
      );
    } else if (e.key === "Tab" && !e.shiftKey) {
      e.preventDefault();
      (
        document.querySelector(
          'button[data-cursor-text="< top"]'
        ) as HTMLButtonElement
      )?.focus();
    }
  };

  useEffect(() => {
    if (focusedIndex === null) return;
    const workId = focusedIndex;
    setCurrentWorkId(workId);
    if (ScrollObserver.getInstance()) {
      ScrollObserver.getInstance().targetScroll =
        workId * GalleryPlanes.PLANE_DISTANCE;
    }
  }, [focusedIndex, setCurrentWorkId]);

  const isUseFocusTab = useStore((state) => state.isUseFocusTab);
  const currentWorkId = useStore((state) => state.currentWorkId);
  const setIsUseFocusTab = useStore((state) => state.setIsUseFocusTab);

  useEffect(() => {
    if (!isUseFocusTab) return;
    startTransition(() => {
      setFocusedIndex(currentWorkId);
      setIsUseFocusTab(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUseFocusTab]);

  const onClick = (index: number) => {
    if (index === videoCount) return;
    const scrollObserver = ScrollObserver.getInstance();
    const galleryPlanes = GalleryPlanes.getInstance();

    if (!scrollObserver || !galleryPlanes) return;

    playSfx("click");

    useStore.getState().setIsTransitioning(true);
    useStore.getState().setCursorVariant("default");
    //サイト遷移
    scrollObserver.saveGalleryScroll();
    useStore.getState().setPhase("galleryDetail");
    galleryPlanes.moveToDetail(index);
    useRouterStore.getState().setPrevWorkId(index);
  };

  return (
    <div className="w-full h-screen grid justify-start items-center content-center grid-cols-[auto_auto] p-2 md:p-4">
      <ul
        tabIndex={1}
        onFocus={() => {
          setIsVisible(true);
        }}
        onBlur={() => {
          setIsVisible(false);
        }}
        onKeyDown={handleKeyDown}
        className={`h-full pointer-events-auto grid justify-center justify-items-center gap-2 p-2 transition-opacity duration-700 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        {Array.from({ length: videoCount + 1 }).map((_, index) => (
          <li key={galleryVideoSources[index]?.slug ?? `work-${index}`}>
            <section
              aria-current={index === focusedIndex ? "page" : undefined}
              aria-labelledby={`work-${index}-title`}
            >
              <h2 id={`work-${index}-title`} className="sr-only">
                {galleryVideoSources[index]?.name ??
                  "最後まで見ていただきありがとうございました"}
              </h2>
              <TabButton
                title={
                  galleryVideoSources[index]?.name ??
                  "最後まで見ていただきありがとうございました"
                }
                isActive={index === focusedIndex}
                onClick={() => onClick(index)}
              />
            </section>
          </li>
        ))}
      </ul>
      <p
        style={{
          writingMode: "vertical-rl",
          textOrientation: "upright",
          whiteSpace: "pre-line",
          fontFeatureSettings: "palt",
        }}
        className={`text-sm transition-[opacity,visibility] duration-700 ${
          isVisible ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      >
        矢印キーで移動
      </p>
    </div>
  );
}
