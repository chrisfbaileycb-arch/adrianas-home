import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GalleryPhoto } from '../types';
import { Upload, RotateCw, FlipHorizontal, Download, Save, Undo, Sparkles, Sliders, Eye } from 'lucide-react';

interface EditorViewProps {
  initialPhoto: GalleryPhoto | null;
  onSaveToGallery: (photo: GalleryPhoto) => void;
  galleryPhotos: GalleryPhoto[];
}

export const EditorView: React.FC<EditorViewProps> = ({
  initialPhoto,
  onSaveToGallery,
  galleryPhotos,
}) => {
  const [imageSrc, setImageSrc] = useState<string | null>(initialPhoto ? initialPhoto.dataUrl : null);
  const [imageTitle, setImageTitle] = useState<string>(initialPhoto ? initialPhoto.title : 'My Edited Photo');
  
  // Adjustment controls
  const [warmth, setWarmth] = useState(25); // 0 to 100
  const [brightness, setBrightness] = useState(105); // 50 to 150
  const [contrast, setContrast] = useState(105); // 60 to 140
  const [saturation, setSaturation] = useState(105); // 0 to 180
  const [vignette, setVignette] = useState(15); // 0 to 100
  const [grain, setGrain] = useState(10); // 0 to 50
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  const [flipH, setFlipH] = useState(false);
  const [isComparing, setIsComparing] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const loadedImageRef = useRef<HTMLImageElement | null>(null);

  // If initialPhoto prop changes (e.g. clicked "Edit in Editor" from Gallery)
  useEffect(() => {
    if (initialPhoto) {
      setImageSrc(initialPhoto.dataUrl);
      setImageTitle(`${initialPhoto.title} (Warm)`);
    } else if (!imageSrc && galleryPhotos.length > 0) {
      // Default to first photo if nothing loaded
      setImageSrc(galleryPhotos[0].dataUrl);
      setImageTitle(galleryPhotos[0].title);
    }
  }, [initialPhoto, galleryPhotos]);

  // Load image object whenever source changes
  useEffect(() => {
    if (!imageSrc) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;
    img.onload = () => {
      loadedImageRef.current = img;
      renderCanvas();
    };
  }, [imageSrc]);

  // Redraw canvas with all filters, transformations, and overlays
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const img = loadedImageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isRotatedQuarter = rotation === 90 || rotation === 270;
    const width = isRotatedQuarter ? img.height : img.width;
    const height = isRotatedQuarter ? img.width : img.height;

    canvas.width = width;
    canvas.height = height;

    ctx.save();
    ctx.clearRect(0, 0, width, height);

    // Apply orientation
    ctx.translate(width / 2, height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    if (flipH) {
      ctx.scale(-1, 1);
    }

    if (isComparing) {
      // Raw original without filters
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      ctx.restore();
      return;
    }

    // Filter pipeline: Sepia warmth, brightness, contrast, saturate
    const sepiaVal = warmth / 100;
    const brightVal = brightness / 100;
    const contrastVal = contrast / 100;
    const satVal = saturation / 100;

    ctx.filter = `sepia(${sepiaVal}) brightness(${brightVal}) contrast(${contrastVal}) saturate(${satVal})`;
    ctx.drawImage(img, -img.width / 2, -img.height / 2);
    ctx.restore();

    // 2. Soft Warm Tint Overlay (brings out golden hearth tone)
    if (warmth > 20) {
      ctx.save();
      ctx.globalCompositeOperation = 'soft-light';
      ctx.fillStyle = `rgba(255, 170, 80, ${(warmth - 20) / 250})`;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    }

    // 3. Vignette
    if (vignette > 0) {
      ctx.save();
      const radius = Math.max(width, height) * 0.75;
      const grad = ctx.createRadialGradient(
        width / 2,
        height / 2,
        radius * 0.4,
        width / 2,
        height / 2,
        radius
      );
      grad.addColorStop(0, 'rgba(0,0,0,0)');
      grad.addColorStop(1, `rgba(40, 20, 10, ${vignette / 120})`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    }

    // 4. Subtle Film Grain
    if (grain > 0) {
      ctx.save();
      const grainFactor = grain / 100;
      const step = Math.max(2, Math.floor(width / 350));
      for (let x = 0; x < width; x += step) {
        for (let y = 0; y < height; y += step) {
          if (Math.random() < 0.3) {
            const val = Math.floor(Math.random() * 255);
            ctx.fillStyle = `rgba(${val},${val},${val},${grainFactor * 0.12})`;
            ctx.fillRect(x, y, step, step);
          }
        }
      }
      ctx.restore();
    }
  }, [warmth, brightness, contrast, saturation, vignette, grain, rotation, flipH, isComparing]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setImageSrc(dataUrl);
        setImageTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
        handleReset();
      }
    };
    reader.readAsDataURL(file);
  };

  const handleReset = () => {
    setWarmth(0);
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setVignette(0);
    setGrain(0);
    setRotation(0);
    setFlipH(false);
  };

  const applyPreset = (presetName: string) => {
    switch (presetName) {
      case 'golden':
        setWarmth(45);
        setBrightness(106);
        setContrast(110);
        setSaturation(115);
        setVignette(20);
        setGrain(10);
        break;
      case 'hearth':
        setWarmth(65);
        setBrightness(102);
        setContrast(112);
        setSaturation(110);
        setVignette(28);
        setGrain(18);
        break;
      case 'linen':
        setWarmth(20);
        setBrightness(112);
        setContrast(94);
        setSaturation(88);
        setVignette(10);
        setGrain(8);
        break;
      case 'rose':
        setWarmth(35);
        setBrightness(100);
        setContrast(115);
        setSaturation(105);
        setVignette(35);
        setGrain(15);
        break;
      case 'bw':
        setWarmth(0);
        setBrightness(104);
        setContrast(122);
        setSaturation(0);
        setVignette(25);
        setGrain(22);
        break;
      default:
        handleReset();
    }
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleFlip = () => {
    setFlipH((prev) => !prev);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `${imageTitle.toLowerCase().replace(/\s+/g, '-')}-edited.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleSaveToGallery = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    const newPhoto: GalleryPhoto = {
      id: `photo-${Date.now()}`,
      title: imageTitle.includes('Warm') ? imageTitle : `${imageTitle} (Warm)`,
      dataUrl,
      date: new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date()),
      caption: 'Adjusted with golden warmth.',
      tags: ['Home', 'Favorites'],
      isFavorite: true,
    };

    onSaveToGallery(newPhoto);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-2 sm:py-6">
      
      {/* Header with Title and Unboxed Metadata */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#E8DFD3]">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-[#8F7F72]">
            <span>Canvas Photo Lab</span>
            <span aria-hidden="true">·</span>
            <span>Real-time Warmth & Filters</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#2D231C]">
            Photo Editor
          </h1>
          <p className="text-xs sm:text-sm text-[#736558] font-prose-serif">
            Adjust warmth, gentle vintage grain, and brightness to make every family memory feel cozy.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-[#2D231C] bg-white border border-[#E8DFD3] rounded-lg hover:bg-[#F3ECE2] transition-colors shadow-xs"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload New Photo</span>
          </button>
        </div>
      </div>

      {/* Editor Layout: Main Canvas + Control Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Canvas Display (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[#1C1815] border border-[#3E342D] rounded-2xl p-4 sm:p-6 flex items-center justify-center min-h-[380px] sm:min-h-[460px] relative shadow-inner overflow-hidden">
            <canvas
              ref={canvasRef}
              className="max-w-full max-h-[58vh] object-contain rounded-lg shadow-2xl transition-all"
            />

            {/* Quick hold-to-compare original button */}
            <button
              onMouseDown={() => setIsComparing(true)}
              onMouseUp={() => setIsComparing(false)}
              onMouseLeave={() => setIsComparing(false)}
              onTouchStart={() => setIsComparing(true)}
              onTouchEnd={() => setIsComparing(false)}
              className="absolute bottom-4 left-4 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-black/60 hover:bg-black/80 text-white rounded-lg backdrop-blur-md transition-colors select-none"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{isComparing ? 'Showing Original' : 'Hold to Compare'}</span>
            </button>
          </div>

          {/* Quick Toolbar below canvas */}
          <div className="flex items-center justify-between gap-2 px-2 flex-wrap text-xs text-[#736558]">
            <div className="flex items-center gap-2">
              <button
                onClick={handleRotate}
                title="Rotate 90 degrees"
                className="flex items-center gap-1 px-3 py-1.5 bg-white border border-[#E8DFD3] rounded-lg hover:bg-[#F3ECE2] transition-colors"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Rotate</span>
              </button>
              <button
                onClick={handleFlip}
                title="Flip horizontally"
                className="flex items-center gap-1 px-3 py-1.5 bg-white border border-[#E8DFD3] rounded-lg hover:bg-[#F3ECE2] transition-colors"
              >
                <FlipHorizontal className="w-3.5 h-3.5" />
                <span>Flip</span>
              </button>
              <button
                onClick={handleReset}
                title="Reset all adjustments"
                className="flex items-center gap-1 px-3 py-1.5 text-[#8F7F72] hover:text-[#DC2626] transition-colors"
              >
                <Undo className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-[#2D231C] bg-white border border-[#E8DFD3] rounded-lg hover:bg-[#F3ECE2] transition-colors shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
              <button
                onClick={handleSaveToGallery}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-white bg-[#B84A2A] rounded-lg hover:bg-[#A33F23] transition-colors shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save to Gallery</span>
              </button>
            </div>
          </div>

          {savedSuccess && (
            <div className="p-3 bg-[#EBF7EE] border border-[#C2E7CA] text-[#1E7438] rounded-xl text-xs flex items-center justify-between animate-in fade-in">
              <span>Saved beautifully to your Gallery album!</span>
            </div>
          )}
        </div>

        {/* Right Side: Controls & Warmth Sliders (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-[#E8DFD3] rounded-2xl p-6 space-y-6 shadow-xs">
          
          {/* Quick Presets */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#B84A2A] flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Handcrafted Presets
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'golden', label: 'Golden Hour' },
                { id: 'hearth', label: 'Hearth Glow' },
                { id: 'linen', label: 'Linen Soft' },
                { id: 'rose', label: 'Moody Rose' },
                { id: 'bw', label: 'Classic Film' },
                { id: 'original', label: 'Original' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => applyPreset(p.id)}
                  className="px-2.5 py-2 text-xs font-medium bg-[#FAF7F2] border border-[#E8DFD3] hover:border-[#B84A2A] hover:bg-[#F7EFE6] text-[#4A3E34] rounded-lg transition-colors text-center truncate"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Detailed Fine-Tuning Sliders */}
          <div className="space-y-4 pt-4 border-t border-[#F0E6D9]">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#736558] flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5" />
              Fine-Tune Adjustments
            </span>

            {/* Warmth (Sepia / Golden shift) */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-[#2D231C]">Warmth & Ember</span>
                <span className="font-mono text-[#8F7F72] tabular-nums">{warmth}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="80"
                value={warmth}
                onChange={(e) => setWarmth(Number(e.target.value))}
                className="w-full accent-[#B84A2A] cursor-pointer"
              />
            </div>

            {/* Brightness */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-[#2D231C]">Brightness</span>
                <span className="font-mono text-[#8F7F72] tabular-nums">{brightness}%</span>
              </div>
              <input
                type="range"
                min="60"
                max="140"
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                className="w-full accent-[#B84A2A] cursor-pointer"
              />
            </div>

            {/* Contrast */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-[#2D231C]">Contrast</span>
                <span className="font-mono text-[#8F7F72] tabular-nums">{contrast}%</span>
              </div>
              <input
                type="range"
                min="70"
                max="135"
                value={contrast}
                onChange={(e) => setContrast(Number(e.target.value))}
                className="w-full accent-[#B84A2A] cursor-pointer"
              />
            </div>

            {/* Saturation */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-[#2D231C]">Color Richness</span>
                <span className="font-mono text-[#8F7F72] tabular-nums">{saturation}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="150"
                value={saturation}
                onChange={(e) => setSaturation(Number(e.target.value))}
                className="w-full accent-[#B84A2A] cursor-pointer"
              />
            </div>

            {/* Vignette */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-[#2D231C]">Soft Edge Vignette</span>
                <span className="font-mono text-[#8F7F72] tabular-nums">{vignette}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="70"
                value={vignette}
                onChange={(e) => setVignette(Number(e.target.value))}
                className="w-full accent-[#B84A2A] cursor-pointer"
              />
            </div>

            {/* Film Grain */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-[#2D231C]">Delicate Film Grain</span>
                <span className="font-mono text-[#8F7F72] tabular-nums">{grain}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                value={grain}
                onChange={(e) => setGrain(Number(e.target.value))}
                className="w-full accent-[#B84A2A] cursor-pointer"
              />
            </div>
          </div>

          {/* Quick Photo Switcher from Gallery */}
          {galleryPhotos.length > 1 && (
            <div className="pt-4 border-t border-[#F0E6D9] space-y-2">
              <span className="text-xs text-[#8F7F72]">Choose another photo from Gallery:</span>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {galleryPhotos.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setImageSrc(p.dataUrl);
                      setImageTitle(p.title);
                    }}
                    className="w-12 h-12 rounded-lg overflow-hidden border border-[#E8DFD3] shrink-0 hover:border-[#B84A2A] transition-colors"
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
