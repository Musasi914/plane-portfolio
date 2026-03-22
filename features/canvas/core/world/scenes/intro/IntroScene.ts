import Experience from "../../../Experience";
import * as THREE from "three";
import type { SceneLike } from "../../../types/sceneLike";
import { Face } from "./Face";
import NamePlane from "./NamePlane";
import Particles from "./Particles";
import IntroRaycaster from "./IntroRaycaster";
import gsap from "gsap";
import { useRouterStore, useStore } from "@/store/store";
import { CustomEase } from "gsap/CustomEase";
gsap.registerPlugin(CustomEase);

export class IntroScene implements SceneLike {
  static CAMERA_FOV = 75;
  static CAMERA_NEAR = 5;
  static CAMERA_FAR = 5000;

  private experience: Experience;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;

  private face: Face;
  private namePlane: NamePlane;
  private particles: Particles;
  private raycaster: IntroRaycaster;

  private planeWidth: number;

  /** 縦長画面かどうか */
  private isPortrait: boolean;

  constructor() {
    this.experience = Experience.getInstance();
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xeeeeee);
    this.isPortrait =
      this.experience.config.width < this.experience.config.height;

    this.planeWidth = this.calcPlaneWidth();

    this.camera = this.setCamera();

    this.createLight();

    this.face = new Face(
      this.scene,
      this.planeWidth,
      this.camera,
      this.isPortrait
    );
    this.namePlane = new NamePlane(this.scene, this.planeWidth);
    this.particles = new Particles(this.scene, this.planeWidth, this.camera);
    this.raycaster = new IntroRaycaster(
      this.camera,
      this.namePlane.raycasteredObject
    );
    this.setTransitionFire();

    this.experience.canvasWrapper.addEventListener(
      "click",
      this.setTransitionFire
    );
  }

  private setCamera() {
    const camera = new THREE.PerspectiveCamera(
      IntroScene.CAMERA_FOV,
      this.experience.config.width / this.experience.config.height,
      IntroScene.CAMERA_NEAR,
      IntroScene.CAMERA_FAR
    );

    this.setCameraPosition(camera);

    return camera;
  }
  private setCameraPosition(camera: THREE.PerspectiveCamera) {
    const distance =
      this.experience.config.height /
      (2 * Math.tan(((IntroScene.CAMERA_FOV / 2) * Math.PI) / 180));

    if (this.isPortrait) {
      camera.position.set(0, -this.planeWidth * 0.5, distance);
    } else {
      camera.position.set(this.planeWidth * 0.5, 0, distance);
    }
  }

  private createLight() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 5);
    this.scene.add(ambientLight);
  }

  private calcPlaneWidth() {
    const baseSize = this.isPortrait
      ? Math.min(
          this.experience.config.width,
          this.experience.config.height / 2
        )
      : Math.min(
          this.experience.config.height,
          this.experience.config.width / 2
        );
    return baseSize * 0.8;
  }

  private sceneChange() {
    if (useStore.getState().isTransitioning) return;
    // this.face.deleteFaceControls();

    // カメラが0,0,0に
    const tl = gsap.timeline({
      onStart: () => {
        useStore.getState().setIsTransitioning(true);
        useStore.getState().setCursorVariant("default");
      },
      onComplete: () => {
        useStore.getState().setActiveSceneId("gallery");
        useStore.getState().setNextSceneId(null);
        useStore.getState().setIsTransitioning(false);
        useRouterStore.getState().onNavigate?.("/gallery");
      },
    });
    tl.to(this.camera.position, {
      x: 0,
      y: 0,
      duration: 1.5,
      ease: "power4.inOut",
    });

    // particlesのprogressを1に
    // カメラを0,0,particlesのMAX_DEPTHに
    // progressによってnamePlaneをMax_DEPTH/2くらいまで後退
    tl.to(
      this.particles,
      {
        progress: 1,
        duration: 2,
        ease: "power4.in",
      },
      ">-0.1"
    );
    tl.to(
      this.namePlane.mesh.position,
      {
        z: -this.particles.MAX_DEPTH * 0.5,
        duration: 2,
        ease: "power2.inOut",
      },
      "<0.2"
    );
    tl.to(
      this.camera.position,
      {
        z: -this.particles.MAX_DEPTH * 0.9,
        duration: 4.8,
        ease: CustomEase.create(
          "custom",
          "M0,0 C0.108,0 0.2,0.131 0.2,0.3 0.2,0.585 0.8,0.434 0.8,0.71 0.8,0.911 0.875,1.015 1,1.015 "
        ),
      },
      "<0.8"
    );

    const obj = {
      value: 0,
    };
    tl.to(
      obj,
      {
        value: 1,
        duration: 0.5,
        ease: "power2.inOut",
        onStart: () => {
          useStore.getState().setNextSceneId("gallery");
        },

        onUpdate: () => {
          const progress = obj.value;
          useStore.getState().setSceneTransitionProgress(progress);
        },
      },
      "-=0.5"
    );
  }

  private setTransitionFire = () => {
    if (this.raycaster.isHovering) {
      useStore.getState().setPhase("introPlaying");
      this.sceneChange();
      this.raycaster.isHovering = false;
    }
  };

  resize() {
    if (useStore.getState().phase !== "introReady") return;
    this.planeWidth = this.calcPlaneWidth();

    this.isPortrait =
      this.experience.config.width < this.experience.config.height;

    this.camera.aspect =
      this.experience.config.width / this.experience.config.height;
    this.camera.updateProjectionMatrix();
    this.camera.position.set(
      this.isPortrait ? 0 : this.planeWidth * 0.5,
      this.isPortrait ? -this.planeWidth * 0.5 : 0,
      this.camera.position.z
    );

    this.face.resize(this.planeWidth, this.isPortrait);
    this.namePlane.resize(this.planeWidth);
    this.particles.resize(this.planeWidth);
  }

  update() {
    if (!useStore.getState().isTransitioning) {
      this.face.update();
      this.raycaster.update();
    }
    this.namePlane.update(this.particles.progress);
    this.particles.update();
  }

  destroy() {
    this.face.destroy();
    this.namePlane.destroy();
    this.particles.destroy();
    this.scene.clear();
    this.experience.canvasWrapper.removeEventListener(
      "click",
      this.setTransitionFire
    );
  }

  // ページ遷移用
  reset() {
    this.resize();
    this.face.reset();
    this.namePlane.reset();
    this.particles.reset();

    this.setCameraPosition(this.camera);
  }
}
