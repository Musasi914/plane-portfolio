import Experience from "../../../Experience";
import * as THREE from "three";
import faceVert from "./shaders/face.vert";
import faceFrag from "./shaders/face.frag";

export class Face {
  private experience: Experience;
  private scene: THREE.Scene;
  private resource: Experience["resource"];

  private fluid: Experience["fluid"];

  private faceMesh: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;

  constructor(scene: THREE.Scene) {
    this.experience = Experience.getInstance();
    this.scene = scene;
    this.resource = this.experience.resource;
    this.fluid = this.experience.fluid;

    this.faceMesh = this.createFace();
  }

  private createFace() {
    const {
      faceTexture,
      faceDisplacementTexture,
      faceSmileTexture,
      faceSmileDisplacementTexture,
    } = this.getTexture();

    const geometry = new THREE.PlaneGeometry(
      (faceTexture.image as HTMLImageElement).width,
      (faceTexture.image as HTMLImageElement).height,
      1024,
      1024
    );
    const material = new THREE.ShaderMaterial({
      vertexShader: faceVert,
      fragmentShader: faceFrag,
      uniforms: {
        uFace: { value: faceTexture },
        uFaceDisplacement: { value: faceDisplacementTexture },
        uFaceSmile: { value: faceSmileTexture },
        uFaceSmileDisplacement: { value: faceSmileDisplacementTexture },
        uFluidVelocity: { value: null },
      },
      transparent: true,
    });
    const faceMesh = new THREE.Mesh(geometry, material);
    faceMesh.position.set(0, 0, -200);
    this.scene.add(faceMesh);

    return faceMesh;
  }

  private getTexture() {
    const faceTexture = this.resource.items.face as THREE.Texture;
    faceTexture.colorSpace = THREE.SRGBColorSpace;
    faceTexture.minFilter = THREE.NearestFilter;
    faceTexture.magFilter = THREE.NearestFilter;
    faceTexture.generateMipmaps = false;
    const faceDisplacementTexture = this.resource.items
      .faceDisplacement as THREE.Texture;
    faceDisplacementTexture.minFilter = THREE.NearestFilter;
    faceDisplacementTexture.magFilter = THREE.NearestFilter;
    faceDisplacementTexture.generateMipmaps = false;

    const faceSmileTexture = this.resource.items.faceSmile as THREE.Texture;
    faceSmileTexture.colorSpace = THREE.SRGBColorSpace;
    faceSmileTexture.minFilter = THREE.NearestFilter;
    faceSmileTexture.magFilter = THREE.NearestFilter;
    faceSmileTexture.generateMipmaps = false;
    const faceSmileDisplacementTexture = this.resource.items
      .faceSmileDisplacement as THREE.Texture;
    faceSmileDisplacementTexture.minFilter = THREE.NearestFilter;
    faceSmileDisplacementTexture.magFilter = THREE.NearestFilter;

    return {
      faceTexture,
      faceDisplacementTexture,
      faceSmileTexture,
      faceSmileDisplacementTexture,
    };
  }

  resize() {}

  update() {
    this.faceMesh.material.uniforms.uFluidVelocity.value =
      this.fluid.getVelocityTexture();
  }

  destroy() {
    this.faceMesh.geometry.dispose();
    (this.faceMesh.material as THREE.Material).dispose();
    this.scene.remove(this.faceMesh);
  }
}
