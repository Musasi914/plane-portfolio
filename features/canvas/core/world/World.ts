import Experience from "../Experience";
import { useStore, type SceneId } from "@/store/store";
import { IntroScene } from "./scenes/intro/IntroScene";
import { GalleryScene } from "./scenes/gallery/GalleryScene";
import type { RenderState } from "../types/renderState";
export class World {
  experience: Experience;
  introScene: IntroScene | null = null;
  galleryScene: GalleryScene | null = null;

  constructor() {
    this.experience = Experience.getInstance();

    this.introScene = new IntroScene();
    this.galleryScene = new GalleryScene();
  }

  getRenderState(): RenderState | null {
    const state = useStore.getState();
    const { activeSceneId, nextSceneId, sceneTransitionProgress } = state;

    if (!this.introScene || !this.galleryScene) return null;

    const getScene = (id: SceneId) => {
      return id === "intro"
        ? { scene: this.introScene!.scene, camera: this.introScene!.camera }
        : {
            scene: this.galleryScene!.scene,
            camera: this.galleryScene!.camera,
          };
    };

    const active = getScene(activeSceneId);
    const next = nextSceneId ? getScene(nextSceneId) : null;

    return {
      active,
      next,
      transitionProgress: sceneTransitionProgress,
    };
  }

  resize() {
    this.introScene?.resize();
    this.galleryScene?.resize();
  }

  update() {
    const state = useStore.getState();
    const { activeSceneId, nextSceneId } = state;

    if (activeSceneId === "intro") {
      this.introScene?.update();
    } else {
      this.galleryScene?.update();
    }

    if (nextSceneId) {
      if (nextSceneId === "intro") {
        this.introScene?.update();
      } else {
        this.galleryScene?.update();
      }
    }
  }

  destroy() {
    this.introScene?.destroy();
    this.galleryScene?.destroy();
    this.introScene = null;
    this.galleryScene = null;
  }

  reset() {
    this.introScene?.reset();
    this.galleryScene?.reset();
  }
}
