import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ScriptureVerse } from '../types';
import { CURATED_DAILY_VERSES } from '../data/dailyScriptures';
import {
  BookOpen,
  Heart,
  Copy,
  Check,
  ChevronRight,
  Volume2,
  VolumeX,
  Share2,
  Sparkles,
  RefreshCw,
  Globe,
  Feather,
} from 'lucide-react';

interface DailyScriptureProps {
  onToggleFavorite?: (verseId: string) => void;
  onExploreAll?: () => void;
  initialVerse?: ScriptureVerse;
  className?: string;
  variant?: 'card' | 'banner' | 'expanded';
}

export const DailyScripture: React.FC<DailyScriptureProps> = ({
  onToggleFavorite,
  onExploreAll,
  initialVerse,
  className = '',
  variant = 'card',
}) => {
  // Format today's calendar date
  const todayDateString = useMemo(() => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date());
  }, []);

  const todayKey = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  // Compute deterministic index for today's curated verse
  const todayCuratedVerse = useMemo(() => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 0);
    const diff = (now.getTime() - startOfYear.getTime()) + ((startOfYear.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
    const index = Math.abs(dayOfYear) % CURATED_DAILY_VERSES.length;
    return CURATED_DAILY_VERSES[index] || CURATED_DAILY_VERSES[0];
  }, []);

  const [activeVerse, setActiveVerse] = useState<ScriptureVerse>(() => initialVerse || todayCuratedVerse);
  const [sourceType, setSourceType] = useState<'daily' | 'online' | 'curated'>('daily');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isFavorite, setIsFavorite] = useState<boolean>(() => activeVerse.isFavorite || false);

  // Sync favorite state if activeVerse changes
  useEffect(() => {
    setIsFavorite(Boolean(activeVerse.isFavorite));
  }, [activeVerse]);

  // Attempt fetching from external Bible API on mount with graceful offline fallback
  useEffect(() => {
    let isCancelled = false;

    async function fetchDailyOnlineVerse() {
      // Check localStorage cache first
      try {
        const cached = localStorage.getItem(`hearth_daily_verse_${todayKey}`);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (!isCancelled && parsed?.verse && parsed?.reference) {
            setActiveVerse(parsed);
            setSourceType('daily');
            return;
          }
        }
      } catch {}

      // Try fetching from public Bible API (Bible-API.com) with timeout
      try {
        setIsLoading(true);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);

        const refToFetch = encodeURIComponent(todayCuratedVerse.reference);
        const res = await fetch(`https://bible-api.com/${refToFetch}?translation=web`, {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (res.ok && !isCancelled) {
          const data = await res.json();
          if (data.text) {
            const cleanText = data.text.replace(/\s+/g, ' ').trim();
            const fetchedVerse: ScriptureVerse = {
              id: `api-${todayKey}`,
              verse: cleanText,
              reference: data.reference || todayCuratedVerse.reference,
              category: todayCuratedVerse.category,
              reflection: todayCuratedVerse.reflection,
              isFavorite: todayCuratedVerse.isFavorite,
            };

            setActiveVerse(fetchedVerse);
            setSourceType('daily');
            try {
              localStorage.setItem(`hearth_daily_verse_${todayKey}`, JSON.stringify(fetchedVerse));
            } catch {}
          }
        }
      } catch (err) {
        // Fallback transparently to curated local collection
        if (!isCancelled) {
          setActiveVerse(todayCuratedVerse);
          setSourceType('curated');
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    if (!initialVerse) {
      fetchDailyOnlineVerse();
    }

    return () => {
      isCancelled = true;
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [todayKey, todayCuratedVerse, initialVerse]);

  // Cycle to next verse
  const handleNextVerse = useCallback(() => {
    const currentIndex = CURATED_DAILY_VERSES.findIndex((v) => v.id === activeVerse.id);
    const nextIndex = (currentIndex + 1) % CURATED_DAILY_VERSES.length;
    const nextVerse = CURATED_DAILY_VERSES[nextIndex];
    setActiveVerse(nextVerse);
    setSourceType('curated');

    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [activeVerse.id]);

  // Copy verse quote
  const handleCopyQuote = useCallback(() => {
    const quote = `“${activeVerse.verse}”\n— ${activeVerse.reference}\n\nHearth Sanctuary`;
    navigator.clipboard.writeText(quote);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [activeVerse]);

  // Share verse quote
  const handleShareQuote = useCallback(() => {
    const quote = `“${activeVerse.verse}” — ${activeVerse.reference}`;
    if (navigator.share) {
      navigator.share({
        title: `Scripture for Today: ${activeVerse.reference}`,
        text: quote,
        url: window.location.href,
      }).catch(() => {});
    } else {
      handleCopyQuote();
    }
  }, [activeVerse, handleCopyQuote]);

  // Text to speech playback
  const handleToggleSpeak = useCallback(() => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const textToRead = `${activeVerse.verse}. From ${activeVerse.reference}.`;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;

    // Pick a natural English voice if available
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(
      (v) => (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha')) && v.lang.startsWith('en')
    );
    if (naturalVoice) utterance.voice = naturalVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [activeVerse, isSpeaking]);

  // Toggle favorite
  const handleToggleFav = useCallback(() => {
    setIsFavorite((prev) => !prev);
    if (onToggleFavorite) {
      onToggleFavorite(activeVerse.id);
    }
  }, [activeVerse.id, onToggleFavorite]);

  // Category Theme Badges
  const categoryStyles: Record<string, { bg: string; text: string; border: string }> = {
    Peace: { bg: 'bg-[#F2F7F4]', text: 'text-[#2D6A4F]', border: 'border-[#D1E7DD]' },
    Strength: { bg: 'bg-[#FAF4EB]', text: 'text-[#9A5B18]', border: 'border-[#F1DFC6]' },
    Rest: { bg: 'bg-[#F0F5FA]', text: 'text-[#265B88]', border: 'border-[#CFE2F3]' },
    Comfort: { bg: 'bg-[#FAF2ED]', text: 'text-[#B84A2A]', border: 'border-[#F2C8B5]' },
    'Family & Love': { bg: 'bg-[#FAF0F4]', text: 'text-[#9A3563]', border: 'border-[#F4D1E1]' },
    Gratitude: { bg: 'bg-[#F6F8EE]', text: 'text-[#5B701B]', border: 'border-[#DEE8BD]' },
  };

  const style = categoryStyles[activeVerse.category] || categoryStyles.Peace;

  return (
    <section
      aria-label="Daily Scripture"
      className={`bg-white border border-[#E8DFD3] rounded-3xl p-6 sm:p-9 shadow-xs relative overflow-hidden transition-all duration-300 ${className}`}
    >
      {/* Decorative Warm Side Accent Bar */}
      <div className="absolute top-0 left-0 w-1.5 h-full bg-[#B84A2A]" />

      <div className="space-y-5">
        
        {/* Top Header Row with Date, Category Badge, and Source Pill */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold uppercase tracking-wider text-[#B84A2A] text-[11px] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Verse of the Day</span>
            </span>
            <span className="text-[#C4B5A5]" aria-hidden="true">·</span>
            <span className="text-[#7D6E62]">{todayDateString}</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Category Pill */}
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${style.bg} ${style.text} ${style.border}`}
            >
              {activeVerse.category}
            </span>

            {/* Online / Curated Tag */}
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-[#8F7F72] bg-[#FAF7F2] px-2 py-0.5 rounded-full border border-[#EFE5D8]">
              <Globe className="w-2.5 h-2.5 text-[#B84A2A]" />
              <span>{sourceType === 'online' ? 'Online Feed' : 'Curated Sanctum'}</span>
            </span>
          </div>
        </div>

        {/* The Scripture Verse Blockquote */}
        <div className="space-y-3 py-1">
          <blockquote className="font-serif text-2xl sm:text-3xl text-[#2B211A] leading-relaxed italic font-normal selection:bg-[#F2D7CA]">
            “{activeVerse.verse}”
          </blockquote>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <cite className="not-italic font-serif text-base sm:text-lg font-semibold text-[#665649] tracking-wide">
              — {activeVerse.reference}
            </cite>
            {activeVerse.reflection && (
              <>
                <span className="text-[#D1C2B2]" aria-hidden="true">·</span>
                <span className="text-xs sm:text-sm text-[#7D6E62] font-prose-serif italic leading-relaxed">
                  {activeVerse.reflection}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Action Controls Bar */}
        <div className="pt-2 border-t border-[#F3ECE2] flex flex-wrap items-center justify-between gap-3">
          
          {/* Audio Reader & Quote Utilities */}
          <div className="flex items-center gap-2">
            
            {/* Audio Listen Button */}
            <button
              type="button"
              onClick={handleToggleSpeak}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border transition-all ${
                isSpeaking
                  ? 'bg-[#B84A2A] text-white border-[#B84A2A] shadow-xs'
                  : 'bg-[#FAF7F2] text-[#4A3E34] border-[#E8DFD3] hover:bg-[#F3ECE2]'
              }`}
              title={isSpeaking ? 'Stop listening' : 'Listen to this verse in a gentle voice'}
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="w-3.5 h-3.5" />
                  <span>Speaking...</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-[#B84A2A]" />
                  <span>Listen</span>
                </>
              )}
            </button>

            {/* Copy Quote Button */}
            <button
              type="button"
              onClick={handleCopyQuote}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-[#4A3E34] bg-[#FAF7F2] border border-[#E8DFD3] rounded-xl hover:bg-[#F3ECE2] transition-colors"
              title="Copy verse to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#059669]" />
                  <span className="text-[#059669]">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#736558]" />
                  <span className="hidden sm:inline">Copy</span>
                </>
              )}
            </button>

            {/* Bookmark / Favorite */}
            <button
              type="button"
              onClick={handleToggleFav}
              className={`p-2 border rounded-xl transition-all ${
                isFavorite
                  ? 'bg-[#FAF2ED] text-[#B84A2A] border-[#F2C8B5]'
                  : 'bg-[#FAF7F2] text-[#736558] border-[#E8DFD3] hover:text-[#B84A2A]'
              }`}
              title={isFavorite ? 'Bookmarked in your library' : 'Bookmark this verse'}
            >
              <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
            </button>

            {/* Share Verse */}
            <button
              type="button"
              onClick={handleShareQuote}
              className="p-2 bg-[#FAF7F2] text-[#736558] border border-[#E8DFD3] rounded-xl hover:text-[#2D231C] hover:bg-[#F3ECE2] transition-colors"
              title="Share verse"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Right Navigation Controls */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Another Verse / Cycle Button */}
            <button
              type="button"
              onClick={handleNextVerse}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-[#2D231C] bg-[#FAF7F2] border border-[#E2D4C3] rounded-xl hover:bg-[#F3ECE2] transition-colors disabled:opacity-50"
              title="Read another steadying verse"
            >
              <RefreshCw className={`w-3 h-3 text-[#B84A2A] ${isLoading ? 'animate-spin' : ''}`} />
              <span>Another Verse</span>
            </button>

            {/* Explore Scripture Library CTA */}
            {onExploreAll && (
              <button
                type="button"
                onClick={onExploreAll}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-white bg-[#B84A2A] rounded-xl hover:bg-[#A33F23] transition-colors shadow-xs"
              >
                <span>Scripture Library</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

      </div>
    </section>
  );
};
