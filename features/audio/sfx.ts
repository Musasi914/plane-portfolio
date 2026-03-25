import { useStore } from "@/store/store";

const sfx = {
  hover: new Audio("/audio/hover.mp3"),
  click: new Audio("/audio/click.mp3"),
  wind: new Audio("/audio/wind.mp3"),
  scratch: new Audio("/audio/scratch.mp3"),
};

export default sfx;

export const playSfx = (name: keyof typeof sfx) => {
  if (!useStore.getState().enableSound) return;
  const audio = sfx[name];

  audio.playbackRate = name === "scratch" ? 3 : 1;
  audio.currentTime = 0;
  audio.play();
};
