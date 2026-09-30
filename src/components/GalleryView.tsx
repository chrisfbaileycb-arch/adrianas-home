import React, { useState } from 'react';
import { CuratedSharedAlbum, UserRole } from '../types';
import {
  ExternalLink,
  Plus,
  Heart,
  Trash2,
  ShieldCheck,
  Sparkles,
  Search,
  Filter,
  Images,
  FolderLock,
  Layers,
  BookOpen,
} from 'lucide-react';

interface GalleryViewProps {
  sharedAlbums: CuratedSharedAlbum[];
  onAddSharedAlbum: (album: Omit<CuratedSharedAlbum, 'id'>) => void;
  onToggleFavoriteAlbum: (id: string) => void;
  onDeleteSharedAlbum: (id: string) => void;
  onOpenEditor?: () => void;
  currentRole?: UserRole;
}

export const GalleryView: React.FC<GalleryViewProps> = ({
  sharedAlbums,
  onAddSharedAlbum,
  onToggleFavoriteAlbum,
  onDeleteSharedAlbum,
  onOpenEditor,
  currentRole = 'owner',
}) => {
  const [selectedProvider, setSelectedProvider] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Album Form state
  const [newTitle, setNewTitle] = useState('');
  const [newProvider, setNewProvider] = useState<CuratedSharedAlbum['provider']>('Google Photos');
  const [newUrl, setNewUrl] = useState('');
  const [newCover, setNewCover] = useState('');
  const [newCount, setNewCount] = useState('45 photos');
  const [newDate, setNewDate] = useState('Recent Season');
  const [newCaption, setNewCaption] = useState('');

  const coverPresets = [
    { label: 'Family Cookout', url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80' },
    { label: 'Broncos Game Day', url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80' },
    { label: 'Sunflowers & Meadow', url: 'https://images.unsplash.com/photo-1476703993599-0035a21b17a9?auto=format&fit=crop&w=800&q=80' },
    { label: 'Hearth Christmas', url: 'https://images.unsplash.com/photo-1543258103-a62bdc069871?auto=format&fit=crop&w=800&q=80' },
    { label: 'Mountain Cabin', url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80' },
    { label: 'Sunday Kitchen Loaf', url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80' },
  ];

  const handleCreateAlbum = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newUrl.trim()) return;

    onAddSharedAlbum({
      title: newTitle.trim(),
      provider: newProvider,
      albumUrl: newUrl.trim(),
      coverImageUrl: newCover.trim() || coverPresets[0].url,
      photoCount: newCount.trim() || 'Curated Collection',
      date: newDate.trim() || 'This Year',
      caption: newCaption.trim() || 'Shared family moments kept safely in cloud storage.',
      isFavorite: false,
    });

    setNewTitle('');
    setNewUrl('');
    setNewCover('');
    setNewCaption('');
    setShowAddModal(false);
  };

  const filteredAlbums = sharedAlbums.filter((album) => {
    const matchesProvider =
      selectedProvider === 'All'
        ? true
        : selectedProvider === 'Favorites'
        ? album.isFavorite
        : album.provider === selectedProvider;

    const matchesSearch =
      album.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      album.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (album.caption && album.caption.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesProvider && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-2 sm:py-6">
      
      {/* Header with Title and Metadata */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#E8DFD3]">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-[#8F7F72]">
            <span>{sharedAlbums.length} Curated Shared Albums</span>
            <span aria-hidden="true">·</span>
            <span className="text-[#059669] font-medium flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Zero Hosting Liability
            </span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#2D231C]">
            Family Photo Albums
          </h1>
          <p className="text-xs sm:text-sm text-[#736558] font-prose-serif max-w-xl">
            Curated family collections linked directly to Google Photos and Apple iCloud Shared Albums. High-resolution media stays private and securely hosted on cloud platforms.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Print Keepsake Affiliate Action */}
          <a
            href="https://www.artifactuprising.com/photo-books?ref=familyhearth"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#2D231C] bg-white border border-[#E8DFD3] rounded-xl hover:bg-[#FAF7F2] transition-colors shadow-2xs whitespace-nowrap"
            title="Turn shared photos into a linen keepsake book via Artifact Uprising / Shutterfly"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#B84A2A]" />
            <span>Turn shared photos into a linen keepsake book ↗</span>
          </a>

          {currentRole === 'owner' && onOpenEditor && (
            <button
              onClick={onOpenEditor}
              className="px-3.5 py-2 text-xs font-medium text-[#2D231C] bg-white border border-[#E8DFD3] rounded-xl hover:bg-[#F5EFE6] transition-colors shadow-2xs whitespace-nowrap"
            >
              Photo Editor & Filters
            </button>
          )}

          {currentRole === 'owner' ? (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-[#B84A2A] rounded-xl hover:bg-[#A33F23] transition-colors shadow-xs whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Link Shared Album</span>
            </button>
          ) : (
            <span className="px-3 py-1.5 rounded-full bg-[#FAF7F2] border border-[#E8DFD3] text-[11px] font-medium text-[#736558]">
              Guest View · Read-Only
            </span>
          )}
        </div>
      </div>

      {/* Proof-of-Concept Zero Hosting Liability Banner */}
      <div className="bg-[#FAF2ED] border border-[#F2C8B5] rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-white border border-[#F2C8B5] text-[#B84A2A] shrink-0 mt-0.5">
            <FolderLock className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#B84A2A]">
                Zero-Hosting-Liability Proof of Concept
              </h2>
              <span className="text-[10px] px-2 py-0.2 bg-white rounded-full text-[#B84A2A] border border-[#F2C8B5] font-semibold">
                Social Bio Ready
              </span>
            </div>
            <p className="text-xs text-[#6C5E53] font-prose-serif leading-relaxed max-w-2xl">
              Family memories open directly in original high-resolution on <strong>Google Photos</strong> (<code className="text-[11px] font-mono text-[#B84A2A]">photos.app.goo.gl</code>) and <strong>Apple iCloud Shared Albums</strong> (<code className="text-[11px] font-mono text-[#B84A2A]">shared.icloud.com</code>). No user files are stored on raw servers, preventing storage costs, moderation risks, and media liability.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
          <span className="text-[11px] font-medium text-[#B84A2A] bg-white px-3 py-1 rounded-full border border-[#F2C8B5]">
            Encrypted Cloud Source
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {['All', 'Google Photos', 'Apple iCloud', 'Favorites'].map((tab) => {
            const isActive = selectedProvider === tab;
            return (
              <button
                key={tab}
                onClick={() => setSelectedProvider(tab)}
                className={`px-3 py-1.5 text-xs font-medium rounded-xl whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-[#2D231C] text-white shadow-xs'
                    : 'bg-white text-[#736558] border border-[#E8DFD3] hover:text-[#2D231C]'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#9E9084]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search family albums..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-[#E8DFD3] rounded-xl text-[#2D231C] focus:outline-none focus:ring-2 focus:ring-[#B84A2A]"
          />
        </div>
      </div>

      {/* Curated Albums Grid */}
      {filteredAlbums.length === 0 ? (
        <div className="bg-white border border-[#E8DFD3] rounded-3xl p-12 text-center space-y-3">
          <Images className="w-10 h-10 mx-auto text-[#B84A2A]/60" />
          <h3 className="font-serif text-lg font-semibold text-[#2D231C]">
            No albums found
          </h3>
          <p className="text-xs text-[#736558] max-w-sm mx-auto">
            Try adjusting your search query, or link a new Google Photos or Apple iCloud album.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-[#B84A2A] rounded-xl hover:bg-[#A33F23] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Link an Album</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAlbums.map((album) => {
            const isGoogle = album.provider === 'Google Photos';
            const isApple = album.provider === 'Apple iCloud';

            return (
              <div
                key={album.id}
                className="group bg-white border border-[#E8DFD3] hover:border-[#C4B29E] rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Album Cover Visual */}
                  <div className="relative aspect-16/10 overflow-hidden bg-[#F2EAE1]">
                    <img
                      src={album.coverImageUrl}
                      alt={album.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                    {/* Platform Badge on Cover */}
                    <div className="absolute top-3 left-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide shadow-md ${
                          isGoogle
                            ? 'bg-[#1A73E8] text-white'
                            : isApple
                            ? 'bg-black text-white'
                            : 'bg-[#B84A2A] text-white'
                        }`}
                      >
                        <span>{album.provider}</span>
                      </span>
                    </div>

                    {/* Favorite and Delete icons */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      <button
                        onClick={() => onToggleFavoriteAlbum(album.id)}
                        className={`p-1.5 rounded-full backdrop-blur-md transition-colors ${
                          album.isFavorite
                            ? 'bg-white text-[#DC2626]'
                            : 'bg-black/40 text-white hover:bg-black/60'
                        }`}
                        title={album.isFavorite ? 'Remove favorite' : 'Mark favorite'}
                      >
                        <Heart
                          className={`w-3.5 h-3.5 ${
                            album.isFavorite ? 'fill-[#DC2626]' : ''
                          }`}
                        />
                      </button>

                      {currentRole === 'owner' && (
                        <button
                          onClick={() => onDeleteSharedAlbum(album.id)}
                          className="p-1.5 rounded-full bg-black/40 text-white hover:bg-[#DC2626] backdrop-blur-md transition-colors opacity-0 group-hover:opacity-100"
                          title="Remove album"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Photo count indicator */}
                    <div className="absolute bottom-3 left-3 text-white text-xs font-medium flex items-center gap-1.5 drop-shadow-sm">
                      <Images className="w-3.5 h-3.5 text-white/90" />
                      <span>{album.photoCount}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-white/80">{album.date}</span>
                    </div>
                  </div>

                  {/* Album Details */}
                  <div className="p-5 space-y-2.5">
                    <h3 className="font-serif text-lg font-bold text-[#2D231C] leading-snug group-hover:text-[#B84A2A] transition-colors">
                      {album.title}
                    </h3>

                    {album.caption && (
                      <p className="text-xs text-[#6C5E53] font-prose-serif leading-relaxed line-clamp-2">
                        {album.caption}
                      </p>
                    )}

                    {album.tags && album.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {album.tags.map((t) => (
                          <span
                            key={t}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-[#FAF7F2] text-[#736558] border border-[#E8DFD3]"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Direct Outbound Cloud Hyperlink Button */}
                <div className="px-5 pb-5 pt-1">
                  <a
                    href={album.albumUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-xs ${
                      isGoogle
                        ? 'bg-[#E8F0FE] hover:bg-[#D2E3FC] text-[#1967D2] border border-[#C2E7FF]'
                        : isApple
                        ? 'bg-[#F5F5F7] hover:bg-[#E8E8ED] text-[#1D1D1F] border border-[#D2D2D7]'
                        : 'bg-[#FAF2ED] hover:bg-[#FBE8DE] text-[#B84A2A] border border-[#F2C8B5]'
                    }`}
                  >
                    <span>Open in {album.provider}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Link New Shared Album Modal */}
      {showAddModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-[#E8DFD3] max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#E8DFD3]">
              <div className="space-y-0.5">
                <h3 className="font-serif text-xl font-bold text-[#2D231C] flex items-center gap-2">
                  <ExternalLink className="w-5 h-5 text-[#B84A2A]" />
                  <span>Link a Cloud Shared Album</span>
                </h3>
                <p className="text-xs text-[#8F7F72]">
                  Add an outbound hyperlink to Google Photos or Apple iCloud.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-[#8F7F72] hover:text-[#2D231C]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAlbum} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#736558] mb-1">
                  Album Title
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Summer at the Lake, Grandkids Birthday..."
                  className="w-full px-3.5 py-2 text-xs bg-[#FAF7F2] border border-[#E0D5C7] rounded-xl text-[#2D231C]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#736558] mb-1">
                    Cloud Provider
                  </label>
                  <select
                    value={newProvider}
                    onChange={(e) => setNewProvider(e.target.value as CuratedSharedAlbum['provider'])}
                    className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E0D5C7] rounded-xl text-[#2D231C]"
                  >
                    <option value="Google Photos">Google Photos (photos.app.goo.gl)</option>
                    <option value="Apple iCloud">Apple iCloud (shared.icloud.com)</option>
                    <option value="Amazon Photos">Amazon Photos</option>
                    <option value="OneDrive">OneDrive / Dropbox</option>
                    <option value="Other">Other Cloud Album</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#736558] mb-1">
                    Approx Photo Count
                  </label>
                  <input
                    type="text"
                    value={newCount}
                    onChange={(e) => setNewCount(e.target.value)}
                    placeholder="e.g. 52 photos"
                    className="w-full px-3.5 py-2 text-xs bg-[#FAF7F2] border border-[#E0D5C7] rounded-xl text-[#2D231C]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#736558] mb-1">
                  Outbound Shared Album URL
                </label>
                <input
                  type="url"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://photos.app.goo.gl/... or https://shared.icloud.com/..."
                  className="w-full px-3.5 py-2 text-xs bg-[#FAF7F2] border border-[#E0D5C7] rounded-xl text-[#2D231C]"
                  required
                />
              </div>

              {/* Cover Photo Selection / URL */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#736558]">
                  Cover Photo Image URL
                </label>
                <input
                  type="url"
                  value={newCover}
                  onChange={(e) => setNewCover(e.target.value)}
                  placeholder="https://images.unsplash.com/... or choose preset below"
                  className="w-full px-3.5 py-2 text-xs bg-[#FAF7F2] border border-[#E0D5C7] rounded-xl text-[#2D231C]"
                />

                <span className="text-[11px] text-[#8F7F72] block pt-1">Or choose a preset theme cover:</span>
                <div className="grid grid-cols-3 gap-2">
                  {coverPresets.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setNewCover(preset.url)}
                      className={`text-left p-1.5 rounded-lg border text-[11px] truncate transition-colors ${
                        newCover === preset.url
                          ? 'border-[#B84A2A] bg-[#FAF2ED] font-semibold text-[#B84A2A]'
                          : 'border-[#E8DFD3] bg-[#FAF7F2] text-[#736558] hover:text-[#2D231C]'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#736558] mb-1">
                  Tender Family Caption
                </label>
                <textarea
                  rows={2}
                  value={newCaption}
                  onChange={(e) => setNewCaption(e.target.value)}
                  placeholder="What makes this collection special?"
                  className="w-full p-2.5 text-xs bg-[#FAF7F2] border border-[#E0D5C7] rounded-xl text-[#2D231C]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E8DFD3]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs text-[#736558]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-medium text-white bg-[#B84A2A] rounded-xl hover:bg-[#A33F23] transition-colors"
                >
                  Link Album
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
