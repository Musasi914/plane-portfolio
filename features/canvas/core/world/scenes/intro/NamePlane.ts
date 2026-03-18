import * as THREE from "three";
import Experience from "../../../Experience";
import noiseGlsl from "./shaders/noise.glsl";
import nameVert from "./shaders/name.vert";
import nameFrag from "./shaders/name.frag";

export default class NamePlane {
  private experience: Experience;
  private scene: THREE.Scene;

  mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  // raycasterの対象となるオブジェクト。このクラスでは使わないが、他のクラスで使うために公開する。
  raycasteredObject: THREE.Object3D;

  private WIDTH: number;

  constructor(scene: THREE.Scene, width: number) {
    this.experience = Experience.getInstance();
    this.scene = scene;
    this.WIDTH = width;

    this.mesh = this.createNamePlane();
    this.raycasteredObject = this.mesh;
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
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.scale.set(this.WIDTH, this.WIDTH, 1);
    this.scene.add(mesh);

    return mesh;
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
    this.mesh.scale.set(this.WIDTH, this.WIDTH, 1);
  }

  update(progress: number) {
    const material = this.mesh.material as THREE.ShaderMaterial;
    material.uniforms.uTime.value = this.experience.time.elapsed;
    material.uniforms.uProgress.value = progress;
  }

  destroy() {
    this.mesh.geometry.dispose();
    (this.mesh.material as THREE.Material).dispose();
    this.scene.remove(this.mesh);
  }

  reset() {
    this.mesh.position.z = 0;
  }
}
