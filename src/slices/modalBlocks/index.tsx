"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FC, useState } from "react";
import { PrismicNextImage, PrismicNextLink } from "@prismicio/next";
import {
  PrismicRichText,
  type SliceComponentProps,
  type JSXMapSerializer,
} from "@prismicio/react";
import { Container } from "@/components/Container";
import { FadeIn, FadeInStagger } from "@/components/FadeIn";
import { SectionIntro } from "@/components/SectionIntro";
import clsx from "clsx";

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

// Modal Component
const Modal: FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: any;
  image: any;
}> = ({ isOpen, onClose, title, description, image }) => {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 200);
  };

  if (!isOpen && !isClosing) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className={clsx(
          "absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300",
          isClosing ? "opacity-0" : "opacity-100"
        )}
        onClick={handleClose}
      />
      
      {/* Modal Content */}
      <div className={clsx(
        "relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-8 shadow-2xl transition-all duration-300",
        isClosing 
          ? "opacity-0 scale-95" 
          : "opacity-100 scale-100"
      )}>
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute right-6 top-6 z-10 rounded-full bg-white/10 p-2 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <h2 className="font-display text-3xl font-bold text-neutral-950 mb-4">
            {title}
          </h2>
        </div>

        {/* Modal Image */}
        {image && (
          <div className="mb-6">
            <PrismicNextImage
              field={image}
              className="w-full rounded-xl object-cover"
              alt=""
            />
          </div>
        )}

        {/* Modal Description */}
        {description && (
          <div className="prose prose-lg max-w-none">
            <PrismicRichText field={description} components={components} />
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Props for `ModalBlocks`.
 */
type ModalBlocksProps = SliceComponentProps<any>;

/**
 * Component for "ModalBlocks" Slices.
 */
const ModalBlocks: FC<ModalBlocksProps> = ({ slice }) => {
  const { title, eyebrow, description } = slice.primary;
  const background_color = (slice.primary as { background_color?: string }).background_color;
  const bgColor = background_color || "#f5f5f5";
  const [openModal, setOpenModal] = useState<number | null>(null);

  const openModalHandler = (index: number) => {
    setOpenModal(index);
  };

  const closeModalHandler = () => {
    setOpenModal(null);
  };

  return (
    <div className="py-8 sm:py-12 lg:py-38" style={{ backgroundColor: bgColor }}>
      <Container className="">
        {(title || eyebrow || description) && (
          <SectionIntro title={title || ""} eyebrow={eyebrow || ""}>
            {description && (
              <PrismicRichText field={description} components={components} />
            )}
          </SectionIntro>
        )}
        
        <FadeInStagger className="mt-16">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
            {slice.items.map((item: any, index: number) => {
              const heightClasses = {
                small: "aspect-square",
                medium: "aspect-square",
                large: "aspect-square",
                xlarge: "aspect-square"
              };
              
              const blockHeight = item.block_height || "medium";
              
              return (
                <FadeIn key={index} className={clsx(
                  "group relative overflow-hidden rounded-3xl transition-all duration-300 cursor-pointer",
                  heightClasses[blockHeight as keyof typeof heightClasses]
                )}>
                  {/* Background Image */}
                  {item.background_image && (
                    <div className="absolute inset-0">
                      <PrismicNextImage
                        field={item.background_image}
                        className="h-full w-full object-cover"
                        priority={index < 3}
                        alt=""
                      />
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    </div>
                  )}
                  
                  {/* Pulsing Click Indicator */}
                  <div className="absolute top-4 right-4 z-20">
                    <div className="relative">
                      {/* Pulsing circle */}
                      <div className="absolute inset-0 bg-white/20 rounded-full animate-ping" />
                      {/* Static circle */}
                      <div className="relative bg-white/90 backdrop-blur-sm rounded-full p-2">
                        <svg 
                          className="w-4 h-4 text-neutral-900" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
                          />
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" 
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="relative flex h-full flex-col justify-end p-8 text-white">
                    <div className="space-y-2">
                      {item.block_title && (
                        <h3 className="font-display text-2xl font-bold">
                          {item.block_title}
                        </h3>
                      )}
                      
                      {item.block_subtitle && (
                        <p className="text-lg text-white/80">
                          {item.block_subtitle}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Click Handler */}
                  <button
                    onClick={() => openModalHandler(index)}
                    className="absolute inset-0 z-10"
                    aria-label={`Open modal for ${item.block_title}`}
                  />
                </FadeIn>
              );
            })}
          </div>
        </FadeInStagger>
      </Container>

      {/* Modals */}
      {slice.items.map((item: any, index: number) => (
        <Modal
          key={`modal-${index}`}
          isOpen={openModal === index}
          onClose={closeModalHandler}
          title={item.modal_title || item.block_title || ""}
          description={item.modal_description}
          image={item.modal_image}
        />
      ))}
    </div>
  );
};

export default ModalBlocks;
