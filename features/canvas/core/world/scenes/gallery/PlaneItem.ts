import * as THREE from "three";

export default class PlaneItem {
  private geometry: THREE.PlaneGeometry;
  private planeSize: { width: number; height: number };
  private texture: THREE.VideoTexture<HTMLVideoElement>;

  mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;

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
    const material = new THREE.MeshBasicMaterial({
      map: this.texture,
    });
    const mesh = new THREE.Mesh(this.geometry, material);
    mesh.scale.set(this.planeSize.width, this.planeSize.height, 1);

    return mesh;
  }

  play() {
    this.texture.image.play();
  }

  pause() {
    this.texture.image.pause();
  }

  resize({ width, height }: { width: number; height: number }) {
    this.mesh.scale.set(width, height, 1);
  }
}
