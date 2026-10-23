export const ITEM_ATLAS = {
  src: "/illustrations/packing-atlas.png",
  width: 1086,
  height: 1448,
};

export const WARDROBE_ATLAS = {
  src: "/illustrations/wardrobe-atlas.png",
  width: 1536,
  height: 1024,
};

export const UNISEX_ATLAS = {
  src: "/illustrations/unisex-atlas.png",
  width: 1254,
  height: 1254,
};

/** Neutral-cut occasion clothing and plain accessories. */
export const UNISEX_ILLUSTRATIONS: Record<string, readonly [number, number, number, number]> = {
  "lightweight-overshirt": [33, 36, 370, 357],
  "swim-cap": [468, 92, 314, 259],
  "formal-jacket": [858, 36, 364, 365],
  "formal-trousers": [110, 437, 214, 379],
  "evening-top": [436, 442, 382, 365],
  "crossbody-bag": [854, 527, 370, 257],
  wristwatch: [96, 854, 229, 346],
  "dress-belt": [449, 919, 353, 228],
  "sun-hat": [852, 895, 370, 264],
};

/** Additional climate layers, occasion clothing and personal accessories. */
export const WARDROBE_ILLUSTRATIONS: Record<string, readonly [number, number, number, number]> = {
  "light-scarf": [23, 25, 214, 231],
  "long-sleeve-top": [271, 26, 232, 230],
  "corduroy-trousers": [568, 26, 144, 230],
  "quilted-vest": [809, 26, 171, 224],
  "wool-socks": [1049, 29, 197, 224],
  espadrilles: [1284, 69, 229, 160],
  "beach-towel": [31, 315, 225, 169],
  "swim-goggles": [275, 335, 227, 126],
  "flip-flops": [549, 282, 190, 220],
  "rash-guard": [780, 272, 234, 223],
  "party-shirt": [1045, 265, 217, 234],
  blazer: [780, 512, 234, 238],
  "business-shirt": [1040, 512, 238, 236],
  "tailored-trousers": [1346, 513, 125, 236],
  notebook: [25, 758, 230, 231],
  smartphone: [314, 760, 140, 233],
  tablet: [532, 755, 211, 239],
  "power-bank": [787, 812, 231, 176],
  "trekking-trousers": [1076, 752, 150, 255],
  "trail-cap": [1280, 783, 232, 179],
};

/** Pixel bounds [left, top, width, height], including transparent padding. */
export const ITEM_ILLUSTRATIONS: Record<string, readonly [number, number, number, number]> = {
  "cotton-tees": [35, 58, 140, 137],
  "walking-shoes": [196, 80, 172, 121],
  "phone-charger": [390, 52, 150, 153],
  "water-bottle": [583, 49, 89, 148],
  "wash-bag": [721, 77, 171, 117],
  "linen-shirt": [915, 49, 155, 154],
  "tank-tops": [215, 225, 135, 166],
  "linen-trousers": [394, 210, 137, 180],
  "trench-coat": [554, 211, 151, 181],
  cardigan: [718, 229, 187, 160],
  "light-chinos": [941, 212, 103, 177],
  "white-sneakers": [20, 423, 170, 142],
  "denim-jacket": [193, 394, 180, 172],
  "flannel-shirt": [382, 394, 165, 172],
  "dark-jeans": [580, 392, 103, 176],
  "ankle-boots": [727, 423, 179, 137],
  "wool-coat": [916, 396, 155, 185],
  "wool-scarf": [21, 584, 162, 165],
  "fleece-pullover": [190, 582, 190, 164],
  "winter-boots": [387, 583, 153, 162],
  "easy-shorts": [552, 586, 169, 153],
  sandals: [722, 607, 184, 122],
  sunglasses: [910, 626, 167, 88],
  sunscreen: [47, 751, 110, 149],
  "cozy-knit": [382, 748, 161, 155],
  "thermal-layers": [556, 753, 157, 159],
  "puffer-jacket": [730, 748, 176, 161],
  "beanie-gloves": [920, 753, 151, 163],
  "rain-jacket": [23, 918, 161, 156],
  "tiny-umbrella": [194, 914, 175, 161],
  "hiking-boots": [558, 944, 158, 133],
  daypack: [740, 918, 141, 157],
  "little-camera": [914, 945, 151, 113],
  passport: [42, 1090, 130, 145],
  "travel-adapter": [203, 1097, 151, 139],
  headphones: [385, 1086, 161, 151],
  "good-book": [552, 1101, 174, 134],
  laptop: [722, 1092, 187, 141],
  "dress-shoes": [21, 1270, 165, 139],
  "running-kit": [209, 1245, 141, 174],
};
