import React, { useState, useEffect } from 'react';

function App() {
  const [notifications, setNotifications] = useState([]);
  const [category, setCategory] = useState('All');
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = `http://localhost:5000/api/priority-notifications?notification_type=${category}&limit=${limit}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setNotifications(data.notifications || []);
      } else {
        setError(data.error || 'Failed to sync with priority matrix.');
      }
    } catch (err) {
      setError('Algorithmic engine unreachable. Ensure backend server.js is active.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [category, limit]);

  const getCardTheme = (type) => {
    switch (type?.toLowerCase()) {
      case 'placement':
        return { bg: '#fef2f2', border: '#fca5a5', text: '#ef4444', marker: '#ef4444', icon: '💼' };
      case 'result':
        return { bg: '#f0fdf4', border: '#86efac', text: '#22c55e', marker: '#22c55e', icon: '🎓' };
      case 'event':
        return { bg: '#eff6ff', border: '#93c5fd', text: '#3b82f6', marker: '#3b82f6', icon: '🚀' };
      default:
        return { bg: '#f8fafc', border: '#cbd5e1', text: '#64748b', marker: '#64748b', icon: '📢' };
    }
  };

  const stats = {
    total: notifications.length,
    placements: notifications.filter(n => n.type?.toLowerCase() === 'placement').length,
    results: notifications.filter(n => n.type?.toLowerCase() === 'result').length,
    events: notifications.filter(n => n.type?.toLowerCase() === 'event').length,
  };

  return (
    <div style={{ padding: 'clamp(1.5rem, 5vw, 3rem)', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', backgroundColor: '#0f172a', color: '#f8fafc', minHeight: '100vh', boxSizing: 'border-box', width: '100%' }}>
      
      {/* Top Header Section */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <span style={{ backgroundColor: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', padding: '0.4rem 1rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.05em' }}>
        </span>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 2.8rem)', color: '#ffffff', fontWeight: '800', marginTop: '0.75rem', marginBottom: '0.5rem', letterSpacing: '-0.025em' }}>
          Campus Intelligence Hub
        </h1>
        <p style={{ color: '#94a3b8', fontSize: 'clamp(0.95rem, 2vw, 1.1rem)', margin: '0 auto', maxWidth: '650px', lineHeight: '1.5' }}>
          Real-time announcement stream sorted by critical priority coefficients.
        </p>
      </div>

      {/* Analytics Counter Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1.25rem', maxWidth: '1400px', margin: '0 auto 3rem auto' }}>
        {[
          { label: 'Total Loaded', count: stats.total, color: '#38bdf8' },
          { label: 'Placements', count: stats.placements, color: '#ef4444' },
          { label: 'Results', count: stats.results, color: '#22c55e' },
          { label: 'Events', count: stats.events, color: '#3b82f6' }
        ].map((s, idx) => (
          <div key={idx} style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '14px', padding: '1.25rem', textAlign: 'center', borderLeft: `5px solid ${s.color}`, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8', fontWeight: '600', letterSpacing: '0.02em' }}>{s.label}</p>
            <h3 style={{ margin: '0.35rem 0 0 0', fontSize: '1.75rem', color: '#ffffff', fontWeight: '800' }}>{s.count}</h3>
          </div>
        ))}
      </div>

      {/* Control Panel */}
      <div style={{ 
        display: 'flex', gap: '1.25rem', justifyContent: 'center', alignItems: 'center',
        background: '#1e293b', padding: '1.5rem', borderRadius: '20px', border: '1px solid #334155',
        maxWidth: '900px', margin: '0 auto 3.5rem auto', flexWrap: 'wrap', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: '1 1 220px' }}>
          <label style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: '700', letterSpacing: '0.05em' }}>FILTER MATRIX</label>
          <select 
            value={category} onChange={(e) => setCategory(e.target.value)}
            style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#ffffff', fontWeight: '600', outline: 'none', cursor: 'pointer' }}
          >
            <option value="All">All Streams Combined</option>
            <option value="Placement">Corporate Placements</option>
            <option value="Result">Academic Results</option>
            <option value="Event">Institutional Events</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: '1 1 180px' }}>
          <label style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: '700', letterSpacing: '0.05em' }}>FEED CAPACITY</label>
          <select 
            value={limit} onChange={(e) => setLimit(Number(e.target.value))}
            style={{ width: '100%', padding: '0.65rem', borderRadius: '10px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#ffffff', fontWeight: '600', outline: 'none', cursor: 'pointer' }}
          >
            <option value={5}>Top 5 Rows</option>
            <option value={10}>Top 10 Rows</option>
            <option value={20}>Top 20 Rows</option>
          </select>
        </div>

        <button 
          onClick={fetchNotifications}
          style={{ padding: '0.65rem 2rem', backgroundColor: '#38bdf8', color: '#0f172a', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', height: '42px', alignSelf: 'flex-end', flex: '1 1 auto', transition: 'background-color 0.2s', boxShadow: '0 4px 12px rgba(56, 189, 248, 0.2)' }}
        >
          Sync Data
        </button>
      </div>

      {/* System Status Indicators */}
      {loading && <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8', fontWeight: '600', fontSize: '1.1rem' }}>Syncing channels...</div>}
      {error && <div style={{ maxWidth: '600px', margin: '0 auto 2rem auto', padding: '1.25rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '14px', textAlign: 'center', fontWeight: '600' }}>🛑 {error}</div>}

      {/* Main Grid View - Cards are larger, spacious, and neatly distributed */}
      {!loading && !error && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
          {notifications.length === 0 ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '6rem', color: '#475569', fontWeight: '600', fontSize: '1.2rem' }}>No active parameters found.</div>
          ) : (
            notifications.map((item) => {
              const theme = getCardTheme(item.type);
              return (
                <div 
                  key={item.id} 
                  style={{ 
                    backgroundColor: '#1e293b', 
                    borderRadius: '20px', 
                    padding: '2rem', // Increased inside spacing
                    border: '1px solid #334155',
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '1.5rem', 
                    position: 'relative',
                    minHeight: '230px', // Increased minimum height footprint
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
                    transition: 'all 0.25s ease-in-out'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-6px)';
                    e.currentTarget.style.borderColor = theme.marker;
                    e.currentTarget.style.boxShadow = `0 20px 30px -10px rgba(0,0,0,0.5), 0 0 20px ${theme.marker}22`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = '#334155';
                    e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.2)';
                  }}
                >
                  {/* Card Header Structure */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: `${theme.text}15`, color: theme.text, padding: '0.4rem 0.8rem', borderRadius: '10px', fontSize: '0.8rem', fontWeight: '700', border: `1px solid ${theme.text}30` }}>
                      <span style={{ fontSize: '1.1rem' }}>{theme.icon}</span>
                      <span style={{ letterSpacing: '0.04em' }}>{item.type}</span>
                    </span>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '1.4rem', fontWeight: '900', color: theme.marker, letterSpacing: '-0.025em' }}>{item.score}</span>
                      <p style={{ margin: 0, fontSize: '0.65rem', color: '#64748b', fontWeight: '800', letterSpacing: '0.05em' }}>INDEX SCORE</p>
                    </div>
                  </div>

                  {/* Body Text */}
                  <p style={{ color: '#e2e8f0', fontSize: '1.05rem', lineHeight: '1.6', margin: '0', fontWeight: '500', flexGrow: 1 }}>
                    {item.message}
                  </p>

                  {/* Operational Time Footer */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#64748b', fontWeight: '600', marginTop: 'auto', borderTop: '1px solid #334155', paddingTop: '1rem' }}>
                    <span style={{ fontSize: '0.95rem' }}>🕒</span>
                    <span>{new Date(item.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

export default App;