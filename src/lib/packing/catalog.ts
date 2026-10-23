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
  conference: {
    label: "conferences",
    question: "Will the traveller attend a professional conference, business event or in-person client meeting requiring business clothing? Remote work alone does not count.",
  },
  party: {
    label: "parties",
    question: "Will the traveller go to a party, celebration, cocktail reception or nightclub requiring an evening outfit? Ordinary sightseeing does not count.",
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

export type Item = {
  id: string;
  name: string;
  /** Specific use and climate guidance included in the question sent to Jev. */
  use: string;
  /** Placeholder art until /public/items/<id>.png exists. */
  emoji: string;
  /** Optional individual illustration, independent of atlas discovery. */
  image?: string;
  /** Volume in litres once packed. */
  liters: number;
  /** "basic" items always go in unless the traveller removes them. */
  signal: TripSignalId | "basic";
  /** Additional uses for the offline fallback; Jev judges the full trip itself. */
  alsoFor?: TripSignalId[];
};

// A single catalog of neutral-cut garments and shared accessories.
// Order here is the order the cards are shown in.
export const ITEMS: Item[] = [
  // Everyday essentials and casual clothing
  { id: "cotton-tees", name: "Cotton tees", use: "Short-sleeve casual tops for warm days or summer. Not a substitute for long sleeves or thermal underwear on cold trips.", emoji: "👕", liters: 2.5, signal: "summer" },
  { id: "walking-shoes", name: "Walking shoes", use: "Breathable casual walking trainers for sightseeing in dry, mild weather. Choose insulated winter boots for freezing weather, hiking boots for trails, or dress shoes for formal events.", emoji: "👟", liters: 3, signal: "exploring" },
  { id: "phone-charger", name: "Phone charger", use: "Everyday charging cable and wall plug for the phone; useful on every trip.", emoji: "🔌", liters: 0.3, signal: "basic" },
  { id: "water-bottle", name: "Water bottle", use: "Reusable drinking bottle for daily hydration.", emoji: "🧃", liters: 0.8, signal: "basic" },
  { id: "wash-bag", name: "Wash bag", use: "Essential toiletries for overnight trips.", emoji: "🧼", liters: 1.5, signal: "basic" },

  // Summer wardrobe
  { id: "linen-shirt", name: "Linen shirt", use: "Airy linen shirt for hot summer days; too thin as the main shirt for cold winter or autumn trips.", emoji: "👔", liters: 1, signal: "summer" },
  { id: "lightweight-overshirt", name: "Light overshirt", use: "Loose straight-cut cotton overshirt for mild summer evenings and relaxed warm-weather outings; not a winter layer or business shirt.", emoji: "", liters: 1, signal: "summer" },
  { id: "tank-tops", name: "Tank tops", use: "Sleeveless lightweight tops for hot summer weather; unnecessary for cool spring, autumn or winter.", emoji: "🎽", liters: 0.6, signal: "summer" },
  { id: "linen-trousers", name: "Linen trousers", use: "Thin breathable trousers for summer heat; choose corduroy or jeans for chilly autumn and winter.", emoji: "👖", liters: 1.2, signal: "summer" },

  // Spring wardrobe
  { id: "trench-coat", name: "Trench coat", use: "Light uninsulated spring coat for mild changeable days; not warm enough for winter and too much for summer heat.", emoji: "🧥", liters: 2.5, signal: "spring" },
  { id: "cardigan", name: "Cardigan", use: "Light knitted layer for mild spring evenings; choose a thick knit for cold winter.", emoji: "🧶", liters: 1.5, signal: "spring" },
  { id: "light-chinos", name: "Light chinos", use: "Lightweight cotton trousers for mild spring days and casual business settings; not insulated winter trousers.", emoji: "👖", liters: 1.5, signal: "spring" },
  { id: "white-sneakers", name: "White sneakers", use: "Low-top shoes for mild dry spring city trips; not winter, hiking or formal footwear.", emoji: "👟", liters: 2.5, signal: "spring" },

  // Autumn wardrobe
  { id: "denim-jacket", name: "Denim jacket", use: "Medium-weight casual outer layer for cool autumn days; unnecessary in summer heat and insufficient for freezing winter.", emoji: "🧥", liters: 2.5, signal: "autumn" },
  { id: "flannel-shirt", name: "Flannel shirt", use: "Warm brushed long-sleeve shirt for crisp autumn weather; too warm for summer heat.", emoji: "👕", liters: 1.5, signal: "autumn" },
  { id: "dark-jeans", name: "Dark jeans", use: "Sturdy denim trousers for cool autumn days and winter city trips; avoid for hot beach trips.", emoji: "👖", liters: 2, signal: "autumn" },
  { id: "ankle-boots", name: "Ankle boots", use: "Leather boots for cool autumn city walks; less insulated than snow boots and too heavy for summer.", emoji: "👢", liters: 3, signal: "autumn" },

  // Winter wardrobe
  { id: "wool-coat", name: "Wool coat", use: "Heavy smart winter coat for cold city trips, conferences and formal evenings; leave out for mild spring or hot summer. Prefer a puffer for snow sports.", emoji: "🧥", liters: 5, signal: "winter" },
  { id: "wool-scarf", name: "Wool scarf", use: "Thick warm scarf for cold winter days; use the lightweight scarf in mild spring.", emoji: "🧣", liters: 0.8, signal: "winter" },
  { id: "fleece-pullover", name: "Fleece pullover", use: "Insulating layer for winter or cold mountain trips; not needed for mild spring city breaks or summer.", emoji: "🧥", liters: 2.5, signal: "winter" },
  { id: "winter-boots", name: "Winter boots", use: "Insulated boots for winter cold, snow and ice; avoid for mild spring and summer.", emoji: "🥾", liters: 4.5, signal: "winter" },

  // Weather
  { id: "easy-shorts", name: "Easy shorts", use: "Light casual shorts for warm summer days; not for cold weather, formal events or business conferences.", emoji: "🩳", liters: 1.2, signal: "sun" },
  { id: "sandals", name: "Sandals", use: "Leather open-toe sandals for warm summer city days; use rubber flip-flops for pools and beaches.", emoji: "🩴", liters: 1, signal: "sun" },
  { id: "sunglasses", name: "Sunglasses", use: "Eye protection for sunny weather and bright snow.", emoji: "🕶️", liters: 0.3, signal: "sun" },
  { id: "sunscreen", name: "Sunscreen", use: "Sun protection for exposed skin at the beach, in strong sun or on mountain trips.", emoji: "🧴", liters: 0.3, signal: "sun" },
  { id: "sun-hat", name: "Bucket sun hat", use: "Plain cotton bucket hat for summer sun, beach days and warm outdoor sightseeing; use a technical trail cap for active hiking.", emoji: "", liters: 1, signal: "sun" },
  { id: "cozy-knit", name: "Cozy knit", use: "Thick wool sweater for cold winter days; too warm for mild spring and summer.", emoji: "🧶", liters: 3, signal: "cold" },
  { id: "thermal-layers", name: "Thermal layers", use: "Insulating base layer top and leggings for winter cold, snow and freezing temperatures; unnecessary for mild spring.", emoji: "🧦", liters: 2, signal: "cold" },
  { id: "puffer-jacket", name: "Puffer jacket", use: "Insulated winter outerwear for freezing weather, snow and cold outdoor trips; avoid in spring, summer and mild autumn. Prefer a wool coat for smart city events.", emoji: "🧥", liters: 5, signal: "snow" },
  { id: "beanie-gloves", name: "Beanie & gloves", use: "Warm knitted hat and insulated gloves for winter cold, not just snow; leave out on mild trips.", emoji: "🧤", liters: 0.8, signal: "cold" },
  { id: "rain-jacket", name: "Rain jacket", use: "Waterproof lightweight shell when rain or wet outdoor activities are expected; do not assume rain solely from a season.", emoji: "🧥", liters: 1.5, signal: "rain" },
  { id: "tiny-umbrella", name: "Tiny umbrella", use: "Compact rain cover for wet city trips; unnecessary if the trip is dry.", emoji: "☂️", liters: 0.5, signal: "rain" },

  // Activities & travel
  { id: "swim-cap", name: "Swim cap", use: "Silicone swimming cap for pool sessions and lap swimming in any season; not needed for a dry city trip.", emoji: "", liters: 0.1, signal: "swimming" },
  { id: "swim-shorts", name: "Swim shorts", use: "Relaxed straight-cut swim shorts for swimming, pools or beach time in any season; summer alone does not imply swimming.", emoji: "🩳", image: "/items/swim-shorts.png", liters: 0.4, signal: "swimming" },
  { id: "hiking-boots", name: "Hiking boots", use: "Sturdy supportive boots for actual hiking and rough trails; unnecessary for ordinary city sightseeing.", emoji: "🥾", liters: 4, signal: "hiking" },
  { id: "daypack", name: "Daypack", use: "Small backpack for hiking day trips, trails and carrying outdoor gear.", emoji: "🎒", liters: 2, signal: "hiking" },
  { id: "little-camera", name: "Little camera", use: "Dedicated camera for photography, sightseeing and capturing places; optional on a work-only trip.", emoji: "📷", liters: 1, signal: "exploring" },
  { id: "passport", name: "Passport", use: "Travel identity document when crossing borders.", emoji: "🛂", liters: 0.1, signal: "abroad" },
  { id: "travel-adapter", name: "Travel adapter", use: "Plug adapter when travelling abroad to a different socket system.", emoji: "🔋", liters: 0.2, signal: "abroad" },
  { id: "headphones", name: "Headphones", use: "Audio for flights, listening to music, digital entertainment or remote meetings.", emoji: "🎧", liters: 1, signal: "flying", alsoFor: ["reading", "work"] },
  { id: "good-book", name: "A good book", use: "Paper book for an explicitly planned reading holiday or quiet downtime; not automatically needed on work or party trips.", emoji: "📕", liters: 0.8, signal: "reading" },
  { id: "laptop", name: "Laptop", use: "Computer for work, coding, presentations and professional conferences; unnecessary for a leisure-only beach or party trip.", emoji: "💻", liters: 2.5, signal: "work", alsoFor: ["conference"] },
  { id: "formal-jacket", name: "Evening jacket", use: "Straight-cut black evening jacket with satin lapels for formal weddings, galas and black-tie occasions; more formal than a conference blazer or casual party shirt.", emoji: "", liters: 1.8, signal: "formal" },
  { id: "formal-trousers", name: "Evening trousers", use: "Straight-leg black trousers with pressed creases for formal weddings, galas and evening events; pair with an evening jacket, not casual beach or hiking gear.", emoji: "", liters: 1.2, signal: "formal" },
  { id: "dress-shoes", name: "Dress shoes", use: "Smart leather footwear for business conferences, formal events and dressy parties; not for hiking or swimming.", emoji: "👞", liters: 2.5, signal: "formal", alsoFor: ["conference", "party"] },
  { id: "running-kit", name: "Running kit", use: "Technical exercise top and shorts for running and workouts; not an ordinary city outfit.", emoji: "🏃", liters: 1.5, signal: "fitness" },
  // Additional climate layers, activity outfits and accessories
  { id: "light-scarf", name: "Light scarf", use: "Thin cotton scarf for breezy mild spring days; choose a thick wool scarf for winter cold.", emoji: "", liters: 0.3, signal: "spring" },
  { id: "long-sleeve-top", name: "Long-sleeve top", use: "Breathable striped cotton top for mild spring days; lighter than autumn flannel and winter thermals.", emoji: "", liters: 0.8, signal: "spring" },
  { id: "corduroy-trousers", name: "Corduroy trousers", use: "Warm textured trousers for crisp autumn weather; too warm for summer and more substantial than spring chinos.", emoji: "", liters: 1.8, signal: "autumn" },
  { id: "quilted-vest", name: "Quilted vest", use: "Sleeveless insulating layer over a flannel shirt for crisp autumn walks; not a full winter coat or summer layer.", emoji: "", liters: 1.5, signal: "autumn" },
  { id: "wool-socks", name: "Wool socks", use: "Thick insulating socks for winter boots and cold weather; unnecessary on mild or hot trips.", emoji: "", liters: 0.3, signal: "winter" },
  { id: "espadrilles", name: "Espadrilles", use: "Light canvas shoes for dry hot summer days and relaxed dinners; unsuitable for winter, rain or formal events.", emoji: "", liters: 0.9, signal: "summer" },
  { id: "beach-towel", name: "Beach towel", use: "Compact drying towel for swimming, pools and beaches in any season; not needed on a city-only trip.", emoji: "", liters: 0.8, signal: "swimming" },
  { id: "swim-goggles", name: "Swim goggles", use: "Goggles for swimming laps or underwater visibility; useful for a swimming trip, not ordinary sightseeing.", emoji: "", liters: 0.2, signal: "swimming" },
  { id: "flip-flops", name: "Flip-flops", use: "Rubber water-friendly footwear for poolside and beach showers; not walking or conference shoes.", emoji: "", liters: 0.4, signal: "swimming" },
  { id: "rash-guard", name: "Rash guard", use: "Sun-protective swim shirt for outdoor swimming, surfing and a beach holiday; not a casual or business top.", emoji: "", liters: 0.5, signal: "swimming" },
  { id: "party-shirt", name: "Party shirt", use: "Burgundy satin evening shirt for parties, nightlife and celebrations; not a business shirt or everyday city layer.", emoji: "", liters: 0.7, signal: "party" },
  { id: "evening-top", name: "Evening top", use: "Relaxed charcoal mock-neck top with a subtle satin finish for parties, nightlife and cocktail receptions; distinct from a crisp business shirt or casual cotton tee.", emoji: "", liters: 0.6, signal: "party" },
  { id: "crossbody-bag", name: "Crossbody pouch", use: "Compact plain crossbody pouch for carrying phone, tickets and keys at parties, festivals and evening events; more compact than a hiking daypack.", emoji: "", liters: 0.3, signal: "party", alsoFor: ["formal"] },
  { id: "wristwatch", name: "Wristwatch", use: "Minimalist watch with a plain leather strap for dressy parties, formal events and professional meetings; optional for casual beach holidays.", emoji: "", liters: 0.1, signal: "party", alsoFor: ["formal", "conference"] },
  { id: "dress-belt", name: "Dress belt", use: "Plain black leather belt with a simple buckle for tailored trousers at formal events and business conferences; unnecessary with swim shorts or technical hiking trousers.", emoji: "", liters: 0.1, signal: "formal", alsoFor: ["conference"] },
  { id: "blazer", name: "Business blazer", use: "Structured navy blazer for professional conferences and client meetings; not beachwear or a casual sightseeing jacket.", emoji: "", liters: 1.5, signal: "conference" },
  { id: "business-shirt", name: "Business shirt", use: "Crisp button-down shirt for business conferences, presentations and formal dress codes; distinct from a satin party shirt.", emoji: "", liters: 0.7, signal: "conference", alsoFor: ["formal"] },
  { id: "tailored-trousers", name: "Tailored trousers", use: "Smart charcoal trousers for conferences, client meetings and formal occasions; not casual beach or hiking trousers.", emoji: "", liters: 1.2, signal: "conference", alsoFor: ["formal"] },
  { id: "notebook", name: "Notebook & pen", use: "Paper notebook and pen for conference notes, workshops and meetings; unnecessary for a beach-only holiday.", emoji: "", liters: 0.3, signal: "conference" },
  { id: "smartphone", name: "Smartphone", use: "Everyday phone for navigation, tickets, communication and snapshots; useful on every trip.", emoji: "", liters: 0.2, signal: "basic" },
  { id: "tablet", name: "Tablet", use: "Tablet for explicitly requested digital reading, films or light digital work; do not add just for having spare space. A laptop is preferable for coding and presentations.", emoji: "", liters: 0.6, signal: "reading", alsoFor: ["work"] },
  { id: "power-bank", name: "Power bank", use: "Portable charging for long sightseeing, photography, hiking or travel days away from sockets.", emoji: "", liters: 0.3, signal: "exploring", alsoFor: ["hiking", "flying"] },
  { id: "trekking-trousers", name: "Trekking trousers", use: "Quick-dry technical trousers for hiking and rugged trails; not business trousers or a party outfit.", emoji: "", liters: 0.9, signal: "hiking" },
  { id: "trail-cap", name: "Trail cap", use: "Lightweight technical cap for sunny hiking, trail running and outdoor exercise; unnecessary for indoor events.", emoji: "", liters: 0.2, signal: "hiking", alsoFor: ["fitness"] },
];

export const PRESETS = [
  {
    id: "malaga",
    label: "Málaga",
    text: "Five days in Málaga in July, 28°C. Beach relaxation, swimming, reading and seaside walks. Pack light.",
  },
  {
    id: "hamburg",
    label: "Hamburg",
    text: "Four days in Hamburg in October, 12°C and rain. Business meetings, a conference and presentations. Laptop and smart clothes.",
  },
  {
    id: "vienna",
    label: "Vienna",
    text: "A week in Vienna in December, -2°C and snow. Museums, palaces, photography and a dressy evening at the opera.",
  },
  {
    id: "illinois",
    label: "Illinois",
    text: "Six days in Chicago, Illinois, in April, 12°C and rain. Leisure with friends: parks, lake walks, baseball and live music.",
  },
] as const;
