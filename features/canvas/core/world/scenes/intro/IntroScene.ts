import Experience from "../../../Experience";
import * as THREE from "three";
import type { SceneLike } from "../../../types/sceneLike";
import { Face } from "./Face";
import NamePlane from "./NamePlane";
import Particles from "./Particles";

export class IntroScene implements SceneLike {
  private experience: Experience;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;

  private face: Face;
  private namePlane: NamePlane;
  private particles: Particles;

  private planeWidth: number;

  /** 縦長画面かどうか */
  private isPortrait: boolean;

  constructor() {
    this.experience = Experience.getInstance();
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xeeeeee);
    this.isPortrait =
      this.experience.config.width < this.experience.config.height;

    const baseSize = this.isPortrait
      ? Math.min(
          this.experience.config.width,
          this.experience.config.height / 2
        )
      : Math.min(
          this.experience.config.height,
          this.experience.config.width / 2
        );
    this.planeWidth = baseSize * 0.8;

    this.camera = this.setCamera(75, 1, 5000);

    this.createLight();

    this.face = new Face(
      this.scene,
      this.planeWidth,
      this.camera,
      this.isPortrait
    );
    this.namePlane = new NamePlane(this.scene, this.planeWidth);
    this.particles = new Particles(this.scene, this.planeWidth, this.camera);
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

    if (this.isPortrait) {
      camera.position.set(0, -this.planeWidth * 0.5, distance);
    } else {
      camera.position.set(this.planeWidth * 0.5, 0, distance);
    }

    return camera;
  }

  private createLight() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 5);
    this.scene.add(ambientLight);
  }

  resize() {
    const baseSize = this.isPortrait
      ? Math.min(
          this.experience.config.width,
          this.experience.config.height / 2
        )
      : Math.min(
          this.experience.config.height,
          this.experience.config.width / 2
        );
    this.planeWidth = baseSize * 0.8;

    this.isPortrait =
      this.experience.config.width < this.experience.config.height;

    this.camera.aspect =
      this.experience.config.width / this.experience.config.height;
    this.camera.updateProjectionMatrix();
    if (this.isPortrait) {
      this.camera.position.set(
        0,
        -this.planeWidth * 0.5,
        this.camera.position.z
      );
    } else {
      this.camera.position.set(
        this.planeWidth * 0.5,
        0,
        this.camera.position.z
      );
    }

    this.face.resize(this.planeWidth, this.isPortrait);
    this.namePlane.resize(this.planeWidth);
    this.particles.resize(this.planeWidth);
  }

  update() {
    this.face.update();
    this.namePlane.update(this.particles.progress);
    this.particles.update();
  }

  destroy() {
    this.face.destroy();
    this.namePlane.destroy();
    this.particles.destroy();
    this.scene.clear();
  }
}
