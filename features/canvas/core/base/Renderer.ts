import Experience from "../Experience";
import * as THREE from "three";
import type { RenderState } from "../types/renderState";
import { useStore } from "@/store/store";
import transitionVert from "./shaders/transition.vert";
import transitionFrag from "./shaders/transition.frag";

export class Renderer {
  instance: THREE.WebGLRenderer;
  experience: Experience;
  canvasWrapper: Experience["canvasWrapper"];
  config: Experience["config"];
  scene: Experience["scene"];
  camera: Experience["camera"];

  private introRT: THREE.WebGLRenderTarget;
  private galleryRT: THREE.WebGLRenderTarget;
  private compositeMesh: THREE.Mesh<
    THREE.PlaneGeometry,
    THREE.ShaderMaterial
  > | null = null;

  constructor() {
    this.experience = Experience.getInstance();
    this.canvasWrapper = this.experience.canvasWrapper;
    this.config = this.experience.config;
    this.scene = this.experience.scene;
    this.camera = this.experience.camera;

    this.instance = this.setInstance();
    this.introRT = this.createRenderTarget();
    this.galleryRT = this.createRenderTarget();

    this.setupCompositePass();
  }

  private createRenderTarget() {
    const w = Math.floor(this.config.width * this.config.pixelRatio);
    const h = Math.floor(this.config.height * this.config.pixelRatio);
    const rt = new THREE.WebGLRenderTarget(w, h, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
    });
    return rt;
  }

  private setupCompositePass() {
    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      vertexShader: transitionVert,
      fragmentShader: transitionFrag,
      uniforms: {
        uTexActive: { value: null as THREE.Texture | null },
        uTexNext: { value: null as THREE.Texture | null },
        uProgress: { value: 0 },
      },
    });
    this.compositeMesh = new THREE.Mesh(geometry, material);
    this.scene.add(this.compositeMesh);
  }

  private setInstance() {
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
    });

    this.canvasWrapper.appendChild(renderer.domElement);
    renderer.setPixelRatio(this.config.pixelRatio);
    renderer.setSize(this.config.width, this.config.height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.5;

    return renderer;
  }

  private updateRenderTargetSizes() {
    const w = Math.floor(this.config.width * this.config.pixelRatio);
    const h = Math.floor(this.config.height * this.config.pixelRatio);
    this.introRT.setSize(w, h);
    this.galleryRT.setSize(w, h);
  }

  resize() {
    this.config = this.experience.config;
    this.instance.setPixelRatio(this.config.pixelRatio);
    this.instance.setSize(this.config.width, this.config.height);
    this.updateRenderTargetSizes();
  }

  update(renderState: RenderState) {
    const { active, next, transitionProgress } = renderState;
    const state = useStore.getState();
    const activeSceneId = state.activeSceneId;
    const nextSceneId = state.nextSceneId;

    const renderIntro = activeSceneId === "intro" || nextSceneId === "intro";
    const renderGallery =
      activeSceneId === "gallery" || nextSceneId === "gallery";

    if (renderIntro) {
      const introPair = activeSceneId === "intro" ? active : next!;
      this.instance.setRenderTarget(this.introRT);
      this.instance.render(introPair.scene, introPair.camera);
    }

    if (renderGallery) {
      const galleryPair = activeSceneId === "gallery" ? active : next!;
      this.instance.setRenderTarget(this.galleryRT);
      this.instance.render(galleryPair.scene, galleryPair.camera);
    }

    const progress = activeSceneId === "gallery" ? 1 : transitionProgress;

    if (this.compositeMesh) {
      this.compositeMesh.material.uniforms.uTexActive.value =
        this.introRT.texture;
      this.compositeMesh.material.uniforms.uTexNext.value =
        this.galleryRT.texture;
      this.compositeMesh.material.uniforms.uProgress.value = progress;
    }

    this.instance.setRenderTarget(null);
    this.instance.render(this.scene, this.camera.instance);
  }

  destroy() {
    this.introRT.dispose();
    this.galleryRT.dispose();
    this.compositeMesh?.geometry.dispose();
    this.compositeMesh?.material.dispose();
    this.instance.dispose();
    this.instance.domElement.remove();
  }
}
