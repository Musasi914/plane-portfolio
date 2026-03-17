import * as THREE from "three";

export default class LastPlane {
  private geometry: THREE.PlaneGeometry;
  mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;

  constructor(
    geometry: THREE.PlaneGeometry,
    planeSize: { width: number; height: number }
  ) {
    this.geometry = geometry;

    const material = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
    });
    this.mesh = new THREE.Mesh(this.geometry, material);
    this.mesh.scale.set(planeSize.width, planeSize.height, 1);
  }

  resize({ width, height }: { width: number; height: number }) {
    this.mesh.scale.set(width, height, 1);
  }
}
