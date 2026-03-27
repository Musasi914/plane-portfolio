import * as THREE from "three";
import Experience from "../Experience";

type PointerState = {
  /** 0..1 (UV) */
  uv: THREE.Vector2;
  /** 前フレームとの差分（UV） */
  deltaUv: THREE.Vector2;
  /** 前フレームの uv */
  previousUv: THREE.Vector2;
  movedSinceLastUpdate: boolean;
  /** 今フレームで move が発生したか（update() 後に参照する） */
  movedThisFrame: boolean;
  /** -1..1 (NDC) */
  ndc: THREE.Vector2;
};

export default class Pointer {
  private experience: Experience;
  private el: HTMLDivElement;
  state: PointerState;

  constructor() {
    this.experience = Experience.getInstance();
    this.el = this.experience.canvasWrapper;

    this.state = {
      uv: new THREE.Vector2(0.5, 0.5),
      previousUv: new THREE.Vector2(0.5, 0.5),
      deltaUv: new THREE.Vector2(0, 0),
      movedSinceLastUpdate: false,
      movedThisFrame: false,
      ndc: new THREE.Vector2(0, -1),
    };

    this.el.style.touchAction = "none";

    this.el.addEventListener("pointermove", this.updateFromEvent);
    // タップでは move が無いので ndc が更新されず PlaneRaycaster が当たらない → pointerdown でも同期
    this.el.addEventListener("pointerdown", this.updateFromEvent);
  }

  private updateFromEvent = (e: PointerEvent) => {
    const rect = this.el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = 1.0 - (e.clientY - rect.top) / rect.height;

    this.state.uv.set(x, y);
    this.state.ndc.set(x * 2 - 1, y * 2 - 1);
    this.state.movedSinceLastUpdate = true;
  };

  update() {
    this.state.movedThisFrame = this.state.movedSinceLastUpdate;
    this.state.deltaUv.subVectors(this.state.uv, this.state.previousUv);
    this.state.previousUv.copy(this.state.uv);
    this.state.movedSinceLastUpdate = false;
  }

  destroy() {
    this.el.removeEventListener("pointermove", this.updateFromEvent);
    this.el.removeEventListener("pointerdown", this.updateFromEvent);
  }
}
