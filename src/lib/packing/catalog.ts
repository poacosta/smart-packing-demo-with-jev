// Static packing catalog: the trip signals Jev scores, the items they unlock
// and the bags they have to fit into.

export const SIGNALS = {
  sun: {
    label: "sun",
    question: "Will the trip be sunny or warm enough to need sun protection?",
  },
  cold: {
    label: "cold",
    question:
      "Will it be cold (below about 12°C) at some point, so warm layers are needed?",
  },
  snow: {
    label: "snow",
    question: "Will there be snow, ice or freezing temperatures?",
  },
  rain: {
    label: "rain",
    question: "Is rain or wet weather likely during the trip?",
  },
  swimming: {
    label: "swimming",
    question: "Will the traveller swim, go to the beach or use a pool?",
  },
  hiking: {
    label: "hiking",
    question: "Will the traveller hike, trek or walk on mountain trails?",
  },
  exploring: {
    label: "exploring",
    question:
      "Will the traveller go sightseeing or explore places worth photographing?",
  },
  abroad: {
    label: "abroad",
    question: "Does the trip cross an international border?",
  },
  flying: {
    label: "flying",
    question: "Will the traveller take a flight?",
  },
  reading: {
    label: "reading",
    question: "Does the traveller plan to read or have long quiet downtime?",
  },
  work: {
    label: "work",
    question: "Will the traveller need to work, use a laptop or attend meetings?",
  },
  formal: {
    label: "dress code",
    question:
      "Is there a formal event, a smart dinner, a wedding or a dress code?",
  },
  fitness: {
    label: "workouts",
    question: "Will the traveller go running or work out?",
  },
  packLight: {
    label: "pack light",
    question: "Does the traveller want to pack light or keep luggage minimal?",
  },
} as const;

export type SignalId = keyof typeof SIGNALS;
export const SIGNAL_IDS = Object.keys(SIGNALS) as SignalId[];

/** Asked as one choice question, so the probabilities compete with each other. */
export const SEASONS = {
  winter: {
    label: "winter",
    description: "Winter at the destination: short days, cold, possibly snow",
  },
  spring: {
    label: "spring",
    description: "Spring at the destination: mild, changeable, blossoms and showers",
  },
  summer: {
    label: "summer",
    description: "Summer at the destination: long, hot or warm days",
  },
  autumn: {
    label: "autumn",
    description: "Autumn at the destination: cooling down, crisp, falling leaves",
  },
} as const;

export type SeasonId = keyof typeof SEASONS;
export const SEASON_IDS = Object.keys(SEASONS) as SeasonId[];

/** Everything an item can depend on: boolean signals plus season probabilities. */
export type TripSignalId = SignalId | SeasonId;
export type Signals = Record<TripSignalId, number>;

export function signalLabel(id: TripSignalId) {
  return id in SIGNALS ? SIGNALS[id as SignalId].label : SEASONS[id as SeasonId].label;
}

export const TEMPERATURE_LEVELS = [
  "Freezing, below 0°C",
  "Cold, 0–10°C",
  "Mild, 10–18°C",
  "Warm, 18–26°C",
  "Hot, above 26°C",
] as const;

export const BAGS = {
  underseat: {
    label: "18 L · under-seat",
    liters: 18,
    description: "Under-seat bag (18 L): one or two nights, minimal needs",
  },
  cabin: {
    label: "24 L · cabin bag",
    liters: 24,
    description: "Cabin bag (24 L): a few days up to a week, packing light",
  },
  carryon: {
    label: "40 L · carry-on",
    liters: 40,
    description: "Large carry-on (40 L): a week or more, or some bulky gear",
  },
  checked: {
    label: "65 L · checked",
    liters: 65,
    description:
      "Checked suitcase (65 L): long trips, cold-weather clothes or lots of gear",
  },
} as const;

export type BagId = keyof typeof BAGS;
export const BAG_IDS = Object.keys(BAGS) as BagId[];

export const WARDROBES = {
  men: { label: "Men", description: "Men's clothing, including shared and unisex items" },
  women: { label: "Women", description: "Women's clothing, including shared and unisex items" },
} as const;

export type WardrobeId = keyof typeof WARDROBES;
export const WARDROBE_IDS = Object.keys(WARDROBES) as WardrobeId[];

export type Item = {
  id: string;
  name: string;
  /** Placeholder art until /public/items/<id>.png exists. */
  emoji: string;
  /** Optional individual illustration, independent of atlas discovery. */
  image?: string;
  /** Volume in litres once packed. */
  liters: number;
  /** Omit for items shared by both wardrobe options. */
  wardrobe?: WardrobeId;
  /** "basic" items always go in unless the traveller removes them. */
  signal: TripSignalId | "basic";
};

// Order here is the order the cards are shown in.
export const ITEMS: Item[] = [
  // Basics
  { id: "cotton-tees", name: "Cotton tees", emoji: "👕", liters: 2.5, signal: "basic" },
  { id: "walking-shoes", name: "Walking shoes", emoji: "👟", liters: 3, signal: "basic" },
  { id: "phone-charger", name: "Phone charger", emoji: "🔌", liters: 0.3, signal: "basic" },
  { id: "water-bottle", name: "Water bottle", emoji: "🧃", liters: 0.8, signal: "basic" },
  { id: "wash-bag", name: "Wash bag", emoji: "🧼", liters: 1.5, signal: "basic" },

  // Summer wardrobe
  { id: "linen-shirt", name: "Linen shirt", emoji: "👔", liters: 1, signal: "summer" },
  { id: "summer-dress", name: "Summer dress", emoji: "👗", liters: 1, wardrobe: "women", signal: "summer" },
  { id: "tank-tops", name: "Tank tops", emoji: "🎽", liters: 0.6, signal: "summer" },
  { id: "linen-trousers", name: "Linen trousers", emoji: "👖", liters: 1.2, signal: "summer" },

  // Spring wardrobe
  { id: "trench-coat", name: "Trench coat", emoji: "🧥", liters: 2.5, signal: "spring" },
  { id: "cardigan", name: "Cardigan", emoji: "🧶", liters: 1.5, signal: "spring" },
  { id: "light-chinos", name: "Light chinos", emoji: "👖", liters: 1.5, signal: "spring" },
  { id: "white-sneakers", name: "White sneakers", emoji: "👟", liters: 2.5, signal: "spring" },

  // Autumn wardrobe
  { id: "denim-jacket", name: "Denim jacket", emoji: "🧥", liters: 2.5, signal: "autumn" },
  { id: "flannel-shirt", name: "Flannel shirt", emoji: "👕", liters: 1.5, signal: "autumn" },
  { id: "dark-jeans", name: "Dark jeans", emoji: "👖", liters: 2, signal: "autumn" },
  { id: "ankle-boots", name: "Ankle boots", emoji: "👢", liters: 3, signal: "autumn" },

  // Winter wardrobe
  { id: "wool-coat", name: "Wool coat", emoji: "🧥", liters: 5, signal: "winter" },
  { id: "wool-scarf", name: "Wool scarf", emoji: "🧣", liters: 0.8, signal: "winter" },
  { id: "fleece-pullover", name: "Fleece pullover", emoji: "🧥", liters: 2.5, signal: "winter" },
  { id: "winter-boots", name: "Winter boots", emoji: "🥾", liters: 4.5, signal: "winter" },

  // Weather
  { id: "easy-shorts", name: "Easy shorts", emoji: "🩳", liters: 1.2, signal: "sun" },
  { id: "sandals", name: "Sandals", emoji: "🩴", liters: 1, signal: "sun" },
  { id: "sunglasses", name: "Sunglasses", emoji: "🕶️", liters: 0.3, signal: "sun" },
  { id: "sunscreen", name: "Sunscreen", emoji: "🧴", liters: 0.3, signal: "sun" },
  { id: "sun-hat", name: "Sun hat", emoji: "👒", liters: 1, signal: "sun" },
  { id: "cozy-knit", name: "Cozy knit", emoji: "🧶", liters: 3, signal: "cold" },
  { id: "thermal-layers", name: "Thermal layers", emoji: "🧦", liters: 2, signal: "cold" },
  { id: "puffer-jacket", name: "Puffer jacket", emoji: "🧥", liters: 5, signal: "snow" },
  { id: "beanie-gloves", name: "Beanie & gloves", emoji: "🧤", liters: 0.8, signal: "snow" },
  { id: "rain-jacket", name: "Rain jacket", emoji: "🧥", liters: 1.5, signal: "rain" },
  { id: "tiny-umbrella", name: "Tiny umbrella", emoji: "☂️", liters: 0.5, signal: "rain" },

  // Activities & travel
  { id: "swimwear", name: "Swimwear", emoji: "🩱", liters: 0.4, wardrobe: "women", signal: "swimming" },
  { id: "swim-shorts", name: "Swim shorts", emoji: "🩳", image: "/items/swim-shorts.png", liters: 0.4, wardrobe: "men", signal: "swimming" },
  { id: "hiking-boots", name: "Hiking boots", emoji: "🥾", liters: 4, signal: "hiking" },
  { id: "daypack", name: "Daypack", emoji: "🎒", liters: 2, signal: "hiking" },
  { id: "little-camera", name: "Little camera", emoji: "📷", liters: 1, signal: "exploring" },
  { id: "passport", name: "Passport", emoji: "🛂", liters: 0.1, signal: "abroad" },
  { id: "travel-adapter", name: "Travel adapter", emoji: "🔋", liters: 0.2, signal: "abroad" },
  { id: "headphones", name: "Headphones", emoji: "🎧", liters: 1, signal: "flying" },
  { id: "good-book", name: "A good book", emoji: "📕", liters: 0.8, signal: "reading" },
  { id: "laptop", name: "Laptop", emoji: "💻", liters: 2.5, signal: "work" },
  { id: "smart-outfit", name: "Smart outfit", emoji: "🤵", liters: 3, wardrobe: "men", signal: "formal" },
  { id: "formal-dress", name: "Formal dress", emoji: "👗", image: "/items/formal-dress.png", liters: 1.5, wardrobe: "women", signal: "formal" },
  { id: "dress-shoes", name: "Dress shoes", emoji: "👞", liters: 2.5, signal: "formal" },
  { id: "running-kit", name: "Running kit", emoji: "🏃", liters: 1.5, signal: "fitness" },
];

export function getWardrobeItems(wardrobe: WardrobeId): Item[] {
  return ITEMS.filter((item) => !item.wardrobe || item.wardrobe === wardrobe);
}

export const PRESETS = [
  {
    id: "summer",
    label: "Málaga · summer",
    icon: "☀",
    text: "Five days in Málaga in July for a summer beach break, flying from London. Sunny days around 28°C, swimming, reading and long seaside walks. I want to pack light.",
  },
  {
    id: "autumn",
    label: "Hamburg · autumn",
    icon: "△",
    text: "Four days in Hamburg in October for an autumn city break, travelling by train from Berlin. Plan for cool days around 12°C, wind and rain. Harbour walks, museums, coffee houses and lots of photos.",
  },
  {
    id: "winter",
    label: "Vienna · winter",
    icon: "❄",
    text: "A week in Vienna in mid-December for the Christmas markets, flying from Madrid. Expect snow and around -2°C. Museums, coffee houses and a night at the opera.",
  },
  {
    id: "spring",
    label: "Kyoto · spring",
    icon: "✿",
    text: "Six days in Kyoto in early April for the cherry blossoms, flying from New York. Mild days around 16°C with the odd shower. Temples, gardens and lots of photos.",
  },
] as const;
