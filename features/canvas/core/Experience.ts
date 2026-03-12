import { Camera } from "./base/Camera";
import { Renderer } from "./base/Renderer";
import { Resource } from "./base/Resource";
import * as THREE from "three";
import { World } from "./world/World";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { sources } from "./source";
import Enviroment from "./world/Enviroment";
import { Size } from "./utils/Size";
import { Time } from "./utils/Time";
import GUI from "three/examples/jsm/libs/lil-gui.module.min.js";
import { useStore } from "@/store/store";

export default class Experience {
  static instance: Experience;
  static getInstance(): Experience {
    return this.instance;
  }

  canvasWrapper: HTMLDivElement;
  size: Size;
  time: Time;
  gui: GUI;
  stats: Stats;
  scene: THREE.Scene;
  camera: Camera;
  renderer: Renderer;
  resource: Resource;
  world: World;
  config: {
    width: number;
    height: number;
    pixelRatio: number;
  };
  enviroment: Enviroment;
  private onResize = () => this.resize();
  private onTick = () => this.update();
  private unsubscribeStore: (() => void) | null = null;

  constructor(canvasWrapper: HTMLDivElement) {
    Experience.instance = this;
    this.scene = new THREE.Scene();
    this.canvasWrapper = canvasWrapper;

    this.size = new Size();
    this.time = new Time();

    this.gui = new GUI();
    this.stats = new Stats();
    this.stats.showPanel(0);
    document.body.appendChild(this.stats.dom);

    this.config = this.setConfig();

    this.camera = new Camera();
    this.renderer = new Renderer();
    this.resource = new Resource(sources);

    this.world = new World();
    this.enviroment = new Enviroment();

    this.setupTransitionGUI();

    this.size.on("resize", this.onResize);
    this.time.on("tick", this.onTick);
    this.unsubscribeStore = useStore.subscribe((state, previousState) => {
      if (state.qualityTier !== previousState.qualityTier) {
        this.resize();
      }
    });
  }

  private setupTransitionGUI() {
    const folder = this.gui.addFolder("Transition");
    const obj = {
      progress: useStore.getState().sceneTransitionProgress,
    };
    folder
      .add(obj, "progress", 0, 1, 0.01)
      .name("sceneTransitionProgress")
      .onChange((value: number) => {
        obj.progress = value;
        useStore.getState().setSceneTransitionProgress(value);
        if (value > 0 && value < 1) {
          useStore.getState().setNextSceneId("gallery");
          useStore.getState().setActiveSceneId("intro");
        } else if (value >= 1) {
          useStore.getState().setActiveSceneId("gallery");
          useStore.getState().setNextSceneId(null);
        } else {
          useStore.getState().setNextSceneId(null);
        }
      });
    folder.open();
  }

  private getMaxPixelRatio() {
    const qualityTier = useStore.getState().qualityTier;

    if (qualityTier === "low") {
      return 1;
    }

    if (qualityTier === "medium") {
      return 1.5;
    }

    return 2;
  }

  private setConfig() {
    const boundingBox = this.canvasWrapper.getBoundingClientRect();
    return {
      width: boundingBox.width,
      height: boundingBox.height,
      pixelRatio: Math.min(window.devicePixelRatio, this.getMaxPixelRatio()),
    };
  }

  private resize() {
    this.config = this.setConfig();
    this.camera.resize();
    this.renderer.resize();
    this.world.resize();
  }

  private update() {
    this.stats.update();
    this.world.update();
    const renderState = this.world.getRenderState();
    this.renderer.update(renderState);
  }

  private disposeMaterial(material: THREE.Material | THREE.Material[]) {
    if (Array.isArray(material)) {
      material.forEach((mat) => mat.dispose());
      return;
    }

    material.dispose();
  }

  private disposeScene(scene: THREE.Scene) {
    const objectsToRemove: THREE.Object3D[] = [];

    scene.traverse((child) => {
      if (!(child instanceof THREE.Mesh || child instanceof THREE.Points)) {
        return;
      }

      child.geometry?.dispose();
      this.disposeMaterial(child.material);
      objectsToRemove.push(child);
    });

    objectsToRemove.forEach((object3D) => {
      object3D.parent?.remove(object3D);
    });

    scene.clear();
  }

  destroy() {
    this.size.off("resize");
    this.time.off("tick");
    this.unsubscribeStore?.();
    this.unsubscribeStore = null;
    this.size.destroy();
    this.time.destroy();
    this.world.destroy();
    this.camera.destroy();
    this.resource.destroy();
    this.renderer.destroy();
    this.gui.destroy();
    this.stats.dom.remove();
    this.disposeScene(this.scene);
  }
}
