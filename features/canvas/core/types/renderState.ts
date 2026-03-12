import * as THREE from "three";

export type RenderState = {
  active: {
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
  };
  next: {
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
  } | null;
  transitionProgress: number;
};
