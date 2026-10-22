import React, { useState, useEffect } from 'react';
import {
  Search,
  ClipboardPaste,
  Sparkles,
  ArrowRight,
  Layers,
  X,
  PlayCircle,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Platform } from '../types';
import { translations } from '../translations';
import { AnimatedLoopingHeading } from './AnimatedLoopingHeading';

interface HeroInputProps {
  url: string;
  setUrl: (url: string) => void;
  onSubmit: (targetUrl?: string) => void;
  isLoading: boolean;
  lang: 'en' | 'bn';
  batchMode: boolean;
  setBatchMode: (mode: boolean) => void;
  batchUrls: string;
  setBatchUrls: (urls: string) => void;
  onBatchSubmit: () => void;
  error?: string | null;
}

export const HeroInput: React.FC<HeroInputProps> = ({
  url,
  setUrl,
  onSubmit,
  isLoading,
  lang,
  batchMode,
  setBatchMode,
  batchUrls,
  setBatchUrls,
  onBatchSubmit,
  error,
}) => {
  const t = translations[lang];
  const [detectedPlatform, setDetectedPlatform] = useState<Platform | null>(null);

  // Auto-detect platform from current URL
  useEffect(() => {
    const trimmed = url.trim().toLowerCase();
    if (!trimmed) {
      setDetectedPlatform(null);
    } else if (trimmed.includes('tiktok.com')) {
      setDetectedPlatform('tiktok');
    } else if (trimmed.includes('instagram.com')) {
      setDetectedPlatform('instagram');
    } else if (trimmed.includes('youtube.com') || trimmed.includes('youtu.be')) {
      setDetectedPlatform('youtube');
    } else if (trimmed.includes('facebook.com') || trimmed.includes('fb.watch')) {
      setDetectedPlatform('facebook');
    } else {
      setDetectedPlatform('general');
    }
  }, [url]);

  const handlePaste = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setUrl(text.trim());
        }
      }
    } catch (err) {
      console.warn('Clipboard read error:', err);
    }
  };

  const platformBadgeDetails = {
    tiktok: { label: 'TikTok Reel', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' },
    instagram: { label: 'Instagram Reel', color: 'text-pink-400 bg-pink-500/10 border-pink-500/30' },
    youtube: { label: 'YouTube Short', color: 'text-red-400 bg-red-500/10 border-red-500/30' },
    facebook: { label: 'Facebook Reel', color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
    general: { label: 'Video Link', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pt-6 pb-4">
      {/* Hero Header Typography */}
      <div className="text-center space-y-3 mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 border border-rose-500/20 text-rose-300 shadow-sm shadow-rose-500/10">
          <Sparkles className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
          <span>{t.heroTag}</span>
        </div>

        {/* Looping Word-By-Word Animated Headline */}
        <AnimatedLoopingHeading text={t.heroHeading} />

        <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto font-normal">
          {t.heroSubheading}
        </p>
      </div>

      {/* Mode Switcher Toggle with 3D button interactions */}
      <div className="flex justify-center mb-4">
        <div className="inline-flex p-1 bg-slate-900/90 border border-slate-800 rounded-xl text-xs font-medium shadow-lg shadow-black/40">
          <button
            onClick={() => setBatchMode(false)}
            className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer btn-3d ${
              !batchMode
                ? 'bg-rose-500 text-white font-semibold shadow-md shadow-rose-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t.singleMode}
          </button>
          <button
            onClick={() => setBatchMode(true)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer btn-3d ${
              batchMode
                ? 'bg-rose-500 text-white font-semibold shadow-md shadow-rose-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{t.batchMode}</span>
          </button>
        </div>
      </div>

      {/* Input Stage Card with 3D Depth & Tilt */}
      <div className="relative rounded-2xl bg-slate-900/90 border border-slate-800 p-2 sm:p-3 shadow-2xl shadow-black/70 backdrop-blur-md tilt-card-3d">
        {!batchMode ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit();
            }}
            className="flex flex-col sm:flex-row items-center gap-2"
          >
            <div className="relative flex-1 w-full flex items-center">
              <Search className="w-5 h-5 text-slate-500 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={t.inputPlaceholder}
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                inputMode="url"
                className="w-full pl-11 pr-24 py-3.5 bg-slate-950/80 border border-slate-800/80 rounded-xl text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none focus:border-rose-500/60 focus:ring-1 focus:ring-rose-500/40 transition-all font-mono"
              />

              {/* Action buttons inside input */}
              <div className="absolute right-2.5 flex items-center gap-1.5">
                {url ? (
                  <button
                    type="button"
                    onClick={() => setUrl('')}
                    className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Clear input"
                  >
                    <X className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handlePaste}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700 hover:text-white rounded-md border border-slate-700/60 transition-all cursor-pointer"
                    title="Paste from clipboard"
                  >
                    <ClipboardPaste className="w-3 h-3 text-rose-400" />
                    <span>{t.pasteBtn}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Fetch & Preview Action Button */}
            <button
              type="submit"
              disabled={isLoading || !url.trim()}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-sm sm:text-base bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white shadow-lg shadow-rose-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{t.fetching}</span>
                </>
              ) : (
                <>
                  <span>{t.fetchBtn}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* Batch Mode Input */
          <div className="space-y-3">
            <p className="text-xs text-slate-400 font-mono">
              {t.batchSubtitle}
            </p>
            <textarea
              rows={4}
              value={batchUrls}
              onChange={(e) => setBatchUrls(e.target.value)}
              placeholder="https://www.tiktok.com/@user/video/...\nhttps://www.instagram.com/reel/...\nhttps://www.youtube.com/shorts/..."
              className="w-full p-3.5 bg-slate-950/80 border border-slate-800/80 rounded-xl text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none focus:border-rose-500/60 font-mono leading-relaxed"
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500 font-mono">
                {batchUrls.split('\n').filter((u) => u.trim()).length} link(s) added
              </span>
              <button
                type="button"
                onClick={onBatchSubmit}
                disabled={isLoading || !batchUrls.trim()}
                className="px-5 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white shadow-lg shadow-rose-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Processing Batch...</span>
                  </>
                ) : (
                  <>
                    <span>Process Batch Links</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Dynamic Platform Tag Indicator */}
        {detectedPlatform && detectedPlatform !== 'general' && (
          <div className="mt-2.5 px-2 flex items-center gap-2 text-xs">
            <span className="text-slate-400 text-[11px]">Detected platform:</span>
            <span
              className={`px-2 py-0.5 rounded-md border text-[11px] font-semibold ${platformBadgeDetails[detectedPlatform].color}`}
            >
              {platformBadgeDetails[detectedPlatform].label}
            </span>
          </div>
        )}

        {/* Error notification */}
        {error && (
          <div className="mt-2.5 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* One-Click Sample Reels Carousel with 3D interactions */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
        <span className="text-slate-500 font-medium">{t.trySample}</span>
        <button
          onClick={() => onSubmit('sample:sample-durga-1')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500/10 to-rose-500/10 hover:from-amber-500/20 hover:to-rose-500/20 border border-amber-500/30 hover:border-amber-500/50 text-amber-200 hover:text-white transition-all cursor-pointer font-semibold shadow-sm btn-3d"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
          <span>Maa Durga Reel (All Rounder Ajay)</span>
        </button>
        <button
          onClick={() => onSubmit('sample:sample-tiktok-1')}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer font-medium btn-3d"
        >
          <PlayCircle className="w-3.5 h-3.5 text-cyan-400" />
          <span>{t.sampleDog}</span>
        </button>
        <button
          onClick={() => onSubmit('sample:sample-yt-1')}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer font-medium btn-3d"
        >
          <PlayCircle className="w-3.5 h-3.5 text-red-400" />
          <span>{t.sampleTech}</span>
        </button>
        <button
          onClick={() => onSubmit('sample:sample-insta-1')}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer font-medium btn-3d"
        >
          <PlayCircle className="w-3.5 h-3.5 text-pink-400" />
          <span>{t.sampleTravel}</span>
        </button>
      </div>
    </div>
  );
};
