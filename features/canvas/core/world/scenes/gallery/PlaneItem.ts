import gsap from "gsap";
import * as THREE from "three";
import planeVert from "./shaders/plane.vert";
import planeFrag from "./shaders/plane.frag";

export default class PlaneItem {
  private geometry: THREE.PlaneGeometry;
  private planeSize: { width: number; height: number };
  private texture: THREE.VideoTexture<HTMLVideoElement>;

  mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;

  constructor(
    geometry: THREE.PlaneGeometry,
    planeSize: { width: number; height: number },
    texture: THREE.VideoTexture<HTMLVideoElement>
  ) {
    this.geometry = geometry;
    this.planeSize = planeSize;
    this.texture = texture;

    this.mesh = this.createPlane();
  }

  private createPlane() {
    const material = new THREE.ShaderMaterial({
      vertexShader: planeVert,
      fragmentShader: planeFrag,
      uniforms: {
        uTexture: { value: this.texture },
        uProgress: { value: 0 },
        uOpacity: { value: 1 },
        uToDetail: { value: 1 },
      },
      transparent: true,
    });
    const mesh = new THREE.Mesh(this.geometry, material);
    mesh.scale.set(this.planeSize.width, this.planeSize.height, 1);

    return mesh;
  }

  play() {
    const video = this.texture.image;
    if (!video.paused) return;
    void video.play().catch(() => {});
  }

  pause() {
    this.texture.image.pause();
  }

  hover() {
    gsap.to(this.texture.repeat, {
      x: 0.9,
      y: 0.9,
      duration: 0.3,
    });
    gsap.to(this.texture.offset, {
      x: 0.05,
      y: 0.05,
      duration: 0.3,
    });
  }

  unhover() {
    gsap.to(this.texture.repeat, {
      x: 1,
      y: 1,
      duration: 0.3,
    });
    gsap.to(this.texture.offset, {
      x: 0,
      y: 0,
      duration: 0.3,
    });
  }

  resize({ width, height }: { width: number; height: number }) {
    this.mesh.scale.set(width, height, 1);
  }
}
