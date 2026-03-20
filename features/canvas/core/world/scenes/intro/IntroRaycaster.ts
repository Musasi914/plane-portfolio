import * as THREE from "three";
import Experience from "../../../Experience";
import { useStore } from "@/store/store";

export default class IntroRaycaster {
  private experience: Experience;
  private pointer: Experience["pointer"];

  private raycaster: THREE.Raycaster;
  private camera: THREE.PerspectiveCamera;
  private targetObject: THREE.Object3D;

  isHovering = false;

  constructor(camera: THREE.PerspectiveCamera, targetObject: THREE.Object3D) {
    this.experience = Experience.getInstance();
    this.pointer = this.experience.pointer;
    this.camera = camera;
    this.targetObject = targetObject;
    this.raycaster = new THREE.Raycaster();
  }

  update() {
    if (useStore.getState().phase !== "introReady") return;
    this.raycaster.setFromCamera(this.pointer.state.ndc, this.camera);
    const intersects = this.raycaster.intersectObject(this.targetObject);
    if (intersects.length > 0) {
      useStore.getState().setCursorVariant("hover");
      useStore.getState().setCursorText("gallery >");
      this.isHovering = true;
    } else {
      if (this.isHovering) {
        useStore.getState().setCursorVariant("default");
        useStore.getState().setCursorText("");
      }
      this.isHovering = false;
    }
  }
}
