import Experience from "../Experience";
import { useStore, type SceneId } from "@/store/store";
import { IntroScene } from "./scenes/intro/IntroScene";
import { GalleryScene } from "./scenes/gallery/GalleryScene";
import type { RenderState } from "../types/renderState";
import { Resource } from "../base/Resource";
import * as THREE from "three";
export class World {
  experience: Experience;
  resource: Resource;
  introScene: IntroScene | null = null;
  galleryScene: GalleryScene | null = null;

  constructor() {
    this.experience = Experience.getInstance();
    this.resource = this.experience.resource;

    this.resource.on("ready", this.onResourceReady.bind(this));
  }
  private onResourceReady() {
    this.introScene = new IntroScene();
    this.galleryScene = new GalleryScene();
    useStore.getState().setPhase("introReady");
  }

  getRenderState(): RenderState {
    const state = useStore.getState();
    const { activeSceneId, nextSceneId, sceneTransitionProgress } = state;

    const getScene = (id: SceneId) => {
      if (!this.introScene || !this.galleryScene) {
        return {
          scene: new THREE.Scene(),
          camera: new THREE.PerspectiveCamera(),
        };
      }

      return id === "intro"
        ? { scene: this.introScene.scene, camera: this.introScene.camera }
        : { scene: this.galleryScene.scene, camera: this.galleryScene.camera };
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
    this.resource.off("ready");
    this.introScene?.destroy();
    this.galleryScene?.destroy();
    this.introScene = null;
    this.galleryScene = null;
  }
}
