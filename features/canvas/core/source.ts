export type Source = {
  name: string;
  type: "cubeTexture" | "model" | "texture" | "font";
  path: string[] | string;
};

export const sources: Source[] = [
  {
    name: "face",
    type: "texture",
    path: "/face/face.webp",
  },
  {
    name: "face-displacement",
    type: "texture",
    path: "/face/face-displacement.webp",
  },
];
