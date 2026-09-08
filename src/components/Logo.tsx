/**
 * Placeholder mark for this proof of concept.
 *
 * Deliberately an original, minimal hexagon monogram - it is NOT the real
 * business's logo and reuses none of its artwork, mascot, or lockup. It only
 * echoes the orange hexagon idea so the demo reads as the right kind of product.
 */
export function Logo({
  size = 36,
  tone = 'light',
  className = '',
}: {
  size?: number
  /** 'light' = for dark chrome, 'dark' = for light backgrounds */
  tone?: 'light' | 'dark'
  className?: string
}) {
  const hex = tone === 'light' ? 'rgba(255,255,255,0.85)' : '#ea5808'
  const word = tone === 'light' ? '#ffffff' : '#c14209'
  const fill = tone === 'light' ? 'rgba(255,255,255,0.12)' : '#fff5ed'

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label="JGL Repair service portal (unofficial concept)"
      className={className}
    >
      <polygon
        points="50,5 92,28 92,72 50,95 8,72 8,28"
        fill={fill}
        stroke={hex}
        strokeWidth="7"
        strokeLinejoin="round"
      />
      <text
        x="50"
        y="50"
        textAnchor="middle"
        dominantBaseline="central"
        fill={word}
        fontSize="30"
        fontWeight="800"
        letterSpacing="1"
        fontFamily="Inter, system-ui, sans-serif"
      >
        JGL
      </text>
    </svg>
  )
}
