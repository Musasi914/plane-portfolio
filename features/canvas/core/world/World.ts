import Experience from "../Experience";
import { useStore, type SceneId } from "@/store/store";
import { IntroScene } from "./scenes/IntroScene";
import { GalleryScene } from "./scenes/GalleryScene";
import type { RenderState } from "../types/renderState";

export class World {
  experience: Experience;
  introScene: IntroScene;
  galleryScene: GalleryScene;

  constructor() {
    this.experience = Experience.getInstance();
    this.introScene = new IntroScene();
    this.galleryScene = new GalleryScene();
  }

  getRenderState(): RenderState {
    const state = useStore.getState();
    const { activeSceneId, nextSceneId, sceneTransitionProgress } = state;

    const getScene = (id: SceneId) =>
      id === "intro"
        ? { scene: this.introScene.scene, camera: this.introScene.camera }
        : { scene: this.galleryScene.scene, camera: this.galleryScene.camera };

    const active = getScene(activeSceneId);
    const next = nextSceneId ? getScene(nextSceneId) : null;

    return {
      active,
      next,
      transitionProgress: sceneTransitionProgress,
    };
  }

  resize() {
    this.introScene.resize();
    this.galleryScene.resize();
  }

  update() {
    const state = useStore.getState();
    const { activeSceneId, nextSceneId } = state;

    if (activeSceneId === "intro") {
      this.introScene.update();
    } else {
      this.galleryScene.update();
    }

    if (nextSceneId) {
      if (nextSceneId === "intro") {
        this.introScene.update();
      } else {
        this.galleryScene.update();
      }
    }
  }

  destroy() {
    this.introScene.destroy();
    this.galleryScene.destroy();
  }
}
