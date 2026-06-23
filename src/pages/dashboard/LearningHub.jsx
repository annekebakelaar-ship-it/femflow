import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'react-feather'
import { FEATURED, RECOMMENDED, BY_CATEGORY } from '../../content/artikelen'
import hero1 from '../../assets/hero1.png'
import hero3 from '../../assets/hero3.webp'
import hero4 from '../../assets/hero4.png'
import hero5 from '../../assets/hero5.webp'
import hero6 from '../../assets/hero6.webp'

// Categoriefoto's: tijdelijk de bestaande hero-beelden. Eigen foto's?
// Drop ze in src/assets/kennisbank/ en wijs ze hier per categorie toe.
const CATEGORIES = [
  { id: 'sleep', label: 'Slaap', foto: hero3 },
  { id: 'stress', label: 'Stress', foto: hero4 },
  { id: 'cycle', label: 'Cyclus', foto: hero6 },
  { id: 'nutrition', label: 'Voeding', foto: hero1 },
  { id: 'exercise', label: 'Beweging', foto: hero5 },
  { id: 'mood', label: 'Stemming', foto: hero3 },
]


export default function LearningHub() {
  const navigate = useNavigate()
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [leesArtikel, setLeesArtikel] = useState(null)

  // Content komt uit de lokale bibliotheek (src/content/artikelen.js) —
  // geen netwerk, geen laadstatus nodig
  const featured = FEATURED
  const recommended = RECOMMENDED
  const articles = selectedCategory ? (BY_CATEGORY[selectedCategory] || []) : []

  if (leesArtikel) {
    return <ArtikelLezer artikel={leesArtikel} onTerug={() => setLeesArtikel(null)} />
  }

  const huidigeCategorie = CATEGORIES.find(c => c.id === selectedCategory)

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--d-page)',
      padding: '20px 0 120px 0',
    }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ padding: '0 16px', marginBottom: 'var(--space-lg)' }}>
          <button
            onClick={() => selectedCategory ? setSelectedCategory(null) : navigate('/dashboard')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'none',
              border: 'none',
              color: 'var(--d-ink-2)',
              cursor: 'pointer',
              fontSize: '13px', fontFamily: 'var(--font-sans)', fontWeight: '400',
              padding: 0,
              marginBottom: 'var(--space-sm)',
            }}
          >
            <ArrowLeft size={14} strokeWidth={1.5} />
            {selectedCategory ? 'Alle categorieën' : 'Dashboard'}
          </button>
          <h1 style={{
            fontSize: '26px', fontFamily: 'var(--font-display)', fontWeight: '500', lineHeight: 1.25, letterSpacing: '-0.5px',
            color: 'var(--d-ink)',
            margin: '0 0 8px 0',
          }}>
            {huidigeCategorie ? huidigeCategorie.label : 'Kennisbank'}
          </h1>
          {!selectedCategory && (
            <p style={{
              fontSize: '15px', fontFamily: 'var(--font-sans)', fontWeight: '400', lineHeight: 1.5,
              color: 'var(--d-ink-2)',
              margin: 0,
            }}>
              Nuchtere artikelen voor jouw lichaam en cyclus
            </p>
          )}
        </div>

        {/* Content */}
        {selectedCategory ? (
          // Categorieweergave
          <div style={{ padding: '0 16px' }}>
            {articles.length === 0 ? (
              <p style={{ color: 'var(--d-ink-3)', textAlign: 'center', fontSize: '13px', fontFamily: 'var(--font-sans)', fontWeight: '400' }}>
                Nog geen artikelen in deze categorie
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {articles.map(article => (
                  <ArticleCard key={article.id} article={article} onLees={() => setLeesArtikel(article)} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Trending */}
            {featured.length > 0 && (
              <div style={{ padding: '0 16px', marginBottom: 'var(--space-xl)' }}>
                <p style={{
                  fontSize: '11px', fontFamily: 'var(--font-sans)', fontWeight: '600',
                  color: 'var(--d-ink-3)',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  marginBottom: 'var(--space-md)',
                }}>
                  Trending deze week
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {featured.map(article => (
                    <ArticleCard key={article.id} article={article} isFeatured onLees={() => setLeesArtikel(article)} />
                  ))}
                </div>
              </div>
            )}

            {/* Categorie-dashboard met foto's */}
            <div style={{ padding: '0 16px', marginBottom: 'var(--space-xl)' }}>
              <p style={{
                fontSize: '11px', fontFamily: 'var(--font-sans)', fontWeight: '600',
                color: 'var(--d-ink-3)',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                marginBottom: 'var(--space-md)',
              }}>
                Categorieën
              </p>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px',
              }}>
                {CATEGORIES.map(cat => {
                  const aantal = (BY_CATEGORY[cat.id] || []).length
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      style={{
                        position: 'relative',
                        height: '110px',
                        border: 'none',
                        borderRadius: '22px',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        padding: 0,
                        textAlign: 'left',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.09)',
                      }}
                    >
                      <img
                        src={cat.foto}
                        alt=""
                        aria-hidden="true"
                        style={{
                          position: 'absolute',
                          inset: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(180deg, rgba(27, 15, 7, 0.15) 0%, rgba(27, 15, 7, 0.82) 100%)',
                      }} />
                      <div style={{ position: 'absolute', left: '14px', right: '14px', bottom: '12px' }}>
                        <p style={{
                          margin: 0,
                          fontSize: '15px',
                          fontWeight: '600',
                          color: 'var(--d-ink)',
                          fontFamily: 'var(--font-sans)',
                        }}>
                          {cat.label}
                        </p>
                        <p style={{
                          margin: '2px 0 0 0',
                          fontSize: '11px',
                          color: 'rgba(244, 236, 227, 0.7)',
                          fontFamily: 'var(--font-sans)',
                        }}>
                          {aantal} {aantal === 1 ? 'artikel' : 'artikelen'}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Aanbevolen */}
            {recommended.length > 0 && (
              <div style={{ padding: '0 16px' }}>
                <p style={{
                  fontSize: '11px', fontFamily: 'var(--font-sans)', fontWeight: '600',
                  color: 'var(--d-ink-3)',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  marginBottom: 'var(--space-md)',
                }}>
                  Voor jou aanbevolen
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {recommended.map(article => (
                    <ArticleCard key={article.id} article={article} withReason onLees={() => setLeesArtikel(article)} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function ArticleCard({ article, isFeatured, withReason, onLees }) {
  const difficultyColor = {
    beginner: 'var(--success)',
    intermediate: '#FFD700',
    advanced: 'var(--error)',
  }

  return (
    <div onClick={onLees} style={{
      cursor: 'pointer',
      background: 'var(--d-card)',
      border: 'none',
      borderRadius: '22px',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.09)',
      padding: 'var(--space-md)',
      transition: 'all 150ms ease',
    }}
    onMouseEnter={e => {
      e.currentTarget.style.borderColor = 'var(--d-accent)'
      if (!isFeatured) e.currentTarget.style.background = 'var(--d-card-solid)'
    }}
    onMouseLeave={e => {
      e.currentTarget.style.borderColor = isFeatured ? 'var(--d-accent)' : 'var(--d-border)'
      if (!isFeatured) e.currentTarget.style.background = 'var(--d-card)'
    }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-md)' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{
            fontSize: '15px', fontFamily: 'var(--font-sans)', fontWeight: '600',
            color: 'var(--d-ink)',
            margin: '0 0 4px 0',
          }}>
            {article.title}
          </h3>

          {article.subtitle && (
            <p style={{
              fontSize: '13px', fontFamily: 'var(--font-sans)', fontWeight: '400',
              color: 'var(--d-ink-3)',
              margin: '0 0 8px 0',
            }}>
              {article.subtitle}
            </p>
          )}

          <p style={{
            fontSize: '13px', fontFamily: 'var(--font-sans)', fontWeight: '400',
            color: 'var(--d-ink-2)',
            margin: '0 0 8px 0',
            lineHeight: '1.5',
          }}>
            {article.description}
          </p>

          {withReason && article.reason && (
            <p style={{
              fontSize: '11px', fontFamily: 'var(--font-sans)', fontWeight: '500',
              color: 'var(--d-accent)',
              margin: '0',
            }}>
              ✓ {article.reason}
            </p>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
          <span style={{
            fontSize: '11px', fontFamily: 'var(--font-sans)', fontWeight: '500',
            color: 'white',
            background: difficultyColor[article.difficulty] || 'var(--d-ink-3)',
            padding: '2px 8px',
            borderRadius: '4px',
            textTransform: 'capitalize',
          }}>
            {article.difficulty}
          </span>
          <p style={{
            fontSize: '11px', fontFamily: 'var(--font-sans)', fontWeight: '400',
            color: 'var(--d-ink-3)',
            margin: 0,
            textAlign: 'right',
          }}>
            {article.readTime} min
          </p>
        </div>
      </div>
    </div>
  )
}

// Volledige leesweergave van een artikel uit de bibliotheek
function ArtikelLezer({ artikel, onTerug }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--d-page)',
      padding: '20px 16px 120px 16px',
    }}>
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <button
        onClick={onTerug}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: 'none',
          border: 'none',
          color: 'var(--d-ink-2)',
          cursor: 'pointer',
          fontSize: '13px',
          fontFamily: 'var(--font-sans)',
          marginBottom: 'var(--space-lg)',
          padding: 0,
        }}
      >
        <ArrowLeft size={14} strokeWidth={1.5} /> Kennisbank
      </button>

      <p style={{
        fontSize: '11px', fontFamily: 'var(--font-sans)', fontWeight: '500',
        color: 'var(--d-ink-3)', letterSpacing: '0.12em', textTransform: 'uppercase',
        margin: '0 0 8px 0',
      }}>
        {artikel.readTime} min lezen · {artikel.source}
      </p>

      <h1 style={{
        fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: '500',
        lineHeight: 1.2, color: 'var(--d-ink)', margin: '0 0 6px 0',
      }}>
        {artikel.title}
      </h1>
      <p style={{
        fontFamily: 'var(--font-sans)', fontSize: '15px', color: 'var(--d-ink-2)',
        margin: '0 0 var(--space-xl) 0', lineHeight: 1.5,
      }}>
        {artikel.subtitle}
      </p>

      {artikel.body.map((sectie, i) => (
        <div key={i} style={{ marginBottom: 'var(--space-lg)' }}>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: '500',
            color: 'var(--d-ink)', margin: '0 0 8px 0',
          }}>
            {sectie.kop}
          </h2>
          <p style={{
            fontFamily: 'var(--font-sans)', fontSize: '15px', lineHeight: 1.65,
            color: 'var(--d-ink-2)', margin: 0,
          }}>
            {sectie.tekst}
          </p>
        </div>
      ))}

      <div style={{
        marginTop: 'var(--space-xl)',
        padding: 'var(--space-md)',
        background: 'var(--d-card-solid)',
        border: '1px solid var(--d-border)',
        borderRadius: '8px',
        fontFamily: 'var(--font-sans)',
        fontSize: '12px',
        color: 'var(--d-ink-3)',
        lineHeight: 1.5,
      }}>
        Dit artikel is informatief en geen medisch advies. Bespreek aanhoudende
        klachten of twijfels altijd met je huisarts.
      </div>
    </div>
    </div>
  )
}
