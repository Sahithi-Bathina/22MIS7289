import React, { useState, useEffect } from 'react';

function App() {
  const [data, setData] = useState([]);
  const [category, setCategory] = useState('All');
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const loadFeed = async () => {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch(`http://localhost:5000/api/priority-notifications?notification_type=${category}&limit=${limit}`);
      const json = await res.json();
      if (json.success) {
        setData(json.notifications);
      } else {
        setErr(json.error || 'Failed to parse');
      }
    } catch (e) {
      setErr('Backend server is down. Make sure node server.js is active.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeed();
  }, [category, limit]);

  const badgeColor = (type) => {
    if (type === 'Placement') return { bg: '#ffdcd9', txt: '#c62828' };
    if (type === 'Result') return { bg: '#e8f5e9', txt: '#2e7d32' };
    return { bg: '#e3f2fd', txt: '#1565c0' };
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={{ margin: '0 0 5px 0' }}>Campus Notifications Dashboard</h1>
        <small style={{ color: '#777' }}>Priority Sorting Active</small>
      </div>

      <div style={styles.filterBar}>
        <div style={styles.box}>
          <label style={styles.label}>Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} style={styles.input}>
            <option value="All">All Items</option>
            <option value="Placement">Placements</option>
            <option value="Result">Results</option>
            <option value="Event">Events</option>
          </select>
        </div>

        <div style={styles.box}>
          <label style={styles.label}>Max Count</label>
          <select value={limit} onChange={(e) => setLimit(Number(e.target.value))} style={styles.input}>
            <option value={5}>Top 5</option>
            <option value={10}>Top 10</option>
            <option value={20}>Top 20</option>
          </select>
        </div>

        <button onClick={loadFeed} style={styles.btn}>Refresh</button>
      </div>

      {loading && <p style={{ color: '#666' }}>Loading filtered priority streams...</p>}
      {err && <div style={styles.errorBox}>{err}</div>}

      <div style={styles.list}>
        {!loading && data.map(item => {
          const colors = badgeColor(item.type);
          return (
            <div key={item.id} style={styles.card}>
              <div style={styles.row}>
                <span style={{ ...styles.badge, backgroundColor: colors.bg, color: colors.txt }}>
                  {item.type}
                </span>
                <span style={{ fontSize: '0.85rem' }}>Score: <b>{item.score}</b></span>
              </div>
              <p style={styles.msg}>{item.message}</p>
              <div style={styles.date}>{new Date(item.timestamp).toLocaleString()}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  page: { padding: '30px', maxWidth: '1100px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' },
  header: { borderBottom: '1px solid #ddd', paddingBottom: '15px', marginBottom: '25px' },
  filterBar: { display: 'flex', gap: '20px', alignItems: 'flex-end', background: '#f9f9f9', padding: '15px', borderRadius: '8px', marginBottom: '25px' },
  box: { display: 'flex', flexDirection: 'column', gap: '5px' },
  label: { fontSize: '0.8rem', fontWeight: 'bold', color: '#555' },
  input: { padding: '8px', borderRadius: '4px', border: '1px solid #ccc', minWidth: '150px' },
  btn: { padding: '9px 20px', background: '#222', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  list: { display: 'flex', flexDirection: 'column', gap: '15px' },
  card: { padding: '20px', border: '1px solid #eee', borderRadius: '6px', background: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' },
  row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
  badge: { padding: '3px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' },
  msg: { fontSize: '1rem', margin: '5px 0 12px 0', color: '#333' },
  date: { fontSize: '0.75rem', color: '#999' },
  errorBox: { padding: '12px', background: '#ffebee', color: '#c62828', borderRadius: '4px', marginBottom: '15px' }
};

export default App;