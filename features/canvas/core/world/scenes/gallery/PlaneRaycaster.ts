import * as THREE from "three";
import Experience from "../../../Experience";
import { useStore } from "@/store/store";
import { galleryVideoSources } from "../../../source";

export default class PlaneRaycaster {
  private experience: Experience;
  private pointer: Experience["pointer"];

  private raycaster: THREE.Raycaster;
  private camera: THREE.PerspectiveCamera;
  private targetObjects: THREE.Object3D[];

  isIntersecting = false;

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
    if (
      useStore.getState().phase !== "gallery" ||
      useStore.getState().isTransitioning
    )
      return;

    const currentWorkId = useStore.getState().currentWorkId;
    const target = this.targetObjects[currentWorkId];
    if (!target) return;

    this.raycaster.setFromCamera(this.pointer.state.ndc, this.camera);
    const intersects = this.raycaster.intersectObject(target);
    if (intersects.length > 0) {
      this.isIntersecting = true;
      const { hoveredWorkId, cursorVariant, currentWorkId } =
        useStore.getState();
      if (hoveredWorkId !== currentWorkId) {
        useStore.getState().setHoveredWorkId(currentWorkId);
      }
      if (cursorVariant !== "hover") {
        useStore.getState().setCursorVariant("hover");
        useStore
          .getState()
          .setCursorText(`${galleryVideoSources[currentWorkId].name} >`);
      }
    } else {
      this.isIntersecting = false;
      if (useStore.getState().hoveredWorkId !== null) {
        useStore.getState().setCursorVariant("default");
        useStore.getState().setCursorText("");
        useStore.getState().setHoveredWorkId(null);
      }
    }
  }
}
