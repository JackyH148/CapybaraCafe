# ☕ Capybara Cafe

Do your homework, fund your capybaras' cafe, keep them happy. See [docs/DESIGN.md](docs/DESIGN.md) for the game design and architecture.

## Run it

```bash
npm install
npm run dev      # API on :3001, web app on http://localhost:5173
npm test         # game-rule unit tests
```

Data is stored in `server/data/db.json` (delete it to reset).
`AI_PROVIDER` selects the capybara agent (default `mock`; see `server/src/agent/index.js`).

## Layout

```
server/src/game.js      game rules (rewards, penalties, decay, shop, emotes) — pure, tested
server/src/content.js   personalities & dialogue, shop items, emotes
server/src/agent/       capybara generation + dialogue (mock now, LLM later)
server/src/index.js     Express API
client/src/             React UI (Vite)
```
