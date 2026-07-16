/**
 * Curated fashion photography from Unsplash (free for commercial use under the
 * Unsplash License — https://unsplash.com/license). Each pool is a set of verified,
 * category-appropriate photo IDs; images are assigned deterministically so a given
 * product always shows the same photos and server/client renders match.
 *
 * To use your own photography instead, drop files into public/products/<slug>/ and
 * run `npm run images` — those take precedence over these placeholders per product.
 */

function unsplashImage(id: string, w = 800, h = 1000) {
  return `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&crop=entropy&auto=format&q=80`;
}

const POOLS = {
  women: [
    "1515886657613-9f3515b0c78f",
    "1483985988355-763728e1935b",
    "1557777586-f6682739fcf3",
    "1492707892479-7bc8d5a4ee93",
    "1532453288672-3a27e9be9efd",
    "1554412933-514a83d2f3c8",
    "1617922001439-4a2e6562f328",
    "1590330297626-d7aff25a0431",
    "1618244972963-dbee1a7edc95",
    "1623039497026-00af61471107",
    "1512101903502-7eb0c9022c74",
    "1524255684952-d7185b509571",
    "1612423284934-2850a4ea6b0f",
    "1616847220575-31b062a4cd05",
  ],
  men: [
    "1617137968427-85924c800a22",
    "1618886614638-80e3c103d31a",
    "1617114919297-3c8ddb01f599",
    "1488161628813-04466f872be2",
    "1617113930975-f9c7243ae527",
    "1527010154944-f2241763d806",
    "1441984904996-e0b6ba687e04",
    "1617662408044-cda3ab7134c9",
    "1618001789159-ffffe6f96ef2",
    "1507680434567-5739c80be1ac",
    "1479064555552-3ef4979f8908",
    "1559582798-678dfc71ccd8",
    "1490114538077-0a7f8cb49891",
    "1602810318383-e386cc2a3ccf",
    "1516257984-b1b4d707412e",
  ],
  shoes: [
    "1542291026-7eec264c27ff",
    "1606107557195-0e29a4b5b4aa",
    "1525966222134-fcfa99b8ae77",
    "1560769629-975ec94e6a86",
    "1595950653106-6c9ebd614d3a",
    "1549298916-b41d501d3772",
    "1543508282-6319a3e2621f",
    "1600185365926-3a2ce3cdb9eb",
    "1491553895911-0055eca6402d",
    "1512374382149-233c42b6a83b",
    "1608231387042-66d1773070a5",
    "1595341888016-a392ef81b7de",
    "1539185441755-769473a23570",
  ],
  beauty: [
    "1523293182086-7651a899d37f",
    "1541643600914-78b084683601",
    "1594035910387-fea47794261f",
    "1458538977777-0549b2370168",
    "1610461888750-10bfc601b874",
    "1590736704728-f4730bb30770",
    "1587017539504-67cfbddac569",
    "1622618991746-fe6004db3a47",
    "1535683577427-740aaac4ec25",
    "1588514912908-8f5891714f8d",
    "1543422655-ac1c6ca993ed",
    "1593487568720-92097fb460fb",
    "1547887537-6158d64c35b3",
  ],
  kids: [
    "1525507119028-ed4c629a60a3",
    "1611708314849-8bb91fe0fa56",
    "1560506840-ec148e82a604",
    "1566454544259-f4b94c3d758c",
    "1518831959646-742c3a14ebf7",
    "1632337948797-ba161d29532b",
    "1607453998825-f3f36da5ab18",
    "1560859259-fcf2b952aed8",
  ],
  home: [
    "1616046229478-9901c5536a45",
    "1618220179428-22790b461013",
    "1583847268964-b28dc8f51f92",
    "1615873968403-89e068629265",
    "1616486338812-3dadae4b4ace",
    "1572048572872-2394404cf1f3",
    "1615874694520-474822394e73",
    "1554995207-c18c203602cb",
    "1628152371231-936cf45eb8f3",
    "1616047006789-b7af5afb8c20",
    "1617103996702-96ff29b1c467",
    "1534349762230-e0cadf78f5da",
  ],
} as const;

type PoolName = keyof typeof POOLS;

/** Map a leaf category slug to the photo pool that best matches it. */
function poolFor(category: string): readonly string[] {
  if (category.includes("footwear")) return POOLS.shoes;
  if (category.startsWith("women") || category === "sale-women")
    return POOLS.women;
  if (category.startsWith("men") || category === "sale-men") return POOLS.men;
  if (category.startsWith("kids") || category === "sale-kids") return POOLS.kids;
  if (category.startsWith("perfumes")) return POOLS.beauty;
  if (category.startsWith("jewellery")) return POOLS.beauty;
  if (category.startsWith("beauty")) return POOLS.beauty;
  if (category.startsWith("home")) return POOLS.home;
  return POOLS.women;
}

const DEPARTMENT_POOLS: Record<string, PoolName> = {
  women: "women",
  men: "men",
  kids: "kids",
  perfumes: "beauty",
  beauty: "beauty",
  jewellery: "beauty",
  home: "home",
  sale: "women",
};

/**
 * Four category-appropriate photos for a product, stable for a given seed.
 * `offset` shifts the starting photo within the pool — used to give a section
 * (e.g. the sale rail) a different selection without changing the seed.
 */
export function productImages(category: string, seed: number, count = 4, offset = 0) {
  const pool = poolFor(category);
  const base = Math.abs(seed + offset) % pool.length;
  return Array.from({ length: count }, (_, i) =>
    unsplashImage(pool[(base + i) % pool.length], 800, 1000),
  );
}

/** A single banner-sized image from a department pool (hero, tiles, mega-menu). */
export function departmentImage(
  dept: string,
  index: number,
  w = 800,
  h = 1000,
) {
  const pool = POOLS[DEPARTMENT_POOLS[dept] ?? "women"];
  return unsplashImage(pool[Math.abs(index) % pool.length], w, h);
}

/** A single banner-sized image drawn from a leaf category's pool (split banners). */
export function categoryImage(
  category: string,
  index: number,
  w = 800,
  h = 1000,
) {
  const pool = poolFor(category);
  return unsplashImage(pool[Math.abs(index) % pool.length], w, h);
}
