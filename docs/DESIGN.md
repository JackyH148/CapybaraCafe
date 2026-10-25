# Capybara Cafe: Design

A Tamagotchi-style study companion. Your capybaras want to run a cafe. Doing homework funds the cafe. Funding buys decor, which makes the capybaras happier. Happy capybaras unlock emotes. Neglect your homework and the capybaras get sad, each in its own way.

## Core loop

```
add assignment (title + deadline)
        │
        ▼
finish it ──► funding + happiness, scaled by how early you finished
        │       └─ chance of a new capybara wandering in
        ▼
spend funding in the shop ──► more happiness (bonus for a capybara's favourite item)
        │
        ▼
happiness ≥ threshold ──► emote unlocked (permanent)

ignore it ──► deadline passes ──► happiness and funding penalty
stop studying ──► after 24h, happiness slowly decays
```

## Reward rules (`server/src/game.js`)

| Situation | Multiplier on $50 / +8 happiness |
|---|---|
| Finished ≥ 48h before the deadline | 1.0 (full) |
| Finished closer to the deadline | Scales linearly from 1.0 down to 0.4 |
| Finished after the deadline | 0.15 (still worth something) |
| Deadline passes while unfinished | −15 happiness, −$25 funding (once per task) |
| No homework finished for 24h | −0.5 happiness per hour after that |

- **Short-notice tasks.** A task added less than 48h before it is due is measured against its own lifetime, so the student isn't punished for an assignment they just received.
- **"Reward if done now."** The task list shows the live reward (`rewardNow`). Watching it shrink is the anti-procrastination nudge.
- **Capybara drops.** Each on-time completion has a 20% × multiplier chance of a drop. Late work never drops one. Rarity is weighted: common 70, rare 25, legendary 5.
- **Lazy simulation.** There is no background job. `tick()` runs whenever a cafe is read or acted on, and applies the missed deadlines and decay since `lastTickAt`.

All the numbers live in `RULES`. Tune them there.

## Capybaras and personality

Each capybara has a `personality` (cheerful, grumpy, sleepy, dramatic, scholarly, chill), a `rarity`, a `color`, an `accessory`, a `favoriteItem`, and its own `happiness`.

Its mood comes from its happiness: thriving ≥ 80, happy ≥ 60, okay ≥ 40, sad ≥ 20, miserable below that. Mood selects what the capybara says and changes its face in the UI.

## The agent layer (`server/src/agent/`)

The game talks to the AI through two calls only:

```js
generateCapybara({ rarity? }) → { name, personality, rarity, color, accessory, favoriteItem, bio }
speak(capybara, { mood } | { event })  → string   // event: early | procrastinated | late | missed | purchase
```

- **`mock.js`** (current) builds capybaras and dialogue from the templates in `content.js`, so it works offline and is deterministic enough to demo.
- **LLM provider** (next step). Add `agent/<provider>.js` with the same interface and register it in `agent/index.js`, then select it with `AI_PROVIDER=<provider>`. Suggested prompts:
  - *generate*: give the model the personality list, rarity, and shop item ids. Ask for strict JSON, and validate it against the allowed values.
  - *speak*: give the model the capybara's bio, personality, mood, recent cafe log, and the student's upcoming deadlines. That makes the dialogue context-aware, e.g. "your essay is due in 3 hours…".
  - If the LLM call fails or times out, fall back to the mock, so the game never breaks mid-demo.
- **Going more agentic later.** Give the model tools such as `get_upcoming_deadlines`, `get_cafe_state`, and `suggest_purchase`. The capybara can then decide on its own to nag, encourage, or propose a cafe upgrade.

## Friends

Every cafe has an invite code, and joining moves you into that cafe. All members' homework feeds the shared funding and happiness. Missed deadlines from any member hurt everyone, which creates gentle peer accountability.

## Data model (`server/data/db.json`)

```
User  { id, name, cafeId, emotes[] }
Cafe  { id, name, inviteCode, memberIds[], funding, items[], capybaras[], lastHomeworkAt, lastTickAt, log[] }
Task  { id, userId, title, createdAt, deadline, status: open|missed|done, completedAt }
```

## Known MVP shortcuts / next steps

- **No auth.** Logging in by name returns that user. Add real auth before sharing beyond a demo.
- **Self-reported completion.** Students can game it by adding a far-off deadline and completing the task instantly. Options to fix this:
  - Daily earning cap
  - Minimum time between adding and completing a task
  - Canvas/LMS submission import
  - Friend verification
- **JSON file storage.** Move to SQLite or Postgres when there is more than one server instance.
- **Leaving a cafe abandons your old one.** Consider letting users belong to several cafes.
- **Ideas:**
  - Push notifications when a capybara gets sad
  - Seasonal shop items
  - Visible cafe layout slots
  - Emotes usable in a friends chat


  To run it: npm install && npm run dev from CapybaraCafe/, then open http://localhost:5173.
