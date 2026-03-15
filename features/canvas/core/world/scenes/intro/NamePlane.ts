import * as THREE from "three";
import Experience from "../../../Experience";
import noiseGlsl from "./shaders/noise.glsl";
import nameVert from "./shaders/name.vert";
import nameFrag from "./shaders/name.frag";

export default class NamePlane {
  private experience: Experience;
  private scene: THREE.Scene;

  private namePlane: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;

  private WIDTH: number;

  constructor(scene: THREE.Scene, width: number) {
    this.experience = Experience.getInstance();
    this.scene = scene;
    this.WIDTH = width;

    this.namePlane = this.createNamePlane();
  }

  private createNamePlane() {
    const texture = this.getTexture();
    const geometry = new THREE.PlaneGeometry(1, 1);
    const material = new THREE.ShaderMaterial({
      vertexShader: nameVert,
      fragmentShader: noiseGlsl + nameFrag,
      uniforms: {
        uTexture: { value: texture },
        uTime: { value: 0 },
        uProgress: { value: 0 },
      },
      transparent: true,
    });
    const namePlane = new THREE.Mesh(geometry, material);
    namePlane.scale.set(this.WIDTH, this.WIDTH, 1);
    this.scene.add(namePlane);

    return namePlane;
  }

  private getTexture() {
    const texture = this.experience.resource.items.name as THREE.Texture;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;
    texture.generateMipmaps = false;
    return texture;
  }

  resize(width: number) {
    this.WIDTH = width;
    this.namePlane.scale.set(this.WIDTH, this.WIDTH, 1);
  }

  update(progress: number) {
    const material = this.namePlane.material as THREE.ShaderMaterial;
    material.uniforms.uTime.value = this.experience.time.elapsed;
    material.uniforms.uProgress.value = progress;
  }

  destroy() {
    this.namePlane.geometry.dispose();
    (this.namePlane.material as THREE.Material).dispose();
    this.scene.remove(this.namePlane);
  }
}
