import crypto from 'node:crypto';
import cors from 'cors';
import express from 'express';
import { createAgent } from './agent/index.js';
import { EMOTES, SHOP } from './content.js';
import { db, save } from './db.js';
import { RULES, buyItem, completeTask, moodFor, tick, timeliness, unlockEmotes } from './game.js';

const agent = createAgent();
const app = express();
app.use(cors());
app.use(express.json());

const newId = () => crypto.randomUUID();
const inviteCode = () => crypto.randomBytes(3).toString('hex').toUpperCase();

class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

function findUser(id) {
  const user = db.users.find((u) => u.id === id);
  if (!user) throw new HttpError(404, 'User not found');
  return user;
}

const cafeOf = (user) => db.cafes.find((c) => c.id === user.cafeId);
const memberTasks = (cafe) => db.tasks.filter((t) => cafe.memberIds.includes(t.userId));

function log(cafe, text, now = Date.now()) {
  cafe.log.unshift({ at: now, text });
  cafe.log.length = Math.min(cafe.log.length, 30);
}

async function newCapybara(opts) {
  return { id: newId(), happiness: RULES.starterHappiness, joinedAt: Date.now(), ...(await agent.generateCapybara(opts)) };
}

// Brings the cafe up to date (missed deadlines, idle decay) before any read or action.
async function sync(cafe, now = Date.now()) {
  for (const task of tick(cafe, memberTasks(cafe), now)) {
    const owner = db.users.find((u) => u.id === task.userId);
    const capy = cafe.capybaras[0];
    log(cafe, `${owner.name} missed "${task.title}". ${capy.name}: "${await agent.speak(capy, { event: 'missed' })}"`, now);
  }
}

app.post('/api/users', async (req, res) => {
  const name = String(req.body.name ?? '').trim();
  if (!name) throw new HttpError(400, 'Name required');

  // No auth in the MVP: logging in by name returns the existing user.
  let user = db.users.find((u) => u.name.toLowerCase() === name.toLowerCase());
  if (!user) {
    const now = Date.now();
    user = { id: newId(), name, emotes: [] };
    const cafe = {
      id: newId(),
      name: `${name}'s Capybara Cafe`,
      inviteCode: inviteCode(),
      memberIds: [user.id],
      funding: 0,
      items: [],
      capybaras: [await newCapybara({ rarity: 'common' })],
      lastHomeworkAt: now,
      lastTickAt: now,
      log: [],
    };
    user.cafeId = cafe.id;
    log(cafe, `${cafe.capybaras[0].name} opened the cafe!`, now);
    db.users.push(user);
    db.cafes.push(cafe);
    save();
  }
  res.json({ user });
});

app.get('/api/users/:id/state', async (req, res) => {
  const user = findUser(req.params.id);
  const cafe = cafeOf(user);
  await sync(cafe);
  unlockEmotes(user, cafe);
  save();

  const capybaras = await Promise.all(cafe.capybaras.map(async (c) => {
    const mood = moodFor(c.happiness);
    return { ...c, happiness: Math.round(c.happiness), mood, line: await agent.speak(c, { mood }) };
  }));
  res.json({
    user,
    cafe: { ...cafe, capybaras },
    members: db.users.filter((u) => cafe.memberIds.includes(u.id)).map(({ id, name }) => ({ id, name })),
    // rewardNow: funding earned if the task were finished right now.
    tasks: db.tasks.filter((t) => t.userId === user.id).map((t) => (t.status === 'done' ? t
      : { ...t, rewardNow: Math.round(RULES.baseFunding * timeliness(t, Date.now()).multiplier) })),
    shop: SHOP,
    emotes: EMOTES,
  });
});

app.post('/api/tasks', (req, res) => {
  const user = findUser(req.body.userId);
  const title = String(req.body.title ?? '').trim();
  const deadline = new Date(req.body.deadline).getTime();
  if (!title) throw new HttpError(400, 'Title required');
  if (!(deadline > Date.now())) throw new HttpError(400, 'Deadline must be in the future');

  const task = { id: newId(), userId: user.id, title, createdAt: Date.now(), deadline, status: 'open', completedAt: null };
  db.tasks.push(task);
  save();
  res.json({ task });
});

app.post('/api/tasks/:id/complete', async (req, res) => {
  const user = findUser(req.body.userId);
  const task = db.tasks.find((t) => t.id === req.params.id && t.userId === user.id);
  if (!task) throw new HttpError(404, 'Task not found');
  if (task.status === 'done') throw new HttpError(400, 'Already done');

  const cafe = cafeOf(user);
  const now = Date.now();
  await sync(cafe, now);
  const reward = completeTask(cafe, task, now);

  let newCapy = null;
  if (reward.dropsCapybara) {
    newCapy = await newCapybara();
    cafe.capybaras.push(newCapy);
    log(cafe, `A ${newCapy.rarity} capybara, ${newCapy.name}, wandered in!`, now);
  }
  const reactions = await Promise.all(cafe.capybaras.map(async (c) => ({
    capybaraId: c.id, name: c.name, line: await agent.speak(c, { event: reward.timing }),
  })));
  log(cafe, `${user.name} finished "${task.title}" (${reward.timing}) +$${reward.funding}`, now);
  const newEmotes = unlockEmotes(user, cafe);
  save();
  res.json({ reward, newCapybara: newCapy, reactions, newEmotes });
});

app.post('/api/cafe/buy', async (req, res) => {
  const user = findUser(req.body.userId);
  const cafe = cafeOf(user);
  await sync(cafe);
  let item;
  try {
    item = buyItem(cafe, req.body.itemId);
  } catch (err) {
    throw new HttpError(400, err.message);
  }
  const capy = cafe.capybaras[0];
  log(cafe, `${user.name} bought ${item.emoji} ${item.name}. ${capy.name}: "${await agent.speak(capy, { event: 'purchase' })}"`);
  const newEmotes = unlockEmotes(user, cafe);
  save();
  res.json({ item, newEmotes });
});

app.post('/api/cafe/join', (req, res) => {
  const user = findUser(req.body.userId);
  const code = String(req.body.inviteCode ?? '').trim().toUpperCase();
  const target = db.cafes.find((c) => c.inviteCode === code);
  if (!target) throw new HttpError(404, 'No cafe with that invite code');
  if (target.id === user.cafeId) throw new HttpError(400, 'Already in this cafe');

  const current = cafeOf(user);
  current.memberIds = current.memberIds.filter((id) => id !== user.id);
  target.memberIds.push(user.id);
  user.cafeId = target.id;
  log(target, `${user.name} joined the cafe!`);
  save();
  res.json({ cafeId: target.id });
});

app.use((err, req, res, next) => {
  if (!(err instanceof HttpError)) console.error(err);
  res.status(err.status ?? 500).json({ error: err.status ? err.message : 'Internal error' });
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Capybara Cafe API on http://localhost:${port} (agent: ${process.env.AI_PROVIDER || 'mock'})`));
