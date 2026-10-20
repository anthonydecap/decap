import clsx from 'clsx'

function Office({
  name,
  children,
  invert = false,
}: {
  name: string
  children: React.ReactNode
  invert?: boolean
}) {
  return (
    <address
      className={clsx(
        'text-sm not-italic',
        invert ? 'text-neutral-300' : 'text-neutral-600',
      )}
    >
      <strong className={invert ? 'text-white' : 'text-neutral-950'}>
        {name}
      </strong>
      <br />
      {children}
    </address>
  )
}

/** The workshop on the Langepad, home of Decap Herentals and Atelier Frank Decap. */
export function Offices({
  invert = false,
  ...props
}: React.ComponentPropsWithoutRef<'ul'> & { invert?: boolean }) {
  return (
    <ul role="list" {...props}>
      <li>
        <Office name="Decap Herentals" invert={invert}>
          Langepad 51C
          <br />
          2200 Herentals, Belgium
        </Office>
      </li>
      <li>
        <Office name="Atelier Frank Decap" invert={invert}>
          Organ restoration, on the same site
        </Office>
      </li>
    </ul>
  )
}
