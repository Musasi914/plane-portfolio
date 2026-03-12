import Experience from "../../Experience";
import * as THREE from "three";
import type { SceneLike } from "../../types/sceneLike";

export class GalleryScene implements SceneLike {
  experience: Experience;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;

  constructor() {
    this.experience = Experience.getInstance();
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x16213e);

    this.camera = new THREE.PerspectiveCamera(
      75,
      this.experience.config.width / this.experience.config.height,
      0.1,
      1000
    );
    this.camera.position.set(0, 0, 5);
    this.camera.lookAt(0, 0, 0);

    const geometry = new THREE.TorusGeometry(1, 0.3, 16, 32);
    const material = new THREE.MeshBasicMaterial({ color: 0xe94560 });
    const mesh = new THREE.Mesh(geometry, material);
    this.scene.add(mesh);
  }

  update() {
    // Gallery用のplane/スクロール更新は後で追加
  }

  resize() {
    this.camera.aspect =
      this.experience.config.width / this.experience.config.height;
    this.camera.updateProjectionMatrix();
  }

  destroy() {
    this.scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        (child.material as THREE.Material).dispose();
      }
    });
    this.scene.clear();
  }
}
