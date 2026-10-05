import React, { useState, useRef, useEffect } from 'react';
import { GalleryPhoto } from '../types';
import {
  Download,
  RotateCw,
  Sliders,
  Sparkles,
  Save,
  Undo2,
  Image as ImageIcon,
} from 'lucide-react';

interface EditorViewProps {
  initialPhoto?: GalleryPhoto | null;
  onSaveToGallery?: (photo: GalleryPhoto) => void;
  galleryPhotos?: GalleryPhoto[];
}

export const EditorView: React.FC<EditorViewProps> = ({
  initialPhoto,
  onSaveToGallery,
  galleryPhotos = [],
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [activePhoto, setActivePhoto] = useState<GalleryPhoto>(
    initialPhoto || galleryPhotos[0] || {
      id: 'default-edit',
      title: 'Hearthside Warmth',
      dataUrl:
        'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1000&q=80',
      date: 'Today',
      isFavorite: false,
    }
  );

  // Filters
  const [warmth, setWarmth] = useState(25);
  const [brightness, setBrightness] = useState(105);
  const [contrast, setContrast] = useState(105);
  const [sepia, setSepia] = useState(20);
  const [saturation, setSaturation] = useState(110);
  const [rotation, setRotation] = useState(0);

  // Apply filters to canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = activePhoto.dataUrl;

    img.onload = () => {
      canvas.width = img.naturalWidth || 800;
      canvas.height = img.naturalHeight || 600;

      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Translation for rotation
      if (rotation % 360 !== 0) {
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);
      }

      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) sepia(${sepia}%) saturate(${saturation}%)`;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Golden Warmth overlay
      if (warmth > 0) {
        ctx.fillStyle = `rgba(235, 140, 52, ${warmth / 250})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.restore();
    };
  }, [activePhoto, warmth, brightness, contrast, sepia, saturation, rotation]);

  const handleApplyPreset = (preset: 'golden' | 'linen' | 'film' | 'reset') => {
    if (preset === 'golden') {
      setWarmth(40);
      setBrightness(108);
      setContrast(110);
      setSepia(30);
      setSaturation(115);
    } else if (preset === 'linen') {
      setWarmth(20);
      setBrightness(105);
      setContrast(95);
      setSepia(15);
      setSaturation(90);
    } else if (preset === 'film') {
      setWarmth(30);
      setBrightness(102);
      setContrast(120);
      setSepia(25);
      setSaturation(105);
    } else {
      setWarmth(0);
      setBrightness(100);
      setContrast(100);
      setSepia(0);
      setSaturation(100);
      setRotation(0);
    }
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `hearth-photo-${Date.now()}.jpg`;
    link.href = canvas.toDataURL('image/jpeg', 0.92);
    link.click();
  };

  const handleSaveToSanctuary = () => {
    const canvas = canvasRef.current;
    if (!canvas || !onSaveToGallery) return;

    const edited: GalleryPhoto = {
      id: `photo-edited-${Date.now()}`,
      title: `${activePhoto.title} (Warmth Edition)`,
      dataUrl: canvas.toDataURL('image/jpeg', 0.9),
      date: 'Recently Edited',
      tags: ['Edited', 'Warmth'],
      isFavorite: true,
    };
    onSaveToGallery(edited);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-2 sm:py-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#E8DFD3]">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-[#8F7F72]">
            <span>Gentle Tone Lab</span>
            <span aria-hidden="true">·</span>
            <span>Zero Compression</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#2D231C]">
            Photo Warmth & Canvas Editor
          </h1>
          <p className="text-xs sm:text-sm text-[#736558] font-prose-serif">
            Infuse your family photos with golden warmth, soft linen glow, and analog film softness.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onSaveToGallery && (
            <button
              onClick={handleSaveToSanctuary}
              className="flex items-center gap-1.5 px-3 py-2 bg-white text-[#2D231C] border border-[#E8DFD3] text-xs font-medium rounded-xl hover:border-[#B84A2A] hover:text-[#B84A2A] transition-colors shadow-2xs"
            >
              <Save className="w-3.5 h-3.5 text-[#B84A2A]" />
              <span>Save Copy to Sanctuary</span>
            </button>
          )}

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#B84A2A] text-white text-xs font-medium rounded-xl hover:bg-[#A33F23] transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download JPEG</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Canvas Display */}
        <div className="lg:col-span-2 bg-white border border-[#E8DFD3] rounded-3xl p-6 shadow-xs flex flex-col items-center justify-center min-h-[420px] overflow-hidden">
          <canvas
            ref={canvasRef}
            className="max-h-[500px] w-auto max-w-full rounded-2xl shadow-sm object-contain"
          />
        </div>

        {/* Adjustments Panel */}
        <div className="bg-white border border-[#E8DFD3] rounded-3xl p-6 shadow-xs space-y-6">
          
          {/* Presets */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-[#2D231C] uppercase tracking-wider block">
              Warmth Presets
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleApplyPreset('golden')}
                className="p-2.5 text-xs font-medium rounded-xl bg-[#FAF2ED] text-[#B84A2A] border border-[#F2C8B5] hover:bg-[#FBE4D8] transition-colors text-left"
              >
                Golden Hour
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('linen')}
                className="p-2.5 text-xs font-medium rounded-xl bg-[#FAF7F2] text-[#4A3E34] border border-[#E8DFD3] hover:bg-[#F3ECE2] transition-colors text-left"
              >
                Linen Soft
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('film')}
                className="p-2.5 text-xs font-medium rounded-xl bg-[#FAF7F2] text-[#4A3E34] border border-[#E8DFD3] hover:bg-[#F3ECE2] transition-colors text-left"
              >
                Vintage Film
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('reset')}
                className="p-2.5 text-xs font-medium rounded-xl bg-white text-[#736558] border border-[#E8DFD3] hover:bg-[#FAF7F2] transition-colors text-left flex items-center justify-between"
              >
                <span>Reset</span>
                <Undo2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Sliders */}
          <div className="space-y-4 pt-2 border-t border-[#F0E6D9]">
            
            <div>
              <div className="flex justify-between text-xs font-medium text-[#2D231C] mb-1">
                <span>Warm Amber Tint</span>
                <span className="font-mono text-[#B84A2A]">+{warmth}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="80"
                value={warmth}
                onChange={(e) => setWarmth(Number(e.target.value))}
                className="w-full accent-[#B84A2A]"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-[#2D231C] mb-1">
                <span>Brightness</span>
                <span className="font-mono">{brightness}%</span>
              </div>
              <input
                type="range"
                min="70"
                max="140"
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                className="w-full accent-[#B84A2A]"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-[#2D231C] mb-1">
                <span>Contrast</span>
                <span className="font-mono">{contrast}%</span>
              </div>
              <input
                type="range"
                min="70"
                max="140"
                value={contrast}
                onChange={(e) => setContrast(Number(e.target.value))}
                className="w-full accent-[#B84A2A]"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-[#2D231C] mb-1">
                <span>Sepia Nostalgia</span>
                <span className="font-mono">{sepia}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                value={sepia}
                onChange={(e) => setSepia(Number(e.target.value))}
                className="w-full accent-[#B84A2A]"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-[#2D231C] mb-1">
                <span>Saturation</span>
                <span className="font-mono">{saturation}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="150"
                value={saturation}
                onChange={(e) => setSaturation(Number(e.target.value))}
                className="w-full accent-[#B84A2A]"
              />
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setRotation((r) => r + 90)}
                className="w-full py-2 bg-[#FAF7F2] text-[#2D231C] border border-[#E8DFD3] rounded-xl text-xs font-medium hover:bg-[#F3ECE2] transition-colors flex items-center justify-center gap-1.5"
              >
                <RotateCw className="w-3.5 h-3.5 text-[#B84A2A]" />
                <span>Rotate 90°</span>
              </button>
            </div>

          </div>

          {/* Source Selector */}
          {galleryPhotos.length > 1 && (
            <div className="pt-2 border-t border-[#F0E6D9] space-y-2">
              <span className="text-xs font-semibold text-[#2D231C] uppercase tracking-wider block">
                Choose Canvas Photo
              </span>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {galleryPhotos.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setActivePhoto(p)}
                    className={`w-14 h-14 rounded-xl overflow-hidden border shrink-0 transition-all ${
                      activePhoto.id === p.id
                        ? 'ring-2 ring-[#B84A2A] border-[#B84A2A]'
                        : 'border-[#E8DFD3] opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img src={p.dataUrl} alt={p.title} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
