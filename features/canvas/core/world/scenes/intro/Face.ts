import Experience from "../../../Experience";
import * as THREE from "three";

export class Face {
  private experience: Experience;
  private scene: THREE.Scene;
  private config: Experience["config"];
  private resource: Experience["resource"];

  private geometry!: THREE.PlaneGeometry;
  private material!: THREE.MeshStandardMaterial;
  private mesh!: THREE.Mesh;

  constructor(scene: THREE.Scene) {
    this.experience = Experience.getInstance();
    this.scene = scene;
    this.config = this.experience.config;
    this.resource = this.experience.resource;

    this.createFace();
  }

  private createFace() {
    const { texture, displacementTexture } = this.getTexture();

    this.geometry = new THREE.PlaneGeometry(
      (texture.image as HTMLImageElement).width,
      (texture.image as HTMLImageElement).height,
      1024,
      1024
    );
    this.material = new THREE.MeshStandardMaterial({
      map: texture,
      displacementMap: displacementTexture,
      displacementScale: 150,
      displacementBias: 0.0,
      transparent: true,
    });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.mesh);
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
