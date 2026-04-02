"use client";

import { useStore } from "@/store/store";
import type { Post } from "@/types/wp-post";

type Props = {
  post: Post;
};

export default function GalleryDetailContent({ post }: Props) {
  const isMobile = useStore((s) => s.isMobile);

  return (
    <section
      aria-labelledby="page-title"
      className="relative z-0 w-full pointer-events-auto"
    >
      <div
        id="detail-container"
        className={
          isMobile
            ? "grid gap-8 p-4 md:p-8"
            : "absolute inset-0 grid grid-cols-[1fr_2fr] gap-8 p-4 md:p-8"
        }
      >
        <div
          className={
            isMobile
              ? "grid gap-4 content-center p-4 md:p-8"
              : "fixed inset-0 min-h-screen grid gap-4 content-center p-4 md:p-8 w-1/3"
          }
        >
          <div className="flex items-center gap-2">
            <span>
              #{post.acf["work-number"].toString().padStart(2, "0")}
            </span>
            <span
              className={`w-px rotate-12 bg-gray-700 block ${
                isMobile ? "h-[1em]" : "h-[1.5em]"
              }`}
            />
            <span className="text-sm">{post.acf["work-type"]} work</span>
          </div>
          <div>
            <h1
              id="page-title"
              className={isMobile ? "text-3xl" : "text-4xl"}
            >
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
          className={
            isMobile
              ? "relative contents"
              : "relative block min-h-full col-2"
          }
        >
          <div
            className={
              isMobile ? "pb-24 contents" : "pt-8 pb-24 block"
            }
          >
            <div className="aspect-8/5 -order-10" />
            <article
              className={
                isMobile
                  ? "pb-20 pt-8 prose prose-figure:h-auto prose-h2:font-medium prose-strong:font-medium text-foreground max-w-none"
                  : "pb-0 pt-0 prose prose-figure:h-auto prose-h2:font-medium prose-strong:font-medium text-foreground max-w-none"
              }
              dangerouslySetInnerHTML={{ __html: post.content.rendered }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
