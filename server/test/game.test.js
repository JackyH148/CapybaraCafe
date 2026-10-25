import assert from 'node:assert/strict';
import { test } from 'node:test';
import { RULES, buyItem, completeTask, tick, timeliness, unlockEmotes } from '../src/game.js';

const HOUR = 60 * 60 * 1000;
const T0 = 1_000_000_000_000;

const makeCafe = (happiness = 60) => ({
  funding: 0, items: [], lastHomeworkAt: T0, lastTickAt: T0,
  capybaras: [{ happiness, favoriteItem: 'matcha' }],
});
const makeTask = (leadHours) => ({ createdAt: T0, deadline: T0 + leadHours * HOUR, status: 'open' });

test('finishing well before the deadline earns full rewards', () => {
  const r = timeliness(makeTask(96), T0 + 24 * HOUR); // 72h early
  assert.equal(r.multiplier, 1);
  assert.equal(r.timing, 'early');
});

test('procrastinating shrinks rewards but never to zero', () => {
  const task = makeTask(96);
  const r = timeliness(task, task.deadline - 1);
  assert.equal(r.timing, 'procrastinated');
  assert.ok(r.multiplier >= RULES.minOnTimeMultiplier && r.multiplier < 0.45);
});

test('short-notice tasks are measured against their own lifetime', () => {
  const task = makeTask(4);
  assert.equal(timeliness(task, T0 + HOUR).timing, 'early'); // 3h left of 4h = 75%
});

test('late completion gives the small late multiplier and never drops a capybara', () => {
  const cafe = makeCafe();
  const task = makeTask(2);
  const reward = completeTask(cafe, task, task.deadline + HOUR, () => 0);
  assert.equal(reward.timing, 'late');
  assert.equal(reward.dropsCapybara, false);
  assert.equal(cafe.funding, Math.round(RULES.baseFunding * RULES.lateMultiplier));
});

test('missed deadlines penalise once', () => {
  const cafe = makeCafe(60);
  cafe.funding = 100;
  const tasks = [makeTask(1)];
  assert.equal(tick(cafe, tasks, T0 + 2 * HOUR).length, 1);
  assert.equal(tick(cafe, tasks, T0 + 3 * HOUR).length, 0);
  assert.equal(cafe.funding, 100 + RULES.missedFunding);
  assert.equal(cafe.capybaras[0].happiness, 60 + RULES.missedHappiness);
});

test('happiness decays only after the grace period, and not twice', () => {
  const cafe = makeCafe(60);
  tick(cafe, [], T0 + RULES.decayGraceMs);
  assert.equal(cafe.capybaras[0].happiness, 60);
  tick(cafe, [], T0 + RULES.decayGraceMs + 10 * HOUR);
  tick(cafe, [], T0 + RULES.decayGraceMs + 10 * HOUR);
  assert.equal(cafe.capybaras[0].happiness, 60 - 10 * RULES.decayPerHour);
});

test('buying a favourite item gives a bonus; emotes unlock and stick', () => {
  const cafe = makeCafe(70);
  cafe.funding = 40;
  buyItem(cafe, 'matcha');
  assert.equal(cafe.capybaras[0].happiness, 83);
  assert.throws(() => buyItem(cafe, 'piano'), /Not enough funding/);

  const user = { emotes: [] };
  assert.deepEqual(unlockEmotes(user, cafe).map((e) => e.id), ['wave', 'sip', 'orange', 'party']);
  cafe.capybaras[0].happiness = 0;
  unlockEmotes(user, cafe);
  assert.equal(user.emotes.length, 4);
});
