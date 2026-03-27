/**
 * @react-three/drei の useVideoTexture と同じ考え方で、
 * HTMLVideoElement → THREE.VideoTexture を Promise で用意する（R3F なし）。
 *
 * @see https://github.com/pmndrs/drei/blob/master/src/core/VideoTexture.tsx
 */
import * as THREE from "three";

export type CreateVideoTextureOptions = {
  /** このイベントで Promise を解決する（drei 既定: loadedmetadata） */
  unsuspend?: keyof HTMLVideoElementEventMap;
  crossOrigin?: HTMLVideoElement["crossOrigin"];
  muted?: boolean;
  loop?: boolean;
  playsInline?: boolean;
  preload?: HTMLVideoElement["preload"];
  /** WebGLRenderer.outputColorSpace に合わせる（drei: gl.outputColorSpace） */
  outputColorSpace?: THREE.ColorSpace;
  minFilter?: THREE.MinificationTextureFilter;
  magFilter?: THREE.MagnificationTextureFilter;
};

export type VideoTextureResult = {
  texture: THREE.VideoTexture<HTMLVideoElement>;
  video: HTMLVideoElement;
};

function isUnsuspendReady(
  video: HTMLVideoElement,
  unsuspend: keyof HTMLVideoElementEventMap
): boolean {
  switch (unsuspend) {
    case "loadedmetadata":
      return video.readyState >= HTMLMediaElement.HAVE_METADATA;
    case "loadeddata":
    case "canplay":
      return video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA;
    case "canplaythrough":
      return video.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA;
    default:
      return false;
  }
}

export function createVideoTextureFromSrc(
  src: string,
  options: CreateVideoTextureOptions = {}
): Promise<VideoTextureResult> {
  const {
    unsuspend = "loadedmetadata",
    crossOrigin = "anonymous",
    muted = true,
    loop = true,
    playsInline = true,
    preload = "auto",
    outputColorSpace = THREE.SRGBColorSpace,
    minFilter = THREE.NearestFilter,
    magFilter = THREE.NearestFilter,
  } = options;

  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.crossOrigin = crossOrigin;
    video.muted = muted;
    video.loop = loop;
    video.playsInline = playsInline;
    video.preload = preload;
    video.src = src;

    let settled = false;

    const finish = () => {
      if (settled) return;
      settled = true;
      video.removeEventListener(unsuspend, onUnsuspend);
      video.removeEventListener("error", onError);

      const texture = new THREE.VideoTexture(video);
      texture.colorSpace = outputColorSpace;
      texture.minFilter = minFilter;
      texture.magFilter = magFilter;

      resolve({ texture, video });
    };

    const onUnsuspend = () => {
      finish();
    };

    const onError = () => {
      if (settled) return;
      settled = true;
      video.removeEventListener(unsuspend, onUnsuspend);
      video.removeEventListener("error", onError);
      reject(new Error(`Video load failed: ${src}`));
    };

    video.addEventListener("error", onError);

    if (isUnsuspendReady(video, unsuspend)) {
      queueMicrotask(finish);
    } else {
      video.addEventListener(unsuspend, onUnsuspend, { once: true });
    }
  });
}
