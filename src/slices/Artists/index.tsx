/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FC } from "react";
import { PrismicNextLink, PrismicNextImage } from "@prismicio/next";
import {
  PrismicRichText,
  type JSXMapSerializer,
} from "@prismicio/react";
import { Container } from "@/components/Container";
import { FadeIn, FadeInStagger } from "@/components/FadeIn";

const components: JSXMapSerializer = {
  hyperlink: ({ node, children }) => {
    return <PrismicNextLink field={node.data}>{children}</PrismicNextLink>;
  },
};

/**
 * Props for `Artists`.
 */
interface ArtistsProps {
  slice: {
    primary: {
      title?: string;
      description?: any;
    };
    items: any[];
  };
}

/**
 * Component for "Artists" Slices.
 */
const Artists: FC<ArtistsProps> = ({ slice }) => {
  const { title, description } = slice.primary;
  const artists = slice.items || [];

  return (
    <Container className="mt-24 sm:mt-32 lg:mt-40">
      <FadeIn className="-mx-6 rounded-4xl bg-neutral-950 px-6 py-20 sm:mx-0 sm:py-32 md:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            {title && (
              <h2 className="font-display text-3xl font-medium text-white sm:text-4xl">
                {title}
              </h2>
            )}
            {description && (
              <div className="mt-6 text-base text-neutral-300">
                <PrismicRichText field={description} components={components} />
              </div>
            )}
          </div>
          
          {artists.length > 0 && (
            <div className="mt-16">
              <FadeInStagger>
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {artists.map((artist: any, index: number) => (
                    <FadeIn key={index}>
                      <div className="group relative">
                        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-neutral-800">
                          {artist.artist_portrait && (
                            <PrismicNextImage
                              field={artist.artist_portrait}
                              className="h-full w-full object-cover transition-all duration-500 ease-in-out grayscale group-hover:grayscale-0"
                              alt=""
                            />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                        </div>
                        
                        <div className="mt-4 text-center">
                          {artist.artist_name && (
                            <h3 className="font-display text-lg font-medium text-white">
                              {artist.artist_name}
                            </h3>
                          )}
                          {artist.artist_role && (
                            <p className="mt-1 text-sm text-neutral-400">
                              {artist.artist_role}
                            </p>
                          )}
                        </div>
                      </div>
                    </FadeIn>
                  ))}
                </div>
              </FadeInStagger>
            </div>
          )}
        </div>
      </FadeIn>
    </Container>
  );
};

export default Artists; 