import DetailToGalleryButton from "@/features/navigation/DetailToGalleryButton";
import { getPostBySlug } from "@/lib/wp";
import { notFound } from "next/navigation";
import { Metadata } from "next";

export default async function page({ params }: { params: { slug: string } }) {
  const { slug } = await params;

  const post = await getPostBySlug(slug);

  if (!post) notFound();

  return (
    <>
      <section
        aria-describedby="page-title"
        className="w-full pointer-events-auto animate-fade-in-soft"
      >
        <div className="absolute inset-0 grid grid-cols-[1fr_2fr] gap-8 p-4 md:p-8">
          <div className="fixed pointer-events-none inset-0 grid gap-4 content-center p-4 md:p-8 w-1/3">
            <div className="flex items-center gap-2">
              <span>
                #{post.acf["work-number"].toString().padStart(2, "0")}
              </span>
              <span className="w-px h-[1.5em] rotate-12 bg-gray-700 block"></span>
              <span className="text-sm">{post.acf["work-type"]} work</span>
            </div>
            <div>
              <h1 id="page-title" className="text-4xl">
                {post.title.rendered}
              </h1>
              <span>{post.acf.work_period}</span>
            </div>
            <div className="flex gap-x-2 gap-y-1 flex-wrap max-w-full text-xs tracking-wide">
              {post.acf.tec.map((tec) => (
                <span key={tec} className="text-background bg-foreground p-1">
                  {tec}
                </span>
              ))}
            </div>
            <div
              className="text-xs"
              dangerouslySetInnerHTML={{ __html: post.acf.summary }}
            />
            <div className="grid grid-cols-2 gap-2 text-sm">
              {post.acf.site_url && (
                <a
                  href={post.acf.site_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border p-2 cursor-pointer text-center pointer-events-auto"
                  data-cursor-hover
                  data-cursor-text="open tab"
                >
                  visit site
                </a>
              )}
              {post.acf.github_url && (
                <a
                  href={post.acf.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border p-2 cursor-pointer text-center pointer-events-auto"
                  data-cursor-hover
                  data-cursor-text="open tab"
                >
                  view github
                </a>
              )}
            </div>
          </div>
          <div id="detail-canvas" className="relative min-h-full col-2">
            <div className="pt-8 pb-48">
              <div className="aspect-8/5"></div>
              <article
                className="prose text-foreground max-w-none"
                dangerouslySetInnerHTML={{ __html: post.content.rendered }}
              />
            </div>
          </div>
        </div>
      </section>
      <DetailToGalleryButton />
    </>
  );
}
