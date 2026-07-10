/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "@/prismicio";
import { formatDate } from "./format-date";

export interface BlogPost {
  uid: string;
  data: {
    title: any;
    excerpt: any;
    card_image: any;
    featured_image: any;
    author_name: string;
    author_role: string;
    author_image: any;
    published_date: string;
    type?: string;
    tags: any[];
    reading_time: number;
    meta_title: string;
    meta_description: string;
    meta_image: any;
    slices: any[];
  };
  first_publication_date: string;
  last_publication_date: string;
  lang: string;
}

export async function getBlogPosts(lang: string = "en-us"): Promise<BlogPost[]> {
  const client = createClient();

  try {
    const posts = await client.getAllByType("blog" as any, {
      lang,
      orderings: [
        { field: "my.blog.published_date", direction: "desc" },
        { field: "document.first_publication_date", direction: "desc" },
      ],
    });

    if (Array.isArray(posts)) {
      return posts.filter(
        (post: any) => post && post.data && post.uid,
      ) as unknown as BlogPost[];
    }

    return [];
  } catch (error) {
    console.warn("Blog posts not found:", error);
    return [];
  }
}

export async function getBlogPostsByType(
  type: string,
  lang: string = "en-us",
): Promise<BlogPost[]> {
  const posts = await getBlogPosts(lang);
  return posts.filter((post) => post?.data?.type === type);
}

export function getBlogPostDate(post: BlogPost): string {
  return formatDate(post.data.published_date || post.first_publication_date);
}

export function extractTagsFromPost(post: BlogPost): string[] {
  if (!post?.data?.tags || !Array.isArray(post.data.tags)) {
    return [];
  }

  return post.data.tags
    .filter((tagItem: any) => tagItem && typeof tagItem === "object")
    .map((tagItem: any) => tagItem.tag)
    .filter((tag: string) => tag && typeof tag === "string" && tag.trim() !== "");
}

export function getRelatedPosts(
  currentPost: BlogPost,
  allPosts: BlogPost[],
  limit: number = 3,
): BlogPost[] {
  if (!currentPost || !Array.isArray(allPosts)) {
    return [];
  }

  const currentTags = extractTagsFromPost(currentPost);

  if (currentTags.length === 0) {
    return allPosts
      .filter((post) => post && post.uid !== currentPost.uid)
      .slice(0, limit);
  }

  const relatedPosts = allPosts
    .filter((post) => post && post.uid !== currentPost.uid)
    .map((post) => {
      const postTags = extractTagsFromPost(post);
      const commonTags = currentTags.filter((tag) => postTags.includes(tag));
      return { post, score: commonTags.length };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.post);

  if (relatedPosts.length < limit) {
    const remainingPosts = allPosts
      .filter(
        (post) =>
          post &&
          post.uid !== currentPost.uid &&
          !relatedPosts.some((related) => related.uid === post.uid),
      )
      .slice(0, limit - relatedPosts.length);

    relatedPosts.push(...remainingPosts);
  }

  return relatedPosts;
}
