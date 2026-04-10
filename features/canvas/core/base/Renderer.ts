import Experience from "../Experience";
import * as THREE from "three";
import type { RenderState } from "../types/renderState";
import { useStore } from "@/store/store";
import transitionVert from "./shaders/transition.vert";
import transitionFrag from "./shaders/transition.frag";

export class Renderer {
  instance: THREE.WebGLRenderer;
  private experience: Experience;
  private canvasWrapper: Experience["canvasWrapper"];
  private config: Experience["config"];
  scene: Experience["scene"];
  private camera: Experience["camera"];

  private introRT: THREE.WebGLRenderTarget;
  private galleryRT: THREE.WebGLRenderTarget;
  private compositeMesh: THREE.Mesh<
    THREE.PlaneGeometry,
    THREE.ShaderMaterial
  > | null = null;

  planeSize: { width: number; height: number };

  constructor() {
    this.experience = Experience.getInstance();
    this.canvasWrapper = this.experience.canvasWrapper;
    this.config = this.experience.config;
    this.scene = this.experience.scene;
    this.camera = this.experience.camera;

    this.instance = this.setInstance();
    this.introRT = this.createRenderTarget();
    this.galleryRT = this.createRenderTarget();
    this.planeSize = this.updateRenderTargetSizes();

    this.setupCompositePass();
  }

  private createRenderTarget() {
    const w = Math.floor(this.config.width * this.config.pixelRatio);
    const h = Math.floor(this.config.height * this.config.pixelRatio);
    const rt = new THREE.WebGLRenderTarget(w, h, {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      generateMipmaps: false,
    });

    const quality = useStore.getState().qualityTier;
    rt.samples = quality === "low" ? 0 : quality === "medium" ? 0 : 2;

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
        uFluidVelocity: { value: null as THREE.Texture | null },
      },
    });
    this.compositeMesh = new THREE.Mesh(geometry, material);
    this.scene.add(this.compositeMesh);
  }

  private setInstance() {
    const renderer = new THREE.WebGLRenderer({
      antialias: !useStore.getState().isMobile,
      powerPreference: "high-performance",
    });

    this.canvasWrapper.appendChild(renderer.domElement);
    renderer.setPixelRatio(this.config.pixelRatio);
    renderer.setSize(this.config.width, this.config.height);
    renderer.setClearColor(0xf0f0f0);
    renderer.outputColorSpace = THREE.LinearSRGBColorSpace;

    return renderer;
  }

  private updateRenderTargetSizes() {
    const w = Math.floor(this.config.width * this.config.pixelRatio);
    const h = Math.floor(this.config.height * this.config.pixelRatio);
    this.introRT.setSize(w, h);
    this.galleryRT.setSize(w, h);
    return { width: w, height: h };
  }

  resize() {
    this.config = this.experience.config;
    this.instance.setPixelRatio(this.config.pixelRatio);
    this.instance.setSize(this.config.width, this.config.height);
    this.planeSize = this.updateRenderTargetSizes();
  }

  loadingUpdate() {
    this.instance.setRenderTarget(null);
    this.instance.render(this.scene, this.camera.instance);
  }

  update(renderState: RenderState, fluidVelocityTexture: THREE.Texture) {
    const { active, next, transitionProgress } = renderState;
    const state = useStore.getState();
    const activeSceneId = state.activeSceneId;
    const nextSceneId = state.nextSceneId;

    const progress = nextSceneId
      ? transitionProgress
      : activeSceneId === "gallery"
      ? 1
      : 0;
    if (this.compositeMesh) {
      this.compositeMesh.material.uniforms.uTexActive.value =
        this.introRT.texture;
      this.compositeMesh.material.uniforms.uTexNext.value =
        this.galleryRT.texture;
      this.compositeMesh.material.uniforms.uProgress.value = progress;
      this.compositeMesh.material.uniforms.uFluidVelocity.value =
        fluidVelocityTexture;
    }

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
