// NOTE: Experience.tsで resource.on("ready") で実行される

import { galleryVideoSources, type GalleryVideoSource } from "../../../source";
import * as THREE from "three";
import EventEmitter from "../../../utils/EventEmitter";
import { useStore } from "@/store/store";

export default class GalleryVideoLoader extends EventEmitter {
  private videoSources: GalleryVideoSource[];

  textures: { [key: string]: THREE.VideoTexture<HTMLVideoElement> } = {};

  constructor() {
    useStore.getState().setVideoCount(galleryVideoSources.length);

    super();
    this.videoSources = galleryVideoSources;
  }

  loadVideos() {
    const loadPromises = this.videoSources.map((source) => {
      const video = this.createVideo(source);
      const texture = new THREE.VideoTexture(video);
      texture.minFilter = THREE.NearestFilter;
      texture.magFilter = THREE.NearestFilter;
      texture.colorSpace = THREE.SRGBColorSpace;

      this.textures[source.name] = texture;

      return this.waitForVideoLoad(video);
    });

    Promise.all(loadPromises).then(() => {
      this.trigger("videoLoaded");
    });
  }

  private createVideo(source: GalleryVideoSource) {
    const video = document.createElement("video");
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = "auto";
    video.src = source.path;
    return video;
  }

  private waitForVideoLoad(video: HTMLVideoElement): Promise<void> {
    return new Promise((resolve, reject) => {
      video.addEventListener("canplaythrough", () => resolve(), { once: true });
      video.addEventListener(
        "error",
        () => reject(new Error("Video load failed")),
        {
          once: true,
        }
      );
    });
  }
}
