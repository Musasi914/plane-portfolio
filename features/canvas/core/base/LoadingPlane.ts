import * as THREE from "three";
import Experience from "../Experience";
import loadingPlaneFrag from "./shaders/loadingPlane.frag";
import gsap from "gsap";

export default class LoadingPlane {
  private experience: Experience;
  private scene: Experience["scene"];
  private size: { width: number; height: number };
  private mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;

  private disposed = false;

  constructor(scene: THREE.Scene, size: { width: number; height: number }) {
    this.experience = Experience.getInstance();
    this.scene = scene;
    this.size = size;
    this.mesh = this.createLoadingPlane();
  }

  private createLoadingPlane() {
    const geometry = new THREE.PlaneGeometry(1, 1);
    const material = new THREE.ShaderMaterial({
      fragmentShader: loadingPlaneFrag,
      uniforms: {
        uTime: { value: 0 },
        uResolution: {
          value: new THREE.Vector2(this.size.width, this.size.height),
        },
        uProgress: { value: 0 },
      },
      transparent: true,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.renderOrder = 1;
    mesh.scale.set(this.size.width, this.size.height, 1);
    this.scene.add(mesh);

    return mesh;
  }

  async play() {
    await gsap.to(this.mesh.material.uniforms.uProgress, {
      value: 1,
      duration: 3,
      delay: 1,
      ease: "power4.in",
      onComplete: () => {
        this.disposed = true;
      },
    });
  }

  resize({ width, height }: { width: number; height: number }) {
    if (this.disposed) return;
    this.mesh.scale.set(width, height, 1);
    this.mesh.material.uniforms.uResolution.value.set(width, height);
  }

  update() {
    if (this.disposed) return;
    this.mesh.material.uniforms.uTime.value = this.experience.time.elapsed;
  }

  destroy() {
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
    this.scene.remove(this.mesh);
  }
}
