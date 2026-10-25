// Static game content: personalities, shop catalogue, emotes.
// The mock agent draws from these; a real LLM agent would use the personality
// descriptions as character prompts instead of the canned lines.

export const MOODS = [
  { id: 'thriving', min: 80 },
  { id: 'happy', min: 60 },
  { id: 'okay', min: 40 },
  { id: 'sad', min: 20 },
  { id: 'miserable', min: 0 },
];

export const PERSONALITIES = {
  cheerful: {
    label: 'Cheerful',
    description: 'Endlessly upbeat, treats every customer like a best friend.',
    lines: {
      thriving: ['Best. Cafe. EVER! Look at all these happy customers!', 'I could hug every single one of your assignments!'],
      happy: ['Ooh, the cafe smells like fresh matcha today!', "You're doing great, partner!"],
      okay: ['Things are a little quiet... maybe some homework would liven it up?', "I'm still smiling! Mostly!"],
      sad: ["I'm sure you'll come back to your homework soon... right?", 'I wiped the same table five times waiting for you.'],
      miserable: ["I... I can't find my smile anywhere.", 'The lights flicker when nobody studies.'],
    },
    reactions: {
      early: ['WOW, done early?! You absolute star!'],
      procrastinated: ["Phew, cutting it close! But you did it, yay!"],
      late: ['Late is better than never! I still believe in you!'],
      missed: ['Oh no, we missed one... we can bounce back together!'],
      purchase: ['A new thing! I love it I love it I love it!'],
    },
  },
  grumpy: {
    label: 'Grumpy',
    description: 'Complains constantly but secretly cares a lot.',
    lines: {
      thriving: ["Hmph. Fine. The cafe is... acceptable. Don't let it go to your head.", "I'm not smiling. My face is just like this."],
      happy: ['Business is decent. Keep it that way.', "You actually did your work. I'm mildly impressed."],
      okay: ["Customers are complaining. So am I.", 'This espresso machine won\'t pay for itself.'],
      sad: ['Typical. You disappear and I run this place alone.', "Don't mind me, just sweeping an empty cafe."],
      miserable: ["I'm not upset. I just haven't moved in two days.", 'Go do your homework. Please. I mean it.'],
    },
    reactions: {
      early: ['Early? ...Who are you and what did you do with my owner?'],
      procrastinated: ['Last minute again. Classic.'],
      late: ["Late. Of course it's late."],
      missed: ['Missed it. Great. Wonderful. Fantastic.'],
      purchase: ['I guess it looks... fine.'],
    },
  },
  sleepy: {
    label: 'Sleepy',
    description: 'Drowsy and slow, speaks in yawns, loves cozy vibes.',
    lines: {
      thriving: ['*yawn* so cozy... this is the dream cafe...', 'Everything is warm and perfect. Nap time?'],
      happy: ['Mmm... a nice calm day at the cafe...', 'You studied? Nice... *snore*'],
      okay: ["Is it closing time yet? It's always closing time.", 'Zzz... huh? Oh, homework. Right.'],
      sad: ['Too sad to even nap properly...', 'The couch feels cold without customers.'],
      miserable: ["Can't sleep. Can't wake up. Just... here.", 'Even my dreams are empty...'],
    },
    reactions: {
      early: ['Done early... now we can both nap. Perfect.'],
      procrastinated: ['You stayed up late for this? Same...'],
      late: ['Late... like my alarm clock.'],
      missed: ['We slept through a deadline... oops.'],
      purchase: ['Is it soft? Can I sleep on it?'],
    },
  },
  dramatic: {
    label: 'Dramatic',
    description: 'Theatrical diva; every event is a Shakespearean tragedy or triumph.',
    lines: {
      thriving: ['BEHOLD! The finest cafe in all the realms!', 'Darling, we are LEGENDARY.'],
      happy: ['The crowd adores us! As they should.', 'A splendid day for espresso and applause!'],
      okay: ['The stage feels... smaller today.', 'I sense a plot twist coming. Do your homework.'],
      sad: ['Abandoned! Forsaken! Left to brew alone!', 'Woe is me, a capybara without an audience.'],
      miserable: ['This is the darkest act of our tragedy.', 'Tell the world... I tried to run a cafe...'],
    },
    reactions: {
      early: ['A TRIUMPH! Standing ovation!'],
      procrastinated: ['A nail-biting finale! My heart!'],
      late: ['Tardy, but the show goes on!'],
      missed: ['NOOOO! The deadline has claimed another victim!'],
      purchase: ['Exquisite! Worthy of my presence.'],
    },
  },
  scholarly: {
    label: 'Scholarly',
    description: 'Bookish and precise, loves facts and study tips.',
    lines: {
      thriving: ['Productivity is up 300%. Excellent methodology.', 'Fun fact: capybaras are the largest rodents. And the best baristas.'],
      happy: ['Consistent study habits. I approve.', 'Shall I recommend the Pomodoro technique? Oh, you already focus well.'],
      okay: ['Data suggests a slight decline in study output.', 'Spaced repetition works best if you actually start.'],
      sad: ['Hypothesis: you are avoiding your assignments.', 'The cafe library is gathering dust.'],
      miserable: ['Conclusion: the cafe cannot survive without studying.', 'I have catalogued every missed deadline. It is a long list.'],
    },
    reactions: {
      early: ['Ahead of schedule. Textbook execution.'],
      procrastinated: ['Submitted near the deadline. Suboptimal, but valid.'],
      late: ['Late submission noted for the record.'],
      missed: ['Deadline missed. Let us analyze what went wrong.'],
      purchase: ['A sound investment.'],
    },
  },
  chill: {
    label: 'Chill',
    description: 'Laid-back surfer energy, nothing really bothers them (much).',
    lines: {
      thriving: ['Duuude, this cafe is totally vibing.', 'Good waves, good coffee, good grades.'],
      happy: ['Pretty chill day, my friend.', 'Nice work, keep riding that wave.'],
      okay: ["Kinda slow, but it's all good... probably.", 'Maybe catch a homework wave soon?'],
      sad: ["Not gonna lie, kinda bummed, man.", "The vibes are... off."],
      miserable: ['Even I can\'t chill right now.', 'Wipeout, dude. Total wipeout.'],
    },
    reactions: {
      early: ['Early? Radical.'],
      procrastinated: ['Rode that deadline right to shore, nice.'],
      late: ["Late's cool. Better than never, bro."],
      missed: ['Missed that one... no worries, next wave.'],
      purchase: ['Oh that is SICK.'],
    },
  },
};

export const RARITIES = [
  { id: 'common', weight: 70 },
  { id: 'rare', weight: 25 },
  { id: 'legendary', weight: 5 },
];

export const NAME_PARTS = {
  first: ['Mocha', 'Bean', 'Latte', 'Cinna', 'Maple', 'Biscuit', 'Toffee', 'Chai', 'Pudding', 'Waffle', 'Hazel', 'Oat'],
  last: ['bara', 'kins', 'paws', 'muffin', 'nugget', 'loaf', 'puff', 'drop'],
};
export const COLORS = ['#a67c52', '#8b5e3c', '#c49a6c', '#7a5230', '#d2a679', '#b08968'];
export const ACCESSORIES = ['🍊', '🎩', '🎀', '🌸', '👓', '🧢', '🍋', '⭐'];
export const LEGENDARY_TITLES = ['the Golden Barista', 'Keeper of the Bean', 'the Latte Sage', 'Queen of Crema'];

export const SHOP = [
  { id: 'plant', name: 'Potted Monstera', emoji: '🪴', slot: 'decor', cost: 60, happiness: 4 },
  { id: 'lamp', name: 'Cozy Lamp', emoji: '🛋️', slot: 'furniture', cost: 90, happiness: 5 },
  { id: 'piano', name: 'Little Piano', emoji: '🎹', slot: 'furniture', cost: 250, happiness: 10 },
  { id: 'matcha', name: 'Matcha Latte', emoji: '🍵', slot: 'menu', cost: 40, happiness: 3 },
  { id: 'boba', name: 'Brown Sugar Boba', emoji: '🧋', slot: 'menu', cost: 70, happiness: 4 },
  { id: 'cake', name: 'Strawberry Shortcake', emoji: '🍰', slot: 'menu', cost: 80, happiness: 4 },
  { id: 'hotspring', name: 'Mini Hot Spring', emoji: '♨️', slot: 'outdoor', cost: 400, happiness: 15 },
  { id: 'orangetree', name: 'Orange Tree', emoji: '🍊', slot: 'outdoor', cost: 180, happiness: 8 },
];

// Unlocked permanently the first time any capybara in your cafe reaches `threshold`.
export const EMOTES = [
  { id: 'wave', emoji: '👋', name: 'Capy Wave', threshold: 20 },
  { id: 'sip', emoji: '☕', name: 'Coffee Sip', threshold: 40 },
  { id: 'orange', emoji: '🍊', name: 'Orange Hat', threshold: 60 },
  { id: 'party', emoji: '🎉', name: 'Cafe Party', threshold: 80 },
  { id: 'crown', emoji: '👑', name: 'Capy Royalty', threshold: 95 },
];
