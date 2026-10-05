import {
  GalleryPhoto,
  CuratedSharedAlbum,
  ScriptureVerse,
  ThoughtEntry,
  RecipeItem,
  UserProfile,
} from '../types';

export const createWarmSvgPhoto = (
  title: string,
  subtitle: string,
  gradientStops: string,
  type: 'hearth' | 'field' | 'kitchen' | 'tea'
): string => {
  const icons: Record<string, string> = {
    hearth: '<path d="M150,380 Q300,100 450,380 Q375,370 300,320 Q225,370 150,380 Z" fill="#E87C48" opacity="0.35"/>',
    field: '<path d="M0,350 Q150,280 300,330 T600,310 L600,450 L0,450 Z" fill="#88B04B" opacity="0.25"/>',
    kitchen: '<circle cx="300" cy="240" r="90" fill="#E0A96D" opacity="0.25"/>',
    tea: '<path d="M220,240 C220,180 380,180 380,240 C380,310 220,310 220,240 Z" fill="#C38D9E" opacity="0.25"/>',
  };

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="100%" height="100%">
    <defs>
      <linearGradient id="warmGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        ${gradientStops}
      </linearGradient>
    </defs>
    <rect width="600" height="450" fill="url(#warmGrad)"/>
    ${icons[type] || ''}
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
    caption: 'Watching the quiet mist rise before the world gets loud.',
    tags: ['Quiet', 'Peace'],
    isFavorite: false,
  },
];

export const INITIAL_SHARED_ALBUMS: CuratedSharedAlbum[] = [
  {
    id: 'album-1',
    title: "Adriana's Family Cookouts & Birthdays",
    provider: 'Google Photos',
    albumUrl: 'https://photos.app.goo.gl/adriana-family-cookouts',
    coverImageUrl: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=800&q=80',
    photoCount: 42,
    date: 'Summer Traditions',
    caption: 'Summer barbecues, picnic blankets on the grass, laughter with the kids.',
    tags: ['Family', 'Cookouts', 'Celebrations'],
    isFavorite: true,
  },
  {
    id: 'album-2',
    title: 'Autumn Mountain Hikes & Golden Aspen Trails',
    provider: 'Google Photos',
    albumUrl: 'https://photos.app.goo.gl/adriana-mountain-hikes',
    coverImageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    photoCount: 28,
    date: 'Autumn',
    caption: 'Crisp crisp mornings hiking through Colorado aspen groves turned brilliant gold.',
    tags: ['Nature', 'Hikes', 'Outdoors'],
    isFavorite: true,
  },
  {
    id: 'album-3',
    title: 'Grandkids Backyard Adventures & Treehouse Days',
    provider: 'Apple iCloud',
    albumUrl: 'https://shared.icloud.com/icu/092backyard-grandkids-adventures',
    coverImageUrl: 'https://images.unsplash.com/photo-1472162072942-cd5147eb3902?auto=format&fit=crop&w=800&q=80',
    photoCount: 65,
    date: 'Spring & Summer',
    caption: 'Every tender smile, first steps, and messy ice cream cones worth holding onto forever.',
    tags: ['Grandkids', 'Memories', 'Milestones'],
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
      'Flaky Maldon sea salt for the crust',
    ],
    instructions: [
      'Whisk dry ingredients in a wide earthenware bowl.',
      'Stir in warm water and honey until a shaggy dough forms.',
      'Cover with a damp linen cloth and let rest in a warm spot for 12 to 18 hours.',
      'Preheat Dutch oven to 450°F. Shape dough into a round loaf on parchment paper.',
      'Bake covered for 30 minutes, then uncover for 10 minutes until deeply golden brown.',
    ],
    memoryNote: 'Always served hot right out of the cast iron with salted butter while everyone gathers.',
    isFavorite: true,
  },
  {
    id: 'rec-2',
    title: 'Grandma’s Sunday Braised Roast',
    category: 'Family Dinners',
    prepTime: '25 min',
    cookTime: '3.5 hours',
    servings: '6 hearty servings',
    description: 'Fork-tender chuck roast slow braised in red wine, rosemary, baby carrots, and sweet butter onions.',
    ingredients: [
      '3.5 lb chuck roast, trimmed and tied',
      '4 medium yellow onions, thick wedges',
      '1 lb whole baby Dutch carrots, peeled',
      '4 cloves garlic, smashed',
      '2 cups rich beef bone broth',
      'Fresh rosemary, thyme sprigs, and bay leaves',
    ],
    instructions: [
      'Generously salt and pepper the roast on all sides.',
      'Sear in hot olive oil until deep mahogany brown crust forms on every side.',
      'Surround with onions, garlic, carrots, and herbs. Pour over broth.',
      'Tightly cover with heavy lid and transfer to 300°F oven for 3.5 hours.',
    ],
    memoryNote: 'The kitchen smells like pure safety and comfort all Sunday afternoon.',
    isFavorite: true,
  },
];

export const DEFAULT_USER_PROFILE: UserProfile = {
  name: 'Adriana',
  sanctuaryFocus: 'Warmth, devotion, and family traditions',
  favoriteFlower: 'wild-rose',
  fontLayout: 'serif',
  wallpaperTheme: 'linen',
  accentColor: '#B84A2A',
  dailyLayout: 'standard',
  reminderSoundEnabled: true,
  sportsTeams: ['Denver Broncos', 'Colorado Avalanche', 'Colorado Rockies'],
  favoriteMusic: [
    {
      id: 'fm-1',
      title: 'Hearthside Ember Warmth',
      artist: 'Adriana & Family',
      url: 'https://open.spotify.com',
    },
    {
      id: 'fm-2',
      title: 'Peace Like a River',
      artist: 'Hearth Devotionals',
      url: 'https://open.spotify.com',
    },
  ],
};
