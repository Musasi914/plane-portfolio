"use client";

import { playSfx } from "@/features/audio/sfx";
import Experience from "@/features/canvas/core/Experience";
import { useRouterStore, useStore } from "@/store/store";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { getIndexBySlug } from "@/features/canvas/core/utils/gallery";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useShallow } from "zustand/react/shallow";

export default function RouterSync() {
  const isFirstMount = useRef(true);

  const {
    setPhase,
    setNextSceneId,
    setActiveSceneId,
    setIsTransitioning,
    setCursorVariant,
    setHoveredWorkId,
    setSceneTransitionProgress,
  } = useStore(
    useShallow((s) => ({
      setPhase: s.setPhase,
      setNextSceneId: s.setNextSceneId,
      setActiveSceneId: s.setActiveSceneId,
      setIsTransitioning: s.setIsTransitioning,
      setCursorVariant: s.setCursorVariant,
      setHoveredWorkId: s.setHoveredWorkId,
      setSceneTransitionProgress: s.setSceneTransitionProgress,
    }))
  );

  const {
    setInitialPathname,
    setOnNavigate,
    setIsAppNavigation,
    isAppNavigation,
    onBackToGallery,
    onBackToDetail,
  } = useRouterStore(
    useShallow((s) => ({
      setInitialPathname: s.setInitialPathname,
      setOnNavigate: s.setOnNavigate,
      setIsAppNavigation: s.setIsAppNavigation,
      isAppNavigation: s.isAppNavigation,
      onBackToGallery: s.onBackToGallery,
      onBackToDetail: s.onBackToDetail,
    }))
  );

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
      playSfx("click");
      if (state && state.phase === "gallery") {
        onBackToGallery?.();
      } else if (state && state.phase === "detail") {
        const slug = pathname.match(/^\/gallery\/([^/]+)/)?.[1];
        const workIdFromUrl = slug !== undefined ? getIndexBySlug(slug) : -1;
        onBackToDetail?.(workIdFromUrl >= 0 ? workIdFromUrl : undefined);
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
    playSfx("scratch");

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
