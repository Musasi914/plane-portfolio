import { ScrollTrigger } from "gsap/ScrollTrigger";
import gsap from "gsap";
import { Observer } from "gsap/Observer";
import { useStore } from "@/store/store";
import * as THREE from "three";
gsap.registerPlugin(ScrollTrigger);

export class ScrollObserver {
  static SCROLL_MIN = 0;
  static SCROLL_MAX = 5000;

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

    this.observer = ScrollTrigger.observe({
      target: window,
      type: "wheel,touch,scroll,pointer",
      onChange: this.onScrollChange.bind(this),
    });
  }

  private onScrollChange(self: Observer) {
    if (this.phase !== "gallery") return;
    this.targetScroll += self.deltaY;
    this.targetScroll = Math.max(
      ScrollObserver.SCROLL_MIN,
      Math.min(ScrollObserver.SCROLL_MAX, this.targetScroll)
    );
  }

  update() {
    this.currentScroll = THREE.MathUtils.lerp(
      this.currentScroll,
      this.targetScroll,
      0.3
    );
  }

  destroy() {
    this.observer?.kill();
    this.observer = null;
    this.unsbscribeStore?.();
    this.unsbscribeStore = null;
  }
}
