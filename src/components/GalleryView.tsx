import React, { useState, useRef } from 'react';
import { GalleryPhoto } from '../types';
import { Heart, Upload, Sliders, Trash2, X, Download, ZoomIn, Image as ImageIcon } from 'lucide-react';

interface GalleryViewProps {
  photos: GalleryPhoto[];
  onAddPhotos: (newPhotos: GalleryPhoto[]) => void;
  onToggleFavorite: (id: string) => void;
  onDeletePhoto: (id: string) => void;
  onEditPhotoInCanvas: (photo: GalleryPhoto) => void;
}

export const GalleryView: React.FC<GalleryViewProps> = ({
  photos,
  onAddPhotos,
  onToggleFavorite,
  onDeletePhoto,
  onEditPhotoInCanvas,
}) => {
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [activeLightbox, setActiveLightbox] = useState<GalleryPhoto | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const loadedPhotos: GalleryPhoto[] = [];
    const filesArray = Array.from(files);

    let processedCount = 0;
    filesArray.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (dataUrl) {
          loadedPhotos.push({
            id: `photo-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            title: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
            dataUrl,
            date: new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date()),
            caption: 'A cherished memory saved to Adriana\'s.',
            tags: ['Family'],
            isFavorite: false,
          });
        }
        processedCount++;
        if (processedCount === filesArray.length) {
          onAddPhotos(loadedPhotos);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const allTags = ['All', 'Favorites', ...Array.from(new Set(photos.flatMap((p) => p.tags)))];

  const filteredPhotos = photos.filter((photo) => {
    if (selectedTag === 'All') return true;
    if (selectedTag === 'Favorites') return photo.isFavorite;
    return photo.tags.includes(selectedTag);
  });

  const handleDownload = (photo: GalleryPhoto) => {
    const a = document.createElement('a');
    a.href = photo.dataUrl;
    a.download = `${photo.title.toLowerCase().replace(/\s+/g, '-')}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-2 sm:py-6">
      
      {/* Header with Title and Unboxed Metadata */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#E8DFD3]">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-[#8F7F72]">
            <span>{photos.length} Memories</span>
            <span aria-hidden="true">·</span>
            <span>Saved Safely on This Device</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#2D231C]">
            Gallery
          </h1>
          <p className="text-xs sm:text-sm text-[#736558] font-prose-serif">
            The faces and moments you love, all in one warm place.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            multiple
            className="hidden"
            id="gallery-file-input"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-[#B84A2A] rounded-lg hover:bg-[#A33F23] transition-colors shadow-xs whitespace-nowrap"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Add Photos</span>
          </button>
        </div>
      </div>

      {/* Tag Filters (Segmented Buttons) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => setSelectedTag(tag)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
              selectedTag === tag
                ? 'bg-[#2D231C] text-white shadow-xs'
                : 'bg-white text-[#6E5F53] border border-[#E8DFD3] hover:border-[#C4B29E]'
            }`}
          >
            {tag === 'Favorites' ? '★ Favorites' : tag}
          </button>
        ))}
      </div>

      {/* Photo Grid */}
      {filteredPhotos.length === 0 ? (
        <div className="bg-white border border-[#E8DFD3] rounded-2xl p-12 text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-[#FAF7F2] flex items-center justify-center text-[#B84A2A]">
            <ImageIcon className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-xl font-medium text-[#2D231C]">
            No photos found in this view
          </h3>
          <p className="text-xs text-[#736558] max-w-sm mx-auto">
            Add cherished snapshots from your phone or computer to build your family gallery.
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-[#B84A2A] rounded-lg hover:bg-[#A33F23] transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Choose photos to add</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPhotos.map((photo) => (
            <div
              key={photo.id}
              className="group bg-white border border-[#E8DFD3] rounded-2xl overflow-hidden hover:border-[#C4B29E] transition-all shadow-xs flex flex-col"
            >
              {/* Image Frame */}
              <div
                className="relative aspect-4/3 bg-[#F3ECE2] overflow-hidden cursor-pointer"
                onClick={() => setActiveLightbox(photo)}
              >
                <img
                  src={photo.dataUrl}
                  alt={photo.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                />
                
                {/* Floating Quick Action Overlay */}
                <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(photo.id);
                    }}
                    title={photo.isFavorite ? 'Unfavorite' : 'Mark Favorite'}
                    className={`p-1.5 rounded-full backdrop-blur-md transition-all ${
                      photo.isFavorite
                        ? 'bg-[#B84A2A] text-white'
                        : 'bg-white/80 text-[#55473C] hover:bg-white'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${photo.isFavorite ? 'fill-current' : ''}`} />
                  </button>
                </div>

                <div className="absolute bottom-2.5 left-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="px-2 py-1 text-[11px] font-medium bg-black/60 text-white backdrop-blur-sm rounded-md flex items-center gap-1">
                    <ZoomIn className="w-3 h-3" />
                    <span>View</span>
                  </span>
                </div>
              </div>

              {/* Photo Details */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-[#8F7F72]">
                    <span>{photo.date}</span>
                    <span className="text-[#8F7F72]">
                      {photo.tags.join(' · ')}
                    </span>
                  </div>
                  <h3 className="font-serif text-base font-semibold text-[#2D231C] truncate">
                    {photo.title}
                  </h3>
                  {photo.caption && (
                    <p className="text-xs text-[#736558] line-clamp-2 font-prose-serif italic">
                      {photo.caption}
                    </p>
                  )}
                </div>

                {/* Card Actions */}
                <div className="pt-2 border-t border-[#F5ECE1] flex items-center justify-between">
                  <button
                    onClick={() => onEditPhotoInCanvas(photo)}
                    className="flex items-center gap-1 text-xs font-medium text-[#B84A2A] hover:text-[#8C341A] transition-colors"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Open in Editor</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDownload(photo)}
                      title="Download photo"
                      className="p-1 text-[#8F7F72] hover:text-[#2D231C] transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeletePhoto(photo.id)}
                      title="Delete photo"
                      className="p-1 text-[#8F7F72] hover:text-[#DC2626] transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {activeLightbox && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200"
          onClick={() => setActiveLightbox(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-hidden flex flex-col md:flex-row shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Lightbox Media Container */}
            <div className="bg-[#181512] flex items-center justify-center p-2 md:w-3/5 min-h-[300px] md:min-h-[480px]">
              <img
                src={activeLightbox.dataUrl}
                alt={activeLightbox.title}
                className="max-h-[75vh] w-auto max-w-full object-contain rounded-lg"
              />
            </div>

            {/* Lightbox Metadata & Actions Pane */}
            <div className="p-6 md:w-2/5 flex flex-col justify-between space-y-6 bg-white overflow-y-auto">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-[#8F7F72]">
                    <span>{activeLightbox.date}</span>
                    <span aria-hidden="true">·</span>
                    <span>{activeLightbox.tags.join(', ')}</span>
                  </div>
                  <button
                    onClick={() => setActiveLightbox(null)}
                    className="p-1 text-[#8F7F72] hover:text-[#2D231C] rounded-full hover:bg-[#F3ECE2] transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-2">
                  <h2 className="font-serif text-2xl font-bold text-[#2D231C]">
                    {activeLightbox.title}
                  </h2>
                  {activeLightbox.caption && (
                    <p className="text-sm text-[#6C5E53] font-prose-serif leading-relaxed italic">
                      “{activeLightbox.caption}”
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-3 pt-6 border-t border-[#E8DFD3]">
                <button
                  onClick={() => {
                    const target = activeLightbox;
                    setActiveLightbox(null);
                    onEditPhotoInCanvas(target);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-medium text-white bg-[#B84A2A] rounded-xl hover:bg-[#A33F23] transition-colors shadow-xs"
                >
                  <Sliders className="w-4 h-4" />
                  <span>Edit in Photo Editor</span>
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownload(activeLightbox)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium text-[#4A3E34] bg-[#FAF7F2] border border-[#E8DFD3] rounded-xl hover:bg-[#F3ECE2] transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                  <button
                    onClick={() => {
                      onToggleFavorite(activeLightbox.id);
                      setActiveLightbox({
                        ...activeLightbox,
                        isFavorite: !activeLightbox.isFavorite,
                      });
                    }}
                    className={`px-3 py-2 text-xs font-medium border rounded-xl transition-colors flex items-center gap-1.5 ${
                      activeLightbox.isFavorite
                        ? 'bg-[#FBECE6] text-[#B84A2A] border-[#F2C8B5]'
                        : 'bg-[#FAF7F2] text-[#4A3E34] border-[#E8DFD3]'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${activeLightbox.isFavorite ? 'fill-current' : ''}`} />
                    <span>{activeLightbox.isFavorite ? 'Favorited' : 'Favorite'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
