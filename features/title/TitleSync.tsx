"use client";

import { useStore } from "@/store/store";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import { galleryVideoSources } from "../canvas/core/source";

export default function TitleSync() {
  const { phase, nextSceneId, isTransitioning, currentWorkId } = useStore(
    useShallow((s) => ({
      phase: s.phase,
      nextSceneId: s.nextSceneId,
      isTransitioning: s.isTransitioning,
      currentWorkId: s.currentWorkId,
    }))
  );

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
