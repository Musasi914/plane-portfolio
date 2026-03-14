import Experience from "../../../Experience";
import * as THREE from "three";
import type { SceneLike } from "../../../types/sceneLike";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { Face } from "./Face";
import NamePlane from "./NamePlane";
import Particles from "./Particles";

export class IntroScene implements SceneLike {
  private experience: Experience;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  private orbitControls: OrbitControls | null = null;

  private face: Face;
  private namePlane: NamePlane;
  private particles: Particles;

  private planeWidth: number;

  constructor() {
    this.experience = Experience.getInstance();
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xeeeeee);

    this.camera = this.setCamera(75, 1, 2000);

    this.createLight();

    this.planeWidth =
      Math.min(this.experience.config.width, this.experience.config.height) *
      0.9;
    this.face = new Face(this.scene);
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
    camera.position.set(0, 0, distance);
    camera.lookAt(0, 0, 0);

    this.orbitControls = new OrbitControls(
      camera,
      this.experience.canvasWrapper
    );

    return camera;
  }

  private createLight() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 4);
    this.scene.add(ambientLight);
  }

  update() {
    this.face.update();
    this.namePlane.update(this.particles.progress);
    this.particles.update();
  }

  resize() {
    this.camera.aspect =
      this.experience.config.width / this.experience.config.height;
    this.camera.updateProjectionMatrix();

    this.planeWidth =
      Math.min(this.experience.config.width, this.experience.config.height) *
      0.9;

    this.face.resize();
    this.namePlane.resize(this.planeWidth);
    this.particles.resize(this.planeWidth);
  }

  destroy() {
    this.face.destroy();
    this.namePlane.destroy();
    this.particles.destroy();
    this.orbitControls?.dispose();
    this.scene.clear();
  }
}
