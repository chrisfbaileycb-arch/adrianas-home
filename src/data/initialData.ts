import { PlanItem, GalleryPhoto, ScriptureVerse, ThoughtEntry, RecipeItem } from '../types';

export const INITIAL_PLANS: PlanItem[] = [
  {
    id: 'plan-1',
    title: 'Morning coffee & quiet scripture reflection',
    category: 'Morning',
    completed: true,
    priority: 'gentle',
    notes: 'Sit by the window before the house wakes up',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'plan-2',
    title: 'Tend to the garden & fresh porch planters',
    category: 'Morning',
    completed: false,
    priority: 'gentle',
    notes: 'Snip fresh rosemary for dinner',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'plan-3',
    title: 'Afternoon walk along the neighborhood path',
    category: 'Afternoon',
    completed: false,
    priority: 'important',
    notes: 'Leave phone on silent, just breathe fresh air',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'plan-4',
    title: 'Prep dough for rustic dinner rolls',
    category: 'Afternoon',
    completed: false,
    priority: 'gentle',
    notes: 'Let rise for 1.5 hours in warm spot',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'plan-5',
    title: 'Candlelit family dinner & unhurried tea',
    category: 'Evening',
    completed: false,
    priority: 'important',
    notes: 'Ask everyone their favorite part of the day',
    createdAt: new Date().toISOString(),
  },
];

// High-fidelity inline SVG illustrations for initial gallery photos so they render instantly with zero network dependencies
const createWarmSvgPhoto = (title: string, subtitle: string, bgGradient: string, iconType: 'hearth' | 'field' | 'kitchen' | 'tea'): string => {
  let iconSvg = '';
  if (iconType === 'hearth') {
    iconSvg = `
      <path d="M12 2v4m0 16v-4m-8-6h4m12 0h-4m-2.5-5.5l-2.8 2.8m-5.4 5.4l-2.8 2.8m0-11l2.8 2.8m5.4 5.4l2.8 2.8" stroke="#D97706" stroke-width="2" stroke-linecap="round"/>
      <circle cx="12" cy="12" r="5" fill="#F59E0B" fill-opacity="0.3"/>
      <path d="M9 15c1-3 2-4 3-6 1 2 2 3 3 6-1.5 1-4.5 1-6 0z" fill="#DC2626"/>
    `;
  } else if (iconType === 'field') {
    iconSvg = `
      <path d="M4 18c4-4 8-2 12-6s4-4 4-4" stroke="#059669" stroke-width="2" stroke-linecap="round"/>
      <path d="M2 20c6-3 12-2 20-5" stroke="#10B981" stroke-width="2" stroke-linecap="round"/>
      <circle cx="18" cy="7" r="3" fill="#FBBF24"/>
      <path d="M6 14v4M10 12v6M14 11v7" stroke="#34D399" stroke-width="2" stroke-linecap="round"/>
    `;
  } else if (iconType === 'kitchen') {
    iconSvg = `
      <rect x="5" y="8" width="14" height="10" rx="3" fill="#D97706" fill-opacity="0.2" stroke="#B45309" stroke-width="2"/>
      <path d="M8 8V5a2 2 0 012-2h4a2 2 0 012 2v3" stroke="#B45309" stroke-width="2"/>
      <line x1="9" y1="12" x2="15" y2="12" stroke="#B45309" stroke-width="2" stroke-linecap="round"/>
      <line x1="9" y1="15" x2="13" y2="15" stroke="#B45309" stroke-width="2" stroke-linecap="round"/>
    `;
  } else {
    iconSvg = `
      <path d="M17 8h1a4 4 0 010 8h-1M5 8h12v7a4 4 0 01-4 4H9a4 4 0 01-4-4V8z" stroke="#92400E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M8 4c0 1.5 1 2 1 3M12 4c0 1.5 1 2 1 3" stroke="#D97706" stroke-width="2" stroke-linecap="round"/>
    `;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="600" height="450">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        ${bgGradient}
      </linearGradient>
      <filter id="grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" result="noise"/>
        <feColorMatrix type="matrix" values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.07 0"/>
        <feBlend in="SourceGraphic" mode="multiply"/>
      </filter>
    </defs>
    <rect width="600" height="450" fill="url(#grad)"/>
    <rect width="600" height="450" fill="transparent" filter="url(#grain)"/>
    
    <g transform="translate(300, 180) scale(3.5)" stroke-linejoin="round">
      <g transform="translate(-12, -12)">
        ${iconSvg}
      </g>
    </g>

    <text x="300" y="320" text-anchor="middle" font-family="Georgia, serif" font-size="24" font-weight="600" fill="#3D2E24" letter-spacing="0.5">${title}</text>
    <text x="300" y="352" text-anchor="middle" font-family="-apple-system, sans-serif" font-size="14" font-weight="400" fill="#786659" letter-spacing="1.2">${subtitle}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const INITIAL_PHOTOS: GalleryPhoto[] = [
  {
    id: 'photo-1',
    title: 'By the Hearth Fire',
    dataUrl: createWarmSvgPhoto(
      'By the Hearth Fire',
      'COZY EVENING TOGETHER',
      '<stop offset="0%" stop-color="#FFF5EB"/><stop offset="50%" stop-color="#FDE8D3"/><stop offset="100%" stop-color="#F8D3B2"/>',
      'hearth'
    ),
    date: 'Autumn Evening',
    caption: 'Soft golden warmth, tea on the table, and loved ones close.',
    tags: ['Cozy', 'Home'],
    isFavorite: true,
  },
  {
    id: 'photo-2',
    title: 'Sun-Dappled Meadow',
    dataUrl: createWarmSvgPhoto(
      'Sun-Dappled Meadow',
      'AFTERNOON FAMILY WALK',
      '<stop offset="0%" stop-color="#F4FAF5"/><stop offset="50%" stop-color="#E2F2E7"/><stop offset="100%" stop-color="#CBE8D3"/>',
      'field'
    ),
    date: 'Sunny Saturday',
    caption: 'Walking hand in hand through the tall wildflowers.',
    tags: ['Adventures', 'Family'],
    isFavorite: true,
  },
  {
    id: 'photo-3',
    title: 'Sunday Morning Baking',
    dataUrl: createWarmSvgPhoto(
      'Sunday Morning Baking',
      'KITCHEN FLOUR & HONEY',
      '<stop offset="0%" stop-color="#FCF9F2"/><stop offset="50%" stop-color="#F8EED7"/><stop offset="100%" stop-color="#EFDEB5"/>',
      'kitchen'
    ),
    date: 'Sunday Morning',
    caption: 'The smell of warm sourdough filling the whole home.',
    tags: ['Recipes', 'Home'],
    isFavorite: false,
  },
  {
    id: 'photo-4',
    title: 'Porch Tea & Stillness',
    dataUrl: createWarmSvgPhoto(
      'Porch Tea & Stillness',
      'QUIET MOMENT IN THE SUN',
      '<stop offset="0%" stop-color="#FAF4EE"/><stop offset="50%" stop-color="#F2E3D5"/><stop offset="100%" stop-color="#E6CEBD"/>',
      'tea'
    ),
    date: 'Early Morning',
    caption: 'Before the busy rush begins, a pause for quiet thankfulness.',
    tags: ['Quiet Joy'],
    isFavorite: true,
  },
];

export const SCRIPTURE_COLLECTION: ScriptureVerse[] = [
  {
    id: 'v-1',
    verse: 'Be still, and know that I am God.',
    reference: 'Psalm 46:10',
    category: 'Peace',
    reflection: 'Take a slow, deep breath. You do not have to carry the whole world today.',
    isFavorite: true,
  },
  {
    id: 'v-2',
    verse: 'I can do all things through Christ who strengthens me.',
    reference: 'Philippians 4:13',
    category: 'Strength',
    reflection: 'Strength given for this exact hour, one tender step at a time.',
    isFavorite: true,
  },
  {
    id: 'v-3',
    verse: 'The Lord is my shepherd; I shall not want. He makes me lie down in green pastures. He leads me beside still waters. He restores my soul.',
    reference: 'Psalm 23:1-3',
    category: 'Rest',
    reflection: 'Rest is not something you must earn; it is a gift graciously offered.',
    isFavorite: true,
  },
  {
    id: 'v-4',
    verse: 'Cast all your anxiety on him because he cares for you.',
    reference: '1 Peter 5:7',
    category: 'Comfort',
    reflection: 'Every whisper of worry in your heart is seen and deeply held.',
    isFavorite: false,
  },
  {
    id: 'v-5',
    verse: 'She is clothed with strength and dignity; she can laugh at the days to come.',
    reference: 'Proverbs 31:25',
    category: 'Family & Love',
    reflection: 'You bring so much gentle grace, laughter, and courage into our home.',
    isFavorite: true,
  },
  {
    id: 'v-6',
    verse: 'The steadfast love of the Lord never ceases; his mercies never come to an end; they are new every morning; great is your faithfulness.',
    reference: 'Lamentations 3:22-23',
    category: 'Gratitude',
    reflection: 'Today begins with a clean page and unreserved love.',
    isFavorite: false,
  },
  {
    id: 'v-7',
    verse: 'May the God of hope fill you with all joy and peace as you trust in him, so that you may overflow with hope by the power of the Holy Spirit.',
    reference: 'Romans 15:13',
    category: 'Peace',
    reflection: 'Let peace settle softly over you, like morning sunlight.',
    isFavorite: false,
  },
  {
    id: 'v-8',
    verse: 'Come to me, all you who are weary and burdened, and I will give you rest.',
    reference: 'Matthew 11:28',
    category: 'Rest',
    reflection: 'Lay down the mental to-do lists and rest your tired heart.',
    isFavorite: false,
  },
  {
    id: 'v-9',
    verse: 'And over all these virtues put on love, which binds them all together in perfect unity.',
    reference: 'Colossians 3:14',
    category: 'Family & Love',
    reflection: 'Love is the warmth that makes a house into a true hearth.',
    isFavorite: true,
  },
];

export const INITIAL_THOUGHTS: ThoughtEntry[] = [
  {
    id: 'th-1',
    date: 'This Morning',
    title: 'A quiet morning cup',
    content: 'The house was completely still before sunrise. Watched the light slowly turn the porch amber. Reminded myself that quiet faithfulness in small everyday chores is sacred work.',
    prompt: 'What brought a quiet sense of peace today?',
    tag: 'Gratitude',
    mood: 'Peaceful',
  },
  {
    id: 'th-2',
    date: 'Yesterday Afternoon',
    title: 'Laughter at the supper table',
    content: 'We laughed until our sides hurt over a story from school. I looked around at the faces I love so dearly and whispered a quiet thank you. These are the golden years.',
    prompt: 'A memory from today I want to hold on to...',
    tag: 'Family',
    mood: 'Grateful',
  },
];

export const INITIAL_RECIPES: RecipeItem[] = [
  {
    id: 'rec-1',
    title: 'Rustic Honey Butter Artisan Loaf',
    category: 'Baking & Sweets',
    prepTime: '20 min',
    cookTime: '35 min',
    servings: '1 warm golden loaf',
    description: 'Crispy crackling crust with a tender, airy crumb. Made with a drizzle of wildflower honey and flaky sea salt.',
    ingredients: [
      '3 1/4 cups unbleached bread flour',
      '2 tsp instant yeast',
      '1 1/2 tsp kosher salt',
      '1 1/2 cups warm filtered water (about 105°F)',
      '1 1/2 tbsp raw clover or wildflower honey',
      '2 tbsp softened salted butter',
      'Flaky sea salt for dusting top',
    ],
    instructions: [
      'Whisk flour, yeast, and salt together in a warm stoneware bowl.',
      'Stir warm water and honey together, then pour into flour. Mix with a wooden spoon until a shaggy dough forms.',
      'Cover with a damp linen towel and let rest at room temperature for 2 hours until puffed and bubbly.',
      'Preheat your Dutch oven inside oven to 450°F (230°C) for 30 minutes.',
      'Turn dough onto floured parchment, brush gently with honey-butter, and score with a sharp blade.',
      'Carefully transfer into hot Dutch oven with lid on for 25 minutes; remove lid for last 10 minutes until golden amber.',
    ],
    notes: 'Wonderful sliced thick while still slightly warm, smeared with salted cream butter and jam.',
    isFavorite: true,
  },
  {
    id: 'rec-2',
    title: 'Sunday Pot Roast with Glazed Carrots',
    category: 'Sunday Supper',
    prepTime: '25 min',
    cookTime: '3 hours',
    servings: '6 hearty servings',
    description: 'Melt-in-your-mouth slow-braised chuck roast with caramelized shallots, baby potatoes, and fresh garden herbs.',
    ingredients: [
      '3.5 lb beef chuck roast, well-marbled',
      '2 tbsp olive oil and 1 tbsp butter',
      '1 large yellow onion, sliced thick',
      '5 cloves garlic, smashed',
      '1.5 lbs small gold potatoes, halved',
      '1 bunch rainbow carrots, washed & sliced',
      '2 cups rich beef bone broth',
      '2 sprigs fresh rosemary & 4 sprigs fresh thyme',
      '2 tbsp Worcestershire sauce',
      'Coarse sea salt & freshly cracked black pepper',
    ],
    instructions: [
      'Pat the chuck roast completely dry and season generously on all sides with salt and coarse black pepper.',
      'In a heavy Dutch oven, sear in sizzling olive oil for 4–5 minutes per side until a deep mahogany crust forms.',
      'Remove meat, sauté onions and garlic until fragrant and lightly caramelized.',
      'Pour in broth and Worcestershire, scraping up all browned bits from bottom of pot.',
      'Return roast to pot, tuck potatoes, carrots, rosemary, and thyme around it.',
      'Cover tightly and slow braise in oven at 300°F (150°C) for 3 to 3.5 hours until fork-tender.',
    ],
    notes: 'Leftovers make heavenly French dip sandwiches with warm sourdough the next day!',
    isFavorite: true,
  },
  {
    id: 'rec-3',
    title: 'Lemon Herb Golden Chicken & Orzo',
    category: 'Family Dinner',
    prepTime: '15 min',
    cookTime: '25 min',
    servings: '4 servings',
    description: 'One-skillet cozy meal featuring tender herb chicken, toasted orzo, baby spinach, and bright fresh lemon.',
    ingredients: [
      '1.5 lbs chicken tenderloins or thighs',
      '1 1/4 cups dry orzo pasta',
      '2.5 cups chicken broth',
      'Juice and zest of 1 fresh lemon',
      '2 cups fresh baby spinach',
      '1/3 cup grated Parmesan cheese',
      '2 tbsp olive oil',
      '1 tsp dried oregano & 1/2 tsp garlic powder',
      'Salt and black pepper to taste',
    ],
    instructions: [
      'Season chicken with oregano, garlic powder, salt, and pepper.',
      'Heat olive oil in a wide skillet over medium-high; cook chicken 5-6 mins per side until golden. Set aside.',
      'In the same skillet, add dry orzo and toast for 2 minutes until lightly nutty.',
      'Pour in broth and lemon juice. Bring to a simmer, lower heat, cover, and cook for 9-10 minutes.',
      'Stir in baby spinach, lemon zest, and Parmesan until spinach is wilted and creamy.',
      'Nestle chicken back into the skillet to warm through and serve immediately.',
    ],
    notes: 'Quick enough for a busy weeknight, yet feels like dining at a cozy Mediterranean bistro.',
    isFavorite: false,
  },
  {
    id: 'rec-4',
    title: 'Warm Cinnamon Pecan Apple Crisp',
    category: 'Baking & Sweets',
    prepTime: '15 min',
    cookTime: '40 min',
    servings: '6-8 warm bowls',
    description: 'Honeycrisp apples baked with cinnamon and vanilla beneath a crunchy brown sugar, rolled oat, and buttery pecan topping.',
    ingredients: [
      '6 medium Honeycrisp or Granny Smith apples, peeled & sliced',
      '1 tbsp lemon juice',
      '1 tsp ground cinnamon',
      '1 cup old-fashioned rolled oats',
      '1/2 cup all-purpose flour',
      '1/2 cup packed dark brown sugar',
      '1/2 cup chopped pecans',
      '1/2 cup cold salted butter, cut into small cubes',
      '1 tsp pure vanilla extract',
      'Pinch of sea salt',
    ],
    instructions: [
      'Toss apple slices with lemon juice, 1/2 tsp cinnamon, and 1 tbsp brown sugar. Spread evenly into baking dish.',
      'In a bowl, combine oats, flour, remaining brown sugar, pecans, cinnamon, and salt.',
      'Cut in cold butter using fingers or pastry blender until pea-sized crumbles form. Drizzle with vanilla.',
      'Scatter the oat crumble generously over the sliced apples.',
      'Bake at 350°F (175°C) for 38-42 minutes until topping is toasted brown and apple juices bubble at edges.',
      'Serve warm topped with a scoop of vanilla bean ice cream.',
    ],
    notes: 'The whole house smells like fall and warmth while this is baking in the oven.',
    isFavorite: true,
  },
];
