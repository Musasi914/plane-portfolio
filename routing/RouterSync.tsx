"use client";

import Experience from "@/features/canvas/core/Experience";
import { useRouterStore, useStore } from "@/store/store";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

export default function RouterSync() {
  const setInitialPathname = useRouterStore(
    (state) => state.setInitialPathname
  );
  const isFirstMount = useRef(true);
  const isAppNavigation = useRef(false);

  const setOnNavigate = useRouterStore((state) => state.setOnNavigate);
  const setPhase = useStore((state) => state.setPhase);
  const setNextSceneId = useStore((state) => state.setNextSceneId);
  const setActiveSceneId = useStore((state) => state.setActiveSceneId);
  const setIsTransitioning = useStore((state) => state.setIsTransitioning);
  const setCursorVariant = useStore((state) => state.setCursorVariant);
  const setSceneTransitionProgress = useStore(
    (state) => state.setSceneTransitionProgress
  );

  const activeSceneId = useStore((state) => state.activeSceneId);

  const pathname = usePathname();
  const router = useRouter();

  // 初回マウント時に initialPathname を設定, url変更関数を設定
  useEffect(() => {
    isAppNavigation.current = true;
    setInitialPathname(pathname);
    setOnNavigate((path: string) =>
      router.push(path.startsWith("/") ? path : `/${path}`)
    );
    isFirstMount.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // pathname が変更された時に シーン変更
  useGSAP(() => {
    if (isFirstMount.current) return;
    if (isAppNavigation.current) {
      isAppNavigation.current = false;
      return;
    }

    Experience.getInstance().world?.reset();

    if (pathname === "/") {
      setNextSceneId("intro");
      setCursorVariant("default");
      setIsTransitioning(true);
    } else if (pathname === "/gallery") {
      setNextSceneId("gallery");
      setCursorVariant("default");
      setIsTransitioning(true);
    }

    const tmp = {
      value: activeSceneId === "intro" ? 0 : 1,
    };
    gsap.to(tmp, {
      value: activeSceneId === "intro" ? 1 : 0,
      duration: 1,
      ease: "power2.inOut",
      onUpdate: () => {
        setSceneTransitionProgress(tmp.value);
      },
      onComplete: () => {
        setPhase(activeSceneId === "intro" ? "gallery" : "introReady");
        setActiveSceneId(activeSceneId === "intro" ? "gallery" : "intro");
        setNextSceneId(null);
        setIsTransitioning(false);
      },
    });
  }, [pathname]);

  return null;
}
