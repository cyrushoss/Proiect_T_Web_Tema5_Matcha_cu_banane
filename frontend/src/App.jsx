import { useEffect, useState } from 'react';

export default function App() {
  const [state, setState] = useState({ loading: true, error: null, data: null });

  useEffect(() => {
    fetch('/api/health')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((data) => setState({ loading: false, error: null, data }))
      .catch((error) => setState({ loading: false, error: error.message, data: null }));
  }, []);

  return (
    <main style={{ fontFamily: 'system-ui', maxWidth: 640, margin: '2rem auto', padding: '0 1rem' }}>
      <h1>Documente multi-organizație</h1>
      {state.loading && <p>Se încarcă…</p>}
      {state.error && <p role="alert">Eroare: {state.error}</p>}
      {state.data && <p>API: {state.data.status}, BD: {state.data.db}</p>}
    </main>
  );
}
