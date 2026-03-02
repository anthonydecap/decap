import { Container } from "@/components/Container";
import { FadeIn, FadeInStagger } from "@/components/FadeIn";
import { BlogCarouselPossibilities } from "./BlogCarouselPossibilities";
import { getBlogPostsByType } from "@/lib/blog-utils";

/* eslint-disable @typescript-eslint/no-explicit-any */
type SmartValveBlogsProps = {
  slice: any;
  context?: { lang?: string };
};

/** SmartValve Blogs: same carousel behaviour as smartValvePossibilities but with blog cards. */
export default async function SmartValveBlogs({ slice, context }: SmartValveBlogsProps) {
  const { section_title, background_color } = slice.primary;
  const lang = context?.lang || "en";
  const langCode = lang === "fr" ? "fr-fr" : "en-us";
  const posts = await getBlogPostsByType("smartvalve", langCode);
  const bgColor = background_color || "#0a0a0a";

  if (posts.length === 0) return null;

  return (
    <div className="py-16 sm:py-24 lg:py-32 text-white" style={{ backgroundColor: bgColor }}>
      <Container className="overflow-visible">
        {section_title && (
          <FadeIn>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-10">
              {section_title}
            </h2>
          </FadeIn>
        )}
        <FadeInStagger faster>
          <BlogCarouselPossibilities posts={posts} lang={lang} />
        </FadeInStagger>
      </Container>
    </div>
  );
}
