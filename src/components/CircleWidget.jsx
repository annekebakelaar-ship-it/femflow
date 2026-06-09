import { useState } from 'react'

export default function CircleWidget({
  value,
  label,
  icon: IconComponent,
  color = '#D2C1AA',
  onClick,
  size = 100,
  unit = '',
  description = '',
  isActive = false,
}) {
  const [hovered, setHovered] = useState(false)
  const responsiveSize = Math.max(size, 70)

  return (
    <div onClick={onClick} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', cursor: onClick ? 'pointer' : 'default', perspective: '1000px' }}>
      <div style={{
        position: 'relative',
        width: `clamp(70px, 15vw, ${responsiveSize}px)`,
        height: `clamp(70px, 15vw, ${responsiveSize}px)`,
        borderRadius: '50%',
        border: 'none',
        background: hovered ? 'rgba(199, 154, 110, 0.25)' : 'rgba(199, 154, 110, 0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 150ms ease-out',
        transform: hovered ? 'scale(1.04)' : 'scale(1)',
        boxShadow: hovered
          ? '0 8px 16px rgba(0, 0, 0, 0.1)'
          : '0 4px 8px rgba(0, 0, 0, 0.08)',
        filter: 'brightness(1.05)',
        onMouseEnter: () => setHovered(true),
        onMouseLeave: () => setHovered(false),
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      >
        {value !== undefined && value !== null && value !== '' && (
          <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 'clamp(14px, 4vw, 20px)', color: 'var(--ink)', fontFeatureSettings: "'tnum'", lineHeight: 1 }}>
            {value}{unit}
          </span>
        )}
        <div style={{
          position: 'absolute',
          bottom: '8px',
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '0 4px',
          background: 'transparent',
          display: 'flex',
          alignItems: 'center',
        }}>
          <IconComponent size={20} color={hovered || isActive ? 'var(--accent)' : 'var(--ink-2)'} strokeWidth={1.5} />
        </div>
      </div>
      {label && (
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'clamp(11px, 3vw, 13px)', fontWeight: '500', color: 'var(--ink)', textAlign: 'center', maxWidth: '120px', lineHeight: 1.3 }}>
          {label}
        </span>
      )}
      {description && (
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--ink-3)', textAlign: 'center', maxWidth: '100px', lineHeight: 1.3 }}>
          {description}
        </span>
      )}
    </div>
  )
}
