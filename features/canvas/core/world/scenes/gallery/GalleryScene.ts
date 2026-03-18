import * as THREE from "three";
import Experience from "../../../Experience";
import type { SceneLike } from "../../../types/sceneLike";
import { ScrollObserver } from "./ScrollObserver";
import GalleryPlanes from "./GalleryPlanes";
import GalleryVideoLoader from "./GalleryVideoLoader";
import PlaneRaycaster from "./PlaneRaycaster";

export class GalleryScene implements SceneLike {
  private experience: Experience;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;

  private scrollObserver: ScrollObserver | null = null;
  private planes: GalleryPlanes | null = null;
  private videoLoader: GalleryVideoLoader;

  private planeRaycaster: PlaneRaycaster | null = null;

  constructor() {
    this.experience = Experience.getInstance();
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xffffff);

    this.camera = this.setCamera(75, 5, 5000);

    this.videoLoader = this.experience.galleryVideoLoader;
    this.videoLoader.on("videoLoaded", () => {
      this.prepare();
    });
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

  prepare() {
    if (this.planes) return;
    this.scrollObserver = new ScrollObserver();
    this.planes = new GalleryPlanes(this.scene, this.scrollObserver);
    this.planeRaycaster = new PlaneRaycaster(
      this.camera,
      this.planes.raycasterTargets
    );
  }

  resize() {
    this.camera.aspect =
      this.experience.config.width / this.experience.config.height;
    this.camera.updateProjectionMatrix();
    this.planes?.resize();
  }

  update() {
    this.scrollObserver?.update(this.experience.time.delta);
    this.planes?.update();
    this.planeRaycaster?.update();
  }

  destroy() {
    this.scrollObserver?.destroy();
    this.scene.clear();
  }
}
