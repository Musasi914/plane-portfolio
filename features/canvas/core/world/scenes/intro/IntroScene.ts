import Experience from "../../../Experience";
import * as THREE from "three";
import type { SceneLike } from "../../../types/sceneLike";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { Face } from "./Face";

export class IntroScene implements SceneLike {
  private experience: Experience;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  private orbitControls: OrbitControls | null = null;

  private face: Face;

  constructor() {
    this.experience = Experience.getInstance();
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xffffff);

    this.camera = this.setCamera();

    this.createLight();

    this.face = new Face(this.scene);
  }

  private setCamera() {
    const camera = new THREE.PerspectiveCamera(
      75,
      this.experience.config.width / this.experience.config.height,
      0.1,
      1000
    );
    camera.position.set(0, 0, 500);
    camera.lookAt(0, 0, 0);

    this.orbitControls = new OrbitControls(
      camera,
      this.experience.canvasWrapper
    );

    return camera;
  }

  private createLight() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 3);
    this.scene.add(ambientLight);
  }

  update() {
    // Intro用のアニメーションは後で追加
  }

  resize() {
    this.camera.aspect =
      this.experience.config.width / this.experience.config.height;
    this.camera.updateProjectionMatrix();
  }

  destroy() {
    this.face.destroy();
    this.scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        (child.material as THREE.Material).dispose();
      }
    });
    this.scene.clear();
  }
}
