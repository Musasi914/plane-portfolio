import * as THREE from "three";
import lastPlaneVert from "./shaders/lastPlane.vert";
import lastPlaneFrag from "./shaders/lastPlane.frag";

export default class LastPlane {
  private geometry: THREE.PlaneGeometry;
  mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;

  constructor(
    geometry: THREE.PlaneGeometry,
    planeSize: { width: number; height: number }
  ) {
    this.geometry = geometry;

    const material = new THREE.ShaderMaterial({
      vertexShader: lastPlaneVert,
      fragmentShader: lastPlaneFrag,
      uniforms: {
        // uTexture: { value: this.texture },
        uProgress: { value: 0 },
        uOpacity: { value: 1 },
      },
      transparent: true,
    });
    this.mesh = new THREE.Mesh(this.geometry, material);
    this.mesh.scale.set(planeSize.width, planeSize.height, 1);
  }

  resize({ width, height }: { width: number; height: number }) {
    this.mesh.scale.set(width, height, 1);
  }
}
