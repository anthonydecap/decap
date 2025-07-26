import { PrismicNextLink } from '@prismicio/next'
import { LinkField } from '@prismicio/client'
import clsx from 'clsx'

type ButtonProps = {
  invert?: boolean
  children: React.ReactNode
  className?: string
  href?: LinkField | string
} & Omit<React.ComponentPropsWithoutRef<'button'>, 'href'>

export function Button({
  invert = false,
  className,
  children,
  href,
  ...props
}: ButtonProps) {
  const buttonClasses = clsx(
    className,
    'inline-flex rounded-full px-4 py-1.5 text-sm font-semibold transition',
    invert
      ? 'bg-white text-neutral-950 hover:bg-neutral-200'
      : 'bg-neutral-950 text-white hover:bg-neutral-800',
  )

  const inner = <span className="relative top-px">{children}</span>

  if (href) {
    // If href is a string, render a regular <a> tag
    if (typeof href === 'string') {
      return (
        <a href={href} className={buttonClasses}>
          {inner}
        </a>
      )
    }
    // If href is a Prismic link object, render PrismicNextLink
    return (
      <PrismicNextLink field={href} className={buttonClasses}>
        {inner}
      </PrismicNextLink>
    )
  }

  return (
    <button className={buttonClasses} {...props}>
      {inner}
    </button>
  )
} 