import React, { useState, useRef } from 'react';
import { ThoughtEntry } from '../types';
import {
  Feather,
  Trash2,
  Search,
  Sparkles,
  BookHeart,
  Clock,
  Copy,
  Check,
  Image as ImageIcon,
  X,
  Smile,
  Heart,
  Moon,
  Sunrise,
  HeartHandshake,
  Coffee,
  Filter,
} from 'lucide-react';

export interface MoodDef {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
  border: string;
  description: string;
}

export const MOOD_OPTIONS: MoodDef[] = [
  {
    id: 'happy',
    label: 'Happy',
    icon: Smile,
    color: 'text-[#D97706]',
    bg: 'bg-[#FEF3C7]',
    border: 'border-[#FDE68A]',
    description: 'Joyful, bright, and cheerful spirits',
  },
  {
    id: 'reflective',
    label: 'Reflective',
    icon: Moon,
    color: 'text-[#4F46E5]',
    bg: 'bg-[#EEF2FF]',
    border: 'border-[#E0E7FF]',
    description: 'Contemplative, thoughtful stillness',
  },
  {
    id: 'grateful',
    label: 'Grateful',
    icon: Heart,
    color: 'text-[#DC2626]',
    bg: 'bg-[#FEE2E2]',
    border: 'border-[#FECACA]',
    description: 'Thankful for blessings, tender appreciation',
  },
  {
    id: 'peaceful',
    label: 'Peaceful',
    icon: Feather,
    color: 'text-[#059669]',
    bg: 'bg-[#ECFDF5]',
    border: 'border-[#D1FAE5]',
    description: 'Calm, rested heart, unhurried peace',
  },
  {
    id: 'hopeful',
    label: 'Hopeful',
    icon: Sunrise,
    color: 'text-[#EA580C]',
    bg: 'bg-[#FFEDD5]',
    border: 'border-[#FED7AA]',
    description: 'Looking ahead with faith and encouragement',
  },
  {
    id: 'tender',
    label: 'Tender',
    icon: HeartHandshake,
    color: 'text-[#BE185D]',
    bg: 'bg-[#FCE7F3]',
    border: 'border-[#FBCFE8]',
    description: 'Warm loving moments with family & dear ones',
  },
  {
    id: 'restful',
    label: 'Restful',
    icon: Coffee,
    color: 'text-[#854D0E]',
    bg: 'bg-[#FEF9C3]',
    border: 'border-[#FEF08A]',
    description: 'Quiet pause, gentle cozy rest',
  },
];

export const getMoodDef = (moodLabel?: string): MoodDef => {
  if (!moodLabel) return MOOD_OPTIONS[2]; // Default to Grateful
  const found = MOOD_OPTIONS.find(
    (m) => m.label.toLowerCase() === moodLabel.toLowerCase() || m.id === moodLabel.toLowerCase()
  );
  return found || MOOD_OPTIONS[2];
};

interface ThoughtsViewProps {
  thoughts: ThoughtEntry[];
  onAddThought: (entry: Omit<ThoughtEntry, 'id'>) => void;
  onDeleteThought: (id: string) => void;
}

export const ThoughtsView: React.FC<ThoughtsViewProps> = ({
  thoughts,
  onAddThought,
  onDeleteThought,
}) => {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [activePrompt, setActivePrompt] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('Personal Experience');
  const [mood, setMood] = useState<string>('Grateful');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMoodFilter, setSelectedMoodFilter] = useState<string>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const prompts = [
    'What brought a quiet sense of peace today?',
    'A personal experience from today I want to remember...',
    'A tender moment of laughter with family or friends...',
    'A small, unnoticed blessing right in front of me...',
    'A prayer or hope resting on my heart tonight...',
  ];

  const tags = ['Personal Experience', 'Gratitude', 'Family', 'Peace', 'Memory', 'Reflections'];

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setPhotoUrl(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    onAddThought({
      title: title.trim() || undefined,
      content: content.trim(),
      prompt: activePrompt || undefined,
      tag: selectedTag,
      mood,
      photoUrl: photoUrl || undefined,
      date: new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      }).format(new Date()),
    });

    setContent('');
    setTitle('');
    setActivePrompt('');
    setPhotoUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredThoughts = thoughts.filter((t) => {
    const matchSearch =
      t.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.title && t.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.tag && t.tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.mood && t.mood.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchMood =
      selectedMoodFilter === 'All' ||
      (t.mood && t.mood.toLowerCase() === selectedMoodFilter.toLowerCase());

    return matchSearch && matchMood;
  });

  const activeMoodObj = getMoodDef(mood);

  return (
    <div className="max-w-4xl mx-auto space-y-10 py-2 sm:py-6">
      
      {/* Header with Title and Unboxed Metadata */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#E8DFD3]">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-[#8F7F72]">
            <span>{thoughts.length} Recorded Experiences & Thoughts</span>
            <span aria-hidden="true">·</span>
            <span>Private & Kept on This Device</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#2D231C]">
            Thoughts & Personal Experiences
          </h1>
          <p className="text-xs sm:text-sm text-[#736558] font-prose-serif">
            Select your mood, record personal milestones, quiet reflections, and attach photos to preserve special days.
          </p>
        </div>
      </div>

      {/* Thought & Experience Composition Pane */}
      <section className="bg-white border border-[#E8DFD3] rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
        
        {/* Gentle Prompt Selector */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-[#8F7F72]">
            <span className="font-medium flex items-center gap-1.5 text-[#B84A2A]">
              <Sparkles className="w-3.5 h-3.5" />
              Inspiration & Reflective Prompts
            </span>
            {activePrompt && (
              <button
                onClick={() => setActivePrompt('')}
                className="text-xs text-[#8F7F72] hover:text-[#2D231C]"
              >
                Clear prompt
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {prompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => setActivePrompt(prompt)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-all text-left ${
                  activePrompt === prompt
                    ? 'bg-[#FBECE6] text-[#B84A2A] border-[#F2C8B5] font-medium'
                    : 'bg-[#FAF7F2] text-[#635548] border-[#E8DFD3] hover:border-[#D1C2AF]'
                }`}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Prompt Banner if active */}
        {activePrompt && (
          <div className="p-3 bg-[#FAF7F2] border-l-2 border-[#B84A2A] rounded-r-xl text-xs text-[#6C5E53] italic font-prose-serif">
            Prompt: “{activePrompt}”
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title for this experience or reflection (e.g. A walk in the woods with kids)..."
              className="w-full px-3.5 py-2 text-sm bg-transparent border-b border-[#E8DFD3] focus:border-[#B84A2A] focus:outline-none text-[#2D231C] placeholder:text-[#A09386]"
            />
          </div>

          <div>
            <textarea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What happened today? What is resting in your heart?"
              className="w-full p-3.5 text-sm bg-[#FAF7F2] border border-[#E4D7C8] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#B84A2A] text-[#2D231C] placeholder:text-[#A09386] font-prose-serif leading-relaxed"
              required
            />
          </div>

          {/* Dedicated Mood Entry Feature */}
          <div className="space-y-2.5 p-4 bg-[#FAF7F2] rounded-2xl border border-[#E8DFD3]">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#736558] flex items-center gap-1.5">
                <Smile className="w-4 h-4 text-[#B84A2A]" />
                <span>Select Your Mood for Today</span>
              </label>
              <div className="flex items-center gap-1.5 text-xs text-[#736558]">
                <span>Feeling:</span>
                <span className="font-semibold text-[#2D231C] flex items-center gap-1">
                  <activeMoodObj.icon className={`w-3.5 h-3.5 ${activeMoodObj.color}`} />
                  {activeMoodObj.label}
                </span>
              </div>
            </div>

            {/* Interactive Mood Icon Selector Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
              {MOOD_OPTIONS.map((m) => {
                const Icon = m.icon;
                const isSelected = mood.toLowerCase() === m.label.toLowerCase();
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMood(m.label)}
                    title={m.description}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${
                      isSelected
                        ? `${m.bg} ${m.border} ring-2 ring-[#B84A2A]/40 shadow-xs scale-[1.02]`
                        : 'bg-white border-[#E8DFD3] hover:border-[#D1C4B5] text-[#55473C]'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mb-1 ${isSelected ? m.color : 'text-[#8F7F72]'}`} />
                    <span
                      className={`text-[11px] leading-tight ${
                        isSelected ? 'text-[#2D231C] font-semibold' : 'text-[#6C5E53]'
                      }`}
                    >
                      {m.label}
                    </span>
                  </button>
                );
              })}
            </div>

            <p className="text-[11px] text-[#8F7F72] italic pt-0.5">
              {activeMoodObj.description}
            </p>
          </div>

          {/* Photo attachment preview if uploaded */}
          {photoUrl && (
            <div className="relative inline-block border border-[#E8DFD3] rounded-xl overflow-hidden shadow-xs">
              <img src={photoUrl} alt="Attached memory" className="h-32 w-auto object-cover" />
              <button
                type="button"
                onClick={() => setPhotoUrl(null)}
                className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full hover:bg-black/80 transition-colors"
                title="Remove photo"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Tag & Photo Controls and Submit */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
            <div className="flex items-center gap-3 flex-wrap">
              {/* Photo Upload trigger */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoUpload}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#55473C] bg-[#FAF7F2] border border-[#E8DFD3] rounded-lg hover:border-[#B84A2A] hover:text-[#B84A2A] transition-colors"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>{photoUrl ? 'Change Photo' : 'Attach Photo'}</span>
              </button>

              {/* Tag selector */}
              <div className="flex items-center gap-1 text-xs text-[#736558]">
                <span>Tag:</span>
                <select
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value)}
                  className="px-2 py-1 text-xs bg-[#FAF7F2] border border-[#E8DFD3] rounded-lg text-[#2D231C]"
                >
                  {tags.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-medium text-white bg-[#B84A2A] rounded-xl hover:bg-[#A33F23] transition-colors shadow-xs flex items-center justify-center gap-2 self-end sm:self-auto"
            >
              <Feather className="w-3.5 h-3.5" />
              <span>Save Experience</span>
            </button>
          </div>
        </form>
      </section>

      {/* Past Thoughts & Experiences Collection */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
          <div className="space-y-1">
            <h2 className="font-serif text-xl font-semibold text-[#2D231C] flex items-center gap-2">
              <BookHeart className="w-4 h-4 text-[#B84A2A]" />
              Your Kept Moments & Reflections
            </h2>
          </div>

          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-[#9E9084]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search experiences..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-[#E8DFD3] rounded-lg text-[#2D231C] placeholder:text-[#A09386] focus:outline-none focus:ring-2 focus:ring-[#B84A2A]"
            />
          </div>
        </div>

        {/* Filter by Mood Strip */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs text-[#8F7F72] flex items-center gap-1 pr-1">
            <Filter className="w-3 h-3" />
            <span>Mood:</span>
          </span>
          <button
            onClick={() => setSelectedMoodFilter('All')}
            className={`px-2.5 py-1 text-xs rounded-lg whitespace-nowrap transition-colors ${
              selectedMoodFilter === 'All'
                ? 'bg-[#B84A2A] text-white font-medium'
                : 'bg-white text-[#736558] border border-[#E8DFD3] hover:text-[#2D231C]'
            }`}
          >
            All Moods
          </button>
          {MOOD_OPTIONS.map((m) => {
            const Icon = m.icon;
            const isFilterActive = selectedMoodFilter.toLowerCase() === m.label.toLowerCase();
            return (
              <button
                key={m.id}
                onClick={() => setSelectedMoodFilter(m.label)}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg whitespace-nowrap border transition-colors ${
                  isFilterActive
                    ? `${m.bg} ${m.border} font-semibold text-[#2D231C]`
                    : 'bg-white border-[#E8DFD3] text-[#736558] hover:text-[#2D231C]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${m.color}`} />
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>

        {filteredThoughts.length === 0 ? (
          <div className="bg-white border border-[#E8DFD3] rounded-2xl p-10 text-center space-y-2">
            <h3 className="font-serif text-base font-medium text-[#2D231C]">
              No thoughts or experiences found for this filter
            </h3>
            <p className="text-xs text-[#736558] max-w-sm mx-auto">
              Try switching your mood filter or search term, or record a new moment above.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredThoughts.map((entry) => {
              const entryMood = getMoodDef(entry.mood);
              const MoodIcon = entryMood.icon;

              return (
                <div
                  key={entry.id}
                  className="group bg-white border border-[#E8DFD3] rounded-2xl p-5 sm:p-6 hover:border-[#C4B29E] transition-all shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between text-xs text-[#8F7F72]">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Mood Badge with Icon */}
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-medium ${entryMood.bg} ${entryMood.border} text-[#2D231C]`}
                      >
                        <MoodIcon className={`w-3.5 h-3.5 ${entryMood.color}`} />
                        <span>{entryMood.label}</span>
                      </span>

                      <span aria-hidden="true">·</span>
                      <span className="font-medium text-[#736558]">{entry.tag || 'Experience'}</span>

                      <span aria-hidden="true">·</span>
                      <span className="flex items-center gap-1 text-[#8F7F72]">
                        <Clock className="w-3 h-3 text-[#A8988A]" />
                        {entry.date}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleCopy(entry.id, entry.content)}
                        className="p-1 text-[#8F7F72] hover:text-[#2D231C] transition-colors"
                        title="Copy text"
                      >
                        {copiedId === entry.id ? (
                          <Check className="w-3.5 h-3.5 text-[#059669]" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => onDeleteThought(entry.id)}
                        className="p-1 text-[#8F7F72] hover:text-[#DC2626] transition-colors"
                        title="Delete experience"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {entry.title && (
                    <h3 className="font-serif text-lg font-semibold text-[#2D231C]">
                      {entry.title}
                    </h3>
                  )}

                  {entry.prompt && (
                    <div className="text-[11px] text-[#8C7A6D] italic">
                      Prompt: “{entry.prompt}”
                    </div>
                  )}

                  <p className="text-sm text-[#3E332A] font-prose-serif leading-relaxed whitespace-pre-wrap">
                    {entry.content}
                  </p>

                  {/* Display attached photo */}
                  {entry.photoUrl && (
                    <div className="pt-2">
                      <img
                        src={entry.photoUrl}
                        alt={entry.title || 'Attached photo'}
                        className="max-h-72 w-auto rounded-xl border border-[#E8DFD3] object-cover"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

    </div>
  );
};
