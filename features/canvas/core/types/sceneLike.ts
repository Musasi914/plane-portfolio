import * as THREE from "three";

export type SceneLike = {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  update: (delta?: number) => void;
  resize: () => void;
  destroy: () => void;
};
