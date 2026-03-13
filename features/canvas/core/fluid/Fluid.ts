import Experience from "../Experience";
import * as THREE from "three";
import Simulator from "./Simulator";

export default class Fluid {
  private experience: Experience;
  private renderer: THREE.WebGLRenderer;
  private pointer: Experience["pointer"];

  private sim: Simulator;

  constructor() {
    this.experience = Experience.getInstance();
    this.renderer = this.experience.renderer.instance;
    this.pointer = this.experience.pointer;

    this.sim = new Simulator({
      renderer: this.renderer,
      width: this.experience.config.width / 2,
      height: this.experience.config.height / 2,
    });
  }

  getVelocityTexture() {
    return this.sim.velocityTexture;
  }

  update() {
    this.sim.update({
      pointerUv: this.pointer.state.uv,
      pointerDeltaUv: this.pointer.state.deltaUv,
      pointerMovedThisFrame: this.pointer.state.movedThisFrame,
    });
  }
}
