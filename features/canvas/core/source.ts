export type Source = {
  name: string;
  type: "texture";
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
  {
    name: "end",
    type: "texture",
    path: "/gallery/texture/end.webp",
  },
];

export type GalleryVideoSource = {
  name: string;
  path: string;
  slug: string;
};

export const galleryVideoSources: GalleryVideoSource[] = [
  {
    name: "旧ポートフォリオ",
    path: "/gallery/video/portfolio.webm",
    slug: "portfolio",
  },
  {
    name: "kgrit",
    path: "/gallery/video/kgrit.webm",
    slug: "kgrit",
  },
  {
    name: "cafe",
    path: "/gallery/video/cafe.webm",
    slug: "cafe",
  },
  {
    name: "3d練習",
    path: "/gallery/video/3d-practice.webm",
    slug: "3d-practice",
  },
  {
    name: "日記帳",
    path: "/gallery/video/diary.webm",
    slug: "diary",
  },
  {
    name: "当サイト",
    path: "/gallery/video/this-site.webm",
    slug: "this-site",
  },
];
