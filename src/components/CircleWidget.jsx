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

  return (
    <div onClick={onClick} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: onClick ? 'pointer' : 'default', perspective: '1000px' }}>
      <div style={{
        position: 'relative',
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        border: hovered ? '1.5px solid transparent' : `1.5px solid ${isActive ? 'var(--accent)' : 'var(--ink-3)'}`,
        background: hovered ? `linear-gradient(135deg, var(--accent), var(--info))` : 'transparent',
        backgroundClip: hovered ? 'padding-box' : 'initial',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 150ms ease-out',
        transform: hovered ? 'scale(1.04) rotateX(8deg) rotateY(-8deg)' : 'scale(1)',
        boxShadow: hovered
          ? '0 24px 48px rgba(0, 0, 0, 0.35), 0 0 30px rgba(199, 154, 110, 0.4), 0 0 60px rgba(199, 154, 110, 0.2)'
          : '0 16px 32px rgba(0, 0, 0, 0.25), 0 0 24px rgba(199, 154, 110, 0.3), 0 8px 16px rgba(0, 0, 0, 0.1)',
        filter: 'brightness(1.1) contrast(1.05)',
        onMouseEnter: () => setHovered(true),
        onMouseLeave: () => setHovered(false),
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      >
        {value !== undefined && value !== null && value !== '' && (
          <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: '18px', color: 'var(--ink)', fontFeatureSettings: "'tnum'", lineHeight: 1 }}>
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
          <IconComponent size={15} color={hovered || isActive ? 'var(--accent)' : 'var(--ink-2)'} strokeWidth={1.5} />
        </div>
      </div>
      {description && (
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--ink-2)', textAlign: 'center', maxWidth: '100px', lineHeight: 1.3 }}>
          {description}
        </span>
      )}
    </div>
  )
}
