/* eslint-disable @typescript-eslint/no-explicit-any */
import { type Metadata } from "next";
import { notFound } from "next/navigation";
import { reverseLocaleLookup } from "@/i18n";

// Import the LOCALES mapping for proper language conversion
// const LOCALES = {
//   "en-us": "en",
//   "fr-fr": "fr",
// } as const;
import { createClient } from "@/prismicio";
import { Container } from "@/components/Container";
import { FadeIn } from "@/components/FadeIn";
import { PrismicNextImage } from "@prismicio/next";
import { PrismicRichText, SliceZone } from "@prismicio/react";
import { components } from "@/slices";
import { formatDate } from "@/lib/format-date";
import { TagList } from "@/components/TagFilter";
import { 
  extractTagsFromPost, 
  getRelatedPosts, 
  getBlogPosts 
} from "@/lib/blog-utils";

type Params = { lang: string; uid: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { lang, uid } = await params;
  const client = createClient();
  
  try {
    // Check if blog custom type exists first
    const prismicLang = reverseLocaleLookup(lang) || "en-us";
    const post = await client.getByUID("blog" as any, uid, {
      lang: prismicLang,
    });
    
    const postData = post.data as any;
    
    return {
      title: postData.meta_title || postData.title || "Blog Post",
      description: postData.meta_description || postData.excerpt || "Read our latest blog post",
      openGraph: {
        title: postData.meta_title || postData.title || "Blog Post",
        description: postData.meta_description || postData.excerpt || "Read our latest blog post",
        images: postData.meta_image?.url ? [postData.meta_image.url] : [],
      },
    };
  } catch (error) {
    console.warn(`Blog post not found or blog custom type not synced: ${uid}`, error);
    return {
      title: "Blog Post",
      description: "Read our latest blog post",
    };
  }
}

export default async function BlogPostPage({ params }: { params: Promise<Params> }) {
  const { lang, uid } = await params;
  const client = createClient();
  
  let post: any = null;
  let allPosts: any[] = [];
  
  try {
    const prismicLang = reverseLocaleLookup(lang) || "en-us";
    
    post = await client.getByUID("blog" as any, uid, {
      lang: prismicLang,
    });
    
    // Get all posts for related posts
    allPosts = await getBlogPosts(prismicLang);
  } catch (error) {
    console.warn(`Blog post not found or blog custom type not synced: ${uid}`, error);
    notFound();
  }
  
  if (!post || !post.data) {
    notFound();
  }
  
  // Ensure post has required fields
  if (!post.data.title || !post.uid) {
    console.warn(`Blog post missing required fields: ${uid}`);
    notFound();
  }
  
  // Extract tags and get related posts
  const postTags = extractTagsFromPost(post);
  const relatedPosts = getRelatedPosts(post, allPosts, 3);

  return (
    <>
      <Container className="mt-24 sm:mt-32 lg:mt-40">
        <FadeIn>
          <header className="mx-auto flex max-w-5xl flex-col text-center">
            <h1 className="mt-6 font-display text-5xl font-medium tracking-tight text-balance text-neutral-950 sm:text-6xl">
              <PrismicRichText
                field={post.data.title}
                components={{
                  heading1: ({ children }) => <span>{children}</span>,
                  heading2: ({ children }) => <span>{children}</span>,
                  heading3: ({ children }) => <span>{children}</span>,
                }}
              />
            </h1>
            <time
              dateTime={post.data.published_date || post.first_publication_date}
              className="order-first text-sm text-neutral-950"
            >
              {formatDate(post.data.published_date || post.first_publication_date)}
            </time>
            {post.data.author_name && (
              <p className="mt-6 text-sm font-semibold text-neutral-950">
                by {post.data.author_name}
                {post.data.author_role && `, ${post.data.author_role}`}
              </p>
            )}
            
            {/* Tags */}
            {postTags.length > 0 && (
              <div className="mt-6">
                <TagList 
                  tags={postTags}
                  lang={lang}
                />
              </div>
            )}
          </header>
        </FadeIn>

        {post.data.featured_image && (
          <FadeIn>
            <div className="mt-24 sm:mt-32 lg:mt-40">
              <PrismicNextImage
                field={post.data.featured_image}
                className="w-full rounded-2xl"
                alt=""
              />
            </div>
          </FadeIn>
        )}

        <FadeIn>
          <div className="mt-24 sm:mt-32 lg:mt-40">
            <div className="mx-auto max-w-4xl prose prose-lg prose-neutral">
              <PrismicRichText field={post.data.content} />
            </div>
          </div>
        </FadeIn>

        {post.data.slices && post.data.slices.length > 0 && (
          <FadeIn>
            <div className="mt-24 sm:mt-32 lg:mt-40">
              <SliceZone slices={post.data.slices} components={components} />
            </div>
          </FadeIn>
        )}

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <FadeIn>
            <div className="mt-24 sm:mt-32 lg:mt-40">
              <h2 className="font-display text-2xl font-semibold text-neutral-950 mb-8">
                Related Posts
              </h2>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {relatedPosts.map((relatedPost) => (
                  <article key={relatedPost.uid} className="group">
                    <div className="relative overflow-hidden rounded-2xl bg-neutral-100 p-6 transition-all duration-300 hover:bg-neutral-50">
                      {relatedPost.data.featured_image && (
                        <div className="relative mb-4 aspect-video overflow-hidden rounded-xl">
                          <PrismicNextImage
                            field={relatedPost.data.featured_image}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            alt=""
                          />
                        </div>
                      )}
                      <div className="space-y-3">
                        <h3 className="font-display text-lg font-semibold text-neutral-950 group-hover:text-neutral-600 transition-colors">
                          <a href={`/${lang}/blog/${relatedPost.uid}`}>
                            <PrismicRichText field={relatedPost.data.title} />
                          </a>
                        </h3>
                        <p className="text-sm text-neutral-600 line-clamp-3">
                          <PrismicRichText field={relatedPost.data.excerpt} />
                        </p>
                        <div className="flex items-center gap-2 text-xs text-neutral-500">
                          <time dateTime={relatedPost.data.published_date || relatedPost.first_publication_date}>
                            {formatDate(relatedPost.data.published_date || relatedPost.first_publication_date)}
                          </time>
                          {relatedPost.data.author_name && (
                            <>
                              <span>•</span>
                              <span>{relatedPost.data.author_name}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </FadeIn>
        )}
      </Container>
    </>
  );
}

// Temporarily disabled due to build issues with specific blog posts
// export async function generateStaticParams() {
//   const client = createClient();
//   
//   try {
//     const posts = await client.getAllByType("blog" as any, {
//       lang: "*",
//     });
//     
//     // Ensure posts is an array and filter out any malformed posts
//     if (!Array.isArray(posts)) {
//       console.warn("Blog posts is not an array, returning empty array");
//       return [];
//     }
//     
//     const validPosts = posts.filter((post: any) => {
//       return post && 
//              typeof post === 'object' &&
//              post.uid && 
//              typeof post.uid === 'string' &&
//              post.lang && 
//              typeof post.lang === 'string' &&
//              post.data && 
//              typeof post.data === 'object' &&
//              post.data.title;
//     });
//     
//     return validPosts.map((post) => {
//       // Convert Prismic locale to URL locale using the LOCALES mapping
//       const urlLocale = LOCALES[post.lang as keyof typeof LOCALES] || post.lang;
//       
//       return { 
//         lang: urlLocale,
//         uid: post.uid 
//       };
//     });
//   } catch (error) {
//     // Return empty array if blog custom type doesn't exist yet
//     console.warn("Blog custom type not found - this is expected during initial setup", error);
//     return [];
//   }
// } 