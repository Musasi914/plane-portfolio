import * as THREE from "three";
import Experience from "../Experience";

export class Camera {
  /** fullscreen composite用: NDC空間のQuad表示 */
  static ORTHO_LEFT = -1;
  static ORTHO_RIGHT = 1;
  static ORTHO_TOP = 1;
  static ORTHO_BOTTOM = -1;
  static ORTHO_NEAR = 0;
  static ORTHO_FAR = 1;

  instance: THREE.OrthographicCamera;
  experience: Experience;
  scene: Experience["scene"];
  config: Experience["config"];

  constructor() {
    this.experience = Experience.getInstance();
    this.scene = this.experience.scene;
    this.config = this.experience.config;

    this.instance = this.setInstance();
  }

  private setInstance() {
    const camera = new THREE.OrthographicCamera(
      Camera.ORTHO_LEFT,
      Camera.ORTHO_RIGHT,
      Camera.ORTHO_TOP,
      Camera.ORTHO_BOTTOM,
      Camera.ORTHO_NEAR,
      Camera.ORTHO_FAR
    );
    camera.lookAt(0, 0, 0);
    this.scene.add(camera);
    return camera;
  }

  resize() {
    this.config = this.experience.config;
    this.instance.updateProjectionMatrix();
  }

  destroy() {
    this.instance.parent?.remove(this.instance);
  }
}
