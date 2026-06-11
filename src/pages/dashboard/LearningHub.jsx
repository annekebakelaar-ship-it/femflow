import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'react-feather'
import { FEATURED, RECOMMENDED, BY_CATEGORY } from '../../content/artikelen'

const CATEGORIES = [
  { id: 'sleep', label: 'Slaap' },
  { id: 'stress', label: 'Stress' },
  { id: 'cycle', label: 'Cyclus' },
  { id: 'nutrition', label: 'Voeding' },
  { id: 'exercise', label: 'Beweging' },
  { id: 'mood', label: 'Stemming' },
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
  const loading = false

  if (leesArtikel) {
    return <ArtikelLezer artikel={leesArtikel} onTerug={() => setLeesArtikel(null)} />
  }

  return (
    <div style={{
      minHeight: '100vh',
      maxWidth: 'var(--container-max)',
      margin: '0 auto',
      padding: 'var(--space-lg) 0 140px 0',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{ padding: '0 var(--space-lg)', marginBottom: 'var(--space-lg)' }}>
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--ink-2)',
            cursor: 'pointer',
            fontSize: '13px', fontFamily: 'var(--font-sans)', fontWeight: '400',
            marginBottom: 'var(--space-sm)',
          }}
        >
          ← Terug
        </button>
        <h1 style={{
          fontSize: '26px', fontFamily: 'var(--font-display)', fontWeight: '500', lineHeight: 1.25, letterSpacing: '-0.5px',
          color: 'var(--ink)',
          margin: '0 0 8px 0',
        }}>
          Kennisbank
        </h1>
        <p style={{
          fontSize: '15px', fontFamily: 'var(--font-sans)', fontWeight: '400', lineHeight: 1.5,
          color: 'var(--ink-2)',
          margin: 0,
        }}>
          Gepersonaliseerde artikelen voor jouw lichaam en cyclus
        </p>
      </div>

      {/* Category Filter */}
      <div style={{ padding: '0 var(--space-lg)', marginBottom: 'var(--space-lg)', overflowX: 'auto' }}>
        <div style={{ display: 'flex', gap: 'var(--space-sm)', paddingBottom: '4px' }}>
          <button
            onClick={() => setSelectedCategory(null)}
            style={{
              padding: '8px 16px',
              background: !selectedCategory ? 'var(--accent)' : 'transparent',
              border: `1px solid ${!selectedCategory ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: '8px',
              color: !selectedCategory ? 'var(--surface)' : 'var(--ink)',
              cursor: 'pointer',
              fontSize: '13px', fontFamily: 'var(--font-sans)', fontWeight: '600',
              transition: 'all 150ms ease',
              whiteSpace: 'nowrap',
            }}
          >
            Aanbevolen
          </button>

          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                padding: '8px 16px',
                background: selectedCategory === cat.id ? 'var(--accent)' : 'transparent',
                border: `1px solid ${selectedCategory === cat.id ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: '8px',
                color: selectedCategory === cat.id ? 'var(--surface)' : 'var(--ink)',
                cursor: 'pointer',
                fontSize: '13px', fontFamily: 'var(--font-sans)', fontWeight: '600',
                transition: 'all 150ms ease',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => {
                if (selectedCategory !== cat.id) {
                  e.target.style.borderColor = 'var(--accent)'
                }
              }}
              onMouseLeave={e => {
                if (selectedCategory !== cat.id) {
                  e.target.style.borderColor = 'var(--border)'
                }
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ padding: '0 var(--space-lg)', textAlign: 'center', color: 'var(--ink-3)', fontSize: '13px', fontFamily: 'var(--font-sans)', fontWeight: '400' }}>
          Laden...
        </div>
      ) : selectedCategory ? (
        // Category view
        <div style={{ padding: '0 var(--space-lg)' }}>
          {articles.length === 0 ? (
            <p style={{ color: 'var(--ink-3)', textAlign: 'center', fontSize: '13px', fontFamily: 'var(--font-sans)', fontWeight: '400' }}>Geen artikelen gevonden</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              {articles.map(article => (
                <ArticleCard key={article.id} article={article} onLees={() => setLeesArtikel(article)} />
              ))}
            </div>
          )}
        </div>
      ) : (
        // Recommendations view
        <>
          {/* Featured Section */}
          {featured.length > 0 && (
            <div style={{ padding: '0 var(--space-lg)', marginBottom: 'var(--space-lg)' }}>
              <p style={{
                fontSize: '11px', fontFamily: 'var(--font-sans)', fontWeight: '500',
                color: 'var(--ink-3)',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                marginBottom: 'var(--space-md)',
              }}>
                Trending deze week
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                {featured.map(article => (
                  <ArticleCard key={article.id} article={article} isFeatured onLees={() => setLeesArtikel(article)} />
                ))}
              </div>
            </div>
          )}

          {/* Recommendations Section */}
          {recommended.length > 0 && (
            <div style={{ padding: '0 var(--space-lg)' }}>
              <p style={{
                fontSize: '11px', fontFamily: 'var(--font-sans)', fontWeight: '500',
                color: 'var(--ink-3)',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                marginBottom: 'var(--space-md)',
              }}>
                Voor jou aanbevolen
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                {recommended.map(article => (
                  <ArticleCard key={article.id} article={article} withReason onLees={() => setLeesArtikel(article)} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
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
      background: isFeatured ? 'var(--surface-warm)' : 'var(--surface)',
      border: `1px solid ${isFeatured ? 'var(--accent)' : 'var(--border)'}`,
      borderRadius: '8px',
      padding: 'var(--space-md)',
      cursor: 'pointer',
      transition: 'all 150ms ease',
    }}
    onMouseEnter={e => {
      e.currentTarget.style.borderColor = 'var(--accent)'
      if (!isFeatured) e.currentTarget.style.background = 'var(--surface-warm)'
    }}
    onMouseLeave={e => {
      e.currentTarget.style.borderColor = isFeatured ? 'var(--accent)' : 'var(--border)'
      if (!isFeatured) e.currentTarget.style.background = 'var(--surface)'
    }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-md)' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{
            fontSize: '15px', fontFamily: 'var(--font-sans)', fontWeight: '600',
            color: 'var(--ink)',
            margin: '0 0 4px 0',
          }}>
            {article.title}
          </h3>

          {article.subtitle && (
            <p style={{
              fontSize: '13px', fontFamily: 'var(--font-sans)', fontWeight: '400',
              color: 'var(--ink-3)',
              margin: '0 0 8px 0',
            }}>
              {article.subtitle}
            </p>
          )}

          <p style={{
            fontSize: '13px', fontFamily: 'var(--font-sans)', fontWeight: '400',
            color: 'var(--ink-2)',
            margin: '0 0 8px 0',
            lineHeight: '1.5',
          }}>
            {article.description}
          </p>

          {withReason && article.reason && (
            <p style={{
              fontSize: '11px', fontFamily: 'var(--font-sans)', fontWeight: '500',
              color: 'var(--accent)',
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
            background: difficultyColor[article.difficulty] || 'var(--ink-3)',
            padding: '2px 8px',
            borderRadius: '4px',
            textTransform: 'capitalize',
          }}>
            {article.difficulty}
          </span>
          <p style={{
            fontSize: '11px', fontFamily: 'var(--font-sans)', fontWeight: '400',
            color: 'var(--ink-3)',
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
      maxWidth: 'var(--container-max)',
      margin: '0 auto',
      padding: 'var(--space-lg) var(--space-lg) 140px var(--space-lg)',
    }}>
      <button
        onClick={onTerug}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: 'none',
          border: 'none',
          color: 'var(--ink-2)',
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
        color: 'var(--ink-3)', letterSpacing: '0.12em', textTransform: 'uppercase',
        margin: '0 0 8px 0',
      }}>
        {artikel.readTime} min lezen · {artikel.source}
      </p>

      <h1 style={{
        fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: '500',
        lineHeight: 1.2, color: 'var(--ink)', margin: '0 0 6px 0',
      }}>
        {artikel.title}
      </h1>
      <p style={{
        fontFamily: 'var(--font-sans)', fontSize: '15px', color: 'var(--ink-2)',
        margin: '0 0 var(--space-xl) 0', lineHeight: 1.5,
      }}>
        {artikel.subtitle}
      </p>

      {artikel.body.map((sectie, i) => (
        <div key={i} style={{ marginBottom: 'var(--space-lg)' }}>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: '500',
            color: 'var(--ink)', margin: '0 0 8px 0',
          }}>
            {sectie.kop}
          </h2>
          <p style={{
            fontFamily: 'var(--font-sans)', fontSize: '15px', lineHeight: 1.65,
            color: 'var(--ink-2)', margin: 0,
          }}>
            {sectie.tekst}
          </p>
        </div>
      ))}

      <div style={{
        marginTop: 'var(--space-xl)',
        padding: 'var(--space-md)',
        background: 'var(--surface-warm)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        fontFamily: 'var(--font-sans)',
        fontSize: '12px',
        color: 'var(--ink-3)',
        lineHeight: 1.5,
      }}>
        Dit artikel is informatief en geen medisch advies. Bespreek aanhoudende
        klachten of twijfels altijd met je huisarts.
      </div>
    </div>
  )
}
