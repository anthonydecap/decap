/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "@/prismicio";
import { formatDate } from "./format-date";

export interface BlogPost {
  uid: string;
  data: {
    title: any;
    excerpt: any;
    content: any;
    featured_image: any;
    author_name: string;
    author_role: string;
    author_image: any;
    published_date: string;
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

/**
 * Get all blog posts for a specific language
 */
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
    
    return posts as unknown as BlogPost[];
  } catch (error) {
    console.warn("Blog posts not found:", error);
    return [];
  }
}

/**
 * Get a single blog post by UID
 */
export async function getBlogPost(uid: string, lang: string = "en-us"): Promise<BlogPost | null> {
  const client = createClient();
  
  try {
    const post = await client.getByUID("blog" as any, uid, {
      lang,
    });
    
    return post as unknown as BlogPost;
  } catch (error) {
    console.warn("Blog post not found:", error);
    return null;
  }
}

/**
 * Get recent blog posts (limited number)
 */
export async function getRecentBlogPosts(limit: number = 3, lang: string = "en-us"): Promise<BlogPost[]> {
  const posts = await getBlogPosts(lang);
  return posts.slice(0, limit);
}

/**
 * Get blog posts by tag
 */
export async function getBlogPostsByTag(tag: string, lang: string = "en-us"): Promise<BlogPost[]> {
  const posts = await getBlogPosts(lang);
  return posts.filter((post) => 
    post.data.tags?.some((postTag: any) => postTag.tag === tag)
  );
}

/**
 * Get formatted date for blog post
 */
export function getBlogPostDate(post: BlogPost): string {
  return formatDate(post.data.published_date || post.first_publication_date);
}

/**
 * Get blog post excerpt as plain text
 */
export function getBlogPostExcerpt(post: BlogPost): string {
  if (!post.data.excerpt) return "";
  
  // Extract plain text from rich text field
  if (Array.isArray(post.data.excerpt)) {
    return post.data.excerpt
      .filter((item: any) => item.type === "paragraph")
      .map((item: any) => item.text)
      .join(" ");
  }
  
  return post.data.excerpt;
}

/**
 * Get blog post title as plain text
 */
export function getBlogPostTitle(post: BlogPost): string {
  if (!post.data.title) return "";
  
  // Extract plain text from rich text field
  if (Array.isArray(post.data.title)) {
    return post.data.title
      .map((item: any) => item.text)
      .join(" ");
  }
  
  return post.data.title;
}

/**
 * Get reading time text
 */
export function getReadingTimeText(minutes: number): string {
  if (minutes <= 1) return "1 min read";
  return `${minutes} min read`;
}

/**
 * Calculate reading time from content
 */
export function calculateReadingTime(content: any): number {
  if (!content) return 1;
  
  let wordCount = 0;
  
  if (Array.isArray(content)) {
    content.forEach((item: any) => {
      if (item.text) {
        wordCount += item.text.split(/\s+/).length;
      }
    });
  } else if (typeof content === "string") {
    wordCount = content.split(/\s+/).length;
  }
  
  // Average reading speed is 200-250 words per minute
  const wordsPerMinute = 200;
  const readingTime = Math.ceil(wordCount / wordsPerMinute);
  
  return readingTime > 0 ? readingTime : 1;
}

/**
 * Extract tags from a blog post
 */
export function extractTagsFromPost(post: BlogPost): string[] {
  if (!post.data.tags || !Array.isArray(post.data.tags)) {
    return [];
  }
  
  return post.data.tags
    .map((tagItem: any) => tagItem.tag)
    .filter((tag: string) => tag && tag.trim() !== "");
}

/**
 * Get all unique tags from an array of blog posts with their counts
 */
export function getAllTagsWithCounts(posts: BlogPost[]): { tag: string; count: number }[] {
  const tagCounts = new Map<string, number>();
  
  posts.forEach((post) => {
    const tags = extractTagsFromPost(post);
    tags.forEach((tag) => {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    });
  });
  
  return Array.from(tagCounts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count); // Sort by count descending
}

/**
 * Get all unique tags from an array of blog posts
 */
export function getAllTags(posts: BlogPost[]): string[] {
  const tags = new Set<string>();
  
  posts.forEach((post) => {
    const postTags = extractTagsFromPost(post);
    postTags.forEach((tag) => tags.add(tag));
  });
  
  return Array.from(tags).sort();
}

/**
 * Filter blog posts by a specific tag
 */
export function filterPostsByTag(posts: BlogPost[], tag: string): BlogPost[] {
  return posts.filter((post) => {
    const postTags = extractTagsFromPost(post);
    return postTags.includes(tag);
  });
}

/**
 * Get blog posts with tag filtering
 */
export async function getBlogPostsWithFilter(
  lang: string = "en-us",
  tag?: string
): Promise<BlogPost[]> {
  const allPosts = await getBlogPosts(lang);
  
  if (!tag) {
    return allPosts;
  }
  
  return filterPostsByTag(allPosts, tag);
}

/**
 * Get related posts by tags
 */
export function getRelatedPosts(
  currentPost: BlogPost,
  allPosts: BlogPost[],
  limit: number = 3
): BlogPost[] {
  const currentTags = extractTagsFromPost(currentPost);
  
  if (currentTags.length === 0) {
    return allPosts
      .filter((post) => post.uid !== currentPost.uid)
      .slice(0, limit);
  }
  
  const relatedPosts = allPosts
    .filter((post) => post.uid !== currentPost.uid)
    .map((post) => {
      const postTags = extractTagsFromPost(post);
      const commonTags = currentTags.filter((tag) => postTags.includes(tag));
      return {
        post,
        score: commonTags.length,
      };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.post);
  
  // Fill remaining slots with other posts if needed
  if (relatedPosts.length < limit) {
    const remainingPosts = allPosts
      .filter((post) => 
        post.uid !== currentPost.uid && 
        !relatedPosts.some((related) => related.uid === post.uid)
      )
      .slice(0, limit - relatedPosts.length);
    
    relatedPosts.push(...remainingPosts);
  }
  
  return relatedPosts;
} 