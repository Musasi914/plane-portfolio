import * as THREE from "three";
import Experience from "../../../Experience";
import { useStore } from "@/store/store";

export default class PlaneRaycaster {
  private experience: Experience;
  private pointer: Experience["pointer"];

  private raycaster: THREE.Raycaster;
  private camera: THREE.PerspectiveCamera;
  private targetObjects: THREE.Object3D[];

  constructor(
    camera: THREE.PerspectiveCamera,
    targetObjects: THREE.Object3D[]
  ) {
    this.experience = Experience.getInstance();
    this.pointer = this.experience.pointer;
    this.camera = camera;
    this.targetObjects = targetObjects;
    this.raycaster = new THREE.Raycaster();
  }

  update() {
    if (useStore.getState().phase !== "gallery") return;

    const currentWorkId = useStore.getState().currentWorkId;
    const target = this.targetObjects[currentWorkId];
    if (!target) return;

    this.raycaster.setFromCamera(this.pointer.state.ndc, this.camera);
    const intersects = this.raycaster.intersectObject(target);
    if (intersects.length > 0) {
      useStore.getState().setHoveredWorkId(currentWorkId);
      useStore.getState().setCursorVariant("hover");
    } else {
      if (useStore.getState().hoveredWorkId !== null) {
        useStore.getState().setHoveredWorkId(null);
        useStore.getState().setCursorVariant("default");
      }
    }
  }
}
