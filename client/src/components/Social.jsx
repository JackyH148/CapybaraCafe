import { useState } from 'react';
import { api } from '../api.js';

export default function Social({ state, userId, act }) {
  const [code, setCode] = useState('');
  const { cafe, members, emotes, user } = state;

  return (
    <section className="card">
      <h2>✨ Emotes</h2>
      <div className="emotes">
        {emotes.map((e) => {
          const unlocked = user.emotes.includes(e.id);
          return (
            <div key={e.id} className={unlocked ? '' : 'locked'} title={unlocked ? e.name : `Reach ${e.threshold} happiness`}>
              <span>{unlocked ? e.emoji : '🔒'}</span>
              <small>{unlocked ? e.name : `${e.threshold}♥`}</small>
            </div>
          );
        })}
      </div>

      <h2>👥 Friends</h2>
      <p>Invite code: <code>{cafe.inviteCode}</code></p>
      <ul className="members">{members.map((m) => <li key={m.id}>{m.name}</li>)}</ul>
      <form className="row" onSubmit={(e) => { e.preventDefault(); act(() => api.join(userId, code)); }}>
        <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Friend's code" />
        <button disabled={!code.trim()}>Join cafe</button>
      </form>
    </section>
  );
}
