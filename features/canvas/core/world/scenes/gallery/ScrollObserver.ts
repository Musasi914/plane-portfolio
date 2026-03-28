import { ScrollTrigger } from "gsap/ScrollTrigger";
import gsap from "gsap";
import { Observer } from "gsap/Observer";
import { StoreType, useStore } from "@/store/store";
import * as THREE from "three";
import GalleryPlanes from "./GalleryPlanes";
import lerpFactor from "../../../utils/lerpFactor";
gsap.registerPlugin(ScrollTrigger);

export class ScrollObserver {
  static instance: ScrollObserver;
  static getInstance(): ScrollObserver {
    return this.instance;
  }

  private SCROLL_MIN = 0;
  private SCROLL_MAX;
  private SCROLL_SNAP;

  private observer: Observer | null = null;
  private phase: StoreType["phase"];

  targetScroll = 0;
  currentScroll = 0;

  unsubscribeStore: (() => void) | null = null;

  constructor() {
    if (!ScrollObserver.instance) {
      ScrollObserver.instance = this;
    }

    this.phase = useStore.getState().phase;
    this.unsubscribeStore = useStore.subscribe((state) => {
      this.phase = state.phase;
    });

    this.SCROLL_MAX =
      useStore.getState().videoCount * GalleryPlanes.PLANE_DISTANCE;
    this.SCROLL_SNAP =
      this.SCROLL_MAX / Math.max(useStore.getState().videoCount, 1);

    this.observer = ScrollTrigger.observe({
      target: window,
      type: "wheel,touch",
      onChangeY: this.onScrollChange.bind(this),
    });

    window.addEventListener("keydown", this.onKeyDown);
  }

  targetScrollMax = 1000;
  setTargetScrollMax(max: number) {
    this.targetScrollMax = max;
  }
  private isTouchEvent(event: Event): boolean {
    return event.type.startsWith("touch");
  }
  private onScrollChange(self: Observer) {
    if (this.phase === "gallery") {
      this.targetScroll += this.isTouchEvent(self.event)
        ? -self.deltaY * 4
        : self.deltaY / 2;
      this.targetScroll = Math.max(
        this.SCROLL_MIN,
        Math.min(this.SCROLL_MAX, this.targetScroll)
      );
      gsap.delayedCall(0.5, () => {
        this.targetScroll = gsap.utils.snap(
          this.SCROLL_SNAP,
          this.targetScroll
        );
        useStore.getState().setCurrentWorkId(this.getWorkId());
      });
    } else if (this.phase === "detail") {
      this.targetScroll += this.isTouchEvent(self.event)
        ? -self.deltaY * 1.5
        : self.deltaY / 2;
      this.targetScroll = Math.min(
        Math.max(0, this.targetScroll),
        this.targetScrollMax
      );
    }
  }

  getIndex(scroll = this.currentScroll): number {
    return scroll / GalleryPlanes.PLANE_DISTANCE;
  }
  getWorkId(scroll = this.targetScroll): number {
    return Math.round(scroll / GalleryPlanes.PLANE_DISTANCE);
  }
  getDiff() {
    return this.targetScroll - this.currentScroll;
  }

  private prevTargetScroll = 0;
  saveGalleryScroll() {
    this.prevTargetScroll = this.targetScroll;
  }
  restoreGalleryScroll() {
    this.targetScroll = this.prevTargetScroll;
    this.currentScroll = this.prevTargetScroll;
  }

  setInitial() {
    this.targetScroll = 0;
    this.currentScroll = 0;
    useStore.getState().setCurrentWorkId(0);
  }

  private onKeyDown = (event: KeyboardEvent) => {
    if (useStore.getState().phase !== "detail") return;
    const isFocusOnDetailCanvas =
      document.activeElement?.closest("#detail-canvas");
    if (!isFocusOnDetailCanvas) return;

    if (
      event.key === "ArrowDown" ||
      event.key === "ArrowRight" ||
      (event.key === " " && !event.shiftKey) ||
      (event.key === "Enter" && !event.shiftKey)
    ) {
      this.targetScroll += 150;
    } else if (
      event.key === "ArrowUp" ||
      event.key === "ArrowLeft" ||
      (event.key === "Enter" && event.shiftKey) ||
      (event.key === " " && event.shiftKey)
    ) {
      this.targetScroll -= 150;
    }
    this.targetScroll = Math.min(
      Math.max(0, this.targetScroll),
      this.targetScrollMax
    );
  };

  reset() {
    this.targetScroll = 0;
    this.currentScroll = 0;
  }

  update(delta: number) {
    this.currentScroll = THREE.MathUtils.lerp(
      this.currentScroll,
      this.targetScroll,
      lerpFactor(useStore.getState().phase === "detail" ? 0.3 : 0.05, delta)
    );
  }

  destroy() {
    this.observer?.kill();
    this.observer = null;
    this.unsubscribeStore?.();
    this.unsubscribeStore = null;
    window.removeEventListener("keydown", this.onKeyDown);
  }
}
