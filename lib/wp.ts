// NOTE: InfiniteFreeでホスティングしているWordPressでは
// 保護ページが返るため　WordPress API を使えない。、
// public/wp-data/posts.json に貼り付けているJSONから取得する。

// 本来
// export const POSTS_ENDPOINT_URL = `${process.env.NEXT_PUBLIC_WORDPRESS_API_BASE_URL}/wp/v2/pages`;

// export const getPost = async (slug: string) => {
//   const res = await fetch(`${POSTS_ENDPOINT_URL}?slug=${slug}`);

//   return (await res.json()) as Post;
// };

import { readFile } from "fs/promises";
import path from "path";
import { cache } from "react";
import { Post } from "@/types/wp-post";

const POSTS_JSON_PATH = path.join(
  process.cwd(),
  "public",
  "wp-data",
  "posts.json"
);

const loadPosts = cache(async (): Promise<Post[]> => {
  const json = await readFile(POSTS_JSON_PATH, "utf-8");
  return JSON.parse(json) as Post[];
});

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const posts = await loadPosts();
  return posts.find((p) => p.slug === slug) ?? null;
}

export async function getPosts(): Promise<Post[]> {
  return loadPosts();
}
