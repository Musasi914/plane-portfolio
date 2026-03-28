import * as THREE from "three";
import noiseGlsl from "./shaders/noise.glsl";
import particlesVert from "./shaders/particles.vert";
import particlesFrag from "./shaders/particles.frag";
import Experience from "../../../Experience";
import { useStore } from "@/store/store";

export default class Particles {
  private GRID_COUNT = useStore.getState().isMobile ? 25 : 50;
  private LAYER_COUNT = 50 as const;
  private NUM_PARTICLES = this.GRID_COUNT * this.GRID_COUNT * this.LAYER_COUNT;

  private experience: Experience;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private WIDTH: number;
  MAX_DEPTH: number;

  private points: THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial>;
  private frameEdge: THREE.LineSegments<
    THREE.EdgesGeometry<THREE.BoxGeometry>,
    THREE.LineBasicMaterial
  >;

  progress = 0;

  constructor(
    scene: THREE.Scene,
    width: number,
    camera: THREE.PerspectiveCamera
  ) {
    this.scene = scene;
    this.camera = camera;
    this.experience = Experience.getInstance();

    this.WIDTH = width;
    this.MAX_DEPTH = width * 7;

    this.points = this.createParticles();
    this.frameEdge = this.createFrameEdge();
  }

  private createParticles() {
    const geometry = new THREE.BufferGeometry();
    const gridOffsets = new Float32Array(this.NUM_PARTICLES * 3);
    const randoms = new Float32Array(this.NUM_PARTICLES * 3);

    let particleIndex = 0;
    for (let depthIndex = this.LAYER_COUNT - 1; depthIndex >= 0; depthIndex--) {
      const depthCenterOffset = -depthIndex;
      for (let rowIndex = 0; rowIndex < this.GRID_COUNT; rowIndex++) {
        const rowCenterOffset = rowIndex - (this.GRID_COUNT - 1) / 2;
        for (
          let columnIndex = 0;
          columnIndex < this.GRID_COUNT;
          columnIndex++
        ) {
          const columnCenterOffset = columnIndex - (this.GRID_COUNT - 1) / 2;
          gridOffsets[particleIndex * 3] = columnCenterOffset;
          gridOffsets[particleIndex * 3 + 1] = rowCenterOffset;
          gridOffsets[particleIndex * 3 + 2] = depthCenterOffset;

          randoms[particleIndex * 3] = Math.random();
          randoms[particleIndex * 3 + 1] = Math.random();
          randoms[particleIndex * 3 + 2] = Math.random();

          particleIndex++;
        }
      }
    }
    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(gridOffsets, 3)
    );
    geometry.setAttribute("aRandom", new THREE.BufferAttribute(randoms, 3));

    const radius = Math.max(this.WIDTH, this.MAX_DEPTH) * 0.7;
    geometry.boundingSphere = new THREE.Sphere(
      new THREE.Vector3(0, 0, -this.MAX_DEPTH / 2),
      radius
    );
    geometry.computeBoundingSphere = () => {};

    const pointSize =
      (0.9 * (this.WIDTH / this.GRID_COUNT) * this.experience.config.height) /
      (this.WIDTH * Math.tan((this.camera.fov * Math.PI) / 360));

    const material = new THREE.ShaderMaterial({
      vertexShader: noiseGlsl + particlesVert,
      fragmentShader: particlesFrag,
      uniforms: {
        uTime: { value: 0 },
        uResolutionY: { value: this.experience.config.height },
        uPointSize: { value: pointSize },
        uProgress: { value: 0 },
        uMaxDepth: { value: this.MAX_DEPTH },
        uGridSize: { value: this.WIDTH / this.GRID_COUNT },
        uDepthPerLayer: { value: this.MAX_DEPTH / this.LAYER_COUNT },
        uFirstSize: { value: useStore.getState().isMobile ? 0.3 : 0.5 },
        uSecondSize: { value: useStore.getState().isMobile ? 0.05 : 0.1 },
      },
      transparent: true,
      // depthTest: true,
      depthWrite: false,
    });

    const points = new THREE.Points(geometry, material);
    this.scene.add(points);

    return points;
  }

  private updateBoundingSphere() {
    const radius = Math.max(this.WIDTH, this.MAX_DEPTH) * 0.7;
    this.points.geometry.boundingSphere!.set(
      new THREE.Vector3(0, 0, -this.MAX_DEPTH / 2),
      radius
    );
  }

  private createFrameEdge() {
    const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
    const geometry = new THREE.EdgesGeometry(boxGeometry);
    const material = new THREE.LineBasicMaterial({ color: 0x000000 });
    const lineSegments = new THREE.LineSegments(geometry, material);
    lineSegments.scale.set(
      this.WIDTH,
      this.WIDTH,
      this.MAX_DEPTH * this.progress
    );
    lineSegments.position.z = (-this.MAX_DEPTH / 2) * this.progress;
    this.scene.add(lineSegments);
    return lineSegments;
  }

  private prevIsMobile = useStore.getState().isMobile;
  resize(width: number) {
    this.WIDTH = width;
    this.MAX_DEPTH = width * 10;

    const pointSize =
      (0.9 * (width / this.GRID_COUNT) * this.experience.config.height) /
      (width * Math.tan((this.camera.fov * Math.PI) / 360));

    const isMobile = useStore.getState().isMobile;
    if (isMobile !== this.prevIsMobile) {
      this.GRID_COUNT = isMobile ? 25 : 50;
      this.NUM_PARTICLES = this.GRID_COUNT * this.GRID_COUNT * this.LAYER_COUNT;
      this.points.geometry.dispose();
      this.points.material.dispose();
      this.scene.remove(this.points);
      this.points = this.createParticles();
      this.points.material.uniforms.uFirstSize.value = isMobile ? 0.3 : 0.5;
      this.points.material.uniforms.uSecondSize.value = isMobile ? 0.05 : 0.1;
      this.prevIsMobile = isMobile;
    }
    this.points.material.uniforms.uPointSize.value = pointSize;
    this.points.material.uniforms.uMaxDepth.value = this.MAX_DEPTH;
    this.points.material.uniforms.uGridSize.value =
      this.WIDTH / this.GRID_COUNT;
    this.points.material.uniforms.uDepthPerLayer.value =
      this.MAX_DEPTH / this.LAYER_COUNT;
    this.points.material.uniforms.uResolutionY.value =
      this.experience.config.height;

    this.updateBoundingSphere();
  }

  update() {
    this.points.material.uniforms.uTime.value = this.experience.time.elapsed;
    this.points.material.uniforms.uProgress.value = this.progress;
    this.frameEdge.scale.set(
      this.WIDTH,
      this.WIDTH,
      this.MAX_DEPTH * this.progress
    );
    this.frameEdge.position.z = (-this.MAX_DEPTH / 2) * this.progress;
  }

  destroy() {
    this.scene.remove(this.points);
    this.scene.remove(this.frameEdge);
    this.points.geometry.dispose();
    this.points.material.dispose();
    this.frameEdge.geometry.dispose();
    this.frameEdge.material.dispose();
  }

  reset() {
    this.progress = 0;
    this.points.material.uniforms.uProgress.value = 0;
    this.frameEdge.scale.set(this.WIDTH, this.WIDTH, this.MAX_DEPTH * 0);
    this.frameEdge.position.z = 0;
  }
}
