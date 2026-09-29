import React, { useState } from 'react';
import { PlanItem } from '../types';
import {
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Printer,
  Sparkles,
  Clock,
  Calendar,
  Bell,
  BellRing,
  BellOff,
  Edit3,
  X,
  Check,
} from 'lucide-react';

interface PlanViewProps {
  plans: PlanItem[];
  onAddPlan: (item: Omit<PlanItem, 'id' | 'createdAt'>) => void;
  onTogglePlan: (id: string) => void;
  onUpdatePlan: (id: string, updates: Partial<PlanItem>) => void;
  onDeletePlan: (id: string) => void;
  onClearCompleted: () => void;
  onRequestNotificationPermission: () => void;
  notificationPermission: NotificationPermission | 'unsupported';
}

export const PlanView: React.FC<PlanViewProps> = ({
  plans,
  onAddPlan,
  onTogglePlan,
  onUpdatePlan,
  onDeletePlan,
  onClearCompleted,
  onRequestNotificationPermission,
  notificationPermission,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<PlanItem['category']>('Morning');
  const [time, setTime] = useState('');
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'All' | 'Morning' | 'Afternoon' | 'Evening'>('All');
  const [showAddForm, setShowAddForm] = useState(false);

  // Edit modal state
  const [editingPlan, setEditingPlan] = useState<PlanItem | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddPlan({
      title: title.trim(),
      category,
      time: time.trim() || undefined,
      reminderEnabled: reminderEnabled && !!reminderTime,
      reminderTime: reminderEnabled ? reminderTime : undefined,
      reminderTriggered: false,
      completed: false,
      priority: 'gentle',
      notes: notes.trim() || undefined,
    });

    setTitle('');
    setTime('');
    setReminderEnabled(false);
    setReminderTime('');
    setNotes('');
    setShowAddForm(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan || !editingPlan.title.trim()) return;

    onUpdatePlan(editingPlan.id, {
      title: editingPlan.title.trim(),
      category: editingPlan.category,
      time: editingPlan.time?.trim() || undefined,
      reminderEnabled: editingPlan.reminderEnabled,
      reminderTime: editingPlan.reminderEnabled ? editingPlan.reminderTime : undefined,
      reminderTriggered: false, // Reset so updated reminder can alert again
      notes: editingPlan.notes?.trim() || undefined,
    });

    setEditingPlan(null);
  };

  const filteredPlans = plans.filter((p) => {
    if (selectedFilter === 'All') return true;
    return p.category === selectedFilter;
  });

  const completedCount = plans.filter((p) => p.completed).length;
  const totalCount = plans.length;
  const percentComplete = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const quickIdeas = [
    { title: 'Morning stretch & quiet tea', time: '07:30', category: 'Morning' as const },
    { title: 'Tidy kitchen counter & water plants', time: '09:00', category: 'Morning' as const },
    { title: 'Afternoon walk in fresh sunshine', time: '14:00', category: 'Afternoon' as const },
    { title: 'Prep ingredients for family dinner', time: '16:30', category: 'Afternoon' as const },
    { title: 'Read quiet book chapter with tea', time: '20:00', category: 'Evening' as const },
  ];

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-2 sm:py-6">
      
      {/* Header with Title and Unboxed Metadata */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#E8DFD3]">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-[#8F7F72]">
            <span>{formattedDate}</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums font-mono">{completedCount} of {totalCount} completed</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums font-mono">{percentComplete}%</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#2D231C]">
            Daily Planner & Reminders
          </h1>
          <p className="text-xs sm:text-sm text-[#736558] font-prose-serif">
            Schedule your day, set gentle chimes, and adjust your personal day planner with ease.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {notificationPermission !== 'granted' && notificationPermission !== 'unsupported' && (
            <button
              onClick={onRequestNotificationPermission}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#B84A2A] bg-[#FAF2ED] border border-[#F2C8B5] rounded-lg hover:bg-[#FBE8DE] transition-colors whitespace-nowrap"
              title="Allow browser notifications for plan reminders"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Enable Alerts</span>
            </button>
          )}

          {completedCount > 0 && (
            <button
              onClick={onClearCompleted}
              className="px-3 py-1.5 text-xs text-[#8F7F72] hover:text-[#B84A2A] transition-colors"
            >
              Clear finished
            </button>
          )}
          <button
            onClick={handlePrint}
            title="Print today's schedule"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#4A3E34] bg-white border border-[#E8DFD3] rounded-lg hover:bg-[#F3ECE2] transition-colors shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Print Sheet</span>
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-white bg-[#B84A2A] rounded-lg hover:bg-[#A33F23] transition-colors shadow-xs whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Plan</span>
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      {totalCount > 0 && (
        <div className="w-full bg-[#EFE8DD] h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-[#B84A2A] h-full transition-all duration-500 ease-out"
            style={{ width: `${percentComplete}%` }}
          />
        </div>
      )}

      {/* Add Plan Form */}
      {showAddForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-[#E8DFD3] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4 animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#B84A2A] flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>Schedule a Daily Plan</span>
            </span>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-xs text-[#8F7F72] hover:text-[#2D231C]"
            >
              Cancel
            </button>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#736558] mb-1">
              What is planned?
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Pick fresh rosemary, finish project reading, walk by the lake"
              className="w-full px-3.5 py-2.5 text-sm bg-[#FAF7F2] border border-[#E0D5C7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B84A2A] text-[#2D231C] placeholder:text-[#A09386]"
              autoFocus
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#736558] mb-1">
                Time of Day
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as PlanItem['category'])}
                className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E0D5C7] rounded-lg text-[#2D231C] focus:outline-none focus:ring-2 focus:ring-[#B84A2A]"
              >
                <option value="Morning">Morning</option>
                <option value="Afternoon">Afternoon</option>
                <option value="Evening">Evening</option>
                <option value="Anytime">Anytime</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#736558] mb-1">
                Scheduled Time (Optional)
              </label>
              <div className="relative">
                <Clock className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#9E9084]" />
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#FAF7F2] border border-[#E0D5C7] rounded-lg text-[#2D231C] focus:outline-none focus:ring-2 focus:ring-[#B84A2A]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#736558] mb-1">
                Reminder Chime & Alert
              </label>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="enable-reminder"
                  checked={reminderEnabled}
                  onChange={(e) => {
                    setReminderEnabled(e.target.checked);
                    if (e.target.checked && !reminderTime) {
                      setReminderTime(time || '12:00');
                    }
                  }}
                  className="w-4 h-4 accent-[#B84A2A] rounded cursor-pointer"
                />
                <label htmlFor="enable-reminder" className="text-xs text-[#2D231C] cursor-pointer">
                  Alert me at:
                </label>
                {reminderEnabled && (
                  <input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="px-2 py-1 text-xs bg-[#FAF7F2] border border-[#E0D5C7] rounded text-[#2D231C]"
                    required={reminderEnabled}
                  />
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#736558] mb-1">
              Notes & Details (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Remember to bring warm scarf, check mailbox"
              className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E0D5C7] rounded-lg text-[#2D231C] focus:outline-none focus:ring-2 focus:ring-[#B84A2A] placeholder:text-[#A09386]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="submit"
              className="px-5 py-2 text-xs font-medium text-white bg-[#B84A2A] rounded-lg hover:bg-[#A33F23] transition-colors shadow-xs"
            >
              Save Plan
            </button>
          </div>
        </form>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
        <div className="flex items-center gap-1 p-1 bg-[#EFE8DD] rounded-xl">
          {(['All', 'Morning', 'Afternoon', 'Evening'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
                selectedFilter === filter
                  ? 'bg-white text-[#2D231C] shadow-xs font-semibold'
                  : 'text-[#736558] hover:text-[#2D231C]'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        <span className="text-xs text-[#8F7F72] hidden sm:inline">
          {filteredPlans.length} {filteredPlans.length === 1 ? 'item' : 'items'}
        </span>
      </div>

      {/* Plans List */}
      <div className="space-y-2.5">
        {filteredPlans.length === 0 ? (
          <div className="bg-white border border-[#E8DFD3] rounded-2xl p-10 text-center space-y-3">
            <div className="w-10 h-10 mx-auto rounded-full bg-[#FAF7F2] flex items-center justify-center text-[#B84A2A]">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-medium text-[#2D231C]">
              Nothing scheduled in this section.
            </h3>
            <p className="text-xs text-[#736558] max-w-sm mx-auto">
              Your day planner is open and unhurried. Add a plan or choose a gentle suggestion below.
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-[#B84A2A] bg-[#FAF7F2] border border-[#E2D4C3] rounded-lg hover:bg-[#F3ECE2] transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add a plan</span>
            </button>
          </div>
        ) : (
          filteredPlans.map((item) => (
            <div
              key={item.id}
              className={`group flex items-start justify-between gap-3 p-4 rounded-xl border transition-all ${
                item.completed
                  ? 'bg-[#FAF7F2]/70 border-[#ECE4D8] opacity-75'
                  : 'bg-white border-[#E8DFD3] hover:border-[#D1C2AF] shadow-xs'
              }`}
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <button
                  onClick={() => onTogglePlan(item.id)}
                  className="mt-0.5 text-[#B84A2A] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B84A2A] rounded-full shrink-0"
                  aria-label={item.completed ? 'Mark incomplete' : 'Mark complete'}
                >
                  {item.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-[#059669]" />
                  ) : (
                    <Circle className="w-5 h-5 text-[#C4B5A5] hover:text-[#B84A2A] transition-colors" />
                  )}
                </button>

                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span
                      onClick={() => onTogglePlan(item.id)}
                      className={`text-sm cursor-pointer select-none transition-colors ${
                        item.completed
                          ? 'line-through text-[#9E9084]'
                          : 'font-medium text-[#2D231C]'
                      }`}
                    >
                      {item.title}
                    </span>

                    <span className="text-xs text-[#9E9084]">
                      · {item.category}
                    </span>

                    {item.time && (
                      <span className="text-xs text-[#6C5E53] font-mono flex items-center gap-1 bg-[#FAF7F2] px-2 py-0.5 rounded border border-[#E8DFD3]">
                        <Clock className="w-3 h-3 text-[#B84A2A]" />
                        {item.time}
                      </span>
                    )}

                    {item.reminderEnabled && item.reminderTime && (
                      <span
                        className={`text-xs flex items-center gap-1 px-2 py-0.5 rounded border ${
                          item.reminderTriggered
                            ? 'bg-[#F2FAF3] text-[#1E7438] border-[#C2E7CA]'
                            : 'bg-[#FDF3EE] text-[#B84A2A] border-[#F4D1C3]'
                        }`}
                        title={`Reminder set for ${item.reminderTime}`}
                      >
                        <BellRing className="w-3 h-3 animate-pulse" />
                        <span>{item.reminderTime}</span>
                      </span>
                    )}
                  </div>

                  {item.notes && (
                    <p className="text-xs text-[#736558] italic font-prose-serif">
                      {item.notes}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setEditingPlan(item)}
                  title="Adjust plan & reminders"
                  className="p-1.5 text-[#8F7F72] hover:text-[#B84A2A] hover:bg-[#FAF7F2] rounded-md transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onDeletePlan(item.id)}
                  title="Remove item"
                  className="p-1.5 text-[#8F7F72] hover:text-[#DC2626] hover:bg-[#FAF7F2] rounded-md transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Gentle Suggestions */}
      <div className="pt-6 border-t border-[#E8DFD3] space-y-3">
        <span className="text-xs font-medium text-[#8F7F72] flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#B84A2A]" />
          Quick Ideas to Add to Your Day Planner
        </span>
        <div className="flex flex-wrap gap-2">
          {quickIdeas.map((idea) => (
            <button
              key={idea.title}
              onClick={() => {
                onAddPlan({
                  title: idea.title,
                  category: idea.category,
                  time: idea.time,
                  reminderEnabled: false,
                  completed: false,
                  priority: 'gentle',
                });
              }}
              className="text-xs px-3 py-1.5 bg-white border border-[#E8DFD3] text-[#5A4D42] rounded-lg hover:border-[#B84A2A] hover:text-[#B84A2A] transition-colors text-left flex items-center gap-1.5"
            >
              <span>+ {idea.title}</span>
              <span className="text-[#8F7F72] font-mono text-[11px]">({idea.time})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Edit Plan Modal */}
      {editingPlan && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setEditingPlan(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-[#E8DFD3]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#E8DFD3]">
              <h3 className="font-serif text-lg font-bold text-[#2D231C] flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[#B84A2A]" />
                <span>Adjust Day Plan</span>
              </h3>
              <button
                onClick={() => setEditingPlan(null)}
                className="text-[#8F7F72] hover:text-[#2D231C]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#736558] mb-1">
                  Plan Description
                </label>
                <input
                  type="text"
                  value={editingPlan.title}
                  onChange={(e) => setEditingPlan({ ...editingPlan, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E0D5C7] rounded-lg text-[#2D231C] focus:outline-none focus:ring-2 focus:ring-[#B84A2A]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#736558] mb-1">
                    Time of Day
                  </label>
                  <select
                    value={editingPlan.category}
                    onChange={(e) =>
                      setEditingPlan({
                        ...editingPlan,
                        category: e.target.value as PlanItem['category'],
                      })
                    }
                    className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E0D5C7] rounded-lg text-[#2D231C]"
                  >
                    <option value="Morning">Morning</option>
                    <option value="Afternoon">Afternoon</option>
                    <option value="Evening">Evening</option>
                    <option value="Anytime">Anytime</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#736558] mb-1">
                    Scheduled Time
                  </label>
                  <input
                    type="time"
                    value={editingPlan.time || ''}
                    onChange={(e) => setEditingPlan({ ...editingPlan, time: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E0D5C7] rounded-lg text-[#2D231C]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#736558] mb-1">
                  Reminder Alert
                </label>
                <div className="flex items-center gap-2 p-2 bg-[#FAF7F2] rounded-lg border border-[#E8DFD3]">
                  <input
                    type="checkbox"
                    id="edit-reminder"
                    checked={editingPlan.reminderEnabled || false}
                    onChange={(e) =>
                      setEditingPlan({
                        ...editingPlan,
                        reminderEnabled: e.target.checked,
                        reminderTime: e.target.checked ? editingPlan.reminderTime || editingPlan.time || '12:00' : undefined,
                      })
                    }
                    className="w-4 h-4 accent-[#B84A2A] rounded cursor-pointer"
                  />
                  <label htmlFor="edit-reminder" className="text-xs text-[#2D231C] cursor-pointer">
                    Alert me at:
                  </label>
                  {editingPlan.reminderEnabled && (
                    <input
                      type="time"
                      value={editingPlan.reminderTime || '12:00'}
                      onChange={(e) => setEditingPlan({ ...editingPlan, reminderTime: e.target.value })}
                      className="px-2 py-1 text-xs bg-white border border-[#E0D5C7] rounded text-[#2D231C]"
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#736558] mb-1">
                  Notes
                </label>
                <input
                  type="text"
                  value={editingPlan.notes || ''}
                  onChange={(e) => setEditingPlan({ ...editingPlan, notes: e.target.value })}
                  placeholder="Additional gentle notes..."
                  className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E0D5C7] rounded-lg text-[#2D231C]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E8DFD3]">
                <button
                  type="button"
                  onClick={() => setEditingPlan(null)}
                  className="px-3 py-1.5 text-xs text-[#736558]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-medium text-white bg-[#B84A2A] rounded-lg hover:bg-[#A33F23] transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
