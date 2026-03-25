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
import { setHasMovedGallery } from "@/utils/storage";
import { playSfx } from "@/features/audio/sfx";
gsap.registerPlugin(CustomEase);

export class IntroScene implements SceneLike {
  static CAMERA_FOV = 75;
  static CAMERA_NEAR = 5;
  static CAMERA_FAR = 5000;
  static MAX_PLANE_WIDTH = 500;

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
    this.scene.fog = new THREE.Fog(0xeeeeee, 100, 2000);
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

    this.experience.canvasWrapper.addEventListener(
      "click",
      this.setTransitionFire
    );

    this.setMoveToDetailButton();

    this.registerOnGoToGallery();
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
    return Math.min(baseSize * 0.8, IntroScene.MAX_PLANE_WIDTH);
  }

  private sceneChange() {
    if (useStore.getState().isTransitioning) return;

    setHasMovedGallery();

    const tl = gsap.timeline({
      onStart: () => {
        useStore.getState().setPhase("introPlaying");
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

    // カメラが0,0,0に
    tl.to(this.camera.position, {
      x: 0,
      y: 0,
      duration: 1.5,
      ease: "power4.inOut",
    });

    // particlesのprogressを1に
    tl.to(
      this.particles,
      {
        progress: 1,
        duration: 2,
        ease: "power4.in",
      },
      ">-0.5"
    );

    // progressによってnamePlaneをMax_DEPTH/2くらいまで後退
    tl.to(
      this.namePlane.mesh.position,
      {
        z: -this.particles.MAX_DEPTH * 0.5,
        duration: 2,
        ease: "power2.inOut",
      },
      "<0.4"
    );

    // カメラを0,0,particlesのMAX_DEPTHに
    tl.to(
      this.camera.position,
      {
        z: -this.particles.MAX_DEPTH * 0.9,
        duration: 4,
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
    if (
      this.raycaster.isHovering &&
      useStore.getState().phase === "introReady"
    ) {
      playSfx("click");
      this.transitionFire();
    }
  };
  private transitionFire() {
    this.sceneChange();
    this.raycaster.isHovering = false;
  }

  private moveToDetailButton: HTMLButtonElement | null = null;
  private moveToDetailWorldPosition = new THREE.Vector3();
  private setMoveToDetailButton() {
    this.moveToDetailButton = document.getElementById(
      "move-to-detail"
    ) as HTMLButtonElement;
    this.setButtonWorldPosition(this.isPortrait, this.planeWidth);
    this.moveToDetailButton.addEventListener("click", () => {
      this.transitionFire();
    });
  }
  private setButtonWorldPosition(isPortrait: boolean, width: number) {
    this.moveToDetailWorldPosition.set(
      isPortrait ? 0 : 0,
      isPortrait ? width * 0.5 : -width * 0.5,
      0
    );
  }
  private removeMoveToDetailButton() {
    this.moveToDetailButton?.removeEventListener("click", this.transitionFire);
  }

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

    this.setButtonWorldPosition(this.isPortrait, this.planeWidth);
  }

  update() {
    if (!useStore.getState().isTransitioning) {
      this.face.update();
      this.raycaster.update();
    }
    this.namePlane.update(this.particles.progress);
    this.particles.update();
    this.updateMoveToDetailButton();
  }

  private tmpV = new THREE.Vector3();
  private updateMoveToDetailButton() {
    if (
      !this.moveToDetailButton ||
      useStore.getState().phase !== "introReady" ||
      useStore.getState().isTransitioning
    )
      return;
    this.tmpV.copy(this.moveToDetailWorldPosition);
    this.tmpV.project(this.camera);
    const x = (this.tmpV.x * 0.5 + 0.5) * this.experience.config.width;
    const y = (this.tmpV.y * -0.5 + 0.5) * this.experience.config.height;
    this.moveToDetailButton.style.transform = `translate(${x}px, ${y}px)`;
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
    this.removeMoveToDetailButton();
  }

  // ページ遷移用
  reset() {
    this.resize();
    this.face.reset();
    this.namePlane.reset();
    this.particles.reset();

    this.setCameraPosition(this.camera);
  }

  private registerOnGoToGallery() {
    useRouterStore.getState().setOnGoToGallery(() => {
      useStore.getState().setActiveSceneId("intro");
      useStore.getState().setNextSceneId("gallery");
      useStore.getState().setCursorVariant("default");
      useStore.getState().setIsTransitioning(true);
      Experience.getInstance().world?.reset();

      const tmp = { value: 0 };
      gsap.to(tmp, {
        value: 1,
        duration: 0.5,
        ease: "power2.inOut",
        onComplete: () => {
          useStore.getState().setPhase("gallery");
          useStore.getState().setActiveSceneId("gallery");
          useStore.getState().setNextSceneId(null);
          useStore.getState().setIsTransitioning(false);
          useRouterStore.getState().onNavigate?.("/gallery");
        },
        onUpdate: () => {
          useStore.getState().setSceneTransitionProgress(tmp.value);
        },
      });
    });
  }
}
