import React, { useState } from 'react';
import { PlanItem } from '../types';
import {
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Clock,
  BellRing,
  Check,
  X,
  Filter,
} from 'lucide-react';

interface PlanViewProps {
  plans: PlanItem[];
  onAddPlan: (plan: Omit<PlanItem, 'id' | 'createdAt'>) => void;
  onTogglePlan: (id: string) => void;
  onUpdatePlan?: (id: string, updates: Partial<PlanItem>) => void;
  onDeletePlan: (id: string) => void;
  onClearCompleted: () => void;
  onRequestNotificationPermission?: () => void;
  notificationPermission?: NotificationPermission | 'unsupported';
}

export const PlanView: React.FC<PlanViewProps> = ({
  plans,
  onAddPlan,
  onTogglePlan,
  onDeletePlan,
  onClearCompleted,
  onRequestNotificationPermission,
  notificationPermission,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<PlanItem['category']>('Home');
  const [time, setTime] = useState('');
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('');
  const [notes, setNotes] = useState('');

  const categories = ['All', 'Home', 'Family', 'Devotion', 'Errand', 'Health', 'Quiet'];

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddPlan({
      title: title.trim(),
      category,
      completed: false,
      time: time || undefined,
      reminderEnabled,
      reminderTime: reminderEnabled ? reminderTime : undefined,
      notes: notes.trim() || undefined,
    });

    setTitle('');
    setTime('');
    setReminderEnabled(false);
    setReminderTime('');
    setNotes('');
    setShowAddModal(false);
  };

  const filteredPlans = plans.filter((p) => {
    if (selectedCategory === 'All') return true;
    return p.category === selectedCategory;
  });

  const completedCount = plans.filter((p) => p.completed).length;

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-2 sm:py-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#E8DFD3]">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-[#8F7F72]">
            <span>{completedCount} of {plans.length} intentions completed</span>
            <span aria-hidden="true">·</span>
            <span>Unrushed Living</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#2D231C]">
            Today's Plan & Reminders
          </h1>
          <p className="text-xs sm:text-sm text-[#736558] font-prose-serif">
            A serene cadence for chores, family moments, quiet tea, and daily devotions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {completedCount > 0 && (
            <button
              onClick={onClearCompleted}
              className="px-3 py-2 text-xs text-[#736558] hover:text-[#DC2626] transition-colors"
            >
              Clear Done
            </button>
          )}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#B84A2A] text-white text-xs font-medium rounded-xl hover:bg-[#A33F23] transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Intention</span>
          </button>
        </div>
      </div>

      {/* Notification banner if permission not granted */}
      {notificationPermission === 'default' && onRequestNotificationPermission && (
        <div className="p-4 bg-[#FAF2ED] border border-[#F2C8B5] rounded-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-xs text-[#2D231C]">
            <BellRing className="w-4 h-4 text-[#B84A2A] shrink-0" />
            <span>Enable browser alerts so Hearth can chime softly when scheduled reminders arrive.</span>
          </div>
          <button
            onClick={onRequestNotificationPermission}
            className="px-3 py-1.5 bg-[#B84A2A] text-white text-xs font-medium rounded-lg hover:bg-[#A33F23] shrink-0 shadow-2xs"
          >
            Enable Chimes
          </button>
        </div>
      )}

      {/* Categories Filter Strip */}
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
            {cat}
          </button>
        ))}
      </div>

      {/* Plans List */}
      <div className="space-y-3">
        {filteredPlans.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-[#E8DFD3] p-8 space-y-3">
            <Clock className="w-8 h-8 text-[#C4B5A5] mx-auto" />
            <h3 className="font-serif text-lg font-semibold text-[#2D231C]">A Quiet, Open Day</h3>
            <p className="text-xs text-[#736558] max-w-sm mx-auto font-prose-serif">
              No intentions scheduled in this category. Enjoy the stillness or add a gentle goal.
            </p>
          </div>
        ) : (
          filteredPlans.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                item.completed
                  ? 'bg-[#FAF7F2] border-[#E8DFD3] opacity-75'
                  : 'bg-white border-[#E8DFD3] hover:border-[#C4B29E] shadow-2xs'
              }`}
            >
              <div
                onClick={() => onTogglePlan(item.id)}
                className="flex items-start gap-3 flex-1 cursor-pointer"
              >
                <button
                  type="button"
                  className="mt-0.5 shrink-0 text-[#B84A2A]"
                >
                  {item.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-[#059669]" />
                  ) : (
                    <Circle className="w-4 h-4 text-[#C4B5A5]" />
                  )}
                </button>

                <div className="space-y-1 min-w-0">
                  <p
                    className={`text-sm font-medium ${
                      item.completed ? 'line-through text-[#9E9084]' : 'text-[#2D231C]'
                    }`}
                  >
                    {item.title}
                  </p>
                  
                  {item.notes && (
                    <p className="text-xs text-[#736558] italic font-prose-serif">
                      {item.notes}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-2 text-[10px] text-[#8F7F72] pt-0.5">
                    <span className="px-2 py-0.5 bg-[#FAF7F2] rounded-md border border-[#EFE5D8]">
                      {item.category}
                    </span>
                    {item.time && <span>· {item.time}</span>}
                    {item.reminderEnabled && item.reminderTime && (
                      <span className="text-[#B84A2A] font-semibold flex items-center gap-0.5">
                        <BellRing className="w-2.5 h-2.5" />
                        {item.reminderTime}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onDeletePlan(item.id)}
                className="text-[#BDB0A2] hover:text-[#DC2626] p-1.5 transition-colors"
                title="Delete item"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Add Plan Modal */}
      {showAddModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl border border-[#E8DFD3]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#F0E6D9]">
              <h2 className="font-serif text-xl font-semibold text-[#2D231C]">
                Add Daily Intention
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
                  Task or Intention Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Afternoon tea with Mom"
                  className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E0D5C7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B84A2A]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#736558] mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E0D5C7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B84A2A]"
                  >
                    <option value="Home">Home</option>
                    <option value="Family">Family</option>
                    <option value="Devotion">Devotion</option>
                    <option value="Errand">Errand</option>
                    <option value="Health">Health</option>
                    <option value="Quiet">Quiet</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#736558] mb-1">
                    Time (Optional)
                  </label>
                  <input
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="e.g. 10:30 AM"
                    className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E0D5C7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B84A2A]"
                  />
                </div>
              </div>

              <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E8DFD3] space-y-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-[#2D231C]">
                  <input
                    type="checkbox"
                    checked={reminderEnabled}
                    onChange={(e) => setReminderEnabled(e.target.checked)}
                    className="rounded text-[#B84A2A] focus:ring-[#B84A2A]"
                  />
                  <span>Set audible chime reminder alert</span>
                </label>

                {reminderEnabled && (
                  <div className="pt-1">
                    <label className="block text-[11px] text-[#736558] mb-1">
                      Alert Time (24h format e.g. 14:30)
                    </label>
                    <input
                      type="time"
                      value={reminderTime}
                      onChange={(e) => setReminderTime(e.target.value)}
                      className="px-2 py-1 text-xs bg-white border border-[#E0D5C7] rounded-lg"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-[#736558] mb-1">
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ingredients to pick up, or quiet verse..."
                  className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E0D5C7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B84A2A]"
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
                  className="px-5 py-2 bg-[#B84A2A] text-white text-xs font-medium rounded-xl hover:bg-[#A33F23] transition-colors shadow-xs"
                >
                  Add Intention
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
