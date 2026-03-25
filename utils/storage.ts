// 一度galleryに移動したら、introでgallery fast moveボタンを作る
export const HAS_MOVED_GALLERY = "hasMovedGallery";

export const setHasMovedGallery = () => {
  localStorage.setItem(HAS_MOVED_GALLERY, "true");
};

export const getHasMovedGallery = () => {
  return localStorage.getItem(HAS_MOVED_GALLERY) === "true";
};
