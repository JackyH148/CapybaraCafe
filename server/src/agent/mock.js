// Offline "agent": generates capybaras and dialogue from templates.
// Same interface as a future LLM-backed agent (see ./index.js).
import {
  ACCESSORIES, COLORS, LEGENDARY_TITLES, NAME_PARTS, PERSONALITIES, RARITIES, SHOP,
} from '../content.js';

const pick = (arr, rng) => arr[Math.floor(rng() * arr.length)];

function pickRarity(rng) {
  const total = RARITIES.reduce((sum, r) => sum + r.weight, 0);
  let roll = rng() * total;
  return RARITIES.find((r) => (roll -= r.weight) < 0).id;
}

export function createMockAgent(rng = Math.random) {
  return {
    async generateCapybara({ rarity } = {}) {
      rarity ??= pickRarity(rng);
      const personality = pick(Object.keys(PERSONALITIES), rng);
      let name = pick(NAME_PARTS.first, rng) + pick(NAME_PARTS.last, rng);
      if (rarity === 'legendary') name += ` ${pick(LEGENDARY_TITLES, rng)}`;
      return {
        name,
        personality,
        rarity,
        color: rarity === 'legendary' ? '#d4a017' : pick(COLORS, rng),
        accessory: rarity === 'common' ? null : pick(ACCESSORIES, rng),
        favoriteItem: pick(SHOP, rng).id,
        bio: PERSONALITIES[personality].description,
      };
    },

    // context: { mood } for idle chatter, or { event } to react to something.
    async speak(capybara, { mood, event }) {
      const p = PERSONALITIES[capybara.personality];
      return pick(event ? p.reactions[event] : p.lines[mood], rng);
    },
  };
}
