import React, { useState, useEffect } from 'react';
import './Dashboard.css';

export default function Dashboard() {
  const [connected, setConnected] = useState(false);
  const [ouraData, setOuraData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

  useEffect(() => {
    // Check if Oura is connected
    checkOuraStatus();
  }, []);

  const checkOuraStatus = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/oura/status`, {
        credentials: 'include'
      });
      const data = await res.json();
      setConnected(data.connected || false);
      if (data.connected) {
        pullOuraData();
      }
    } catch (err) {
      console.error('Status check failed:', err);
    }
  };

  const connectOura = () => {
    window.location.href = `${API_BASE}/api/oura/connect`;
  };

  const pullOuraData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/oura/pull`, {
        method: 'POST',
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to pull data');
      const data = await res.json();
      setOuraData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <h1>Your Wearable Data</h1>

      {/* Oura Connection */}
      <div className="card oura-section">
        <h2>Oura Ring</h2>
        {!connected ? (
          <button onClick={connectOura} className="btn-primary">
            Connect Oura Ring
          </button>
        ) : (
          <div>
            <p className="status-ok">✓ Connected</p>
            <button onClick={pullOuraData} className="btn-secondary" disabled={loading}>
              {loading ? 'Pulling data...' : 'Refresh Data'}
            </button>
          </div>
        )}
      </div>

      {/* Oura Data Display */}
      {ouraData && (
        <div className="data-grid">
          <div className="data-card">
            <h3>Sleep</h3>
            {ouraData.sleep?.map((s, i) => (
              <div key={i}>
                <p>{s.day}: {Math.round(s.duration / 3600)}h</p>
              </div>
            ))}
          </div>

          <div className="data-card">
            <h3>Activity</h3>
            {ouraData.activity?.map((a, i) => (
              <div key={i}>
                <p>{a.day}: {Math.round(a.active_calories)} kcal</p>
              </div>
            ))}
          </div>

          <div className="data-card">
            <h3>Heart Rate Variability</h3>
            {ouraData.heart_rate?.map((h, i) => (
              <div key={i}>
                <p>{h.day}: {h.hrv} ms</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && <div className="error">{error}</div>}
    </div>
  );
}
