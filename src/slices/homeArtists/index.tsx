/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FC } from "react";
import { PrismicNextLink, PrismicNextImage } from "@prismicio/next";
import { PrismicRichText, type JSXMapSerializer } from "@prismicio/react";
import { Container } from "@/components/Container";
import { FadeIn } from "@/components/FadeIn";

const components: JSXMapSerializer = {
  hyperlink: ({ node, children }) => (
    <PrismicNextLink field={node.data}>{children}</PrismicNextLink>
  ),
};

interface HomeArtistsProps {
  slice: {
    primary: {
      title?: string;
      description?: any;
    };
    items: any[];
  };
}

const HomeArtists: FC<HomeArtistsProps> = ({ slice }) => {
  const { title, description } = slice.primary;
  const artists = slice.items || [];

  if (artists.length === 0) {
    return null;
  }

  const reelItems = [...artists, ...artists];

  return (
    <Container className="mt-8 sm:mt-12 lg:mt-16">
      <FadeIn className="-mx-6 rounded-4xl bg-neutral-950 px-6 py-20 sm:mx-0 sm:py-32 md:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            {title ? (
              <h2 className="font-display text-3xl font-medium text-white sm:text-4xl">
                {title}
              </h2>
            ) : null}
            {description ? (
              <div className="mt-6 text-base text-neutral-300">
                <PrismicRichText field={description} components={components} />
              </div>
            ) : null}
          </div>

          <div className="mt-16 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
            <div className="home-artists-reel flex w-max gap-6 pr-6">
              {reelItems.map((artist: any, index: number) => (
                <article
                  key={`${artist.artist_name || "artist"}-${index}`}
                  className="w-[220px] shrink-0 lg:w-[240px]"
                >
                  <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-neutral-800">
                    {artist.artist_portrait ? (
                      <PrismicNextImage
                        field={artist.artist_portrait}
                        className="h-full w-full object-cover"
                        alt=""
                      />
                    ) : null}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
                  </div>

                  <div className="mt-4 text-center">
                    {artist.artist_name ? (
                      <h3 className="font-display text-lg font-medium text-white">
                        {artist.artist_name}
                      </h3>
                    ) : null}
                    {artist.artist_role ? (
                      <p className="mt-1 text-sm text-neutral-400">{artist.artist_role}</p>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </FadeIn>
    </Container>
  );
};

export default HomeArtists;
