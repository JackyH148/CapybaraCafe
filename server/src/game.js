// Pure game rules. No I/O here so it is easy to unit test.
import { EMOTES, MOODS, SHOP } from './content.js';

const HOUR = 60 * 60 * 1000;

export const RULES = {
  baseFunding: 50,
  baseHappiness: 8,
  // Finishing at least this long before the deadline earns full rewards.
  fullRewardWindowMs: 48 * HOUR,
  // Multiplier for finishing right at the deadline (procrastinated, but still rewarded).
  minOnTimeMultiplier: 0.4,
  // Multiplier for finishing after the deadline.
  lateMultiplier: 0.15,
  missedHappiness: -15,
  missedFunding: -25,
  // Happiness decays after this long without any finished homework.
  decayGraceMs: 24 * HOUR,
  decayPerHour: 0.5,
  // Chance of a new capybara on a full-reward completion; scaled by the multiplier.
  capybaraDropChance: 0.2,
  starterHappiness: 60,
};

export const clamp = (n, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));

export function moodFor(happiness) {
  return MOODS.find((m) => happiness >= m.min).id;
}

/**
 * How well-timed a completion was.
 * Returns { multiplier, timing } where timing is 'early' | 'procrastinated' | 'late'.
 */
export function timeliness(task, completedAt) {
  const left = task.deadline - completedAt;
  if (left < 0) return { multiplier: RULES.lateMultiplier, timing: 'late' };

  // Measure against the reward window, or the task's whole lifetime if it was added
  // with less lead time than that, so short-notice tasks aren't unfairly penalised.
  const window = Math.min(RULES.fullRewardWindowMs, task.deadline - task.createdAt);
  const ratio = window <= 0 ? 1 : Math.min(1, left / window);
  const multiplier = RULES.minOnTimeMultiplier + (1 - RULES.minOnTimeMultiplier) * ratio;
  return { multiplier, timing: ratio >= 0.75 ? 'early' : 'procrastinated' };
}

/** Applies a completion to the cafe. Mutates cafe and task; returns the reward summary. */
export function completeTask(cafe, task, now, rng = Math.random) {
  const { multiplier, timing } = timeliness(task, now);
  const funding = Math.round(RULES.baseFunding * multiplier);
  const happiness = Math.round(RULES.baseHappiness * multiplier);

  task.status = 'done';
  task.completedAt = now;
  cafe.funding += funding;
  cafe.lastHomeworkAt = now;
  for (const capy of cafe.capybaras) capy.happiness = clamp(capy.happiness + happiness);

  const dropsCapybara = timing !== 'late' && rng() < RULES.capybaraDropChance * multiplier;
  return { funding, happiness, multiplier, timing, dropsCapybara };
}

/**
 * Advances the cafe clock: penalises newly missed deadlines and applies idle decay.
 * Mutates cafe and tasks; returns the tasks that were newly marked missed.
 */
export function tick(cafe, tasks, now) {
  const missed = [];
  for (const task of tasks) {
    if (task.status === 'open' && task.deadline < now) {
      task.status = 'missed';
      missed.push(task);
      cafe.funding = Math.max(0, cafe.funding + RULES.missedFunding);
      for (const capy of cafe.capybaras) capy.happiness = clamp(capy.happiness + RULES.missedHappiness);
    }
  }

  // Decay only for the part of [lastTickAt, now] that falls after the grace period.
  const decayStart = Math.max(cafe.lastTickAt, cafe.lastHomeworkAt + RULES.decayGraceMs);
  if (now > decayStart) {
    const loss = ((now - decayStart) / HOUR) * RULES.decayPerHour;
    for (const capy of cafe.capybaras) capy.happiness = clamp(capy.happiness - loss);
  }
  cafe.lastTickAt = now;
  return missed;
}

/** Buys a shop item. Throws on invalid purchases. */
export function buyItem(cafe, itemId) {
  const item = SHOP.find((i) => i.id === itemId);
  if (!item) throw new Error('Unknown item');
  if (cafe.items.includes(itemId)) throw new Error('Already owned');
  if (cafe.funding < item.cost) throw new Error('Not enough funding');

  cafe.funding -= item.cost;
  cafe.items.push(itemId);
  for (const capy of cafe.capybaras) {
    const bonus = capy.favoriteItem === itemId ? 10 : 0;
    capy.happiness = clamp(capy.happiness + item.happiness + bonus);
  }
  return item;
}

/** Adds any emotes the user has newly earned. Emotes are never taken away. */
export function unlockEmotes(user, cafe) {
  const peak = Math.max(0, ...cafe.capybaras.map((c) => c.happiness));
  const earned = EMOTES.filter((e) => peak >= e.threshold && !user.emotes.includes(e.id));
  user.emotes.push(...earned.map((e) => e.id));
  return earned;
}
