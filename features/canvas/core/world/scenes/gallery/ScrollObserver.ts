import { ScrollTrigger } from "gsap/ScrollTrigger";
import gsap from "gsap";
import { Observer } from "gsap/Observer";
import { StoreType, useStore } from "@/store/store";
import * as THREE from "three";
import GalleryPlanes from "./GalleryPlanes";
import lerpFactor from "../../../utils/lerpFactor";
gsap.registerPlugin(ScrollTrigger);

export class ScrollObserver {
  private SCROLL_MIN = 0;
  private SCROLL_MAX;
  private SCROLL_SNAP;

  private observer: Observer | null = null;
  private phase: StoreType["phase"];

  targetScroll = 0;
  currentScroll = 0;

  unsubscribeStore: (() => void) | null = null;

  constructor() {
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
      type: "wheel,touch,scroll,pointer",
      onChange: this.onScrollChange.bind(this),
    });
  }

  targetScrollMax = 1000;
  setTargetScrollMax(max: number) {
    this.targetScrollMax = max;
  }
  private onScrollChange(self: Observer) {
    if (this.phase === "gallery") {
      this.targetScroll += self.deltaY / 2;
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
      this.targetScroll += self.deltaY / 3;
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

  reset() {
    this.targetScroll = 0;
    this.currentScroll = 0;
  }

  update(delta: number) {
    this.currentScroll = THREE.MathUtils.lerp(
      this.currentScroll,
      this.targetScroll,
      lerpFactor(0.05, delta)
    );
  }

  destroy() {
    this.observer?.kill();
    this.observer = null;
    this.unsubscribeStore?.();
    this.unsubscribeStore = null;
  }
}
