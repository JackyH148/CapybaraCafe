import { useState } from 'react';
import { api } from '../api.js';

const tomorrow = () => {
  const d = new Date(Date.now() + 24 * 3600e3);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

function timeLeft(deadline) {
  const ms = deadline - Date.now();
  if (ms < 0) return 'overdue';
  const h = Math.floor(ms / 3600e3);
  return h >= 24 ? `${Math.floor(h / 24)}d ${h % 24}h left` : `${h}h ${Math.floor((ms % 3600e3) / 60e3)}m left`;
}

export default function Tasks({ tasks, userId, act, toast }) {
  const [title, setTitle] = useState('');
  const [deadline, setDeadline] = useState(tomorrow);

  const add = async (e) => {
    e.preventDefault();
    if (await act(() => api.addTask(userId, title, new Date(deadline).toISOString()))) setTitle('');
  };

  const complete = async (task) => {
    const result = await act(() => api.completeTask(userId, task.id));
    if (!result) return;
    toast(`+$${result.reward.funding} · finished ${result.reward.timing}`);
    result.reactions.forEach((r) => toast(`${r.name}: "${r.line}"`));
    if (result.newCapybara) toast(`🎉 New ${result.newCapybara.rarity} capybara: ${result.newCapybara.name}!`);
  };

  const pending = tasks.filter((t) => t.status !== 'done').sort((a, b) => a.deadline - b.deadline);
  const done = tasks.filter((t) => t.status === 'done').length;

  return (
    <section className="card">
      <h2>📚 Homework</h2>
      <form className="row" onSubmit={add}>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Assignment" />
        <input type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
        <button disabled={!title.trim()}>Add</button>
      </form>
      <p className="hint">Finish 2+ days early for full rewards. Procrastinating shrinks them; missing a deadline hurts.</p>
      <ul className="tasks">
        {pending.map((t) => (
          <li key={t.id} className={t.status}>
            <span>{t.title}<small>{t.status === 'missed' ? 'missed!' : timeLeft(t.deadline)}</small></span>
            <button onClick={() => complete(t)}>Done · ${t.rewardNow}</button>
          </li>
        ))}
        {!pending.length && <li className="empty">Nothing due. The capybaras are proud.</li>}
      </ul>
      <small>{done} completed</small>
    </section>
  );
}
