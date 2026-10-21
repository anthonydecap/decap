import clsx from 'clsx'

/** The DECAP wordmark (letters D, E, C, A, P), from the original brand SVG. */
const LETTERS = [
  "M20.16 10.71C20.16 15.68 17.87 18.87 13.28 20.26C12.1 20.61 11.04 20.79 10.08 20.79H0V0.630005H10.08C11.04 0.630005 12.1 0.810005 13.28 1.16C17.87 2.55 20.16 5.74001 20.16 10.71ZM17.64 10.71C17.64 6.98 15.92 4.59 12.47 3.55C11.6 3.28 10.8 3.15 10.08 3.15H2.52V18.27H10.08C10.8 18.27 11.6 18.14 12.47 17.87C15.91 16.83 17.64 14.44 17.64 10.71Z",
  "M28.93 20.79V0.630005H46.28V3.15H31.45V13.23H43.76V15.75H31.45V18.27H46.28V20.79H28.93Z",
  "M63 21.27C57.18 21.27 52.44 16.53 52.44 10.71C52.44 4.89002 57.17 0.150024 63 0.150024C66.63 0.150024 69.97 1.98002 71.92 5.05002L69.85 6.36002C68.35 4.00002 65.79 2.59002 63 2.59002C58.53 2.59002 54.89 6.23002 54.89 10.7C54.89 15.17 58.53 18.81 63 18.81C65.79 18.81 68.35 17.4 69.85 15.04L71.92 16.35C69.97 19.42 66.63 21.25 63 21.25V21.27Z",
  "M99.54 20.79H97.02V15.75H81.9V20.79H79.38V10.08C79.38 9.12 79.56 8.06 79.91 6.88C81.3 2.29 84.49 0 89.46 0C94.43 0 97.62 2.29 99.01 6.88C99.36 8.06 99.54 9.12 99.54 10.08V20.79ZM97.02 13.23V10.08C97.02 9.36 96.89 8.56 96.62 7.69C95.58 4.25 93.19 2.52 89.46 2.52C85.73 2.52 83.34 4.24 82.3 7.69C82.03 8.56 81.9 9.36 81.9 10.08V13.23H97.02Z",
  "M128.8 8.19C128.8 11.92 127.08 14.31 123.63 15.35C122.76 15.62 121.96 15.75 121.24 15.75H111.16V20.79H108.64V0.630005H121.24C121.96 0.630005 122.76 0.760005 123.63 1.03C127.07 2.07 128.8 4.46 128.8 8.19ZM126.28 8.19C126.28 6.71 125.81 5.5 124.87 4.56C123.93 3.62 122.72 3.15 121.24 3.15H111.16V13.23H121.24C122.72 13.23 123.93 12.76 124.87 11.82C125.81 10.88 126.28 9.67 126.28 8.19Z",
]

type LogoProps = React.ComponentPropsWithoutRef<'svg'> & {
  invert?: boolean
  /** Kept for API compatibility with the template header/footer. */
  filled?: boolean
  fillOnHover?: boolean
}

/** Drops the template-only props so they don't end up on the <svg>. */
function svgProps({ filled, fillOnHover, ...rest }: Omit<LogoProps, 'invert' | 'className'>) {
  void filled
  void fillOnHover
  return rest
}

/** Full DECAP wordmark. Dark on light backgrounds, white with `invert`. */
export function Logo({ invert = false, className, ...rest }: LogoProps) {
  const props = svgProps(rest)
  return (
    <svg
      viewBox="0 0 129 22"
      role="img"
      aria-label="Decap"
      className={clsx(invert ? 'fill-white' : 'fill-current', 'transition-colors', className)}
      {...props}
    >
      {LETTERS.map((d) => (
        <path key={d.slice(0, 12)} d={d} />
      ))}
    </svg>
  )
}

/** Compact mark for small screens: the D of the wordmark. */
export function Logomark({ invert = false, className, ...rest }: LogoProps) {
  const props = svgProps(rest)
  return (
    <svg
      viewBox="-1 -0.5 22.2 22.2"
      role="img"
      aria-label="Decap"
      className={clsx(invert ? 'fill-white' : 'fill-current', className)}
      {...props}
    >
      <path d={LETTERS[0]} />
    </svg>
  )
}
