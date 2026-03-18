import { create } from "zustand";

export type SceneId = "intro" | "gallery";

export type StoreType = {
  phase: "loading" | "introReady" | "introPlaying" | "gallery" | "detail";
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

  qualityTier: "low" | "medium" | "high";
  setQualityTier: (qualityTier: StoreType["qualityTier"]) => void;

  cursorVariant: "default" | "hover";
  setCursorVariant: (cursorVariant: StoreType["cursorVariant"]) => void;

  // video
  videoCount: number;
  setVideoCount: (videoCount: number) => void;
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

  qualityTier: "high",
  setQualityTier: (qualityTier) => set({ qualityTier }),

  // cursor
  cursorVariant: "default",
  setCursorVariant: (cursorVariant) => set({ cursorVariant }),

  // video
  videoCount: 1,
  setVideoCount: (videoCount) => set({ videoCount }),
}));

type RouterStoreType = {
  initialPathname: string;
  setInitialPathname: (initialPathname: string) => void;

  onNavigate: ((path: string) => void) | null;
  setOnNavigate: (onNavigate: RouterStoreType["onNavigate"]) => void;
};

export const useRouterStore = create<RouterStoreType>((set) => ({
  initialPathname: "/",
  setInitialPathname: (initialPathname) => set({ initialPathname }),

  onNavigate: null,
  setOnNavigate: (onNavigate) => set({ onNavigate }),
}));
