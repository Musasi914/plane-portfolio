// NOTE: Experience.tsで resource.on("ready") で実行される

import { galleryVideoSources, type GalleryVideoSource } from "../../../source";
import * as THREE from "three";
import EventEmitter from "../../../utils/EventEmitter";
import { useStore } from "@/store/store";
import { createVideoTextureFromSrc } from "./createVideoTexture";

export default class GalleryVideoLoader extends EventEmitter {
  private videoSources: GalleryVideoSource[];

  private disposed = false;

  textures: { [key: string]: THREE.VideoTexture<HTMLVideoElement> } = {};

  constructor() {
    useStore.getState().setVideoCount(galleryVideoSources.length);

    super();
    this.videoSources = galleryVideoSources;
  }

  loadVideos(renderer: THREE.WebGLRenderer) {
    if (this.disposed) return;

    const outputColorSpace = renderer.outputColorSpace;

    const loadPromises = this.videoSources.map(async (source) => {
      if (this.disposed) return;
      try {
        const { texture, video } = await createVideoTextureFromSrc(
          source.path,
          {
            unsuspend: "loadedmetadata",
            crossOrigin: "anonymous",
            outputColorSpace: outputColorSpace as THREE.ColorSpace,
          }
        );
        if (this.disposed) {
          this.disposeVideoTexturePair(texture, video);
          return;
        }
        this.textures[source.name] = texture;
        void video.play().catch(() => {});
      } catch (e) {
        console.error(`[GalleryVideoLoader] "${source.name}"`, e);
      }
    });

    void Promise.all(loadPromises).then(() => {
      if (this.disposed) return;
      this.trigger("videoLoaded");
    });
  }

  private disposeVideoTexturePair(
    texture: THREE.VideoTexture<HTMLVideoElement>,
    video: HTMLVideoElement
  ) {
    video.pause();
    video.removeAttribute("src");
    video.load();
    texture.dispose();
  }

  destroy() {
    if (this.disposed) return;
    this.disposed = true;

    this.off("videoLoaded");

    for (const texture of Object.values(this.textures)) {
      const video = texture.image as HTMLVideoElement;
      this.disposeVideoTexturePair(texture, video);
    }
    this.textures = {};
  }
}
