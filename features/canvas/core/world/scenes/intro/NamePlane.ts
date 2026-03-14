import * as THREE from "three";
import Experience from "../../../Experience";

export default class NamePlane {
  static WIDTH = 500;
  private experience: Experience;
  private resource: Experience["resource"];
  private scene: THREE.Scene;

  private namePlane: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;

  constructor(scene: THREE.Scene) {
    this.experience = Experience.getInstance();
    this.resource = this.experience.resource;
    this.scene = scene;

    this.namePlane = this.createNamePlane();
  }

  private createNamePlane() {
    const texture = this.getTexture();
    const geometry = new THREE.PlaneGeometry(NamePlane.WIDTH, NamePlane.WIDTH);
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
    });
    const mesh = new THREE.Mesh(geometry, material);
    this.scene.add(mesh);

    return mesh;
  }

  private getTexture() {
    const texture = this.resource.items.name as THREE.Texture;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;
    texture.generateMipmaps = false;
    return texture;
  }

  resize() {}

  destroy() {
    this.namePlane.geometry.dispose();
    (this.namePlane.material as THREE.Material).dispose();
    this.scene.remove(this.namePlane);
  }
}
