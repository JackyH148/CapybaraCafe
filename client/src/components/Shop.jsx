import { api } from '../api.js';

export default function Shop({ shop, cafe, userId, act }) {
  const favorites = new Set(cafe.capybaras.map((c) => c.favoriteItem));
  return (
    <section className="card">
      <h2>🛍️ Cafe Shop</h2>
      <ul className="shop">
        {shop.map((item) => {
          const owned = cafe.items.includes(item.id);
          return (
            <li key={item.id}>
              <span className="emoji">{item.emoji}</span>
              <span>
                {item.name}{favorites.has(item.id) && ' ❤️'}
                <small>{item.slot} · +{item.happiness} happiness</small>
              </span>
              <button disabled={owned || cafe.funding < item.cost} onClick={() => act(() => api.buy(userId, item.id))}>
                {owned ? 'Owned' : `$${item.cost}`}
              </button>
            </li>
          );
        })}
      </ul>
      <small>❤️ = a capybara's favourite (extra happiness)</small>
    </section>
  );
}
