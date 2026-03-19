import { galleryVideoSources } from "../source";

export const getSlugByIndex = (index: number) => {
  return galleryVideoSources[index]?.slug || null;
};

export const getIndexBySlug = (slug: string) => {
  return galleryVideoSources.findIndex((source) => source.slug === slug);
};
