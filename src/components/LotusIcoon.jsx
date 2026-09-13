// Lotus-icoon uit het homeontwerp: drie open bladen die onderin samenkomen.
// Gedeeld tussen het adviesblok op de home en de Leefstijl-tab in NavV2.
// Zelfde props als react-feather (size, strokeWidth, color).
export default function LotusIcoon({ size = 25, strokeWidth = 1.1, color = 'currentColor' }) {
  const hoogte = Math.round(((size * 19) / 25) * 10) / 10
  return (
    <svg width={size} height={hoogte} viewBox="0 0 25 19" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }} aria-hidden="true">
      <path d="M12.5 1C9.2 4.6 8.5 10 12.5 17.8C16.5 10 15.8 4.6 12.5 1Z" />
      <path d="M12.5 17.8C6.4 18 1.7 13.9 0.9 7.7C5.1 7.5 8.5 9.5 10.3 12.6" />
      <path d="M12.5 17.8C18.6 18 23.3 13.9 24.1 7.7C19.9 7.5 16.5 9.5 14.7 12.6" />
    </svg>
  )
}
