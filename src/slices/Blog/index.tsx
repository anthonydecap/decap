/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FC } from "react";
import { type Content } from "@prismicio/client";
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

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Props for `Blog`.
 */
type BlogProps = SliceComponentProps<Content.BlogSlice>;

/**
 * Component for "Blog" Slices.
 */
const Blog: FC<BlogProps> = ({ slice }) => {
  const { title, eyebrow, description, view_all_link } = slice.primary;

  // Separate featured posts from regular posts
  const featuredPosts = slice.items.filter((item: any) => item.featured);
  const regularPosts = slice.items.filter((item: any) => !item.featured);

  return (
    <Container className="mt-24 sm:mt-32 lg:mt-40">
      <div className="flex items-center justify-between">
        <div className="max-w-2xl">
          {(title || eyebrow || description) && (
            <SectionIntro title={title || ""} eyebrow={eyebrow || ""}>
              {description && (
                <PrismicRichText field={description} components={components} />
              )}
            </SectionIntro>
          )}
        </div>
        {view_all_link && (
          <div className="mt-10 flex">
            <Button href={view_all_link} className="border border-neutral-300 bg-transparent text-neutral-950 hover:bg-neutral-100">
              View All Articles
            </Button>
          </div>
        )}
      </div>

      <FadeInStagger className="mt-16">
        {/* Featured Posts */}
        {featuredPosts.length > 0 && (
          <div className="mb-16">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              {featuredPosts.map((item: any, index: number) => (
                <FadeIn key={index} className="group">
                  <article className="relative overflow-hidden rounded-3xl bg-neutral-100 p-8 transition-all duration-300 hover:bg-neutral-50">
                    {item.post_image && (
                      <div className="relative mb-6 aspect-video overflow-hidden rounded-2xl">
                        <PrismicNextImage
                          field={item.post_image}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          priority={index === 0}
                          alt=""
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                      </div>
                    )}
                    
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 text-sm text-neutral-600">
                        {item.post_date && (
                          <time dateTime={item.post_date}>
                            {formatDate(item.post_date)}
                          </time>
                        )}
                        {item.post_category && (
                          <>
                            <span>•</span>
                            <span className="rounded-full bg-neutral-200 px-2 py-1 text-xs font-medium">
                              {item.post_category}
                            </span>
                          </>
                        )}
                      </div>
                      
                      {item.post_title && (
                        <h3 className="font-display text-2xl font-semibold text-neutral-950 group-hover:text-neutral-600 transition-colors">
                          {item.post_title}
                        </h3>
                      )}
                      
                      {item.post_excerpt && (
                        <div className="text-neutral-600">
                          <PrismicRichText
                            field={item.post_excerpt}
                            components={components}
                          />
                        </div>
                      )}
                      
                      {item.post_link && (
                        <div className="pt-4">
                          <PrismicNextLink
                            field={item.post_link}
                            className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-950 transition-colors hover:text-neutral-600"
                          >
                            Read Article
                            <svg
                              className="h-4 w-4 transition-transform group-hover:translate-x-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 8l4 4m0 0l-4 4m4-4H3"
                              />
                            </svg>
                          </PrismicNextLink>
                        </div>
                      )}
                    </div>
                  </article>
                </FadeIn>
              ))}
            </div>
          </div>
        )}

        {/* Regular Posts */}
        {regularPosts.length > 0 && (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {regularPosts.map((item: any, index: number) => (
              <FadeIn key={index} className="group">
                <article className="relative overflow-hidden rounded-2xl bg-white border border-neutral-200 p-6 transition-all duration-300 hover:border-neutral-300 hover:shadow-lg">
                  {item.post_image && (
                    <div className="relative mb-4 aspect-video overflow-hidden rounded-xl">
                      <PrismicNextImage
                        field={item.post_image}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        alt=""
                      />
                    </div>
                  )}
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-xs text-neutral-600">
                      {item.post_date && (
                        <time dateTime={item.post_date}>
                          {formatDate(item.post_date)}
                        </time>
                      )}
                      {item.post_category && (
                        <>
                          <span>•</span>
                          <span className="rounded-full bg-neutral-100 px-2 py-1 font-medium">
                            {item.post_category}
                          </span>
                        </>
                      )}
                    </div>
                    
                    {item.post_title && (
                      <h3 className="font-display text-lg font-semibold text-neutral-950 group-hover:text-neutral-600 transition-colors">
                        {item.post_title}
                      </h3>
                    )}
                    
                    {item.post_excerpt && (
                      <div className="text-sm text-neutral-600 line-clamp-3">
                        <PrismicRichText
                          field={item.post_excerpt}
                          components={components}
                        />
                      </div>
                    )}
                    
                    {item.post_link && (
                      <div className="pt-2">
                        <PrismicNextLink
                          field={item.post_link}
                          className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-950 transition-colors hover:text-neutral-600"
                        >
                          Read More
                          <svg
                            className="h-3 w-3 transition-transform group-hover:translate-x-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 8l4 4m0 0l-4 4m4-4H3"
                            />
                          </svg>
                        </PrismicNextLink>
                      </div>
                    )}
                  </div>
                </article>
              </FadeIn>
            ))}
          </div>
        )}
      </FadeInStagger>
    </Container>
  );
};

export default Blog; 