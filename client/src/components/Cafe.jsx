import Capybara from './Capybara.jsx';

export default function Cafe({ cafe, shop }) {
  const owned = shop.filter((item) => cafe.items.includes(item.id));
  return (
    <section className="cafe">
      <div className="shelf">
        {owned.length ? owned.map((i) => <span key={i.id} title={i.name}>{i.emoji}</span>)
          : <em>An empty cafe… finish homework to fund some decor!</em>}
      </div>
      <div className="floor">
        {cafe.capybaras.map((c) => (
          <div key={c.id} className="staff">
            <div className="bubble">{c.line}</div>
            <Capybara capybara={c} />
            <strong>{c.name}</strong>
            <small>{c.rarity} · {c.personality} · {c.mood}</small>
            <div className="bar"><div style={{ width: `${c.happiness}%` }} /></div>
          </div>
        ))}
      </div>
      <ul className="log">
        {cafe.log.slice(0, 5).map((l) => <li key={l.at + l.text}>{l.text}</li>)}
      </ul>
    </section>
  );
}
