import React, { useState } from 'react';
import { ScriptureVerse, UserRole } from '../types';
import { BookOpen, Heart, Copy, Check, ChevronRight, Plus, Search, Sparkles } from 'lucide-react';

interface ScriptureViewProps {
  verses: ScriptureVerse[];
  currentVerseIndex: number;
  onNextVerse: () => void;
  onToggleFavoriteVerse: (id: string) => void;
  onAddVerse: (verse: Omit<ScriptureVerse, 'id'>) => void;
  currentRole?: UserRole;
}

export const ScriptureView: React.FC<ScriptureViewProps> = ({
  verses,
  currentVerseIndex,
  onNextVerse,
  onToggleFavoriteVerse,
  onAddVerse,
  currentRole = 'owner',
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New verse form state
  const [newText, setNewText] = useState('');
  const [newRef, setNewRef] = useState('');
  const [newCategory, setNewCategory] = useState<ScriptureVerse['category']>('Peace');
  const [newReflection, setNewReflection] = useState('');

  const currentVerse = verses[currentVerseIndex % verses.length] || verses[0];

  const handleCopy = (verse: ScriptureVerse) => {
    const textToCopy = `“${verse.verse}” — ${verse.reference}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(verse.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim() || !newRef.trim()) return;

    onAddVerse({
      verse: newText.trim(),
      reference: newRef.trim(),
      category: newCategory,
      reflection: newReflection.trim() || undefined,
      isFavorite: true,
    });

    setNewText('');
    setNewRef('');
    setNewReflection('');
    setShowAddModal(false);
  };

  const categories = ['All', 'Favorites', 'Peace', 'Strength', 'Comfort', 'Family & Love', 'Rest', 'Gratitude'];

  const filteredVerses = verses.filter((v) => {
    const matchesCategory =
      selectedCategory === 'All'
        ? true
        : selectedCategory === 'Favorites'
        ? v.isFavorite
        : v.category === selectedCategory;

    const matchesSearch =
      v.verse.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.reflection && v.reflection.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-10 py-2 sm:py-6">
      
      {/* Header with Title and Unboxed Metadata */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#E8DFD3]">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-[#8F7F72]">
            <span>{verses.length} Steadying Verses</span>
            <span aria-hidden="true">·</span>
            <span>Living Truth for Every Day</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#2D231C]">
            Scripture
          </h1>
          <p className="text-xs sm:text-sm text-[#736558] font-prose-serif">
            Words to quiet worry, restore strength, and remind you of enduring love.
          </p>
        </div>

        {currentRole === 'owner' ? (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-[#B84A2A] rounded-lg hover:bg-[#A33F23] transition-colors shadow-xs whitespace-nowrap self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add a Verse</span>
          </button>
        ) : (
          <span className="px-3 py-1.5 rounded-full bg-white border border-[#E8DFD3] text-[11px] font-medium text-[#736558] self-start sm:self-auto">
            Guest View · Read-Only
          </span>
        )}
      </div>

      {/* Featured Large Contemplation Card */}
      {currentVerse && (
        <section className="bg-white border border-[#E4D7C8] rounded-3xl p-8 sm:p-12 shadow-sm relative overflow-hidden text-center space-y-6">
          <div className="flex items-center justify-center gap-2 text-xs text-[#8F7F72]">
            <span className="text-[#B84A2A] font-medium">{currentVerse.category}</span>
            <span aria-hidden="true">·</span>
            <span>Focus for this moment</span>
          </div>

          <blockquote className="font-serif text-2xl sm:text-4xl text-[#2B211A] leading-relaxed max-w-3xl mx-auto italic font-normal">
            “{currentVerse.verse}”
          </blockquote>

          <div className="space-y-2">
            <cite className="not-italic font-serif text-base sm:text-lg font-semibold text-[#665649] tracking-wider block">
              — {currentVerse.reference}
            </cite>
            {currentVerse.reflection && (
              <p className="text-xs sm:text-sm text-[#827163] max-w-xl mx-auto font-prose-serif leading-relaxed italic">
                {currentVerse.reflection}
              </p>
            )}
          </div>

          <div className="flex items-center justify-center gap-3 pt-4">
            <button
              onClick={onNextVerse}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-medium text-white bg-[#B84A2A] rounded-xl hover:bg-[#A33F23] transition-colors shadow-xs"
            >
              <span>Another verse</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => handleCopy(currentVerse)}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium text-[#4A3E34] bg-[#FAF7F2] border border-[#E8DFD3] rounded-xl hover:bg-[#F3ECE2] transition-colors"
            >
              {copiedId === currentVerse.id ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#059669]" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>

            <button
              onClick={() => onToggleFavoriteVerse(currentVerse.id)}
              className={`p-2.5 border rounded-xl transition-colors ${
                currentVerse.isFavorite
                  ? 'bg-[#FBECE6] text-[#B84A2A] border-[#F2C8B5]'
                  : 'bg-[#FAF7F2] text-[#695C51] border-[#E8DFD3] hover:text-[#2D231C]'
              }`}
              title={currentVerse.isFavorite ? 'Bookmarked' : 'Bookmark verse'}
            >
              <Heart className={`w-4 h-4 ${currentVerse.isFavorite ? 'fill-current' : ''}`} />
            </button>
          </div>
        </section>
      )}

      {/* Filter and Search Controls */}
      <div className="space-y-4 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-[#2D231C] text-white shadow-xs'
                    : 'bg-white text-[#6E5F53] border border-[#E8DFD3] hover:border-[#C4B29E]'
                }`}
              >
                {cat === 'Favorites' ? '★ Favorites' : cat}
              </button>
            ))}
          </div>

          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-[#9E9084]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search verse or topic..."
              className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-[#E8DFD3] rounded-lg text-[#2D231C] placeholder:text-[#A09386] focus:outline-none focus:ring-2 focus:ring-[#B84A2A]"
            />
          </div>
        </div>

        {/* Verses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredVerses.map((verse) => (
            <div
              key={verse.id}
              className="bg-white border border-[#E8DFD3] rounded-2xl p-5 hover:border-[#C4B29E] transition-all shadow-xs flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs text-[#8F7F72]">
                  <span className="font-medium text-[#B84A2A]">{verse.category}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleCopy(verse)}
                      className="p-1 text-[#8F7F72] hover:text-[#2D231C] rounded transition-colors"
                      title="Copy verse"
                    >
                      {copiedId === verse.id ? (
                        <Check className="w-3.5 h-3.5 text-[#059669]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => onToggleFavoriteVerse(verse.id)}
                      className="p-1 text-[#8F7F72] hover:text-[#B84A2A] transition-colors"
                      title="Bookmark"
                    >
                      <Heart className={`w-3.5 h-3.5 ${verse.isFavorite ? 'fill-current text-[#B84A2A]' : ''}`} />
                    </button>
                  </div>
                </div>

                <p className="font-serif text-base text-[#2D231C] leading-relaxed italic">
                  “{verse.verse}”
                </p>

                <div className="text-xs font-semibold text-[#665649] font-serif">
                  — {verse.reference}
                </div>

                {verse.reflection && (
                  <p className="text-xs text-[#7F6E60] font-prose-serif pt-1 border-t border-[#F5ECE1] italic">
                    {verse.reflection}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Custom Verse Modal */}
      {showAddModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-[#E8DFD3]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#F0E6D9]">
              <h2 className="font-serif text-xl font-semibold text-[#2D231C]">
                Add a Beloved Verse
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-xs text-[#8F7F72] hover:text-[#2D231C]"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#736558] mb-1">
                  Verse Text
                </label>
                <textarea
                  rows={3}
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  placeholder="e.g. For I know the plans I have for you..."
                  className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E0D5C7] rounded-xl text-[#2D231C] focus:outline-none focus:ring-2 focus:ring-[#B84A2A]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#736558] mb-1">
                    Book & Reference
                  </label>
                  <input
                    type="text"
                    value={newRef}
                    onChange={(e) => setNewRef(e.target.value)}
                    placeholder="e.g. Jeremiah 29:11"
                    className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E0D5C7] rounded-lg text-[#2D231C] focus:outline-none focus:ring-2 focus:ring-[#B84A2A]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#736558] mb-1">
                    Theme
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as ScriptureVerse['category'])}
                    className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E0D5C7] rounded-lg text-[#2D231C] focus:outline-none focus:ring-2 focus:ring-[#B84A2A]"
                  >
                    <option value="Peace">Peace</option>
                    <option value="Strength">Strength</option>
                    <option value="Comfort">Comfort</option>
                    <option value="Family & Love">Family & Love</option>
                    <option value="Rest">Rest</option>
                    <option value="Gratitude">Gratitude</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#736558] mb-1">
                  Personal Reflection / Why it means so much to you (Optional)
                </label>
                <input
                  type="text"
                  value={newReflection}
                  onChange={(e) => setNewReflection(e.target.value)}
                  placeholder="e.g. What Mom whispered to me whenever I was afraid..."
                  className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E0D5C7] rounded-lg text-[#2D231C] focus:outline-none focus:ring-2 focus:ring-[#B84A2A]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs text-[#736558] hover:text-[#2D231C]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-medium text-white bg-[#B84A2A] rounded-lg hover:bg-[#A33F23] transition-colors shadow-xs"
                >
                  Save Verse
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
