# Wardrobe coverage and demo scenarios

The catalog contains 70 distinct items in one wardrobe of neutral-cut garments and
shared accessories. Occasions are distinguished by function, material and dress
code rather than gender-specific outfits.
Every item has an illustration and specific use guidance sent to Jev.
Capacity remains an upper limit. The examples below do not force a full suitcase.

## Change only the season

Use the same bag throughout. Start with:

> Five days in Hamburg in winter for a city break.

Replace only `winter` with `spring`, `summer` or `autumn`. No seasonal UI selector
is needed. An explicit season sets the intended scenario; omit conflicting
temperatures when demonstrating seasonal defaults. A stated temperature should
still influence the clothes, even when unusual for that season.

| Season | Distinct clothing available |
| --- | --- |
| Winter | Wool coat, wool scarf, fleece, insulated boots, thick knit, thermal layers, puffer, beanie and gloves, wool socks |
| Spring | Trench coat, light cardigan, chinos, white sneakers, light scarf, long-sleeve cotton top |
| Summer | Linen shirt and trousers, tank tops, shorts, light overshirt, sandals, espadrilles, bucket sun hat |
| Autumn | Denim jacket, flannel shirt, dark jeans, ankle boots, corduroy trousers, quilted vest |

Shoulder seasons can share some clothing. Weather-specific items such as a rain
jacket depend on the trip, rather than being tied rigidly to one season.

## Change the activity

Keep the beginning fixed: `Five days in Malaga in summer for …`.

| Ending | Distinct items available |
| --- | --- |
| `swimming at the beach.` | Swim shorts, swim cap, beach towel, goggles, flip-flops, rash guard, sunscreen |
| `parties and nightlife.` | Satin party shirt, evening top, crossbody pouch, wristwatch, dress shoes |
| `a professional conference and giving presentations.` | Business blazer, business shirt, tailored trousers, notebook and pen, laptop |
| `a formal black-tie wedding and gala dinner.` | Evening jacket, evening trousers, plain dress belt, dress shoes, wristwatch |
| `reading books and watching films on a tablet.` | Paper book, tablet, headphones |

For outdoor equipment, try:

> Five days in the Alps in autumn for hiking on mountain trails.

Hiking boots, a daypack, trekking trousers and a trail cap are available alongside
appropriate weather layers. A camera and power bank cover sightseeing and long
days outside; a smartphone is part of the everyday kit.

## Verification

Unit tests check seasonal changes, activity kits, the shared wardrobe, per-item
suitability visibility, artwork coverage and capacity limits. Offline tests are
keyword-based coverage checks, not predictions of the live model.

Live results depend on the current model and capacity. Probabilities can vary
between calls, and capacity can exclude useful items. The request and response
viewers make each call inspectable. All 70 items are considered together. The catalog excludes dresses, fitted
one-piece swimsuits, decorative clutches and necklace-and-earring sets; shared
items such as swim shorts, straight-cut jackets and trousers cover those uses.
Clothing preferences can be included in the input.
