# Analytics Setup — FemFlow

## Google Analytics 4 (GA4)

**Property ID:** G-Q9FW3RS7H5  
**Domain:** youcaps.app (captures femflow.youcaps.app + all subdomains)

### GDPR Compliance

GA4 is configured with privacy-first settings:

1. **Consent first** — GA4 wordt PAS geladen na expliciet akkoord via de
   consent-banner (`AnalyticsConsentBanner`). Zonder akkoord wordt het script
   niet geladen en gaat er geen byte naar Google. De keuze staat in
   localStorage onder `femflow_analytics_consent` ('granted' / 'denied').
2. **IP Anonymization** — User IPs are anonymized before sending to Google
3. **Data Retention** — Limited to 14 days (configured in GA4 settings)

### Setup

De consent-gated loader staat in `index.html`: `window.initAnalytics()`
injecteert het gtag-script en wordt aangeroepen (a) bij page load als er al
eerder consent gegeven is, of (b) door de banner zodra de gebruiker akkoord
geeft.

### Access Dashboard

1. Go to **Google Analytics** (analytics.google.com)
2. Sign in with your Google account
3. Select property: **FemFlow (G-Q9FW3RS7H5)**
4. View real-time and historical analytics

### Events

Custom events can be tracked via `window.gtag()`:

```javascript
// Track purchase event
gtag('event', 'purchase', { 
  value: 99.99, 
  currency: 'EUR',
  transaction_id: 'txn_123'
});

// Track custom event
gtag('event', 'cycle_logged', { 
  cycle_length: 28,
  phase: 'menstrual'
});
```

### Privacy Notes

- EU-gebruikers zien de consent-banner bij hun eerste bezoek; analytics is
  opt-in, niet opt-out
- No personal data is collected (health data stays in Neon, encrypted)
- GA4 data is not linked to user identities
- Data retention can be adjusted in GA4 Settings > Data Retention

### Disable GA4 (if needed)

Add to browser console:
```javascript
window['ga-disable-G-Q9FW3RS7H5'] = true;
```

Or via environment variable:
```
VITE_DISABLE_GA=true
```

---

**Last updated:** 2026-06-09  
**Status:** Active
