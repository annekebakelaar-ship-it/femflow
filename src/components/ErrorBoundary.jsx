import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    // Optionally log to external service here
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '20px',
          background: 'var(--bg)',
          fontFamily: 'var(--font-sans)',
        }}>
          <h1 style={{ color: '#C62828', marginBottom: '16px' }}>⚠️ Er ging iets fout</h1>
          <p style={{ color: 'var(--ink-2)', marginBottom: '24px', textAlign: 'center', maxWidth: '400px' }}>
            We hebben een fout gevonden. Dit is niet jouw schuld! Probeer de pagina opnieuw te laden.
          </p>
          {import.meta.env.DEV && (
            <details style={{
              background: '#F5EFEB',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '24px',
              fontSize: '12px',
              maxWidth: '500px',
              overflow: 'auto',
            }}>
              <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>Technische details (dev only)</summary>
              <pre style={{ margin: '8px 0 0 0', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {this.state.error?.toString()}
              </pre>
            </details>
          )}
          <button
            onClick={() => window.location.href = '/'}
            style={{
              padding: '12px 24px',
              background: 'var(--accent)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
            }}
          >
            Terug naar home
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
