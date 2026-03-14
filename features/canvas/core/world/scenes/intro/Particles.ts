import * as THREE from "three";
import particlesVert from "./shaders/particles.vert";
import particlesFrag from "./shaders/particles.frag";
import Experience from "../../../Experience";

export default class Particles {
  static WIDTH = 600 as const;
  static GRID_COUNT = 50 as const;
  static LAYER_COUNT = 50 as const;
  static NUM_PARTICLES =
    Particles.GRID_COUNT * Particles.GRID_COUNT * Particles.LAYER_COUNT;
  static MAX_DEPTH = 1000 as const;

  private experience: Experience;
  private gui: Experience["gui"];
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;

  private points: THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial>;

  constructor(scene: THREE.Scene, camera: THREE.PerspectiveCamera) {
    this.scene = scene;
    this.camera = camera;
    this.experience = Experience.getInstance();

    this.points = this.createParticles();

    this.gui = this.experience.gui;
    this.createGUI();
  }

  private createParticles() {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(Particles.NUM_PARTICLES * 3);
    const randoms = new Float32Array(Particles.NUM_PARTICLES * 3);

    const gridSize = Particles.WIDTH / Particles.GRID_COUNT;
    const depthPerLayer = Particles.MAX_DEPTH / Particles.LAYER_COUNT;

    let particleIndex = 0;
    for (
      let depthIndex = Particles.LAYER_COUNT - 1;
      depthIndex >= 0;
      depthIndex--
    ) {
      const depthCenterOffset = -depthIndex;
      for (let rowIndex = 0; rowIndex < Particles.GRID_COUNT; rowIndex++) {
        const rowCenterOffset = rowIndex - (Particles.GRID_COUNT - 1) / 2;
        for (
          let columnIndex = 0;
          columnIndex < Particles.GRID_COUNT;
          columnIndex++
        ) {
          const columnCenterOffset =
            columnIndex - (Particles.GRID_COUNT - 1) / 2;
          positions[particleIndex * 3] = gridSize * columnCenterOffset;
          positions[particleIndex * 3 + 1] = gridSize * rowCenterOffset;
          positions[particleIndex * 3 + 2] = depthPerLayer * depthCenterOffset;

          randoms[particleIndex * 3] = Math.random();
          randoms[particleIndex * 3 + 1] = Math.random();
          randoms[particleIndex * 3 + 2] = Math.random();

          particleIndex++;
        }
      }
    }
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("aRandom", new THREE.BufferAttribute(randoms, 3));

    const pointSize =
      (0.9 *
        (Particles.WIDTH / Particles.GRID_COUNT) *
        this.experience.config.height) /
      (Particles.WIDTH * Math.tan((this.camera.fov * Math.PI) / 360));

    const material = new THREE.ShaderMaterial({
      vertexShader: particlesVert,
      fragmentShader: particlesFrag,
      uniforms: {
        uTime: { value: 0 },
        uResolutionY: { value: this.experience.config.height },
        uPointSize: { value: pointSize },
        uProgress: { value: 0 },
        uMaxDepth: { value: Particles.MAX_DEPTH },
      },
      transparent: true,
      depthWrite: false,
    });

    const points = new THREE.Points(geometry, material);
    this.scene.add(points);

    return points;
  }

  private createGUI() {
    const folder = this.gui.addFolder("Particles");
    const obj = {
      progress: 0,
    };
    folder.add(obj, "progress", 0, 1, 0.01).onChange((value: number) => {
      this.points.material.uniforms.uProgress.value = value;
    });
    folder.open();
  }

  resize() {
    const pointSize =
      (0.9 *
        (Particles.WIDTH / Particles.GRID_COUNT) *
        this.experience.config.height) /
      (Particles.WIDTH * Math.tan((this.camera.fov * Math.PI) / 360));
    this.points.material.uniforms.uPointSize.value = pointSize;
  }

  update() {
    this.points.material.uniforms.uTime.value = this.experience.time.elapsed;
  }

  destroy() {}
}
