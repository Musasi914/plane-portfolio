import GalleryFocusPanel from "@/features/navigation/GalleryFocusPanel";

export default function GalleryPage() {
  return (
    <>
      <section aria-labelledby="gallery-title" className="sr-only">
        <h1 id="gallery-title">作品ギャラリー</h1>
        <p>
          こちらには、過去に制作した作品・制作物を掲載しています。
          <br />
          スクロールまたはタブ移動で作品を切替、クリックで詳細へ遷移します。
        </p>
      </section>
      <GalleryFocusPanel />
    </>
  );
}
