import { useId } from 'react'

interface GridPatternProps extends React.ComponentPropsWithoutRef<'svg'> {
  width?: number
  height?: number
  x?: number | string
  y?: number | string
  squares?: Array<[x: number, y: number]>
  className?: string
  yOffset?: number
}

export function GridPattern({
  width = 40,
  height = 40,
  x = -1,
  y = -1,
  squares,
  className,
  yOffset = 0,
  ...props
}: GridPatternProps) {
  const patternId = useId()

  return (
    <svg
      aria-hidden="true"
      className={className}
      {...props}
    >
      <defs>
        <pattern
          id={patternId}
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
          x={x}
          y={y}
        >
          <path d={`M.5 ${height}V.5H${width}`} fill="none" />
        </pattern>
      </defs>
      <rect
        width="100%"
        height="100%"
        strokeWidth={0}
        fill={`url(#${patternId})`}
      />
      {squares && (
        <svg x={x} y={y} className="overflow-visible">
          {squares.map(([x, y]) => (
            <rect
              strokeWidth="0"
              key={`${x}-${y}`}
              width={width + 1}
              height={height + 1}
              x={x * width}
              y={y * height + yOffset}
            />
          ))}
        </svg>
      )}
    </svg>
  )
} 