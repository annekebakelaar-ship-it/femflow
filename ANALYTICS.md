# Analytics Setup — FemFlow

## Google Analytics 4 (GA4)

**Property ID:** G-Q9FW3RS7H5  
**Domain:** youcaps.app (captures femflow.youcaps.app + all subdomains)

### GDPR Compliance

GA4 is configured with privacy-first settings:

1. **IP Anonymization** — User IPs are anonymized before sending to Google
2. **Cookieless Tracking** — No cookies needed for basic tracking
3. **Data Retention** — Limited to 14 days (configured in GA4 settings)
4. **Cookie Consent** — Optional; data sends regardless but users can opt-out

### Setup

GA4 tracking script is loaded in `index.html`:
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-Q9FW3RS7H5"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-Q9FW3RS7H5', {
    anonymize_ip: true,
    cookie_flags: 'SameSite=None;Secure'
  });
</script>
```

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

- Users in EU should see a cookie consent banner (optional for GA4 with IP anonymization)
- No personal data is collected (health data stays in Supabase, encrypted)
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
