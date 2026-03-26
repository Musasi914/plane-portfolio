import Experience from "../Experience";
import * as THREE from "three";
import Simulator from "./Simulator";
import { useStore } from "@/store/store";

export default class Fluid {
  private experience: Experience;
  private renderer: THREE.WebGLRenderer;
  private pointer: Experience["pointer"];

  private sim: Simulator;
  /** スマホ時はシミュを回さず、速度ゼロとしてサンプルする */
  private zeroVelocityTexture: THREE.DataTexture;

  constructor() {
    this.experience = Experience.getInstance();
    this.renderer = this.experience.renderer.instance;
    this.pointer = this.experience.pointer;

    this.zeroVelocityTexture = new THREE.DataTexture(
      new Float32Array([0, 0, 0, 1]),
      1,
      1,
      THREE.RGBAFormat,
      THREE.FloatType
    );

    this.sim = new Simulator({
      renderer: this.renderer,
      width: this.experience.config.width / 2,
      height: this.experience.config.height / 2,
    });
  }

  getVelocityTexture() {
    if (useStore.getState().isMobile) {
      return this.zeroVelocityTexture;
    }
    return this.sim.velocityTexture;
  }

  resize() {
    if (useStore.getState().isMobile) {
      return;
    }
    this.sim.resize(
      this.experience.config.width / 2,
      this.experience.config.height / 2
    );
  }

  update() {
    if (useStore.getState().isMobile) {
      return;
    }
    this.sim.update({
      pointerUv: this.pointer.state.uv,
      pointerDeltaUv: this.pointer.state.deltaUv,
      pointerMovedThisFrame: this.pointer.state.movedThisFrame,
    });
  }

  destroy() {
    this.sim.destroy();
    this.zeroVelocityTexture.dispose();
  }
}
