// Agent provider switch. Every provider must implement:
//   generateCapybara({ rarity? }) -> Promise<{ name, personality, rarity, color, accessory, favoriteItem, bio }>
//   speak(capybara, { mood?, event? }) -> Promise<string>
// To add an LLM (watsonx Granite, Claude, ...), create ./<provider>.js with the same
// interface and register it below; fall back to the mock on errors to keep the game playable.
import { createMockAgent } from './mock.js';

const providers = {
  mock: createMockAgent,
};

export function createAgent(name = process.env.AI_PROVIDER || 'mock') {
  const factory = providers[name];
  if (!factory) throw new Error(`Unknown AI_PROVIDER "${name}"`);
  return factory();
}
