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

  const setOnNavigate = useRouterStore((state) => state.setOnNavigate);
  const setPhase = useStore((state) => state.setPhase);
  const setNextSceneId = useStore((state) => state.setNextSceneId);
  const setActiveSceneId = useStore((state) => state.setActiveSceneId);
  const setIsTransitioning = useStore((state) => state.setIsTransitioning);
  const setCursorVariant = useStore((state) => state.setCursorVariant);
  const setHoveredWorkId = useStore((state) => state.setHoveredWorkId);
  const setSceneTransitionProgress = useStore(
    (state) => state.setSceneTransitionProgress
  );
  const setIsAppNavigation = useRouterStore(
    (state) => state.setIsAppNavigation
  );
  const isAppNavigation = useRouterStore((state) => state.isAppNavigation);
  const onBackToGallery = useRouterStore((state) => state.onBackToGallery);
  const onBackToDetail = useRouterStore((state) => state.onBackToDetail);

  const pathname = usePathname();
  const router = useRouter();

  const prevPathname = useRef(pathname);
  const transitionTween = useRef<GSAPTween | null>(null);

  // 初回マウント時に initialPathname を設定, url変更関数を設定
  useEffect(() => {
    setInitialPathname(pathname);
    setOnNavigate((path: string) => {
      setIsAppNavigation(true);
      router.push(path.startsWith("/") ? path : `/${path}`);
    });
    isFirstMount.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // pathname が変更された時に シーン変更。 ここではブラウザの進む戻るボタンによる遷移
  useGSAP(() => {
    if (isFirstMount.current) return;

    // アプリ内遷移: transition をスキップし、ここで false に戻す
    if (isAppNavigation) {
      setIsAppNavigation(false);

      const state = getStateFromPathname(pathname);
      if (state) {
        setPhase(state.phase);
        setActiveSceneId(state.activeSceneId);
        setHoveredWorkId(null);
        setCursorVariant("default");
      }

      prevPathname.current = pathname;
      return;
    }

    const isIntroToGallery =
      prevPathname.current === "/" && pathname === "/gallery";
    const isGalleryToIntro =
      prevPathname.current === "/gallery" && pathname === "/";

    // gaallery ⇔ detail
    if (!isIntroToGallery && !isGalleryToIntro) {
      const state = getStateFromPathname(pathname);
      if (state && state.phase === "gallery") {
        onBackToGallery?.();
      } else if (state && state.phase === "detail") {
        onBackToDetail?.();
      } else if (state) {
        setPhase(state.phase);
        setActiveSceneId(state.activeSceneId);
        setHoveredWorkId(null);
        setCursorVariant("default");
      }

      prevPathname.current = pathname;
      return;
    }

    transitionTween.current?.kill();
    transitionTween.current = null;

    Experience.getInstance().world?.reset();

    if (isIntroToGallery) {
      setNextSceneId("gallery");
    } else if (isGalleryToIntro) {
      setNextSceneId("intro");
    }
    setCursorVariant("default");
    setIsTransitioning(true);

    const tmp = {
      value: isIntroToGallery ? 0 : 1,
    };
    transitionTween.current = gsap.to(tmp, {
      value: isIntroToGallery ? 1 : 0,
      duration: 0.5,
      ease: "power2.inOut",
      onUpdate: () => {
        setSceneTransitionProgress(tmp.value);
      },
      onComplete: () => {
        setPhase(isIntroToGallery ? "gallery" : "introReady");
        setActiveSceneId(isIntroToGallery ? "gallery" : "intro");
        setNextSceneId(null);
        setIsTransitioning(false);
      },
    });

    prevPathname.current = pathname;
  }, [pathname]);

  const getStateFromPathname = (pathname: string) => {
    if (pathname === "/") {
      return {
        phase: "introReady" as const,
        activeSceneId: "intro" as const,
      };
    }
    if (pathname === "/gallery") {
      return {
        phase: "gallery" as const,
        activeSceneId: "gallery" as const,
      };
    }
    if (pathname.startsWith("/gallery")) {
      return {
        phase: "detail" as const,
        activeSceneId: "gallery" as const,
      };
    }
    return null;
  };

  return null;
}
