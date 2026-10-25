// A simple SVG capybara whose face changes with mood.
const FACES = {
  thriving: { eye: 'M58 30 q4 -5 8 0', mouth: 'M70 44 q4 4 8 0' },
  happy: { eye: 'M58 30 q4 -4 8 0', mouth: 'M71 44 q3 2 6 0' },
  okay: { eye: null, mouth: 'M71 45 h6' },
  sad: { eye: null, mouth: 'M71 46 q3 -3 6 0' },
  miserable: { eye: null, mouth: 'M70 47 q4 -5 8 0', tear: true },
};

export default function Capybara({ capybara, size = 120 }) {
  const { color, mood, accessory, rarity } = capybara;
  const face = FACES[mood];
  return (
    <svg viewBox="0 0 100 80" width={size} height={size * 0.8} className={`capy ${mood} ${rarity}`}>
      <ellipse cx="42" cy="52" rx="34" ry="20" fill={color} />
      <rect x="18" y="62" width="8" height="14" rx="3" fill={color} />
      <rect x="54" y="62" width="8" height="14" rx="3" fill={color} />
      <rect x="58" y="22" width="30" height="30" rx="12" fill={color} />
      <ellipse cx="62" cy="21" rx="5" ry="4" fill={color} stroke="#0003" />
      <ellipse cx="83" cy="40" rx="6" ry="5" fill="#0002" />
      <circle cx="86" cy="38" r="1.5" fill="#222" />
      {face.eye
        ? <path d={face.eye} stroke="#222" strokeWidth="2" fill="none" />
        : <circle cx="62" cy="30" r="2.2" fill="#222" />}
      <path d={face.mouth} stroke="#222" strokeWidth="1.5" fill="none" />
      {face.tear && <path d="M62 34 q-2 4 0 6 q2 -2 0 -6" fill="#5ab0ff" />}
      {accessory && <text x="62" y="20" fontSize="16">{accessory}</text>}
    </svg>
  );
}
