// NOTE: Experience.tsで resource.on("ready") で実行される

import { galleryVideoSources, type GalleryVideoSource } from "../../../source";
import * as THREE from "three";
import EventEmitter from "../../../utils/EventEmitter";
import { useStore } from "@/store/store";
import { createVideoTextureFromSrc } from "./createVideoTexture";

export default class GalleryVideoLoader extends EventEmitter {
  private videoSources: GalleryVideoSource[];

  textures: { [key: string]: THREE.VideoTexture<HTMLVideoElement> } = {};

  constructor() {
    useStore.getState().setVideoCount(galleryVideoSources.length);

    super();
    this.videoSources = galleryVideoSources;
  }

  loadVideos(renderer: THREE.WebGLRenderer) {
    const outputColorSpace = renderer.outputColorSpace;

    const loadPromises = this.videoSources.map(async (source) => {
      try {
        const { texture, video } = await createVideoTextureFromSrc(
          source.path,
          {
            unsuspend: "loadedmetadata",
            crossOrigin: "anonymous",
            outputColorSpace: outputColorSpace as THREE.ColorSpace,
          }
        );
        this.textures[source.name] = texture;
        void video.play().catch(() => {});
      } catch (e) {
        console.error(`[GalleryVideoLoader] "${source.name}"`, e);
      }
    });

    Promise.all(loadPromises).then(() => {
      this.trigger("videoLoaded");
    });
  }
}
