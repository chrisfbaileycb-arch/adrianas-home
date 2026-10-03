// Curated, royalty-free starter library members can add to their space.
// These are free-to-use sample tracks — a placeholder shelf the owner can
// later replace with their own original compositions.
export interface LibraryTrack {
  id: string;
  title: string;
  artist: string;
  mood: string;
  url: string;
  description: string;
}

export const MUSIC_LIBRARY: LibraryTrack[] = [
  {
    id: 'lib-1',
    title: 'Hearthlight',
    artist: 'Hearth Sounds',
    mood: 'Warm & Calm',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    description: 'A gentle, glowing instrumental for quiet evenings at home.',
  },
  {
    id: 'lib-2',
    title: 'Morning Linen',
    artist: 'Hearth Sounds',
    mood: 'Bright & Hopeful',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    description: 'Soft light and slow mornings — a hopeful, unhurried start.',
  },
  {
    id: 'lib-3',
    title: 'Sage Garden',
    artist: 'Hearth Sounds',
    mood: 'Peaceful',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    description: 'Breezy and grounding, like a walk through a herb garden.',
  },
  {
    id: 'lib-4',
    title: 'Family Table',
    artist: 'Hearth Sounds',
    mood: 'Joyful',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    description: 'A lively, gathering-together tune for shared meals.',
  },
  {
    id: 'lib-5',
    title: 'Evening Hymn',
    artist: 'Hearth Sounds',
    mood: 'Reflective',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    description: 'A reverent, reflective piece for the close of day.',
  },
  {
    id: 'lib-6',
    title: 'Mile High Sunday',
    artist: 'Hearth Sounds',
    mood: 'Uplifting',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
    description: 'Big-sky optimism and easy momentum for the weekend.',
  },
  {
    id: 'lib-7',
    title: 'Keepsake',
    artist: 'Hearth Sounds',
    mood: 'Nostalgic',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
    description: 'A tender, memory-keeping melody for cherished moments.',
  },
  {
    id: 'lib-8',
    title: 'Lo-Fi Nest',
    artist: 'Hearth Sounds',
    mood: 'Cozy Focus',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
    description: 'Mellow, cozy beats for reading, writing, or winding down.',
  },
];
