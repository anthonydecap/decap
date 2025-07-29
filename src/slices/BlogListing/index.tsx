/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FC } from "react";
import { PrismicNextLink, PrismicNextImage } from "@prismicio/next";
import {
  PrismicRichText,
  type SliceComponentProps,
  type JSXMapSerializer,
} from "@prismicio/react";
import { Container } from "@/components/Container";
import { FadeIn, FadeInStagger } from "@/components/FadeIn";
import { SectionIntro } from "@/components/SectionIntro";
import { Button } from "@/components/Button";
import { Border } from "@/components/Border";
import { TagFilter, TagStats, TagList } from "@/components/TagFilter";
import { createClient } from "@/prismicio";

// Format date function
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};
import { 
  getAllTagsWithCounts, 
  extractTagsFromPost 
} from "@/lib/blog-utils";
import { asText } from "@prismicio/client";
import { reverseLocaleLookup } from "@/i18n";

const components: JSXMapSerializer = {
  hyperlink: ({ node, children }) => {
    return <PrismicNextLink field={node.data}>{children}</PrismicNextLink>;
  },
  label: ({ node, children }) => {
    if (node.data.label === "codespan") {
      return <code>{children}</code>;
    }
  },
};

/**
 * Props for `BlogListing`.
 */
export type BlogListingProps = SliceComponentProps<any>;

/**
 * Component for "BlogListing" Slices.
 */
const BlogListing: FC<BlogListingProps> = async ({ slice, context }) => {
  const client = createClient();
  const lang = (context as any)?.lang || "en-us";
  
  // Get blog posts for the current language
  let blogPosts: any[] = [];
  
  try {
    const prismicLang = reverseLocaleLookup(lang) || "en-us";
    blogPosts = await client.getAllByType("blog" as any, {
      lang: prismicLang,
      orderings: [
        { field: "my.blog.published_date", direction: "desc" },
        { field: "document.first_publication_date", direction: "desc" },
      ],
    });
  } catch {
    console.warn("Blog posts not found yet - this is expected during setup");
  }

  console.log("========");
  console.log(blogPosts);
  console.log("=========");

  // Get all tags with counts
  const allTags = getAllTagsWithCounts(blogPosts);

  const postsPerPage = slice.primary.posts_per_page || 6;
  const displayPosts = blogPosts.slice(0, postsPerPage);

  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className="py-24 sm:py-32"
    >
      <Container>
        <SectionIntro
          title={asText(slice.primary.title) || ""}
          smaller={false}
          invert={false}
        >
          <PrismicRichText
            field={slice.primary.description}
            components={components}
          />
        </SectionIntro>

        {/* Tag Filter */}
        {slice.primary.show_featured && allTags.length > 0 && (
          <div className="mt-16">
            <FadeIn>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <TagStats tags={allTags} />
                <TagFilter tags={allTags} />
              </div>
            </FadeIn>
          </div>
        )}

        <div className="mt-24 sm:mt-32 lg:mt-40">
          <div className="space-y-24 lg:space-y-32">
            <FadeInStagger>
              {displayPosts.map((post) => {
                // Skip posts that don't have the expected structure
                if (!post || !post.data || !post.uid) {
                  return null;
                }
                
                const postTags = extractTagsFromPost(post);
                
                return (
                  <FadeIn key={post.uid}>
                    <article>
                      <Border className="pt-16">
                        <div className="relative lg:-mx-4 lg:flex lg:justify-end">
                          <div className="pt-10 lg:w-2/3 lg:flex-none lg:px-4 lg:pt-0">
                            <h2 className="font-display text-2xl font-semibold text-neutral-950">
                              <PrismicNextLink document={post}>
                                <PrismicRichText field={post.data.title} />
                              </PrismicNextLink>
                            </h2>
                            <dl className="lg:absolute lg:top-0 lg:left-0 lg:w-1/3 lg:px-4">
                              <dt className="sr-only">Published</dt>
                              <dd className="absolute top-0 left-0 text-sm text-neutral-950 lg:static">
                                <time
                                  dateTime={post.data.published_date || post.first_publication_date}
                                >
                                  {formatDate(post.data.published_date || post.first_publication_date)}
                                </time>
                              </dd>
                              {post.data.author_name && (
                                <>
                                  <dt className="sr-only">Author</dt>
                                  <dd className="mt-6 flex gap-x-4">
                                    {post.data.author_image && (
                                      <div className="flex-none overflow-hidden rounded-xl bg-neutral-100">
                                        <PrismicNextImage
                                          field={post.data.author_image}
                                          className="h-12 w-12 object-cover grayscale"
                                          alt=""
                                        />
                                      </div>
                                    )}
                                    <div className="text-sm text-neutral-950">
                                      <div className="font-semibold">
                                        {post.data.author_name}
                                      </div>
                                      {post.data.author_role && (
                                        <div>{post.data.author_role}</div>
                                      )}
                                    </div>
                                  </dd>
                                </>
                              )}
                            </dl>
                            <div className="mt-6 max-w-2xl text-base text-neutral-600">
                              <PrismicRichText
                                field={post.data.excerpt}
                                components={components}
                              />
                            </div>
                            
                            {/* Tags */}
                            {postTags.length > 0 && (
                              <div className="mt-4">
                                <TagList 
                                  tags={postTags} 
                                  lang={lang}
                                />
                              </div>
                            )}
                            
                            <Button
                              href={`/blog/${post.uid}` as any}
                              aria-label={`Read more about ${post.data.title}`}
                              className="mt-8"
                            >
                              Read more
                            </Button>
                          </div>
                        </div>
                      </Border>
                    </article>
                  </FadeIn>
                );
              })}
            </FadeInStagger>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default BlogListing; 