import React, { useState } from 'react';
import { ThoughtEntry, UserRole } from '../types';
import {
  Feather,
  Plus,
  Trash2,
  Sparkles,
  Heart,
  Smile,
  Calendar,
  Tag,
  X,
} from 'lucide-react';

interface ThoughtsViewProps {
  thoughts: ThoughtEntry[];
  onAddThought: (thought: Omit<ThoughtEntry, 'id'>) => void;
  onDeleteThought: (id: string) => void;
  currentRole?: UserRole;
}

export const ThoughtsView: React.FC<ThoughtsViewProps> = ({
  thoughts,
  onAddThought,
  onDeleteThought,
  currentRole = 'owner',
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [prompt, setPrompt] = useState('');
  const [mood, setMood] = useState('Peaceful');
  const [tag, setTag] = useState('Gratitude');

  const prompts = [
    'What brought a quiet sense of peace today?',
    'A memory from today I want to hold on to...',
    'A kind word spoken over our family recently...',
    'What I am learning to trust through this season...',
  ];

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    onAddThought({
      date: new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date()),
      title: title.trim() || undefined,
      content: content.trim(),
      prompt: prompt || undefined,
      mood,
      tag,
      createdAt: new Date().toISOString(),
    });

    setTitle('');
    setContent('');
    setPrompt('');
    setShowAddModal(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-2 sm:py-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#E8DFD3]">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-[#8F7F72]">
            <span>{thoughts.length} Preserved Memories</span>
            <span aria-hidden="true">·</span>
            <span>Quiet Reflection</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#2D231C]">
            Thoughts & Experiences
          </h1>
          <p className="text-xs sm:text-sm text-[#736558] font-prose-serif">
            A tender, private journal for quiet reflections, answered prayers, and family memories.
          </p>
        </div>

        {currentRole === 'owner' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#B84A2A] text-white text-xs font-medium rounded-xl hover:bg-[#A33F23] transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Write Entry</span>
          </button>
        )}
      </div>

      {/* Thought Entries List */}
      <div className="space-y-4">
        {thoughts.map((item) => (
          <article
            key={item.id}
            className="bg-white border border-[#E8DFD3] rounded-3xl p-6 sm:p-7 shadow-xs space-y-3 hover:border-[#C4B29E] transition-all"
          >
            <div className="flex items-center justify-between text-xs text-[#8F7F72]">
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-[#B84A2A]" />
                <span className="font-medium">{item.date}</span>
                {item.mood && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="text-[#6D5D51] font-medium">{item.mood}</span>
                  </>
                )}
              </div>

              {currentRole === 'owner' && (
                <button
                  type="button"
                  onClick={() => onDeleteThought(item.id)}
                  className="text-[#C4B5A5] hover:text-[#DC2626] transition-colors p-1"
                  title="Delete reflection"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {item.title && (
              <h3 className="font-serif text-xl font-semibold text-[#2D231C]">
                {item.title}
              </h3>
            )}

            {item.prompt && (
              <p className="text-xs text-[#8F7F72] italic font-serif border-l-2 border-[#D9C8B5] pl-3 py-0.5">
                “{item.prompt}”
              </p>
            )}

            <p className="text-sm text-[#4A3C31] leading-relaxed font-prose-serif whitespace-pre-line">
              {item.content}
            </p>

            {item.tag && (
              <div className="pt-2 flex items-center gap-1.5">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-[#FAF7F2] text-[#736558] border border-[#EFE5D8]">
                  #{item.tag}
                </span>
              </div>
            )}
          </article>
        ))}
      </div>

      {/* Add Thought Modal */}
      {showAddModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-[#E8DFD3]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#F0E6D9]">
              <h2 className="font-serif text-xl font-semibold text-[#2D231C]">
                New Thought & Reflection
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
                  Title (Optional)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Quiet evening after supper"
                  className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E0D5C7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B84A2A]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#736558] mb-1">
                  Gentle Prompt Idea (Optional)
                </label>
                <select
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E0D5C7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B84A2A]"
                >
                  <option value="">No prompt (Freeform reflection)</option>
                  {prompts.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#736558] mb-1">
                  Reflection Content
                </label>
                <textarea
                  rows={5}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your heart out in quiet peace..."
                  className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E0D5C7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B84A2A]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#736558] mb-1">
                    Mood
                  </label>
                  <select
                    value={mood}
                    onChange={(e) => setMood(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E0D5C7] rounded-lg"
                  >
                    <option value="Peaceful">Peaceful</option>
                    <option value="Grateful">Grateful</option>
                    <option value="Reflective">Reflective</option>
                    <option value="Hopeful">Hopeful</option>
                    <option value="Tender">Tender</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#736558] mb-1">
                    Tag
                  </label>
                  <select
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E0D5C7] rounded-lg"
                  >
                    <option value="Gratitude">Gratitude</option>
                    <option value="Family">Family</option>
                    <option value="Prayer">Prayer</option>
                    <option value="Devotion">Devotion</option>
                    <option value="Memories">Memories</option>
                  </select>
                </div>
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
                  className="px-5 py-2 bg-[#B84A2A] text-white text-xs font-medium rounded-xl hover:bg-[#A33F23] transition-colors shadow-xs"
                >
                  Save Reflection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
