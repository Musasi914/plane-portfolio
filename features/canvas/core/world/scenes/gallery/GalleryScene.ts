import * as THREE from "three";
import Experience from "../../../Experience";
import type { SceneLike } from "../../../types/sceneLike";
import { ScrollObserver } from "./ScrollObserver";
import GalleryPlanes from "./GalleryPlanes";
import GalleryVideoLoader from "./GalleryVideoLoader";
import PlaneRaycaster from "./PlaneRaycaster";
import { useRouterStore, useStore } from "@/store/store";
import { getSlugByIndex } from "../../../utils/gallery";

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
    this.scene.background = new THREE.Color(0xeeeeee);

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

    this.experience.canvasWrapper.addEventListener(
      "click",
      this.transitionToDetailClickHandler
    );

    useRouterStore.getState().setOnBackToGallery(() => {
      this.backToGallery();
    });
    useRouterStore.getState().setOnBackToDetail(() => {
      const prevWorkId = useRouterStore.getState().prevWorkId;
      this.transitionToDetail(prevWorkId ?? undefined);
    });

    // 直接 /gallery/[slug] でアクセスした場合
    if (useStore.getState().phase === "detail") {
      const workId = useStore.getState().currentWorkId;
      useStore.getState().setIsTransitioning(true);
      this.scrollObserver.targetScroll = workId * GalleryPlanes.PLANE_DISTANCE;
      this.scrollObserver?.saveGalleryScroll();
      this.planes.createPlanes(workId);
      this.planes.moveToDetail(workId);
    } else {
      this.planes.createPlanes();
    }

    this.planeRaycaster = new PlaneRaycaster(
      this.camera,
      this.planes.raycasterTargets
    );
  }

  // 引数のため、こういう形に
  private transitionToDetailClickHandler = () => {
    this.transitionToDetail();
  };

  private transitionToDetail = (workId?: number) => {
    if (!workId && useStore.getState().hoveredWorkId === null) return;
    if (!this.canTransitionToDetail()) return;

    useStore.getState().setIsTransitioning(true);
    useStore.getState().setCursorVariant("default");
    if (!workId) {
      //サイト遷移
      this.scrollObserver?.saveGalleryScroll();
      useStore.getState().setPhase("galleryDetail");
      const currentWorkId = useStore.getState().currentWorkId;
      this.planes?.moveToDetail(currentWorkId);
      useRouterStore.getState().setPrevWorkId(currentWorkId);
    } else {
      // 戻るボタンから遷移
      useStore.getState().setPhase("detail");
      this.planes?.moveToDetail(workId);
      useStore.getState().setCurrentWorkId(workId);
    }
  };
  private canTransitionToDetail() {
    const currentWorkId = useStore.getState().currentWorkId;
    if (useStore.getState().phase !== "gallery") return false;

    const slug = getSlugByIndex(currentWorkId);
    if (slug === null) return false;

    return true;
  }

  backToGallery() {
    useStore.getState().setIsTransitioning(true);
    useStore.getState().setPhase("galleryDetail");
    useStore.getState().setCursorVariant("default");
    this.scrollObserver?.restoreGalleryScroll();
    this.planes?.backToGallery();
  }

  resize() {
    if (
      !(
        useStore.getState().phase === "gallery" ||
        useStore.getState().phase === "detail" ||
        useStore.getState().phase === "galleryDetail"
      )
    )
      return;
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
    this.experience.canvasWrapper.removeEventListener(
      "click",
      this.transitionToDetailClickHandler
    );
    useRouterStore.getState().setOnBackToDetail(null);
    useRouterStore.getState().setOnBackToGallery(null);
  }

  reset() {
    this.resize();
    this.planes?.reset();
  }
}
