import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const CATEGORIES = [
  { id: 'sleep', label: 'Slaap' },
  { id: 'stress', label: 'Stress' },
  { id: 'cycle', label: 'Cyclus' },
  { id: 'nutrition', label: 'Voeding' },
  { id: 'exercise', label: 'Beweging' },
  { id: 'mood', label: 'Stemming' },
]

const MOCK_ARTICLES = {
  featured: [
    {
      id: 'sleep-quality-1',
      title: 'Slaapkwaliteit in je cyclus',
      subtitle: 'Waarom je slaap varieert gedurende je maand',
      category: 'sleep',
      difficulty: 'beginner',
      readTime: 5,
      description: 'Je hormonen beïnvloeden je slaappatroon. Leer hoe je je slaap kunt optimaliseren in elke cyclus fase.',
      source: 'YouCaps Research',
    },
    {
      id: 'stress-hormones-1',
      title: 'Stress en hormoonbalans',
      subtitle: 'Hoe chronische stress je cyclus verstoort',
      category: 'stress',
      difficulty: 'intermediate',
      readTime: 8,
      description: 'Cortisol kan je menstruatiecyclus beïnvloeden. Ontdek hoe stress je lichaam aanvalt en wat je eraan kunt doen.',
      source: 'Medical Review',
    },
    {
      id: 'cycle-basics-1',
      title: 'Je cyclus begrijpen',
      subtitle: 'Complete gids naar de 4 fasen',
      category: 'cycle',
      difficulty: 'beginner',
      readTime: 7,
      description: 'Menstruatie, folliculair, ovulatie en luteal. Elke fase heeft unieke kenmerken. Leer wat te verwachten.',
      source: 'YouCaps Academy',
    },
  ],
  recommended: [
    {
      id: 'nutrition-iron-1',
      title: 'IJzer en menstruatie',
      subtitle: 'Zorg voor voldoende ijzer tijdens je periode',
      category: 'nutrition',
      difficulty: 'beginner',
      readTime: 6,
      description: 'Je lichaam verliest bloed, dus ijzer. Voedingsmiddelen rijker dan je denkt.',
      reason: 'Gebaseerd op je trackerdata',
    },
    {
      id: 'exercise-cycle-1',
      title: 'Training aanpassen aan je cyclus',
      subtitle: 'Waarom intensiteit ter zake doet',
      category: 'exercise',
      difficulty: 'intermediate',
      readTime: 9,
      description: 'Hoge intensiteit in je folliculaire fase, rust in je luteal. Hier\'s waarom en hoe.',
      reason: 'Je trainingspatronen passen hier',
    },
    {
      id: 'mood-pms-1',
      title: 'PMS en emotionele gezondheid',
      subtitle: 'Wat er hormoonmatig gebeurt',
      category: 'mood',
      difficulty: 'intermediate',
      readTime: 7,
      description: 'PMDD is echt. Leer de signalen herkennen en wat je kunt doen.',
      reason: 'Je symptomen duiden erop',
    },
    {
      id: 'sleep-hygiene-1',
      title: 'Slaaphygiëne tips',
      subtitle: 'Bouw betere slaapgewoontes op',
      category: 'sleep',
      difficulty: 'beginner',
      readTime: 5,
      description: 'Consistent slapen, koele kamers, geen screens. De basis werkt echt.',
    },
    {
      id: 'stress-management-1',
      title: 'Stressmanagement technieken',
      subtitle: 'Adeemhalingsoefeningen die werken',
      category: 'stress',
      difficulty: 'beginner',
      readTime: 6,
      description: '4-7-8 ademen, meditatie, wandelen. Simpel maar effectief.',
    },
    {
      id: 'nutrition-hydration-1',
      title: 'Vochtopname in je cyclus',
      subtitle: 'Water is je beste vriend',
      category: 'nutrition',
      difficulty: 'beginner',
      readTime: 4,
      description: 'Je lichaam heeft meer water nodig in bepaalde fasen. Hoeveel? Hier\'s het antwoord.',
    },
  ],
  bycategory: {
    sleep: [
      {
        id: 'sleep-quality-1',
        title: 'Slaapkwaliteit in je cyclus',
        category: 'sleep',
        difficulty: 'beginner',
        readTime: 5,
        description: 'Hormonen beïnvloeden slaap. Progesterone kan je slaperig maken, estrogeen houdt je wakker.',
      },
      {
        id: 'sleep-hygiene-1',
        title: 'Slaaphygiëne tips',
        category: 'sleep',
        difficulty: 'beginner',
        readTime: 5,
        description: 'Consistent slapen op dezelfde tijd, koele kamers, geen devices voor bed.',
      },
      {
        id: 'sleep-phases-1',
        title: 'REM en NREM slaap',
        category: 'sleep',
        difficulty: 'intermediate',
        readTime: 8,
        description: 'Waarom beide soorten slaap belangrijk zijn en hoe je ervan kunt profiteren.',
      },
    ],
    stress: [
      {
        id: 'stress-hormones-1',
        title: 'Stress en hormoonbalans',
        category: 'stress',
        difficulty: 'intermediate',
        readTime: 8,
        description: 'Chronische stress verhoogt cortisol, wat je cyclus kan verstoren.',
      },
      {
        id: 'stress-management-1',
        title: 'Stressmanagement technieken',
        category: 'stress',
        difficulty: 'beginner',
        readTime: 6,
        description: 'Adeemhalings- en meditatietechnieken die daadwerkelijk werken.',
      },
    ],
    cycle: [
      {
        id: 'cycle-basics-1',
        title: 'Je cyclus begrijpen',
        category: 'cycle',
        difficulty: 'beginner',
        readTime: 7,
        description: 'Menstruatie (dag 1-5), Folliculair (5-13), Ovulatie (dag 14), Luteal (15-28).',
      },
      {
        id: 'cycle-tracking-1',
        title: 'Hoe je cyclus te tracken',
        category: 'cycle',
        difficulty: 'beginner',
        readTime: 6,
        description: 'Start dag, duur, symptomen. De basisinformatie die je nodig hebt.',
      },
    ],
    nutrition: [
      {
        id: 'nutrition-iron-1',
        title: 'IJzer en menstruatie',
        category: 'nutrition',
        difficulty: 'beginner',
        readTime: 6,
        description: 'IJzer verlies tijdens menstruatie. Kikkererwten, rode bieten, donker groen blad.',
      },
      {
        id: 'nutrition-hydration-1',
        title: 'Vochtopname in je cyclus',
        category: 'nutrition',
        difficulty: 'beginner',
        readTime: 4,
        description: 'Je lichaam retourneert meer water in luteal. Drink meer.',
      },
    ],
    exercise: [
      {
        id: 'exercise-cycle-1',
        title: 'Training aanpassen aan je cyclus',
        category: 'exercise',
        difficulty: 'intermediate',
        readTime: 9,
        description: 'Hoge HIIT in folliculaire fase, meer cardio en yoga in luteal.',
      },
      {
        id: 'exercise-strength-1',
        title: 'Kracht trainen door je cyclus heen',
        category: 'exercise',
        difficulty: 'intermediate',
        readTime: 8,
        description: 'Je bent sterker rond ovulatie. Plan je PRs daar.',
      },
    ],
    mood: [
      {
        id: 'mood-pms-1',
        title: 'PMS en emotionele gezondheid',
        category: 'mood',
        difficulty: 'intermediate',
        readTime: 7,
        description: 'PMDD is een echte diagnose. Herken de signalen.',
      },
      {
        id: 'mood-exercise-1',
        title: 'Bewegen voor je stemming',
        category: 'mood',
        difficulty: 'beginner',
        readTime: 5,
        description: 'Beweging reguleert serotonine. Je voelt je beter.',
      },
    ],
  },
}

export default function LearningHub() {
  const navigate = useNavigate()
  const [recommended, setRecommended] = useState(MOCK_ARTICLES.recommended)
  const [featured, setFeatured] = useState(MOCK_ARTICLES.featured)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (selectedCategory) {
      loadContent()
    }
  }, [selectedCategory])

  async function loadContent() {
    setLoading(true)
    try {
      const token = localStorage.getItem('femflow_jwt')
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {}

      if (selectedCategory) {
        // Try API first, fallback to mock data
        try {
          const res = await fetch(
            `https://wearable-age-api.onrender.com/api/v1/learning/articles?category=${selectedCategory}`,
            { headers, timeout: 5000 }
          )
          if (res.ok) {
            setArticles(await res.json())
            return
          }
        } catch {
          console.warn('API unavailable, using mock data')
        }
        // Fallback to mock
        setArticles(MOCK_ARTICLES.bycategory[selectedCategory] || [])
      } else {
        // Try API first, fallback to mock data
        try {
          const [recRes, featRes] = await Promise.all([
            fetch('https://wearable-age-api.onrender.com/api/v1/learning/recommendations?limit=6', { headers, timeout: 5000 }),
            fetch('https://wearable-age-api.onrender.com/api/v1/learning/featured?limit=3', { headers, timeout: 5000 }),
          ])

          if (recRes.ok) setRecommended(await recRes.json())
          if (featRes.ok) setFeatured(await featRes.json())

          // If API worked, skip fallback
          if (recRes.ok && featRes.ok) return
        } catch {
          console.warn('API unavailable, using mock data')
        }
        // Fallback to mock
        setRecommended(MOCK_ARTICLES.recommended)
        setFeatured(MOCK_ARTICLES.featured)
      }
    } catch (err) {
      console.error('Failed to load learning content:', err)
      // Final fallback
      setRecommended(MOCK_ARTICLES.recommended)
      setFeatured(MOCK_ARTICLES.featured)
    } finally {
      setLoading(false)
    }
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
                <ArticleCard key={article.id} article={article} />
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
                  <ArticleCard key={article.id} article={article} isFeatured />
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
                  <ArticleCard key={article.id} article={article} withReason />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function ArticleCard({ article, isFeatured, withReason }) {
  const difficultyColor = {
    beginner: 'var(--success)',
    intermediate: '#FFD700',
    advanced: 'var(--error)',
  }

  return (
    <div style={{
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
            {article.excerpt}
          </p>

          {withReason && article.why_recommended && (
            <p style={{
              fontSize: '11px', fontFamily: 'var(--font-sans)', fontWeight: '500',
              color: 'var(--accent)',
              margin: '0',
            }}>
              ✓ {article.why_recommended}
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
            {article.reading_time_minutes} min
          </p>
        </div>
      </div>
    </div>
  )
}
