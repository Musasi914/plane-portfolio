import * as THREE from "three";
import LastPlaneTexture from "./LastPlaneTexture";
import lastPlaneVert from "./shaders/lastPlane.vert";
import lastPlaneFrag from "./shaders/lastPlane.frag";

export default class LastPlane {
  private geometry: THREE.PlaneGeometry;
  mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;

  lastPlaneTexture: LastPlaneTexture;
  isCurrent = false;

  constructor(
    geometry: THREE.PlaneGeometry,
    planeSize: { width: number; height: number }
  ) {
    this.geometry = geometry;

    this.lastPlaneTexture = new LastPlaneTexture(
      planeSize.width,
      planeSize.height
    );

    const material = new THREE.ShaderMaterial({
      transparent: true,
      uniforms: {
        uOpacity: { value: 1 },
        uEndTexture: { value: this.lastPlaneTexture.texture },
      },
      vertexShader: lastPlaneVert,
      fragmentShader: lastPlaneFrag,
    });
    this.mesh = new THREE.Mesh(this.geometry, material);
    this.mesh.scale.set(planeSize.width, planeSize.height, 1);
  }

  setIsCurrent(bool: boolean) {
    this.isCurrent = bool;
  }

  resize({ width, height }: { width: number; height: number }) {
    this.mesh.scale.set(width, height, 1);
    this.lastPlaneTexture.resize(width, height);
  }

  update(galleryCamera: THREE.PerspectiveCamera) {
    this.lastPlaneTexture.update(galleryCamera, this.mesh, this.isCurrent);
  }
}
