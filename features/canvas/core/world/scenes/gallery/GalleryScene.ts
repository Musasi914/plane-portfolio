import * as THREE from "three";
import Experience from "../../../Experience";
import type { SceneLike } from "../../../types/sceneLike";
import { ScrollObserver } from "./ScrollObserver";
import GalleryPlanes from "./GalleryPlanes";
import GalleryVideoLoader from "./GalleryVideoLoader";
import PlaneRaycaster from "./PlaneRaycaster";
import { useRouterStore, useStore } from "@/store/store";
import { getSlugByIndex } from "../../../utils/gallery";
import lerpFactor from "../../../utils/lerpFactor";
import gsap from "gsap";
import { playSfx } from "@/features/audio/sfx";

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

    this.registerOnGoToIntro();
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
    useRouterStore.getState().setOnBackToDetail((workIdFromUrl?: number) => {
      const prevWorkId = useRouterStore.getState().prevWorkId;
      const workId = workIdFromUrl ?? prevWorkId ?? undefined;
      this.transitionToDetail(workId);
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

  /**
   * click は同一フレーム内で update() より先に届くことがあり、
   * その時点では hoveredWorkId が未設定のまま。イベント座標で ndc を同期してからレイキャストする。
   */
  private transitionToDetailClickHandler = (e: MouseEvent) => {
    const rect = this.experience.canvasWrapper.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = 1.0 - (e.clientY - rect.top) / rect.height;
    const { pointer } = this.experience;
    pointer.state.ndc.set(x * 2 - 1, y * 2 - 1);
    pointer.state.uv.set(x, y);
    this.planeRaycaster?.update();
    this.transitionToDetail();
  };

  private transitionToDetail = (workId?: number) => {
    if (workId === undefined && useStore.getState().hoveredWorkId === null)
      return;

    const fromHistory = typeof workId === "number";
    if (fromHistory) {
      if (getSlugByIndex(workId) === null) return;
    } else if (!this.canTransitionToDetail()) {
      return;
    }

    playSfx("click");

    useStore.getState().setIsTransitioning(true);
    useStore.getState().setCursorVariant("default");
    if (workId === undefined) {
      //サイト遷移
      this.scrollObserver?.saveGalleryScroll();
      useStore.getState().setPhase("galleryDetail");
      const currentWorkId = useStore.getState().currentWorkId;
      this.planes?.moveToDetail(currentWorkId);
      useRouterStore.getState().setPrevWorkId(currentWorkId);
    } else {
      // ブラウザ履歴で detail URL に戻ったとき（URL は既に正しい。onNavigate は不要）
      useStore.getState().setPhase("detail");
      this.planes?.moveToDetail(workId, { skipUrlSync: true });
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
    this.camera.aspect =
      this.experience.config.width / this.experience.config.height;
    this.camera.updateProjectionMatrix();
    // イントロ表示中も解像度・プレーン寸法を追従（クイック遷移時にリセット前の幅のまま残さない）
    this.planes?.resize();
  }

  update() {
    this.scrollObserver?.update(this.experience.time.delta);
    this.planes?.update(this.camera);
    this.planeRaycaster?.update();
    this.cameraMove();
  }

  private cameraMove() {
    if (useStore.getState().isMobile) return;

    const pointer = this.experience.pointer;
    this.camera.position.x = THREE.MathUtils.lerp(
      this.camera.position.x,
      pointer.state.ndc.x * 10.0,
      lerpFactor(0.1, this.experience.time.delta)
    );
    this.camera.position.y = THREE.MathUtils.lerp(
      this.camera.position.y,
      pointer.state.ndc.y * 10.0,
      lerpFactor(0.1, this.experience.time.delta)
    );
  }

  destroy() {
    this.scrollObserver?.destroy();
    this.planes?.disposeGestureUnlock();
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

  private registerOnGoToIntro() {
    useRouterStore.getState().setOnGoToIntro(() => {
      useStore.getState().setActiveSceneId("gallery");
      useStore.getState().setNextSceneId("intro");
      useStore.getState().setCursorVariant("default");
      useStore.getState().setIsTransitioning(true);
      gsap.delayedCall(0.2, () => Experience.getInstance().world?.reset());

      const tmp = { value: 1 };
      gsap.to(tmp, {
        value: 0,
        duration: 0.5,
        ease: "power2.inOut",
        onComplete: () => {
          useStore.getState().setPhase("introReady");
          useStore.getState().setActiveSceneId("intro");
          useStore.getState().setNextSceneId(null);
          useStore.getState().setIsTransitioning(false);
          useRouterStore.getState().onNavigate?.("/");
        },
        onUpdate: () => {
          useStore.getState().setSceneTransitionProgress(tmp.value);
        },
      });
    });
  }
}
