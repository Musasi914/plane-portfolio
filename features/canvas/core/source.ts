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
    name: "faceSmile",
    type: "texture",
    path: "/intro/face/face-smile.webp",
  },
  {
    name: "faceSmileDisplacement",
    type: "texture",
    path: "/intro/face/face-smile-displacement.webp",
  },
  {
    name: "name",
    type: "texture",
    path: "/intro/name/name.webp",
  },
];


export type GalleryVideoSource = {
  name: string;
  path: string;
};

export const galleryVideoSources = [
  {
    name: "portfolio",
    path: "/gallery/video/portfolio.webm",
  },
  {
    name: "kgrit",
    path: "/gallery/video/kgrit.webm",
  },
  {
    name: "cafe-moku",
    path: "/gallery/video/cafe.webm",
  },
  {
    name: "3d練習サイト",
    path: "/gallery/video/3d-practice.webm",
  },
  {
    name: "日記帳",
    path: "/gallery/video/diary.webm",
  },
  {
    name: "このサイト",
    path: "/gallery/video/diary.webm",
  },
];
