import React, { useState } from 'react';
import { RecipeItem, UserRole } from '../types';
import {
  Utensils,
  Plus,
  Heart,
  Trash2,
  Clock,
  Users,
  Search,
  BookOpen,
  Check,
  X,
} from 'lucide-react';

interface RecipesViewProps {
  recipes: RecipeItem[];
  onAddRecipe: (recipe: Omit<RecipeItem, 'id'>) => void;
  onToggleFavoriteRecipe: (id: string) => void;
  onDeleteRecipe: (id: string) => void;
  currentRole?: UserRole;
}

export const RecipesView: React.FC<RecipesViewProps> = ({
  recipes,
  onAddRecipe,
  onToggleFavoriteRecipe,
  onDeleteRecipe,
  currentRole = 'owner',
}) => {
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeItem>(recipes[0] || null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<RecipeItem['category']>('Baking & Sweets');
  const [prepTime, setPrepTime] = useState('20 min');
  const [cookTime, setCookTime] = useState('35 min');
  const [servings, setServings] = useState('4 servings');
  const [description, setDescription] = useState('');
  const [ingredientsText, setIngredientsText] = useState('');
  const [instructionsText, setInstructionsText] = useState('');
  const [memoryNote, setMemoryNote] = useState('');

  const categories = [
    'All',
    'Baking & Sweets',
    'Family Dinners',
    'Soups & Stews',
    'Sides & Salads',
    'Hearth Traditions',
  ];

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const ingredients = ingredientsText
      .split('\n')
      .map((i) => i.trim())
      .filter(Boolean);
    const instructions = instructionsText
      .split('\n')
      .map((i) => i.trim())
      .filter(Boolean);

    onAddRecipe({
      title: title.trim(),
      category,
      prepTime,
      cookTime,
      servings,
      description: description.trim(),
      ingredients: ingredients.length ? ingredients : ['Ingredients list to be added'],
      instructions: instructions.length ? instructions : ['Instructions to be added'],
      memoryNote: memoryNote.trim() || undefined,
      isFavorite: true,
    });

    setTitle('');
    setDescription('');
    setIngredientsText('');
    setInstructionsText('');
    setMemoryNote('');
    setShowAddModal(false);
  };

  const filteredRecipes = recipes.filter((r) => {
    const matchCat = selectedCategory === 'All' || r.category === selectedCategory;
    const matchSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-2 sm:py-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#E8DFD3]">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-[#8F7F72]">
            <span>{recipes.length} Heirloom Recipes</span>
            <span aria-hidden="true">·</span>
            <span>Handed Down With Love</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#2D231C]">
            Family Recipes & Traditions
          </h1>
          <p className="text-xs sm:text-sm text-[#736558] font-prose-serif">
            Warm aromas that bring everyone into the kitchen. Flour on aprons, simmering pots, and cherished traditions.
          </p>
        </div>

        {currentRole === 'owner' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#B84A2A] text-white text-xs font-medium rounded-xl hover:bg-[#A33F23] transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Family Recipe</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
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
              {cat}
            </button>
          ))}
        </div>

        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-[#9E9084]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search recipes..."
            className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-[#E8DFD3] rounded-lg text-[#2D231C] focus:outline-none focus:ring-2 focus:ring-[#B84A2A]"
          />
        </div>
      </div>

      {/* Recipe Detail / List Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Recipe List */}
        <div className="space-y-3">
          {filteredRecipes.map((r) => {
            const isSel = selectedRecipe?.id === r.id;
            return (
              <div
                key={r.id}
                onClick={() => setSelectedRecipe(r)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  isSel
                    ? 'bg-[#FAF2ED] border-[#B84A2A] shadow-xs'
                    : 'bg-white border-[#E8DFD3] hover:border-[#C4B29E]'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] text-[#8F7F72]">
                  <span className="font-medium text-[#B84A2A]">{r.category}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavoriteRecipe(r.id);
                    }}
                    className="p-1 hover:text-[#B84A2A]"
                  >
                    <Heart className={`w-3.5 h-3.5 ${r.isFavorite ? 'fill-current text-[#B84A2A]' : ''}`} />
                  </button>
                </div>

                <h3 className="font-serif text-base font-semibold text-[#2D231C] mt-1">
                  {r.title}
                </h3>
                <p className="text-xs text-[#736558] line-clamp-1 mt-0.5 font-prose-serif italic">
                  {r.description}
                </p>

                <div className="flex items-center gap-3 text-[10px] text-[#8F7F72] mt-2 pt-2 border-t border-[#F0E6D9]">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{r.cookTime}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    <span>{r.servings}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Side: Active Recipe Card */}
        <div className="lg:col-span-2">
          {selectedRecipe ? (
            <article className="bg-white border border-[#E8DFD3] rounded-3xl p-6 sm:p-9 shadow-xs space-y-6">
              
              <div className="space-y-2 pb-4 border-b border-[#F0E6D9]">
                <div className="flex items-center justify-between text-xs text-[#8F7F72]">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#FAF2ED] text-[#B84A2A] font-semibold border border-[#F2C8B5]">
                    {selectedRecipe.category}
                  </span>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => onToggleFavoriteRecipe(selectedRecipe.id)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors ${
                        selectedRecipe.isFavorite
                          ? 'bg-[#FAF2ED] text-[#B84A2A] border-[#F2C8B5]'
                          : 'bg-[#FAF7F2] text-[#736558] border-[#E8DFD3]'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${selectedRecipe.isFavorite ? 'fill-current' : ''}`} />
                      <span>{selectedRecipe.isFavorite ? 'Bookmarked' : 'Bookmark'}</span>
                    </button>

                    {currentRole === 'owner' && (
                      <button
                        type="button"
                        onClick={() => onDeleteRecipe(selectedRecipe.id)}
                        className="text-[#BDB0A2] hover:text-[#DC2626] p-1.5 transition-colors"
                        title="Delete recipe"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#2D231C]">
                  {selectedRecipe.title}
                </h2>
                
                <p className="text-xs sm:text-sm text-[#736558] font-prose-serif leading-relaxed italic">
                  {selectedRecipe.description}
                </p>

                <div className="flex items-center gap-6 text-xs text-[#736558] pt-2">
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider text-[#A39284]">Prep Time</span>
                    <span className="font-medium text-[#2D231C]">{selectedRecipe.prepTime}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider text-[#A39284]">Cook Time</span>
                    <span className="font-medium text-[#2D231C]">{selectedRecipe.cookTime}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider text-[#A39284]">Servings</span>
                    <span className="font-medium text-[#2D231C]">{selectedRecipe.servings}</span>
                  </div>
                </div>
              </div>

              {/* Ingredients */}
              <div className="space-y-3">
                <h3 className="font-serif text-lg font-semibold text-[#2D231C]">
                  Ingredients
                </h3>
                <ul className="space-y-2 text-xs sm:text-sm text-[#4A3C31]">
                  {selectedRecipe.ingredients.map((ing, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#B84A2A] mt-2 shrink-0" />
                      <span>{ing}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Instructions */}
              <div className="space-y-3 pt-4 border-t border-[#F0E6D9]">
                <h3 className="font-serif text-lg font-semibold text-[#2D231C]">
                  Preparation & Cooking
                </h3>
                <ol className="space-y-3 text-xs sm:text-sm text-[#4A3C31]">
                  {selectedRecipe.instructions.map((step, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-[#FAF2ED] text-[#B84A2A] text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5 border border-[#F2C8B5]">
                        {i + 1}
                      </span>
                      <span className="leading-relaxed font-prose-serif">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Memory Note */}
              {selectedRecipe.memoryNote && (
                <div className="p-4 bg-[#FAF7F2] border border-[#E8DFD3] rounded-2xl space-y-1">
                  <span className="text-[10px] uppercase font-semibold tracking-wider text-[#B84A2A] block">
                    Family Memory & Hearth Note
                  </span>
                  <p className="text-xs sm:text-sm text-[#736558] font-prose-serif italic leading-relaxed">
                    “{selectedRecipe.memoryNote}”
                  </p>
                </div>
              )}

            </article>
          ) : (
            <div className="text-center py-20 bg-white border border-[#E8DFD3] rounded-3xl p-8">
              <Utensils className="w-8 h-8 text-[#C4B5A5] mx-auto mb-2" />
              <p className="text-xs text-[#736558]">Select a recipe from the list to view ingredients.</p>
            </div>
          )}
        </div>

      </div>

      {/* Add Recipe Modal */}
      {showAddModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col p-6 space-y-4 shadow-xl border border-[#E8DFD3] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#F0E6D9]">
              <h2 className="font-serif text-xl font-semibold text-[#2D231C]">
                Add Family Recipe
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-xs text-[#8F7F72] hover:text-[#2D231C]"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="flex-1 overflow-y-auto space-y-4 pr-1">
              <div>
                <label className="block text-xs font-medium text-[#736558] mb-1">Recipe Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Sourdough Cinnamon Morning Rolls"
                  className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E0D5C7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B84A2A]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#736558] mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E0D5C7] rounded-lg"
                  >
                    <option value="Baking & Sweets">Baking & Sweets</option>
                    <option value="Family Dinners">Family Dinners</option>
                    <option value="Soups & Stews">Soups & Stews</option>
                    <option value="Sides & Salads">Sides & Salads</option>
                    <option value="Hearth Traditions">Hearth Traditions</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#736558] mb-1">Servings</label>
                  <input
                    type="text"
                    value={servings}
                    onChange={(e) => setServings(e.target.value)}
                    placeholder="e.g. 8 warm servings"
                    className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E0D5C7] rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#736558] mb-1">Prep Time</label>
                  <input
                    type="text"
                    value={prepTime}
                    onChange={(e) => setPrepTime(e.target.value)}
                    placeholder="e.g. 20 min"
                    className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E0D5C7] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#736558] mb-1">Cook Time</label>
                  <input
                    type="text"
                    value={cookTime}
                    onChange={(e) => setCookTime(e.target.value)}
                    placeholder="e.g. 35 min"
                    className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E0D5C7] rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#736558] mb-1">Short Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Golden and fragrant with cinnamon spice..."
                  className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E0D5C7] rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#736558] mb-1">
                  Ingredients (One per line)
                </label>
                <textarea
                  rows={4}
                  value={ingredientsText}
                  onChange={(e) => setIngredientsText(e.target.value)}
                  placeholder="3 cups unbleached flour&#10;1 cup warm milk&#10;2 tbsp softened butter"
                  className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E0D5C7] rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#736558] mb-1">
                  Instructions (One step per line)
                </label>
                <textarea
                  rows={4}
                  value={instructionsText}
                  onChange={(e) => setInstructionsText(e.target.value)}
                  placeholder="Warm the milk and butter together gently.&#10;Knead into a soft dough and let rise.&#10;Roll out and bake at 375°F until golden."
                  className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E0D5C7] rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#736558] mb-1">
                  Memory Note / Family Tradition (Optional)
                </label>
                <input
                  type="text"
                  value={memoryNote}
                  onChange={(e) => setMemoryNote(e.target.value)}
                  placeholder="Baked every Christmas morning while snow falls..."
                  className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E0D5C7] rounded-xl"
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
                  Save Recipe
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
