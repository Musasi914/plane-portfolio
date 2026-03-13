import Experience from "../../../Experience";
import * as THREE from "three";

export class Face {
  experience: Experience;
  scene: THREE.Scene;
  config: Experience["config"];
  resource: Experience["resource"];

  constructor(scene: THREE.Scene) {
    this.experience = Experience.getInstance();
    this.scene = scene;
    this.config = this.experience.config;
    this.resource = this.experience.resource;

    this.createFace();
  }

  private createFace() {
    const { texture, displacementTexture } = this.getTexture();

    const geometry = new THREE.PlaneGeometry(
      (texture.image as HTMLImageElement).width,
      (texture.image as HTMLImageElement).height,
      1024,
      1024
    );
    const material = new THREE.MeshStandardMaterial({
      map: texture,
      displacementMap: displacementTexture,
      displacementScale: 150,
      displacementBias: 0.0,
      transparent: true,
    });
    const mesh = new THREE.Mesh(geometry, material);
    this.scene.add(mesh);
  }

  getTexture() {
    const texture = this.resource.items.face as THREE.Texture;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;
    texture.generateMipmaps = false;
    const displacementTexture = this.resource.items
      .faceDisplacement as THREE.Texture;
    displacementTexture.wrapS = THREE.RepeatWrapping;
    displacementTexture.wrapT = THREE.RepeatWrapping;
    displacementTexture.minFilter = THREE.NearestFilter;
    displacementTexture.magFilter = THREE.NearestFilter;
    displacementTexture.generateMipmaps = false;

    return { texture, displacementTexture };
  }

  resize() {}

  update() {}

  destroy() {}
}
