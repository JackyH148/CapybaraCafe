import { useCallback, useEffect, useState } from 'react';
import { api } from './api.js';
import Cafe from './components/Cafe.jsx';
import Shop from './components/Shop.jsx';
import Social from './components/Social.jsx';
import Tasks from './components/Tasks.jsx';

const STORAGE_KEY = 'capybara-cafe-user';
const POLL_MS = 30_000;

const storage = {
  get: () => { try { return localStorage.getItem(STORAGE_KEY); } catch { return null; } },
  set: (v) => { try { v ? localStorage.setItem(STORAGE_KEY, v) : localStorage.removeItem(STORAGE_KEY); } catch { /* private mode */ } },
};

function Login({ onLogin }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const submit = async (e) => {
    e.preventDefault();
    try {
      onLogin((await api.login(name)).user.id);
    } catch (err) {
      setError(err.message);
    }
  };
  return (
    <form className="login card" onSubmit={submit}>
      <h1>☕ Capybara Cafe</h1>
      <p>Do your homework. Fund the cafe. Keep the capybaras happy.</p>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" autoFocus />
      <button disabled={!name.trim()}>Open my cafe</button>
      {error && <p className="error">{error}</p>}
    </form>
  );
}

export default function App() {
  const [userId, setUserId] = useState(storage.get);
  const [state, setState] = useState(null);
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((text) => {
    const id = Math.random();
    setToasts((t) => [...t, { id, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 5000);
  }, []);

  const refresh = useCallback(async () => {
    if (!userId) return;
    try {
      setState(await api.state(userId));
    } catch {
      // Stale id (e.g. the server's db was reset): back to login.
      storage.set(null);
      setUserId(null);
    }
  }, [userId]);

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, POLL_MS);
    return () => clearInterval(timer);
  }, [refresh]);

  // Runs an action, shows any error/emote toasts, then refreshes state.
  const act = useCallback(async (fn) => {
    try {
      const result = await fn();
      result?.newEmotes?.forEach((e) => toast(`New emote unlocked: ${e.emoji} ${e.name}`));
      await refresh();
      return result;
    } catch (err) {
      toast(`⚠️ ${err.message}`);
    }
  }, [refresh, toast]);

  if (!userId) {
    return <Login onLogin={(id) => { storage.set(id); setUserId(id); }} />;
  }
  if (!state) return <p className="loading">Brewing…</p>;

  return (
    <div className="app">
      <header>
        <h1>{state.cafe.name}</h1>
        <div className="funding">💰 ${state.cafe.funding}</div>
        <button className="link" onClick={() => { storage.set(null); setUserId(null); setState(null); }}>
          Log out ({state.user.name})
        </button>
      </header>

      <Cafe cafe={state.cafe} shop={state.shop} />

      <div className="grid">
        <Tasks tasks={state.tasks} userId={userId} act={act} toast={toast} />
        <Shop shop={state.shop} cafe={state.cafe} userId={userId} act={act} />
        <Social state={state} userId={userId} act={act} />
      </div>

      <div className="toasts">
        {toasts.map((t) => <div key={t.id} className="toast">{t.text}</div>)}
      </div>
    </div>
  );
}
