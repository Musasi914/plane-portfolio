import * as THREE from "three";
import Experience from "../../../Experience";
import type { SceneLike } from "../../../types/sceneLike";
import { ScrollObserver } from "./ScrollObserver";

export class GalleryScene implements SceneLike {
  private experience: Experience;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;

  private scrollObserver: ScrollObserver;

  constructor() {
    this.experience = Experience.getInstance();
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xffffff);

    this.camera = this.setCamera(75, 5, 1000);

    this.scrollObserver = new ScrollObserver();
  }

  private setCamera(fov: number, near: number, far: number) {
    const camera = new THREE.PerspectiveCamera(
      fov,
      this.experience.config.width / this.experience.config.height,
      near,
      far
    );
    const distance =
      this.experience.config.height /
      (2 * Math.tan(((fov / 2) * Math.PI) / 180));

    camera.position.set(0, 0, distance);
    camera.lookAt(0, 0, 0);

    return camera;
  }

  resize() {
    this.camera.aspect =
      this.experience.config.width / this.experience.config.height;
    this.camera.updateProjectionMatrix();
  }

  update() {
    // Gallery用のplane/スクロール更新は後で追加
    this.scrollObserver.update();
  }

  destroy() {
    this.scrollObserver.destroy();
    this.scene.clear();
  }
}
