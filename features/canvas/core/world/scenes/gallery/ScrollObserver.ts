import { ScrollTrigger } from "gsap/ScrollTrigger";
import gsap from "gsap";
import { Observer } from "gsap/Observer";
import { useStore } from "@/store/store";
import * as THREE from "three";
import GalleryPlanes from "./GalleryPlanes";
import lerpFactor from "../../../utils/lerpFactor";
gsap.registerPlugin(ScrollTrigger);

export class ScrollObserver {
  private SCROLL_MIN = 0;
  private SCROLL_MAX;
  private SCROLL_SNAP;

  private observer: Observer | null = null;
  private phase:
    | "loading"
    | "introReady"
    | "introPlaying"
    | "gallery"
    | "detail";

  targetScroll = 0;
  currentScroll = 0;

  unsbscribeStore: (() => void) | null = null;

  constructor() {
    this.phase = useStore.getState().phase;
    this.unsbscribeStore = useStore.subscribe((state) => {
      this.phase = state.phase;
    });

    this.SCROLL_MAX =
      useStore.getState().videoCount * GalleryPlanes.PLANE_DISTANCE;
    this.SCROLL_SNAP = this.SCROLL_MAX / useStore.getState().videoCount;

    this.observer = ScrollTrigger.observe({
      target: window,
      type: "wheel,touch,scroll,pointer",
      onChange: this.onScrollChange.bind(this),
    });
  }

  private onScrollChange(self: Observer) {
    if (this.phase !== "gallery") return;
    this.targetScroll += self.deltaY / 2;
    this.targetScroll = Math.max(
      this.SCROLL_MIN,
      Math.min(this.SCROLL_MAX, this.targetScroll)
    );
    gsap.delayedCall(0.5, () => {
      this.targetScroll = gsap.utils.snap(this.SCROLL_SNAP, this.targetScroll);
      useStore.getState().setCurrentWorkId(this.getWorkId());
    });
  }

  getIndex(scroll = this.currentScroll): number {
    return scroll / GalleryPlanes.PLANE_DISTANCE;
  }
  getWorkId(scroll = this.currentScroll): number {
    return Math.round(scroll / GalleryPlanes.PLANE_DISTANCE);
  }
  getDiff() {
    return this.targetScroll - this.currentScroll;
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
    this.unsbscribeStore?.();
    this.unsbscribeStore = null;
  }
}
