import DetailContainer from "@/features/navigation/DetailContainer";
import DetailToGalleryButton from "@/features/navigation/DetailToGalleryButton";
import GalleryDetailContent from "@/features/navigation/GalleryDetailContent";
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
        <GalleryDetailContent post={post} />
        <DetailToGalleryButton />
      </DetailContainer>
    </>
  );
}
