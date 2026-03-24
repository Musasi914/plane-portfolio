import * as THREE from "three";
import Experience from "../../../Experience";
import lastPlaneTxVert from "./shaders/lastPlaneTx.vert";
import lastPlaneTxFrag from "./shaders/lastPlaneTx.frag";
import CustomShaderMaterial from "three-custom-shader-material/vanilla";
import {
  GPUComputationRenderer,
  type Variable,
} from "three/addons/misc/GPUComputationRenderer.js";
import computeHeightmapFS from "./shaders/computeHeightmap.frag";

export default class LastPlaneTexture {
  static WATER_DIVIDES = 64 as const;
  static WATER_WIDTH = 5 as const;

  private experience: Experience;
  private renderer: THREE.WebGLRenderer;
  private resource: Experience["resource"];

  private rt: THREE.WebGLRenderTarget;
  texture: THREE.Texture;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;

  private mesh!: THREE.Mesh<THREE.PlaneGeometry, CustomShaderMaterial>;

  private gpuCompute!: GPUComputationRenderer;
  private heightmapVar!: Variable;

  private raycaster: THREE.Raycaster;
  private pointerUv = new THREE.Vector2(999, 999);
  private oldPointerUv = new THREE.Vector2(999, 999);

  private heightmap0!: THREE.DataTexture;

  constructor(width: number, height: number) {
    this.experience = Experience.getInstance();
    this.renderer = this.experience.renderer.instance;
    this.resource = this.experience.resource;

    this.rt = this.createRenderTarget(width, height);
    this.texture = this.rt.texture;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(50, 1 / 1, 0.01, 10);
    this.camera.position.set(0, 0, 5); // 水面の手前
    this.camera.lookAt(0, 0, 0);

    this.setLight();

    this.initGPUCompute();
    this.createWaterSurface();

    this.raycaster = new THREE.Raycaster();

    this.renderer.setRenderTarget(this.rt);
    this.renderer.render(this.scene, this.camera);
    this.renderer.setRenderTarget(null);
  }

  private createRenderTarget(width: number, height: number) {
    const w = Math.floor(width * this.experience.config.pixelRatio);
    const h = Math.floor(height * this.experience.config.pixelRatio);
    return new THREE.WebGLRenderTarget(w, h, {
      type: THREE.HalfFloatType,
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      depthBuffer: false,
      stencilBuffer: false,
      generateMipmaps: false,
    });
  }

  private setLight() {
    const light = new THREE.DirectionalLight(0xffffff, 15);
    light.position.set(5, 2, 5);
    this.scene.add(light);

    const ambientLight = new THREE.AmbientLight(0xffffff, 2);
    this.scene.add(ambientLight);
  }

  private initGPUCompute() {
    this.gpuCompute = new GPUComputationRenderer(
      LastPlaneTexture.WATER_DIVIDES,
      LastPlaneTexture.WATER_DIVIDES,
      this.renderer
    );

    this.heightmap0 = this.gpuCompute.createTexture() as THREE.DataTexture;
    this.fillTexture(this.heightmap0);
    this.heightmapVar = this.gpuCompute.addVariable(
      "heightmap",
      computeHeightmapFS,
      this.heightmap0
    );
    this.heightmapVar.material.uniforms.uPointer = {
      value: this.pointerUv,
    };
    this.heightmapVar.material.uniforms.uPointerPrev = {
      value: this.oldPointerUv,
    };

    this.gpuCompute.setVariableDependencies(this.heightmapVar, [
      this.heightmapVar,
    ]);

    const error = this.gpuCompute.init();
    if (error !== null) {
      console.error(error);
    }
  }
  private fillTexture(texture: THREE.DataTexture) {
    const data = texture.image.data as THREE.TypedArray;

    for (let s = 0; s < LastPlaneTexture.WATER_DIVIDES; s++) {
      for (let t = 0; t < LastPlaneTexture.WATER_DIVIDES; t++) {
        const index = s * LastPlaneTexture.WATER_DIVIDES + t;
        data[index * 4 + 0] = 0;
        data[index * 4 + 1] = 0;
        data[index * 4 + 2] = 0;
        data[index * 4 + 3] = 1;
      }
    }
    texture.needsUpdate = true;
  }

  private createWaterSurface() {
    const geometry = new THREE.PlaneGeometry(
      LastPlaneTexture.WATER_WIDTH,
      LastPlaneTexture.WATER_WIDTH,
      LastPlaneTexture.WATER_DIVIDES,
      LastPlaneTexture.WATER_DIVIDES
    );

    const texture = this.resource.items.end as THREE.Texture;
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.LinearFilter;
    const material = new CustomShaderMaterial({
      baseMaterial: THREE.MeshStandardMaterial,
      vertexShader: lastPlaneTxVert,
      fragmentShader: lastPlaneTxFrag,
      metalness: 0.8,
      roughness: 0,
      uniforms: {
        heightmap: { value: null as THREE.Texture | null },
        uDivides: { value: LastPlaneTexture.WATER_DIVIDES },
        uWidth: { value: LastPlaneTexture.WATER_WIDTH },
        uHeightmap0: { value: this.heightmap0 },
        uEndTexture: { value: texture },
      },
    });
    this.mesh = new THREE.Mesh(geometry, material);
    this.scene.add(this.mesh);
  }

  resize(width: number, height: number) {
    const w = Math.floor(width * this.experience.config.pixelRatio);
    const h = Math.floor(height * this.experience.config.pixelRatio);
    this.rt.setSize(w, h);
  }

  update(
    pickCamera: THREE.PerspectiveCamera | null,
    pickMesh: THREE.Mesh | null,
    isCurrent: boolean
  ) {
    if (!isCurrent) return;
    this.raycastToTextureUv(pickCamera, pickMesh);

    this.gpuCompute.compute();

    this.mesh.material.uniforms.heightmap.value =
      this.gpuCompute.getCurrentRenderTarget(this.heightmapVar).texture;

    this.renderer.setRenderTarget(this.rt);
    this.renderer.render(this.scene, this.camera);
    this.renderer.setRenderTarget(null);
  }

  /** 画面のポインタはギャラリーカメラの NDC と一致。RT 用カメラではない。 */
  private raycastToTextureUv(
    pickCamera: THREE.PerspectiveCamera | null,
    pickMesh: THREE.Mesh | null
  ) {
    if (!pickCamera || !pickMesh) return;

    this.raycaster.setFromCamera(this.experience.pointer.state.ndc, pickCamera);
    const hits = this.raycaster.intersectObject(pickMesh, false);
    if (hits.length > 0 && hits[0].uv) {
      this.oldPointerUv.copy(this.pointerUv);
      this.pointerUv.copy(hits[0].uv);
    } else {
      this.pointerUv.set(999, 999);
      this.oldPointerUv.set(999, 999);
    }
  }
}
