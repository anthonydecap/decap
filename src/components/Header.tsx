'use client'

import { useState, useRef, useId } from 'react'
import Link from 'next/link'
import clsx from 'clsx'
import { motion } from 'framer-motion'
import { PrismicNextImage } from '@prismicio/next'
import { ImageField } from '@prismicio/client'
import { Container } from './Container'
import { Logo, Logomark } from './Logo'

function MenuIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path d="M2 6h20v2H2zM2 16h20v2H2z" />
    </svg>
  )
}

function XIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path d="m5.636 4.223 14.142 14.142-1.414 1.414L4.222 5.637z" />
      <path d="M4.222 18.363 18.364 4.22l1.414 1.414L5.636 19.777z" />
    </svg>
  )
}

function Navigation({ items }: { items: Array<{ label: string; link: { url: string } }> }) {
  return (
    <nav className="mt-px font-display text-5xl font-medium tracking-tight text-white">
      <div className="even:mt-px sm:bg-neutral-950">
        <Container>
          <div className="grid grid-cols-1 sm:grid-cols-2">
            {items.map((item, index) => (
              <Link
                key={index}
                href={item.link.url}
                className="group relative isolate -mx-6 bg-neutral-950 px-6 py-10 even:mt-px sm:mx-0 sm:px-0 sm:py-16 sm:odd:pr-16 sm:even:mt-0 sm:even:border-l sm:even:border-neutral-800 sm:even:pl-16"
              >
                <div className="flex">
                  <div className="self-center">
                    <div className="flex items-center">
                      <span className="text-white hover:text-neutral-200 transition">
                        {item.label}
                      </span>
                    </div>
                  </div>
                </div>
                <span className="absolute inset-y-0 -z-10 w-screen bg-neutral-900 opacity-0 transition group-odd:right-0 group-even:left-0 group-hover:opacity-100" />
              </Link>
            ))}
          </div>
        </Container>
      </div>
    </nav>
  )
}

interface Settings {
  data?: {
    navigation?: Array<{ label: string; link: { url: string } }>
    contact_button_text?: string
    contact_button_link?: { url: string }
    logo?: ImageField
    site_name?: string
  }
}

export function Header({ settings }: { settings?: Settings }) {
  const panelId = useId()
  const [expanded, setExpanded] = useState(false)
  const [logoHovered, setLogoHovered] = useState(false)
  const openRef = useRef<HTMLButtonElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  const navigationItems = settings?.data?.navigation || [
    { label: 'Work', link: { url: '/work' } },
    { label: 'About', link: { url: '/about' } },
    { label: 'Services', link: { url: '/services' } },
    { label: 'Contact', link: { url: '/contact' } },
  ]

  const contactButtonText = settings?.data?.contact_button_text || 'Contact us'
  const contactButtonUrl = settings?.data?.contact_button_link?.url || '/contact'
  const logo = settings?.data?.logo

  const HeaderContent = ({ invert = false }: { invert?: boolean }) => (
    <Container>
      <div className="flex items-center justify-between">
        <Link
          href="/"
          aria-label="Home"
          onMouseEnter={() => setLogoHovered(true)}
          onMouseLeave={() => setLogoHovered(false)}
        >
          {logo ? (
            <PrismicNextImage
              field={logo}
              className="h-8 w-auto"
                             alt=""
            />
          ) : (
            <>
              <Logomark
                className="h-8 sm:hidden"
                invert={invert}
                filled={logoHovered}
              />
              <Logo
                className="hidden h-8 sm:block"
                invert={invert}
                filled={logoHovered}
              />
            </>
          )}
        </Link>
        <div className="flex items-center gap-x-8">
          <Link
            href={contactButtonUrl}
            className={clsx(
              'inline-flex rounded-full px-4 py-1.5 text-sm font-semibold transition',
              invert
                ? 'bg-white text-neutral-950 hover:bg-neutral-200'
                : 'bg-neutral-950 text-white hover:bg-neutral-800',
            )}
          >
            <span className="relative top-px">{contactButtonText}</span>
          </Link>
          <button
            ref={invert ? closeRef : openRef}
            type="button"
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
            aria-controls={panelId}
            className={clsx(
              'group -m-2.5 rounded-full p-2.5 transition',
              invert ? 'hover:bg-white/10' : 'hover:bg-neutral-950/10',
            )}
            aria-label="Toggle navigation"
          >
            {expanded ? (
              <XIcon
                className={clsx(
                  'h-6 w-6',
                  invert
                    ? 'fill-white group-hover:fill-neutral-200'
                    : 'fill-neutral-950 group-hover:fill-neutral-700',
                )}
              />
            ) : (
              <MenuIcon
                className={clsx(
                  'h-6 w-6',
                  invert
                    ? 'fill-white group-hover:fill-neutral-200'
                    : 'fill-neutral-950 group-hover:fill-neutral-700',
                )}
              />
            )}
          </button>
        </div>
      </div>
    </Container>
  )

  return (
    <header>
      <div
        className="absolute top-2 right-0 left-0 z-40 pt-14"
        aria-hidden={expanded ? 'true' : undefined}
      >
        <HeaderContent />
      </div>

      <motion.div
        layout
        id={panelId}
        style={{ height: expanded ? 'auto' : '0.5rem' }}
        className="relative z-50 overflow-hidden bg-neutral-950 pt-2"
        aria-hidden={expanded ? undefined : 'true'}
      >
        <motion.div layout className="bg-neutral-800">
          <div className="bg-neutral-950 pt-14 pb-16">
            <HeaderContent invert />
          </div>
          <Navigation items={navigationItems} />
        </motion.div>
      </motion.div>
    </header>
  )
} 