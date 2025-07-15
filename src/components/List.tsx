import clsx from 'clsx'
import { Border } from './Border'
import { FadeIn, FadeInStagger } from './FadeIn'

export function List({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <FadeInStagger>
      <ul role="list" className={clsx('text-base text-neutral-600', className)}>
        {children}
      </ul>
    </FadeInStagger>
  )
}

export function ListItem({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <li className="group mt-10 first:mt-0">
      <FadeIn>
        <Border className="pt-10 group-first:pt-0 group-first:before:hidden group-first:after:hidden">
          <strong className="font-semibold text-neutral-950">{title}</strong>
          <div className="mt-2">{children}</div>
        </Border>
      </FadeIn>
    </li>
  )
} 