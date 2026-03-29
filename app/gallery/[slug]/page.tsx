import DetailContainer from "@/features/navigation/DetailContainer";
import DetailToGalleryButton from "@/features/navigation/DetailToGalleryButton";
import { getPostBySlug, getPosts } from "@/lib/wp";
import { notFound } from "next/navigation";

export const dynamicParams = false;

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export default async function page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const post = await getPostBySlug(slug);

  if (!post) notFound();

  return (
    <>
      <DetailContainer>
        <section
          aria-labelledby="page-title"
          className="relative z-0 w-full pointer-events-auto"
        >
          <div
            id="detail-container"
            className="sm:absolute sm:inset-0 grid sm:grid-cols-[1fr_2fr] gap-8 p-4 md:p-8"
          >
            <div className="sm:fixed sm:inset-0 sm:min-h-screen grid gap-4 content-center p-4 md:p-8 sm:w-1/3">
              <div className="flex items-center gap-2">
                <span>
                  #{post.acf["work-number"].toString().padStart(2, "0")}
                </span>
                <span className="w-px h-[1em] sm:h-[1.5em] rotate-12 bg-gray-700 block"></span>
                <span className="text-sm">{post.acf["work-type"]} work</span>
              </div>
              <div>
                <h1 id="page-title" className="text-3xl sm:text-4xl">
                  {post.title.rendered}
                </h1>
                <span>{post.acf.work_period}</span>
              </div>
              <div className="flex gap-1 flex-wrap max-w-full text-xs tracking-wide">
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
              <div className="grid grid-cols-[repeat(auto-fit,minmax(9rem,1fr))] gap-2 text-sm">
                {post.acf.site_url && (
                  <a
                    href={post.acf.site_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative border p-2 cursor-pointer text-center pointer-events-auto"
                    data-cursor-hover
                    data-cursor-text="open tab"
                  >
                    visit site
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="absolute right-2 top-1/2 -translate-y-1/2 size-4"
                    >
                      <path d="M15 3h6v6" />
                      <path d="M10 14 21 3" />
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    </svg>
                  </a>
                )}
                {post.acf.github_url && (
                  <a
                    href={post.acf.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative border p-2 cursor-pointer text-center pointer-events-auto"
                    data-cursor-hover
                    data-cursor-text="open tab"
                  >
                    view github
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="absolute right-2 top-1/2 -translate-y-1/2 size-4"
                    >
                      <path d="M15 3h6v6" />
                      <path d="M10 14 21 3" />
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
            <div
              id="detail-canvas"
              tabIndex={0}
              className="relative contents sm:block sm:min-h-full sm:col-2"
            >
              <div className="sm:pt-8 pb-24 contents sm:block">
                <div className="aspect-8/5 -order-10"></div>
                <article
                  className="pb-20 sm:pb-0 pt-8 sm:pt-0 prose prose-figure:h-auto prose-h2:font-medium prose-strong:font-medium text-foreground max-w-none"
                  dangerouslySetInnerHTML={{ __html: post.content.rendered }}
                />
              </div>
            </div>
          </div>
        </section>
        <DetailToGalleryButton />
      </DetailContainer>
    </>
  );
}
