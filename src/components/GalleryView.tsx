import React, { useState } from 'react';
import { CuratedSharedAlbum, UserRole } from '../types';
import {
  ExternalLink,
  Plus,
  Heart,
  Trash2,
  ShieldCheck,
  Images,
  Sliders,
  X,
} from 'lucide-react';

interface GalleryViewProps {
  sharedAlbums: CuratedSharedAlbum[];
  onAddSharedAlbum: (album: Omit<CuratedSharedAlbum, 'id'>) => void;
  onToggleFavoriteAlbum: (id: string) => void;
  onDeleteSharedAlbum: (id: string) => void;
  onOpenEditor: () => void;
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
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [provider, setProvider] = useState<CuratedSharedAlbum['provider']>('Google Photos');
  const [albumUrl, setAlbumUrl] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [caption, setCaption] = useState('');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !albumUrl.trim()) return;

    onAddSharedAlbum({
      title: title.trim(),
      provider,
      albumUrl: albumUrl.trim(),
      coverImageUrl:
        coverImageUrl.trim() ||
        'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=800&q=80',
      photoCount: 'Album Link',
      date: 'Recent Memories',
      caption: caption.trim() || undefined,
      isFavorite: false,
    });

    setTitle('');
    setAlbumUrl('');
    setCoverImageUrl('');
    setCaption('');
    setShowAddModal(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-2 sm:py-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#E8DFD3]">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-[#8F7F72]">
            <span className="text-[#059669] font-medium flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Zero-Liability Cloud Albums</span>
            </span>
            <span aria-hidden="true">·</span>
            <span>Google Photos & Apple iCloud</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#2D231C]">
            Family Albums & Memories
          </h1>
          <p className="text-xs sm:text-sm text-[#736558] font-prose-serif max-w-xl">
            Direct sovereign links to your family’s shared Google Photos and iCloud albums. No storage fees, compression, or privacy compromises.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {currentRole === 'owner' && (
            <>
              <button
                onClick={onOpenEditor}
                className="flex items-center gap-1.5 px-3 py-2 bg-white text-[#2D231C] border border-[#E8DFD3] text-xs font-medium rounded-xl hover:border-[#B84A2A] hover:text-[#B84A2A] transition-colors shadow-2xs"
              >
                <Sliders className="w-3.5 h-3.5 text-[#B84A2A]" />
                <span>Photo Editor</span>
              </button>

              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#B84A2A] text-white text-xs font-medium rounded-xl hover:bg-[#A33F23] transition-colors shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Album Link</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Grid of Albums */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sharedAlbums.map((album) => (
          <div
            key={album.id}
            className="group bg-white border border-[#E8DFD3] rounded-3xl overflow-hidden shadow-xs hover:border-[#C4B29E] transition-all flex flex-col justify-between"
          >
            <div>
              {/* Cover Image */}
              <div className="relative aspect-4/3 overflow-hidden bg-[#FAF7F2]">
                <img
                  src={album.coverImageUrl}
                  alt={album.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Platform Badge */}
                <span className="absolute top-3 left-3 px-2.5 py-1 text-[10px] font-bold text-white bg-black/60 backdrop-blur-xs rounded-full shadow-2xs">
                  {album.provider}
                </span>

                {/* Bookmark Favorite */}
                <button
                  type="button"
                  onClick={() => onToggleFavoriteAlbum(album.id)}
                  className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-colors shadow-2xs ${
                    album.isFavorite
                      ? 'bg-white text-[#B84A2A]'
                      : 'bg-black/40 text-white hover:bg-white hover:text-[#B84A2A]'
                  }`}
                  title={album.isFavorite ? 'Bookmarked' : 'Bookmark album'}
                >
                  <Heart className={`w-3.5 h-3.5 ${album.isFavorite ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Album Info */}
              <div className="p-5 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-[#8F7F72]">
                  <span>{album.date}</span>
                  {album.photoCount && <span>{album.photoCount} photos</span>}
                </div>

                <h3 className="font-serif text-lg font-semibold text-[#2D231C] leading-snug group-hover:text-[#B84A2A] transition-colors">
                  {album.title}
                </h3>

                {album.caption && (
                  <p className="text-xs text-[#736558] font-prose-serif line-clamp-2 italic">
                    {album.caption}
                  </p>
                )}
              </div>
            </div>

            {/* Footer Outbound Link */}
            <div className="px-5 pb-5 pt-2 flex items-center justify-between border-t border-[#F5ECE1]">
              <a
                href={album.albumUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs font-semibold text-[#B84A2A] hover:underline"
              >
                <span>Open in {album.provider}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              {currentRole === 'owner' && (
                <button
                  onClick={() => onDeleteSharedAlbum(album.id)}
                  className="text-[#BDB0A2] hover:text-[#DC2626] p-1 transition-colors"
                  title="Remove album link"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

          </div>
        ))}
      </div>

      {/* Add Shared Album Modal */}
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
                Add Shared Cloud Album Link
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
                  Album Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Summer Family Cabin Trip"
                  className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E0D5C7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B84A2A]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#736558] mb-1">
                  Cloud Platform
                </label>
                <select
                  value={provider}
                  onChange={(e) => setProvider(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E0D5C7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B84A2A]"
                >
                  <option value="Google Photos">Google Photos</option>
                  <option value="Apple iCloud">Apple iCloud</option>
                  <option value="Dropbox">Dropbox</option>
                  <option value="OneDrive">OneDrive</option>
                  <option value="Family Vault">Other Direct Link</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#736558] mb-1">
                  Shared Album URL
                </label>
                <input
                  type="url"
                  value={albumUrl}
                  onChange={(e) => setAlbumUrl(e.target.value)}
                  placeholder="https://photos.app.goo.gl/..."
                  className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E0D5C7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B84A2A]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#736558] mb-1">
                  Cover Image URL (Optional preview image)
                </label>
                <input
                  type="url"
                  value={coverImageUrl}
                  onChange={(e) => setCoverImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E0D5C7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B84A2A]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#736558] mb-1">
                  Short Caption / Occasion
                </label>
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Memories by the lake..."
                  className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E0D5C7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B84A2A]"
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
                  Save Album
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
