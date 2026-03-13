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

    this.camera = this.setCamera();

    this.scrollObserver = new ScrollObserver();

    const geometry = new THREE.TorusGeometry(1, 0.3, 16, 32);
    const material = new THREE.MeshBasicMaterial({ color: 0xe94560 });
    const mesh = new THREE.Mesh(geometry, material);
    this.scene.add(mesh);
  }

  private setCamera() {
    const camera = new THREE.PerspectiveCamera(
      this.experience.config.width / this.experience.config.height,
      0.1,
      1000
    );
    camera.position.set(0, 0, 5);
    camera.lookAt(0, 0, 0);
    return camera;
  }

  update() {
    // Gallery用のplane/スクロール更新は後で追加
    this.scrollObserver.update();
  }

  resize() {
    this.camera.aspect =
      this.experience.config.width / this.experience.config.height;
    this.camera.updateProjectionMatrix();
  }

  destroy() {
    this.scrollObserver?.destroy();
    this.scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        (child.material as THREE.Material).dispose();
      }
    });
    this.scene.clear();
  }
}
