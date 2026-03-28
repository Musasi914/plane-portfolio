import { useStore } from "@/store/store";
import gsap from "gsap";

type SfxName = "hover" | "click" | "wind" | "scratch";

const paths: Record<SfxName, string> = {
  hover: "/audio/hover.mp3",
  click: "/audio/click.mp3",
  wind: "/audio/wind.mp3",
  scratch: "/audio/scratch.mp3",
};

const cache = new Map<SfxName, HTMLAudioElement>();

function getAudio(name: SfxName): HTMLAudioElement | null {
  if (typeof Audio === "undefined") return null;
  let el = cache.get(name);
  if (!el) {
    el = new Audio(paths[name]);
    cache.set(name, el);
  }
  return el;
}

export const playSfx = (name: SfxName) => {
  if (typeof window === "undefined") return;
  if (!useStore.getState().enableSound) return;
  const audio = getAudio(name);
  if (!audio) return;

  audio.playbackRate = name === "scratch" ? 4 : 1;
  if (name === "wind") {
    audio.volume = 0.3;
    audio.playbackRate = 1;
    gsap.delayedCall(2.7, () => {
      audio.pause();
      audio.currentTime = 0;
    });
  } else if (name === "click") {
    audio.volume = 0.6;
  }

  audio.currentTime = 0;
  void audio.play().catch(() => console.error(`[playSfx] ${name}`));
};
