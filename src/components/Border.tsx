import clsx from 'clsx'

export function Border({
  className,
  position = 'top',
  invert = false,
  ...props
}: React.ComponentPropsWithoutRef<'div'> & {
  position?: 'top' | 'left'
  invert?: boolean
}) {
  return (
    <div
      className={clsx(
        className,
        'relative',
        position === 'top' &&
          'before:absolute before:left-0 before:top-0 before:h-px before:w-6',
        position === 'left' &&
          'before:absolute before:left-0 before:top-0 before:h-6 before:w-px',
        invert ? 'before:bg-white' : 'before:bg-neutral-950',
      )}
      {...props}
    />
  )
} 