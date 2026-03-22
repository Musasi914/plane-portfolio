import Experience from "../../../Experience";
import * as THREE from "three";
import faceVert from "./shaders/face.vert";
import faceFrag from "./shaders/face.frag";
import gsap from "gsap";
import lerpFactor from "../../../utils/lerpFactor";
import { useStore } from "@/store/store";

/** faceMesh は frameEdge の FACE_SCALE 倍。Z軸方向に少し奥へ配置する */
export class Face {
  static FACE_SCALE = 0.7;
  static FACE_Z_MULTIPLIER = 0.2;

  private experience: Experience;
  private scene: THREE.Scene;
  private resource: Experience["resource"];
  private WIDTH: number; //planeの高さとして使う

  private fluid: Experience["fluid"];

  private camera: THREE.PerspectiveCamera;

  private faceTexture!: THREE.Texture<HTMLImageElement>;
  private faceMesh: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  private frameEdge: THREE.LineSegments<
    THREE.EdgesGeometry<THREE.BoxGeometry>,
    THREE.LineBasicMaterial
  >;

  /** 縦長だったらnamePaneの下に、横長だったらnamePlaneの右に配置する */
  private isPortrait: boolean;

  // rotateとsmileのオンオフ切り替え
  private faceControls = {
    rotateButton: document.getElementById("face-rotate") as HTMLButtonElement,
    smileButton: document.getElementById("face-smile") as HTMLButtonElement,
    rotateWorldPosition: new THREE.Vector3(),
    smileWorldPosition: new THREE.Vector3(),
    rotateEnabled: true,
    smileEnabled: false,
  };

  constructor(
    scene: THREE.Scene,
    width: number,
    camera: THREE.PerspectiveCamera,
    isPortrait: boolean
  ) {
    this.scene = scene;
    this.WIDTH = width;
    this.camera = camera;
    this.isPortrait = isPortrait;

    this.experience = Experience.getInstance();
    this.resource = this.experience.resource;

    this.fluid = this.experience.fluid;

    this.faceMesh = this.createFace();
    this.frameEdge = this.createFrameEdge();
    this.createFaceControls();

    document.documentElement.addEventListener("mouseleave", this.onMouseLeave);
    document.documentElement.addEventListener("mouseenter", this.onMouseEnter);
  }

  private createFaceControls() {
    this.setButtonWorldPosition(this.isPortrait, this.WIDTH);

    this.faceControls.rotateButton.addEventListener(
      "click",
      this.onRotateClick
    );
    this.faceControls.smileButton.addEventListener("click", this.onSmileClick);
  }
  private setButtonWorldPosition(isPortrait: boolean, width: number) {
    this.faceControls.rotateWorldPosition.set(
      isPortrait ? width * 0.5 : width * 1.5,
      isPortrait ? -width * 1.5 : -width * 0.5,
      0
    );
    this.faceControls.smileWorldPosition.set(
      isPortrait ? width * 0.5 : width * 1.5,
      isPortrait ? -width * 0.5 : width * 0.5,
      0
    );
  }
  private onRotateClick = () => {
    this.faceControls.rotateEnabled = !this.faceControls.rotateEnabled;
    this.faceControls.rotateButton.querySelector("span")!.textContent = this
      .faceControls.rotateEnabled
      ? "ON"
      : "OFF";
  };
  private onSmileClick = () => {
    this.faceControls.smileEnabled = !this.faceControls.smileEnabled;
    this.faceControls.smileButton.querySelector("span")!.textContent = this
      .faceControls.smileEnabled
      ? "ON"
      : "OFF";

    gsap.to(this.faceMesh.material.uniforms.uSwitchProgress, {
      value: this.faceControls.smileEnabled ? 1 : 0,
      duration: 1.4,
      ease: "power2.inOut",
    });
  };
  deleteFaceControls() {
    this.faceControls.rotateButton?.removeEventListener(
      "click",
      this.onRotateClick
    );
    this.faceControls.smileButton?.removeEventListener(
      "click",
      this.onSmileClick
    );
    gsap.to(this.faceControls.rotateButton, {
      autoAlpha: 0,
    });
    gsap.to(this.faceControls.smileButton, {
      autoAlpha: 0,
    });
  }

  private createFace() {
    const {
      faceTexture,
      faceDisplacementTexture,
      faceSmileTexture,
      faceSmileDisplacementTexture,
    } = this.getTexture();
    this.faceTexture = faceTexture;

    const geometry = new THREE.PlaneGeometry(1, 1, 1024, 1024);
    const material = new THREE.ShaderMaterial({
      vertexShader: faceVert,
      fragmentShader: faceFrag,
      uniforms: {
        uFace: { value: faceTexture },
        uFaceDisplacement: { value: faceDisplacementTexture },
        uFaceSmile: { value: faceSmileTexture },
        uFaceSmileDisplacement: { value: faceSmileDisplacementTexture },
        uFluidVelocity: { value: this.fluid.getVelocityTexture() },
        uPlaneWidth: { value: this.WIDTH },
        uFaceScale: { value: Face.FACE_SCALE },
        uSwitchProgress: { value: 0 },
      },
      transparent: true,
    });
    const faceMesh = new THREE.Mesh(geometry, material);
    faceMesh.position.set(
      this.isPortrait ? 0 : this.WIDTH,
      this.isPortrait ? -this.WIDTH : 0,
      -this.WIDTH * Face.FACE_Z_MULTIPLIER
    );
    faceMesh.scale.set(
      (faceTexture.image.width / faceTexture.image.height) *
        this.WIDTH *
        Face.FACE_SCALE,
      this.WIDTH * Face.FACE_SCALE,
      1
    );
    this.scene.add(faceMesh);

    return faceMesh;
  }
  private getTexture() {
    const faceTexture = this.resource.items
      .face as THREE.Texture<HTMLImageElement>;
    faceTexture.colorSpace = THREE.SRGBColorSpace;
    faceTexture.minFilter = THREE.NearestFilter;
    faceTexture.magFilter = THREE.NearestFilter;
    faceTexture.generateMipmaps = false;
    const faceDisplacementTexture = this.resource.items
      .faceDisplacement as THREE.Texture<HTMLImageElement>;
    faceDisplacementTexture.minFilter = THREE.NearestFilter;
    faceDisplacementTexture.magFilter = THREE.NearestFilter;
    faceDisplacementTexture.generateMipmaps = false;

    const faceSmileTexture = this.resource.items
      .faceSmile as THREE.Texture<HTMLImageElement>;
    faceSmileTexture.colorSpace = THREE.SRGBColorSpace;
    faceSmileTexture.minFilter = THREE.NearestFilter;
    faceSmileTexture.magFilter = THREE.NearestFilter;
    faceSmileTexture.generateMipmaps = false;
    const faceSmileDisplacementTexture = this.resource.items
      .faceSmileDisplacement as THREE.Texture<HTMLImageElement>;
    faceSmileDisplacementTexture.minFilter = THREE.NearestFilter;
    faceSmileDisplacementTexture.magFilter = THREE.NearestFilter;
    faceSmileDisplacementTexture.generateMipmaps = false;

    return {
      faceTexture,
      faceDisplacementTexture,
      faceSmileTexture,
      faceSmileDisplacementTexture,
    };
  }

  private createFrameEdge() {
    const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
    const geometry = new THREE.EdgesGeometry(boxGeometry);
    const material = new THREE.LineBasicMaterial({ color: 0x000000 });
    const lineSegments = new THREE.LineSegments(geometry, material);
    lineSegments.scale.set(this.WIDTH, this.WIDTH, 0);
    if (this.isPortrait) {
      lineSegments.position.set(0, -this.WIDTH, 0);
    } else {
      lineSegments.position.set(this.WIDTH, 0, 0);
    }
    this.scene.add(lineSegments);
    boxGeometry.dispose();
    return lineSegments;
  }

  private isMouseLeave = false;
  private onMouseLeave = () => {
    this.isMouseLeave = true;
  };
  private onMouseEnter = () => {
    this.isMouseLeave = false;
  };

  resize(width: number, isPortrait: boolean) {
    this.WIDTH = width;
    this.isPortrait = isPortrait;

    this.faceMesh.position.set(
      isPortrait ? 0 : width,
      isPortrait ? -width : 0,
      -width * Face.FACE_Z_MULTIPLIER
    );
    this.faceMesh.scale.set(
      (this.faceTexture.image.width / this.faceTexture.image.height) *
        width *
        Face.FACE_SCALE,
      width * Face.FACE_SCALE,
      1
    );
    this.faceMesh.material.uniforms.uPlaneWidth.value = width;

    this.frameEdge.scale.set(width, width, 0);
    this.frameEdge.position.set(
      isPortrait ? 0 : width,
      isPortrait ? -width : 0,
      0
    );

    this.setButtonWorldPosition(isPortrait, width);
  }

  update() {
    this.faceMesh.material.uniforms.uFluidVelocity.value =
      this.fluid.getVelocityTexture();

    this.updateFaceLooking();

    this.updateControlsPosition();
  }

  private targetTilt = new THREE.Vector2(0, 0);
  private updateFaceLooking() {
    this.faceMesh.lookAt(this.camera.position);
    const { uv } = this.experience.pointer.state;
    if (this.isMouseLeave || !this.faceControls.rotateEnabled) {
      this.targetTilt.lerp(
        new THREE.Vector2(0, 0),
        lerpFactor(0.1, this.experience.time.delta)
      );
    } else {
      this.targetTilt.lerp(
        new THREE.Vector2(uv.x - 0.5, -(uv.y - 0.5) * 0.5),
        lerpFactor(0.1, this.experience.time.delta)
      );
    }
    this.faceMesh.rotateY(this.targetTilt.x);
    this.faceMesh.rotateX(this.targetTilt.y);
  }

  private tmpV = new THREE.Vector3();
  private updateControlsPosition() {
    this.tmpV.copy(this.faceControls.rotateWorldPosition);
    this.tmpV.project(this.camera);
    const rx = (this.tmpV.x * 0.5 + 0.5) * this.experience.config.width;
    const ry = (this.tmpV.y * -0.5 + 0.5) * this.experience.config.height;
    this.faceControls.rotateButton.style.transform = `translate(${rx}px, ${ry}px)`;
    this.tmpV.copy(this.faceControls.smileWorldPosition);
    this.tmpV.project(this.camera);
    const sx = (this.tmpV.x * 0.5 + 0.5) * this.experience.config.width;
    const sy = (this.tmpV.y * -0.5 + 0.5) * this.experience.config.height;
    this.faceControls.smileButton.style.transform = `translate(${sx}px, ${sy}px)`;
  }

  destroy() {
    this.faceControls.rotateButton?.removeEventListener(
      "click",
      this.onRotateClick
    );
    this.faceControls.smileButton?.removeEventListener(
      "click",
      this.onSmileClick
    );

    this.faceMesh.geometry.dispose();
    this.faceMesh.material.dispose();
    this.scene.remove(this.frameEdge);
    this.frameEdge.geometry.dispose();
    this.frameEdge.material.dispose();
    this.scene.remove(this.faceMesh);
    document.documentElement.removeEventListener(
      "mouseleave",
      this.onMouseLeave
    );
    document.documentElement.removeEventListener(
      "mouseenter",
      this.onMouseEnter
    );
  }

  reset() {
    this.faceControls.rotateEnabled = true;
    this.faceControls.smileEnabled = false;
    this.faceControls.rotateButton.querySelector("span")!.textContent = "ON";
    this.faceControls.smileButton.querySelector("span")!.textContent = "OFF";
    this.faceMesh.material.uniforms.uSwitchProgress.value = 0;
  }
}
