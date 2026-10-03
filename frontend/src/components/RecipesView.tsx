import React, { useState } from 'react';
import { RecipeItem, UserRole } from '../types';
import {
  Utensils,
  Clock,
  Users,
  Plus,
  Heart,
  Search,
  Check,
  Printer,
  X,
  ChefHat,
  BookOpen,
  Download,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

interface RecipesViewProps {
  recipes: RecipeItem[];
  onAddRecipe: (recipe: Omit<RecipeItem, 'id'>) => void;
  onDeleteRecipe: (id: string) => void;
  onToggleFavoriteRecipe: (id: string) => void;
  currentRole?: UserRole;
}

export const RecipesView: React.FC<RecipesViewProps> = ({
  recipes,
  onAddRecipe,
  onDeleteRecipe,
  onToggleFavoriteRecipe,
  currentRole = 'owner',
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCookRecipe, setActiveCookRecipe] = useState<RecipeItem | null>(null);
  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCookbookModal, setShowCookbookModal] = useState(false);

  // New recipe form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<RecipeItem['category']>('Family Dinner');
  const [prepTime, setPrepTime] = useState('15 min');
  const [cookTime, setCookTime] = useState('30 min');
  const [servings, setServings] = useState('4 servings');
  const [description, setDescription] = useState('');
  const [ingredientsText, setIngredientsText] = useState('');
  const [instructionsText, setInstructionsText] = useState('');
  const [notes, setNotes] = useState('');

  const categories = ['All', 'Favorites', 'Family Dinner', 'Baking & Sweets', 'Sunday Supper', 'Breakfast'];

  const filteredRecipes = recipes.filter((r) => {
    const matchesCategory =
      selectedCategory === 'All'
        ? true
        : selectedCategory === 'Favorites'
        ? r.isFavorite
        : r.category === selectedCategory;

    const matchesSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.ingredients.some((ing) => ing.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  const handleToggleIngredient = (idx: number) => {
    const key = `${activeCookRecipe?.id}-${idx}`;
    setCheckedIngredients((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const ingredients = ingredientsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const instructions = instructionsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    onAddRecipe({
      title: title.trim(),
      category,
      prepTime: prepTime.trim() || '15 min',
      cookTime: cookTime.trim() || '30 min',
      servings: servings.trim() || '4 servings',
      description: description.trim() || 'A cherished family meal.',
      ingredients: ingredients.length > 0 ? ingredients : ['Ingredients of your choice'],
      instructions: instructions.length > 0 ? instructions : ['Prepare with love and serve warm.'],
      notes: notes.trim() || undefined,
      isFavorite: true,
    });

    setTitle('');
    setDescription('');
    setIngredientsText('');
    setInstructionsText('');
    setNotes('');
    setShowAddModal(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCookbookManuscript = () => {
    let content = `# FAMILY HEARTH COOKBOOK\n\n`;
    content += `Generated: ${new Date().toLocaleDateString()}\n`;
    content += `Total Cherished Recipes: ${recipes.length}\n\n`;
    content += `## TABLE OF CONTENTS\n\n`;
    recipes.forEach((r, idx) => {
      content += `${idx + 1}. ${r.title} (${r.category}) - Prep: ${r.prepTime} | Cook: ${r.cookTime}\n`;
    });
    content += `\n---\n\n`;

    recipes.forEach((r, idx) => {
      content += `### RECIPE ${idx + 1}: ${r.title.toUpperCase()}\n`;
      content += `Category: ${r.category} | Servings: ${r.servings}\n`;
      content += `Prep Time: ${r.prepTime} | Cook Time: ${r.cookTime}\n\n`;
      content += `Description:\n${r.description}\n\n`;
      content += `Ingredients:\n${r.ingredients.map((i) => `• ${i}`).join('\n')}\n\n`;
      content += `Instructions:\n${r.instructions.map((inst, i) => `${i + 1}. ${inst}`).join('\n')}\n\n`;
      if (r.notes) content += `Hearth Tradition & Note:\n${r.notes}\n\n`;
      content += `\n---\n\n`;
    });

    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Family-Cookbook-Manuscript-${new Date().toISOString().slice(0, 10)}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 py-2 sm:py-6">
      
      {/* Header with Title and Unboxed Metadata */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#E8DFD3]">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-[#8F7F72]">
            <span>{recipes.length} Family Recipes</span>
            <span aria-hidden="true">·</span>
            <span>Gathered Around the Table</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#2D231C]">
            Recipes
          </h1>
          <p className="text-xs sm:text-sm text-[#736558] font-prose-serif">
            The meals, warm crusts, and comforting aromas your family loves coming home to.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          {/* Unobtrusive Print-on-Demand Affiliate Action */}
          <button
            onClick={() => setShowCookbookModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#2D231C] bg-white border border-[#E8DFD3] rounded-xl hover:bg-[#FAF7F2] transition-colors shadow-2xs whitespace-nowrap"
            title="Export recipes to a hardcover or coil-bound physical cookbook via Lulu"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#B84A2A]" />
            <span>Export to Custom Family Cookbook ↗</span>
          </button>

          {currentRole === 'owner' ? (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-[#B84A2A] rounded-xl hover:bg-[#A33F23] transition-colors shadow-xs whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Recipe</span>
            </button>
          ) : (
            <span className="px-3 py-1.5 rounded-full bg-white border border-[#E8DFD3] text-[11px] font-medium text-[#736558]">
              Guest View · Read-Only
            </span>
          )}
        </div>
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
            placeholder="Search dish, ingredient..."
            className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-[#E8DFD3] rounded-lg text-[#2D231C] placeholder:text-[#A09386] focus:outline-none focus:ring-2 focus:ring-[#B84A2A]"
          />
        </div>
      </div>

      {/* Recipe Cards Grid */}
      {filteredRecipes.length === 0 ? (
        <div className="bg-white border border-[#E8DFD3] rounded-2xl p-12 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-[#FAF7F2] flex items-center justify-center text-[#B84A2A]">
            <Utensils className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-lg font-medium text-[#2D231C]">
            No recipes found in this category
          </h3>
          <p className="text-xs text-[#736558] max-w-sm mx-auto">
            Add your favorite Sunday dinner, holiday baking recipe, or cozy soup to start the book.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-[#B84A2A] rounded-lg hover:bg-[#A33F23] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add a recipe</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map((recipe) => (
            <div
              key={recipe.id}
              onClick={() => setActiveCookRecipe(recipe)}
              className="group cursor-pointer bg-white border border-[#E8DFD3] rounded-2xl p-5 hover:border-[#C4B29E] transition-all shadow-xs flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-[#8F7F72]">
                  <span className="font-medium text-[#B84A2A]">{recipe.category}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavoriteRecipe(recipe.id);
                    }}
                    className="p-1 text-[#8F7F72] hover:text-[#B84A2A] transition-colors"
                    title={recipe.isFavorite ? 'Unfavorite' : 'Mark Favorite'}
                  >
                    <Heart className={`w-4 h-4 ${recipe.isFavorite ? 'fill-current text-[#B84A2A]' : ''}`} />
                  </button>
                </div>

                <h3 className="font-serif text-lg font-semibold text-[#2D231C] group-hover:text-[#B84A2A] transition-colors">
                  {recipe.title}
                </h3>

                <p className="text-xs text-[#736558] line-clamp-2 leading-relaxed font-prose-serif">
                  {recipe.description}
                </p>

                <div className="flex items-center gap-3 pt-2 text-xs text-[#8F7F72] font-mono tabular-nums">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#B84A2A]" />
                    <span>{recipe.cookTime}</span>
                  </div>
                  <span aria-hidden="true">·</span>
                  <div className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-[#B84A2A]" />
                    <span>{recipe.servings}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#F5ECE1] flex items-center justify-between text-xs font-medium text-[#B84A2A]">
                <span>View Ingredients & Steps</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cook Mode Modal / Full Recipe Sheet */}
      {activeCookRecipe && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in"
          onClick={() => setActiveCookRecipe(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl border border-[#E8DFD3]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#E8DFD3]">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-[#8F7F72]">
                  <span className="font-medium text-[#B84A2A]">{activeCookRecipe.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>{activeCookRecipe.servings}</span>
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2D231C]">
                  {activeCookRecipe.title}
                </h2>
              </div>
              <button
                onClick={() => setActiveCookRecipe(null)}
                className="p-1.5 text-[#8F7F72] hover:text-[#2D231C] rounded-full hover:bg-[#F3ECE2] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Times banner */}
            <div className="flex items-center justify-around p-3 bg-[#FAF7F2] rounded-xl text-xs text-[#635548] border border-[#EFE5D8]">
              <div className="text-center">
                <span className="block text-[#968678] text-[11px]">Prep Time</span>
                <span className="font-semibold text-[#2D231C]">{activeCookRecipe.prepTime}</span>
              </div>
              <div className="h-6 w-px bg-[#E2D5C6]" />
              <div className="text-center">
                <span className="block text-[#968678] text-[11px]">Cook Time</span>
                <span className="font-semibold text-[#2D231C]">{activeCookRecipe.cookTime}</span>
              </div>
              <div className="h-6 w-px bg-[#E2D5C6]" />
              <div className="text-center">
                <span className="block text-[#968678] text-[11px]">Yield</span>
                <span className="font-semibold text-[#2D231C]">{activeCookRecipe.servings}</span>
              </div>
            </div>

            {activeCookRecipe.description && (
              <p className="text-xs sm:text-sm text-[#6C5E53] font-prose-serif italic leading-relaxed">
                “{activeCookRecipe.description}”
              </p>
            )}

            {/* Ingredients with Interactive Cooking Checkboxes */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-base font-semibold text-[#2D231C] flex items-center gap-1.5">
                  <ChefHat className="w-4 h-4 text-[#B84A2A]" />
                  Ingredients (Tap to check off while cooking)
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-1.5 bg-[#FAF7F2] p-4 rounded-2xl border border-[#EFE5D8]">
                {activeCookRecipe.ingredients.map((ing, idx) => {
                  const isChecked = checkedIngredients[`${activeCookRecipe.id}-${idx}`];
                  return (
                    <div
                      key={idx}
                      onClick={() => handleToggleIngredient(idx)}
                      className={`flex items-start gap-2.5 p-1.5 rounded-lg cursor-pointer transition-colors ${
                        isChecked ? 'line-through text-[#9E9084] bg-white/40' : 'text-[#3B3027] hover:bg-white/70'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center text-white border transition-colors shrink-0 ${
                          isChecked ? 'bg-[#059669] border-[#059669]' : 'border-[#C8BAAC] bg-white'
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3 stroke-3" />}
                      </div>
                      <span className="text-xs">{ing}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step-by-Step Instructions */}
            <div className="space-y-3">
              <h3 className="font-serif text-base font-semibold text-[#2D231C]">
                Instructions
              </h3>

              <div className="space-y-3">
                {activeCookRecipe.instructions.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-[#3E332A]">
                    <span className="w-6 h-6 rounded-full bg-[#FAF7F2] border border-[#E2D5C6] font-mono text-[11px] font-semibold text-[#B84A2A] flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="leading-relaxed font-prose-serif flex-1 pt-0.5">
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Hearth Notes */}
            {activeCookRecipe.notes && (
              <div className="p-4 bg-[#FFF9F3] border border-[#F5DEC7] rounded-xl text-xs text-[#7A5B45] space-y-1">
                <span className="font-semibold text-[#B84A2A]">Family Note & Tip:</span>
                <p className="italic font-prose-serif leading-relaxed">
                  {activeCookRecipe.notes}
                </p>
              </div>
            )}

            {/* Modal Actions */}
            <div className="pt-4 border-t border-[#E8DFD3] flex items-center justify-between">
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#6C5E53] hover:text-[#2D231C]"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Recipe</span>
              </button>

              {currentRole === 'owner' && (
                <button
                  onClick={() => {
                    onDeleteRecipe(activeCookRecipe.id);
                    setActiveCookRecipe(null);
                  }}
                  className="text-xs text-[#9E9084] hover:text-[#DC2626] transition-colors"
                >
                  Remove from book
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Recipe Modal */}
      {showAddModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-5 shadow-2xl border border-[#E8DFD3]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#E8DFD3]">
              <h2 className="font-serif text-xl font-bold text-[#2D231C]">
                Add a Family Recipe
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
                  Recipe Name
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Grandma's Peach Cobbler"
                  className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E0D5C7] rounded-xl text-[#2D231C] focus:outline-none focus:ring-2 focus:ring-[#B84A2A]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <label className="block text-xs font-medium text-[#736558] mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as RecipeItem['category'])}
                    className="w-full px-2 py-2 text-xs bg-[#FAF7F2] border border-[#E0D5C7] rounded-lg text-[#2D231C] focus:outline-none focus:ring-2 focus:ring-[#B84A2A]"
                  >
                    <option value="Family Dinner">Dinner</option>
                    <option value="Baking & Sweets">Baking</option>
                    <option value="Sunday Supper">Sunday Supper</option>
                    <option value="Breakfast">Breakfast</option>
                    <option value="Soups & Stews">Soup</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#736558] mb-1">
                    Prep Time
                  </label>
                  <input
                    type="text"
                    value={prepTime}
                    onChange={(e) => setPrepTime(e.target.value)}
                    placeholder="15 min"
                    className="w-full px-2 py-2 text-xs bg-[#FAF7F2] border border-[#E0D5C7] rounded-lg text-[#2D231C]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#736558] mb-1">
                    Cook Time
                  </label>
                  <input
                    type="text"
                    value={cookTime}
                    onChange={(e) => setCookTime(e.target.value)}
                    placeholder="40 min"
                    className="w-full px-2 py-2 text-xs bg-[#FAF7F2] border border-[#E0D5C7] rounded-lg text-[#2D231C]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#736558] mb-1">
                    Servings
                  </label>
                  <input
                    type="text"
                    value={servings}
                    onChange={(e) => setServings(e.target.value)}
                    placeholder="6 servings"
                    className="w-full px-2 py-2 text-xs bg-[#FAF7F2] border border-[#E0D5C7] rounded-lg text-[#2D231C]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#736558] mb-1">
                  Short Description
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Sweet, golden crust with warm spiced cinnamon peaches."
                  className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E0D5C7] rounded-xl text-[#2D231C]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#736558] mb-1">
                  Ingredients (one per line)
                </label>
                <textarea
                  rows={4}
                  value={ingredientsText}
                  onChange={(e) => setIngredientsText(e.target.value)}
                  placeholder={"4 cups sliced peaches\n1 cup flour\n1/2 cup butter\n1 tsp cinnamon"}
                  className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E0D5C7] rounded-xl text-[#2D231C] font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#736558] mb-1">
                  Instructions (one step per line)
                </label>
                <textarea
                  rows={4}
                  value={instructionsText}
                  onChange={(e) => setInstructionsText(e.target.value)}
                  placeholder={"Toss peaches with sugar and cinnamon in baking dish.\nMix flour and butter into crumbles.\nBake at 350°F for 40 minutes."}
                  className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E0D5C7] rounded-xl text-[#2D231C]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#736558] mb-1">
                  Family Tips & Memories (Optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Best served right out of the oven with vanilla ice cream!"
                  className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E0D5C7] rounded-xl text-[#2D231C]"
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
                  className="px-5 py-2 text-xs font-medium text-white bg-[#B84A2A] rounded-xl hover:bg-[#A33F23] transition-colors shadow-xs"
                >
                  Save to Recipe Book
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Export to Custom Family Cookbook Modal (Lulu Print-on-Demand Partner) */}
      {showCookbookModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setShowCookbookModal(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-[#E8DFD3]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between pb-3 border-b border-[#E8DFD3]">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FAF2ED] border border-[#F2C8B5] text-[10px] font-bold text-[#B84A2A] uppercase tracking-wider">
                  <Sparkles className="w-3 h-3" />
                  <span>Print-on-Demand Partner Extension</span>
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#2D231C]">
                  Export to Custom Family Cookbook
                </h3>
                <p className="text-xs text-[#736558]">
                  Turn your {recipes.length} treasured recipes into a physical hardcover or spiral-bound kitchen keepsake.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCookbookModal(false)}
                className="text-[#8F7F72] hover:text-[#2D231C] p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cookbook Preview Card */}
            <div className="bg-[#FAF7F2] border border-[#E8DFD3] rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-16 h-20 rounded-lg bg-[#35251B] border border-[#524438] flex flex-col items-center justify-center text-center p-1 text-[#F5ECE1] shadow-md shrink-0">
                  <span className="text-[8px] uppercase tracking-widest text-[#E68A6E] font-bold">Cookbook</span>
                  <span className="font-serif text-[11px] leading-tight mt-1 font-bold">Family Hearth</span>
                  <span className="text-[7px] text-[#A8988B] mt-1">{recipes.length} dishes</span>
                </div>
                <div className="space-y-1 min-w-0">
                  <p className="text-xs font-bold text-[#2D231C]">
                    Lulu Print-on-Demand Manuscript Ready
                  </p>
                  <p className="text-[11px] text-[#736558] font-prose-serif leading-relaxed">
                    Formatted with automatic Table of Contents, ingredient checklists, step-by-step instructions, and family memory notes.
                  </p>
                  <span className="text-[10px] font-mono text-[#059669] font-medium block">
                    Zero inventory · Order 1 copy or 50 copies for holidays
                  </span>
                </div>
              </div>
            </div>

            {/* Partner Workflow Details */}
            <div className="space-y-2 text-xs text-[#6C5E53] font-prose-serif">
              <p>
                Through our print partner <strong>Lulu</strong>, you can publish premium hardcovers, full-color glossy pages, or coil-bound books that lay flat on kitchen counters.
              </p>
            </div>

            {/* Modal CTAs */}
            <div className="pt-2 border-t border-[#E8DFD3] flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleDownloadCookbookManuscript}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-medium text-[#2D231C] bg-[#FAF7F2] hover:bg-[#F3ECE2] border border-[#E0D5C7] rounded-xl transition-colors shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-[#B84A2A]" />
                <span>Download Manuscript (.md)</span>
              </button>

              <a
                href="https://www.lulu.com/create/cookbooks?ref=familyhearth"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-[#B84A2A] hover:bg-[#A33F23] rounded-xl transition-colors shadow-xs"
              >
                <span>Print on Lulu (from $14.99) ↗</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
