import * as THREE from "three";
import Experience from "../../../Experience";
import PlaneItem from "./PlaneItem";
import LastPlane from "./LastPlane";
import { ScrollObserver } from "./ScrollObserver";
import lerpFactor from "../../../utils/lerpFactor";
import { useRouterStore, useStore } from "@/store/store";
import gsap from "gsap";
import { getSlugByIndex } from "../../../utils/gallery";
import { galleryVideoSources } from "../../../source";
export default class GalleryPlanes {
  static instance: GalleryPlanes;
  static getInstance(): GalleryPlanes {
    return this.instance;
  }

  static PLANE_ASPECT = 8 / 5;
  static PLANE_DISTANCE = 600;
  private PLANE_SIZE = useStore.getState().isMobile ? 0.9 : 0.7;
  private PLANE_SEGMENTS = useStore.getState().isMobile ? 7 : 10;

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
    if (!GalleryPlanes.instance) {
      GalleryPlanes.instance = this;
    }

    this.scene = scene;
    this.scrollObserver = scrollObserver;
    this.experience = Experience.getInstance();
    this.textures = this.experience.galleryVideoLoader.textures;
    this.PLANE_COUNT = Object.keys(this.textures).length;

    this.planesWrapper = new THREE.Group();
    this.planesGroup = new THREE.Group();
    this.scene.add(this.planesWrapper);
    this.planesWrapper.add(this.planesGroup);

    this.planeSize = this.calcPlaneSize(this.PLANE_SIZE);
  }

  private calcPlaneSize(
    size: number,
    containerWidth: number = this.experience.config.width,
    containerHeight: number = this.experience.config.height
  ) {
    if (containerWidth / GalleryPlanes.PLANE_ASPECT > containerHeight) {
      const height = containerHeight * size;
      const width = height * GalleryPlanes.PLANE_ASPECT;
      return { width, height };
    } else {
      const width = containerWidth * size;
      const height = width / GalleryPlanes.PLANE_ASPECT;
      return { width, height };
    }
  }

  createPlanes(workId?: number) {
    const geometry = new THREE.PlaneGeometry(
      1,
      1,
      this.PLANE_SEGMENTS,
      this.PLANE_SEGMENTS
    );

    for (let i = 0; i < this.PLANE_COUNT; i++) {
      const key = galleryVideoSources[i].name;
      const planeItem = new PlaneItem(
        geometry,
        this.planeSize,
        this.textures[key]
      );
      planeItem.mesh.position.set(
        0,
        0,
        workId
          ? -GalleryPlanes.PLANE_DISTANCE * (workId - 1 - i)
          : -GalleryPlanes.PLANE_DISTANCE * i
      );
      this.planesGroup.add(planeItem.mesh);
      this.planeItems.push(planeItem);
      this.raycasterTargets.push(planeItem.mesh);
    }

    this.lastPlane = new LastPlane(geometry, this.planeSize);
    this.lastPlane.mesh.position.set(
      0,
      this.planeSize.height / 2,
      workId
        ? -GalleryPlanes.PLANE_DISTANCE * (workId - 1 - this.PLANE_COUNT)
        : -GalleryPlanes.PLANE_DISTANCE * this.PLANE_COUNT
    );
    this.planesGroup.add(this.lastPlane.mesh);
    this.planeItems.push(this.lastPlane);

    this.registerGalleryVideoGestureUnlock();
  }

  /** 自動再生ポリシーで初期 play が失敗するため、最初のユーザー操作で再生を試す */
  private gestureUnlockCleanup: (() => void) | null = null;

  private registerGalleryVideoGestureUnlock() {
    if (typeof window === "undefined") return;

    const onGesture = () => {
      this.disposeGestureUnlock();
      this.previousGalleryWorkId = -1;
      const workId = this.scrollObserver.getWorkId();
      const item = this.planeItems[workId];
      this.planeItems.forEach((item) => {
        if (item instanceof PlaneItem) {
          item.play();
          item.pause();
        }
      });
      if (item instanceof PlaneItem) {
        item.play();
      }
    };

    const opts: AddEventListenerOptions = { passive: true, capture: true };
    window.addEventListener("pointerdown", onGesture, opts);
    window.addEventListener("touchstart", onGesture, opts);
    window.addEventListener("wheel", onGesture, opts);

    this.gestureUnlockCleanup = () => {
      window.removeEventListener("pointerdown", onGesture, opts);
      window.removeEventListener("touchstart", onGesture, opts);
      window.removeEventListener("wheel", onGesture, opts);
      this.gestureUnlockCleanup = null;
    };
  }

  disposeGestureUnlock() {
    this.gestureUnlockCleanup?.();
  }

  /** updateGallery 内で毎フレーム play() しない（モバイルの自動再生ポリシーで NotAllowedError になる） */
  private previousGalleryWorkId = -1;

  private offsetY = 0;

  private moveToDetailTl: gsap.core.Timeline | null = null;
  moveToDetail(workId: number) {
    this.moveToDetailTl?.kill();
    this.backToGalleryTl?.kill();

    const target = this.planeItems[workId];
    const others = this.planeItems.filter((item) => item !== target);

    if (target instanceof PlaneItem) {
      target.play();
    }

    const index =
      this.scrollObserver.targetScroll / GalleryPlanes.PLANE_DISTANCE;

    const getTargetY = (offset: number) => {
      let y = 1;
      if (Math.abs(offset) <= 0.5) {
        y = Math.abs(offset) / 0.5;
      }
      return y * this.planeSize.height;
    };

    const tl = gsap.timeline({
      defaults: {
        ease: "power2.out",
        duration: 1,
      },
      onStart: () => {
        if (
          typeof window !== "undefined" &&
          window.location.pathname !== `/gallery/${getSlugByIndex(workId)}`
        ) {
          useRouterStore
            .getState()
            .onNavigate?.(`/gallery/${getSlugByIndex(workId)}`);
        }

        if (target instanceof PlaneItem) {
          target.mesh.material.uniforms.uSign.value = 1;
          const isMobile = useStore.getState().isMobile;
          console.log(isMobile);
          target.mesh.material.uniforms.uOffset.value = new THREE.Vector2(
            isMobile ? 0.2 : 0.8,
            isMobile ? 1.0 : 0.8
          );
        }
      },
      onComplete: () => {
        useStore.getState().setIsTransitioning(false);
        this.scrollObserver?.reset();
      },
    });

    tl.to(
      this.planesGroup.rotation,
      {
        x: 0,
      },
      0
    );

    others.forEach((item) => {
      tl.to(
        item.mesh.rotation,
        {
          x: 0,
          y: 0,
        },
        0
      );

      tl.to(
        item.mesh.material.uniforms.uOpacity,
        {
          value: 0,
          duration: 0.3,
        },
        0
      );

      const planeIndex = this.planeItems.indexOf(item);
      const offset = planeIndex - index;

      const targetZ = -offset * GalleryPlanes.PLANE_DISTANCE;
      const targetY = getTargetY(offset);

      tl.to(
        item.mesh.position,
        {
          x: 0,
          y: targetY,
          z: targetZ,
        },
        0
      );
    });

    tl.to(
      target.mesh.rotation,
      {
        x: 0,
        y: 0,
      },
      0
    );
    tl.to(
      target.mesh.position,
      {
        z: 0,
      },
      0
    );

    const { width, height } = this.getDetailCanvasSize();
    const { x, y } = this.getTargetPosition(width, height);
    this.offsetY = y;
    tl.to(
      target.mesh.position,
      {
        x,
        y,
      },
      0
    );

    tl.to(
      target.mesh.scale,
      {
        x: width,
        y: height,
      },
      0
    );
    if (target instanceof PlaneItem) {
      tl.fromTo(
        target.mesh.material.uniforms.uProgress,
        { value: 0 },
        {
          value: 1,
        },
        0
      );
    }

    this.moveToDetailTl = tl;
  }

  private backToGalleryTl: gsap.core.Timeline | null = null;
  backToGallery() {
    this.backToGalleryTl?.kill();
    this.moveToDetailTl?.kill();

    const workId = useStore.getState().currentWorkId;
    const target = this.planeItems[workId];
    const others = this.planeItems.filter((item) => item !== target);

    const index =
      this.scrollObserver.targetScroll / GalleryPlanes.PLANE_DISTANCE;

    const tl = gsap.timeline({
      defaults: {
        ease: "power2.out",
        duration: 0.5,
      },
      onStart: () => {
        this.detailScrollContentEl = null;
        if (
          typeof window !== "undefined" &&
          window.location.pathname !== "/gallery"
        ) {
          useRouterStore.getState().onNavigate?.("/gallery");
        }

        if (target instanceof PlaneItem) {
          target.mesh.material.uniforms.uSign.value = -1;
          const isMobile = useStore.getState().isMobile;
          target.mesh.material.uniforms.uOffset.value = new THREE.Vector2(
            isMobile ? 0.5 : 0.2,
            isMobile ? 0.0 : 0.2
          );
        }
      },
      onComplete: () => {
        this.previousGalleryWorkId = -1;
        useStore.getState().setIsTransitioning(false);
        useStore.getState().setPhase("gallery");
      },
    });

    const getTargetY = (offset: number) => {
      let y = 1;
      if (Math.abs(offset) <= 0.5) {
        y = Math.abs(offset) / 0.5;
      }
      return y * this.planeSize.height;
    };

    others.forEach((item) => {
      const planeIndex = this.planeItems.indexOf(item);
      const offset = planeIndex - index;
      const targetZ = -offset * GalleryPlanes.PLANE_DISTANCE;
      const targetY = getTargetY(offset);

      tl.to(
        item.mesh.position,
        {
          x: 0,
          y: targetY,
          z: targetZ,
        },
        0
      );

      tl.to(
        item.mesh.material.uniforms.uOpacity,
        {
          value: 1,
        },
        0
      );
    });

    const targetOffset = workId - index;
    const targetZ = -targetOffset * GalleryPlanes.PLANE_DISTANCE;
    const targetY = getTargetY(targetOffset);

    tl.to(
      target.mesh.position,
      {
        x: 0,
        y: targetY,
        z: targetZ,
      },
      0
    );

    tl.to(
      target.mesh.scale,
      {
        x: this.planeSize.width,
        y: this.planeSize.height,
      },
      0
    );

    if (target instanceof PlaneItem) {
      tl.fromTo(
        target.mesh.material.uniforms.uProgress,
        { value: 0 },
        {
          value: 1,
        },
        0
      );
    }

    this.backToGalleryTl = tl;
  }

  private getDetailCanvasSize() {
    const screenWidth = this.experience.config.width;
    const padding = this.getPadding();
    const gap = 32;
    let contentWidth;
    let width;

    if (useStore.getState().isMobile) {
      contentWidth = screenWidth;
      width = contentWidth;
    } else {
      contentWidth = screenWidth - padding * 2 - gap;
      width = contentWidth * (2 / 3);
    }

    return {
      width,
      height: width / GalleryPlanes.PLANE_ASPECT,
    };
  }

  private getTargetPosition(canvasWidth: number, canvasHeight: number) {
    const screenWidth = this.experience.config.width;
    const screenHeight = this.experience.config.height;
    const padding = this.getPadding();

    if (useStore.getState().isMobile) {
      return {
        x: 0,
        y: screenHeight / 2 - canvasHeight / 2,
      };
    }
    return {
      x: screenWidth / 2 - padding - canvasWidth / 2,
      y: screenHeight / 2 - padding - canvasHeight / 2,
    };
  }

  private getPadding() {
    const padding = useStore.getState().isMobile ? 16 : 32;
    return padding;
  }

  private detailScrollContentEl: HTMLElement | null = null;
  private detailContainerEl: HTMLElement | null = null;

  update(galleryCamera: THREE.PerspectiveCamera) {
    if (useStore.getState().isTransitioning) return;

    const phase = useStore.getState().phase;

    if (phase === "gallery") {
      this.updateGallery();
      if (useStore.getState().currentWorkId === this.planeItems.length - 1) {
        this.lastPlane?.setIsCurrent(true);
      } else {
        this.lastPlane?.setIsCurrent(false);
      }
      this.lastPlane?.update(galleryCamera);
    } else if (phase === "detail") {
      // キャッシュがなければ取得を試みる（毎フレーム試行、見つかったらキャッシュ）
      if (!this.detailScrollContentEl || !this.detailContainerEl) {
        this.detailContainerEl = document.getElementById("detail-container");
        this.detailScrollContentEl = document.getElementById("detail-canvas");
        if (this.detailContainerEl && this.detailScrollContentEl) {
          this.scrollObserver.setTargetScrollMax(
            Math.max(
              0,
              this.detailContainerEl.scrollHeight -
                this.experience.config.height
            )
          );
        } else return; // まだ DOM にない → 次フレームで再試行
      }
      this.updateDetail();
    }
  }

  private updateGallery() {
    const index = this.scrollObserver.getIndex();
    const workId = this.scrollObserver.getWorkId();
    const workIdChanged = workId !== this.previousGalleryWorkId;
    if (workIdChanged) {
      this.previousGalleryWorkId = workId;
    }

    const diff = this.scrollObserver.getDiff();
    const targetRotation =
      -Math.max(0.0, Math.min(Math.abs(diff / 8.0), 25)) * 0.01;
    this.planesGroup.rotation.x = THREE.MathUtils.lerp(
      this.planesGroup.rotation.x,
      targetRotation,
      lerpFactor(0.04, this.experience.time.delta)
    );
    this.planesGroup.rotation.y = THREE.MathUtils.lerp(
      this.planesGroup.rotation.y,
      targetRotation / 8,
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

      // play/pause（play は workId が変わったフレームのみ。毎フレーム play は不可）
      if (item instanceof PlaneItem) {
        if (i === workId) {
          if (workIdChanged) {
            item.play();
          }
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

  private updateDetail() {
    const workId = useStore.getState().currentWorkId;
    const target = this.planeItems[workId];
    if (!target || !this.detailScrollContentEl || !this.detailContainerEl)
      return;

    target.mesh.position.y = this.offsetY + this.scrollObserver.currentScroll;
    if (useStore.getState().isMobile) {
      this.detailScrollContentEl.style.transform = `translateY(0px)`;
      this.detailContainerEl.style.transform = `translateY(-${this.scrollObserver.currentScroll}px)`;
    } else {
      this.detailContainerEl.style.transform = `translateY(0px)`;
      this.detailScrollContentEl.style.transform = `translateY(-${this.scrollObserver.currentScroll}px)`;
    }
  }

  resize() {
    this.PLANE_SIZE = useStore.getState().isMobile ? 0.9 : 0.7;
    this.planeSize = this.calcPlaneSize(
      this.PLANE_SIZE,
      this.experience.config.width,
      this.experience.config.height
    );
    this.planeItems.forEach((item) => {
      item.resize(this.planeSize);
    });

    if (useStore.getState().phase === "detail") {
      const { width, height } = this.getDetailCanvasSize();
      const { x, y } = this.getTargetPosition(width, height);
      this.planeSize = { width, height };
      this.offsetY = y;
      const target = this.planeItems[useStore.getState().currentWorkId!];
      if (target) {
        target.resize(this.planeSize);
        target.mesh.position.set(x, y + this.scrollObserver.currentScroll, 0);
      }
    }
  }

  // 戻る進むでのサイト遷移で使われる
  reset() {
    this.planesGroup.rotation.x = 0;
    this.scrollObserver.setInitial();
    this.planeItems.forEach((item, i) => {
      item.mesh.position.set(0, 0, -GalleryPlanes.PLANE_DISTANCE * i);
    });
  }
}
