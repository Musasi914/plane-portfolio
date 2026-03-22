"use client";

import { useStore } from "@/store/store";
import { useEffect } from "react";
import { galleryVideoSources } from "../canvas/core/source";

export default function TitleSync() {
  const phase = useStore((state) => state.phase);
  const nextSceneId = useStore((state) => state.nextSceneId);
  const isTransitioning = useStore((state) => state.isTransitioning);
  const currentWorkId = useStore((state) => state.currentWorkId);

  useEffect(() => {
    if (phase === "loading") {
      document.title = "Loading...";
      return;
    }
    if (phase === "introReady") {
      document.title = "ようこそ！";
      return;
    }
    if (phase === "introPlaying") {
      document.title = "moving...";
      return;
    }
    if (phase === "gallery") {
      const current = currentWorkId + 1;
      if (current === useStore.getState().videoCount + 1) {
        document.title = "ありがとうございました!";
      } else {
        const workName = galleryVideoSources[currentWorkId]?.name ?? "";
        document.title = `${current}/${
          useStore.getState().videoCount
        } - ${workName}`;
      }
      return;
    }
    if (phase === "detail") {
      const workName = galleryVideoSources[currentWorkId]?.name ?? "";
      document.title = `"${workName}"の紹介 !`;
      return;
    }
  }, [phase, nextSceneId, isTransitioning, currentWorkId]);
  return null;
}
