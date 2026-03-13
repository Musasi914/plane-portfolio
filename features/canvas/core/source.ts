export type Source = {
  name: string;
  type: "cubeTexture" | "model" | "texture" | "font";
  path: string[] | string;
};

export const sources: Source[] = [
  {
    name: "face",
    type: "texture",
    path: "/intro/face/face.webp",
  },
  {
    name: "faceDisplacement",
    type: "texture",
    path: "/intro/face/face-displacement.webp",
  },
  {
    name: "name",
    type: "texture",
    path: "/intro/name/name.webp",
  },
];
