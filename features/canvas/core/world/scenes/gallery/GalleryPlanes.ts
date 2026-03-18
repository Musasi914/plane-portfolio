import * as THREE from "three";
import Experience from "../../../Experience";
import PlaneItem from "./PlaneItem";
import LastPlane from "./LastPlane";
import { ScrollObserver } from "./ScrollObserver";
import lerpFactor from "../../../utils/lerpFactor";
import { useStore } from "@/store/store";

export default class GalleryPlanes {
  static PLANE_ASPECT = 8 / 5;
  static PLANE_DISTANCE = 600;
  static PLANE_SIZE = 0.7;

  private experience: Experience;
  private scene: THREE.Scene;
  private scrollObserver: ScrollObserver;
  private textures: { [key: string]: THREE.VideoTexture<HTMLVideoElement> };
  private planeSize: { width: number; height: number };
  private PLANE_COUNT: number;

  // scene > planesWrapper > planesGroup > planeItem*10, lastPlane
  private planesWrapper: THREE.Group;
  private planesGroup: THREE.Group;
  private planeItems: (PlaneItem | LastPlane)[] = [];
  private lastPlane: LastPlane | null = null;

  raycasterTargets: THREE.Object3D[] = [];

  constructor(scene: THREE.Scene, scrollObserver: ScrollObserver) {
    this.scene = scene;
    this.scrollObserver = scrollObserver;
    this.experience = Experience.getInstance();
    this.textures = this.experience.galleryVideoLoader.textures;
    this.PLANE_COUNT = Object.keys(this.textures).length;

    this.planesWrapper = new THREE.Group();
    this.planesGroup = new THREE.Group();
    this.scene.add(this.planesWrapper);
    this.planesWrapper.add(this.planesGroup);

    this.planeSize = this.calcPlaneSize();

    this.createPlanes();
  }

  private calcPlaneSize(
    containerWidth: number = this.experience.config.width,
    containerHeight: number = this.experience.config.height
  ) {
    if (containerWidth / GalleryPlanes.PLANE_ASPECT > containerHeight) {
      const height = containerHeight * GalleryPlanes.PLANE_SIZE;
      const width = height * GalleryPlanes.PLANE_ASPECT;
      return { width, height };
    } else {
      const width = containerWidth * GalleryPlanes.PLANE_SIZE;
      const height = width / GalleryPlanes.PLANE_ASPECT;
      return { width, height };
    }
  }

  private createPlanes() {
    const geometry = new THREE.PlaneGeometry(1, 1);

    for (let i = 0; i < this.PLANE_COUNT; i++) {
      const key = Object.keys(this.textures)[i];
      const planeItem = new PlaneItem(
        geometry,
        this.planeSize,
        this.textures[key]
      );
      planeItem.mesh.position.set(0, 0, -GalleryPlanes.PLANE_DISTANCE * i);
      this.planesGroup.add(planeItem.mesh);
      this.planeItems.push(planeItem);
      this.raycasterTargets.push(planeItem.mesh);
    }

    this.lastPlane = new LastPlane(geometry, this.planeSize);
    this.lastPlane.mesh.position.set(
      0,
      this.planeSize.height / 2,
      -GalleryPlanes.PLANE_DISTANCE * this.PLANE_COUNT
    );
    this.planesGroup.add(this.lastPlane.mesh);
    this.planeItems.push(this.lastPlane);
  }

  update() {
    const index = this.scrollObserver.getIndex();
    const workId = this.scrollObserver.getWorkId();

    const diff = this.scrollObserver.getDiff();
    const targetRotation =
      -Math.max(0.0, Math.min(Math.abs(diff / 8.0), 25)) * 0.01;
    this.planesGroup.rotation.x = THREE.MathUtils.lerp(
      this.planesGroup.rotation.x,
      targetRotation,
      lerpFactor(0.05, this.experience.time.delta)
    );

    for (let i = 0; i < this.planeItems.length; i++) {
      const item = this.planeItems[i];
      if (!item.mesh) continue;

      const offset = i - index;

      // position
      let y = 1;
      if (Math.abs(offset) <= 0.5) {
        y = Math.abs(offset) / 0.5;
      }
      item.mesh.position.y = THREE.MathUtils.lerp(
        item.mesh.position.y,
        y * this.planeSize.height,
        lerpFactor(0.1, this.experience.time.delta)
      );
      item.mesh.position.z = THREE.MathUtils.lerp(
        item.mesh.position.z,
        -offset * GalleryPlanes.PLANE_DISTANCE,
        lerpFactor(0.05, this.experience.time.delta)
      );

      // rotation
      item.mesh.rotation.x = THREE.MathUtils.lerp(
        item.mesh.rotation.x,
        -targetRotation * 2,
        lerpFactor(0.05, this.experience.time.delta)
      );
      item.mesh.rotation.y = THREE.MathUtils.lerp(
        item.mesh.rotation.y,
        targetRotation / 2,
        lerpFactor(0.05, this.experience.time.delta)
      );

      // play/pause
      if (item instanceof PlaneItem) {
        if (i === workId) {
          item.play();
        } else {
          item.pause();
        }
      }

      // hover
      if (item instanceof PlaneItem) {
        if (useStore.getState().hoveredWorkId === i) {
          item.hover();
        } else {
          item.unhover();
        }
      }
    }
  }

  resize() {
    this.planeSize = this.calcPlaneSize(
      this.experience.config.width,
      this.experience.config.height
    );
    this.planeItems.forEach((item) => {
      item.resize(this.planeSize);
    });
  }

  reset() {
    this.planesGroup.rotation.x = 0;
    this.scrollObserver.setInitial();
  }
}
