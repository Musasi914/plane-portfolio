import { create } from "zustand";

export type SceneId = "intro" | "gallery";

export type StoreType = {
  phase:
    | "loading"
    | "introReady"
    | "introPlaying"
    | "gallery"
    | "galleryDetail"
    | "detail";
  setPhase: (phase: StoreType["phase"]) => void;

  currentWorkId: number;
  setCurrentWorkId: (currentWorkId: number) => void;

  hoveredWorkId: number | null;
  setHoveredWorkId: (hoveredWorkId: number | null) => void;

  // work から detail への遷移中かどうか
  isTransitioning: boolean;
  setIsTransitioning: (isTransitioning: boolean) => void;

  sceneTransitionProgress: number;
  setSceneTransitionProgress: (sceneTransitionProgress: number) => void;

  /** 現在表示中のシーン (Intro/Gallery) */
  activeSceneId: SceneId;
  setActiveSceneId: (activeSceneId: SceneId) => void;

  /** 遷移先シーン。null = 遷移していない */
  nextSceneId: SceneId | null;
  setNextSceneId: (nextSceneId: SceneId | null) => void;

  isMobile: boolean;
  setIsMobile: (isMobile: boolean) => void;

  /** OS「視覚効果を減らす」が有効（prefers-reduced-motion: reduce） */
  prefersReducedMotion: boolean;
  setPrefersReducedMotion: (prefersReducedMotion: boolean) => void;

  introFaceDragHintDismissed: boolean;
  setIntroFaceDragHintDismissed: (introFaceDragHintDismissed: boolean) => void;

  qualityTier: "low" | "medium" | "high";
  setQualityTier: (qualityTier: StoreType["qualityTier"]) => void;

  cursorVariant: "default" | "hover";
  setCursorVariant: (cursorVariant: StoreType["cursorVariant"]) => void;

  cursorText: string;
  setCursorText: (cursorText: StoreType["cursorText"]) => void;

  // video
  videoCount: number;
  setVideoCount: (videoCount: number) => void;

  // volume
  enableSound: boolean;
  setEnableSound: (enableSound: boolean) => void;

  // focus
  isUseFocusTab: boolean;
  setIsUseFocusTab: (isUseFocusTab: boolean) => void;
  onKeyDown: (e: Pick<KeyboardEvent, "key">) => void;
};

export const useStore = create<StoreType>((set) => ({
  phase: "loading",
  setPhase: (phase) => set({ phase }),

  // Works
  currentWorkId: 0,
  setCurrentWorkId: (currentWorkId) => set({ currentWorkId }),

  hoveredWorkId: null,
  setHoveredWorkId: (hoveredWorkId) => set({ hoveredWorkId }),

  // シーン管理
  activeSceneId: "intro",
  setActiveSceneId: (activeSceneId) => set({ activeSceneId }),

  nextSceneId: null,
  setNextSceneId: (nextSceneId) => set({ nextSceneId }),

  isTransitioning: false,
  setIsTransitioning: (isTransitioning) => set({ isTransitioning }),

  sceneTransitionProgress: 0,
  setSceneTransitionProgress: (sceneTransitionProgress) =>
    set({ sceneTransitionProgress }),

  // デバイス、品質管理
  isMobile: false,
  setIsMobile: (isMobile) => set({ isMobile }),

  prefersReducedMotion: false,
  setPrefersReducedMotion: (prefersReducedMotion) =>
    set({ prefersReducedMotion }),

  introFaceDragHintDismissed: false,
  setIntroFaceDragHintDismissed: (introFaceDragHintDismissed) =>
    set({ introFaceDragHintDismissed }),

  qualityTier: "high",
  setQualityTier: (qualityTier) => set({ qualityTier }),

  // cursor
  cursorVariant: "default",
  setCursorVariant: (cursorVariant) => set({ cursorVariant }),

  cursorText: "",
  setCursorText: (cursorText) => set({ cursorText }),

  // video
  videoCount: 1,
  setVideoCount: (videoCount) => set({ videoCount }),

  //volume
  enableSound: false,
  setEnableSound: (enableSound) => set({ enableSound }),

  // focus
  isUseFocusTab: false,
  setIsUseFocusTab: (isUseFocusTab) => set({ isUseFocusTab }),
  onKeyDown: (e: Pick<KeyboardEvent, "key">) => {
    if (e.key === "Enter" || e.key === " ") {
      set({ isUseFocusTab: true });
    }
  },
}));

type RouterStoreType = {
  initialPathname: string;
  setInitialPathname: (initialPathname: string) => void;

  onNavigate: ((path: string) => void) | null;
  setOnNavigate: (onNavigate: RouterStoreType["onNavigate"]) => void;

  isAppNavigation: boolean;
  setIsAppNavigation: (isAppNavigation: boolean) => void;

  onBackToGallery: (() => void) | null;
  setOnBackToGallery: (
    onBackToGallery: RouterStoreType["onBackToGallery"]
  ) => void;

  onBackToDetail: (() => void) | null;
  setOnBackToDetail: (
    onBackToDetail: RouterStoreType["onBackToDetail"]
  ) => void;

  onGoToIntro: (() => void) | null;
  setOnGoToIntro: (onGoToIntro: RouterStoreType["onGoToIntro"]) => void;

  onGoToGallery: (() => void) | null;
  setOnGoToGallery: (onGoToGallery: RouterStoreType["onGoToGallery"]) => void;

  prevWorkId: number | null;
  setPrevWorkId: (prevWorkId: number | null) => void;
};

export const useRouterStore = create<RouterStoreType>((set) => ({
  initialPathname: "/",
  setInitialPathname: (initialPathname) => set({ initialPathname }),

  onNavigate: null,
  setOnNavigate: (onNavigate) => set({ onNavigate }),

  isAppNavigation: false,
  setIsAppNavigation: (isAppNavigation) => set({ isAppNavigation }),

  onBackToGallery: null,
  setOnBackToGallery: (onBackToGallery) => set({ onBackToGallery }),

  onBackToDetail: null,
  setOnBackToDetail: (onBackToDetail) => set({ onBackToDetail }),

  onGoToIntro: null,
  setOnGoToIntro: (onGoToIntro) => set({ onGoToIntro }),

  onGoToGallery: null,
  setOnGoToGallery: (onGoToGallery) => set({ onGoToGallery }),

  prevWorkId: null,
  setPrevWorkId: (prevWorkId) => set({ prevWorkId }),
}));

type ClientDeviceStoreType = {
  device: "chrome" | "safari" | "firefox" | "edge" | "other";
  setDevice: (device: ClientDeviceStoreType["device"]) => void;
};

export const useClientDeviceStore = create<ClientDeviceStoreType>((set) => ({
  device: "chrome",
  setDevice: (device) => set({ device }),
}));
