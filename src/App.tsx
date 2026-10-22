/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HeroInput } from './components/HeroInput';
import { VideoPreviewCard } from './components/VideoPreviewCard';
import { DownloadOptions } from './components/DownloadOptions';
import { AiCreatorStudio } from './components/AiCreatorStudio';
import { HistoryDrawer } from './components/HistoryDrawer';
import { HowToUseAndFaq } from './components/HowToUseAndFaq';
import { VideoDetails, AiAnalysisData, DownloadHistoryItem } from './types';
import { translations } from './translations';
import { Download, ExternalLink, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

export default function App() {
  const [lang, setLang] = useState<'en' | 'bn'>(() => {
   return (localStorage.getItem('omnireel_lang') as 'en' | 'bn') || 'en';
  });
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentVideo, setCurrentVideo] = useState<VideoDetails | null>(null);
  const [trimRange, setTrimRange] = useState<[number, number]>([0, 15]);

  // AI Creator Studio state
  const [aiAnalysis, setAiAnalysis] = useState<AiAnalysisData | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // History state
  const [history, setHistory] = useState<DownloadHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('omnireel_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Batch Mode
  const [batchMode, setBatchMode] = useState(false);
  const [batchUrls, setBatchUrls] = useState('');
  const [batchResults, setBatchResults] = useState<{ url: string; status: 'loading' | 'success' | 'error'; video?: VideoDetails; error?: string }[]>([]);

  const t = translations[lang];

  // Save language preference
  const toggleLanguage = () => {
    const next = lang === 'en' ? 'bn' : 'en';
    setLang(next);
    localStorage.setItem('omnireel_lang', next);

    // If video loaded, refresh AI analysis in the new language
    if (currentVideo) {
      triggerAiAnalysis(currentVideo, next);
    }
  };

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('omnireel_history', JSON.stringify(history));
    } catch (e) {
      console.warn('History save failed:', e);
    }
  }, [history]);

  // Trigger Gemini AI Platform-Tailored Format Generation
  const triggerAiAnalysis = async (video: VideoDetails, targetPlatform?: string, currentLang = lang) => {
    setIsAiLoading(true);
    const platKey = (targetPlatform || video.platform || 'instagram').toLowerCase();
    try {
      const res = await fetch('/api/ai-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: video.title,
          platform: video.platform,
          author: video.author,
          language: currentLang,
          targetPlatform: platKey,
        }),
      });
      const data = await res.json();
      if (data && data.success && data.data) {
        setAiAnalysis({
          platform: platKey,
          formattedContent: data.data.formattedContent,
        });
      }
    } catch (err) {
      console.warn('AI analysis fetch error:', err);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Submit / Resolve Video
  const handleResolve = async (targetUrl?: string) => {
    const urlToFetch = (targetUrl || url).trim();
    if (!urlToFetch) {
      setError(lang === 'en' ? 'Please paste a valid video URL.' : 'দয়া করে একটি সঠিক ভিডিও লিংক পেস্ট করুন।');
      return;
    }

    setIsLoading(true);
    setError(null);
    setAiAnalysis(null); // Reset so user can generate on-demand with 1 click

    try {
      const resp = await fetch('/api/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlToFetch }),
      });

      const json = await resp.json();

      if (!resp.ok || !json.success) {
        throw new Error(json.error || 'Failed to fetch video details.');
      }

      const videoData: VideoDetails = json.data;
      setCurrentVideo(videoData);

      // Scroll smoothly down to preview
      setTimeout(() => {
        const previewElement = document.getElementById('preview-section');
        if (previewElement) {
          previewElement.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);

    } catch (err: any) {
      setError(err?.message || 'Could not resolve this reel. Please verify the URL or try another platform link.');
    } finally {
      setIsLoading(false);
    }
  };

  // Batch Processor
  const handleBatchSubmit = async () => {
    const lines = batchUrls
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    if (lines.length === 0) return;

    setIsLoading(true);
    setError(null);

    const initialQueue = lines.map((u) => ({
      url: u,
      status: 'loading' as const,
    }));
    setBatchResults(initialQueue);

    for (let i = 0; i < lines.length; i++) {
      const lineUrl = lines[i];
      try {
        const resp = await fetch('/api/resolve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: lineUrl }),
        });
        const resJson = await resp.json();

        setBatchResults((prev) => {
          const updated = [...prev];
          if (resp.ok && resJson.success) {
            updated[i] = { url: lineUrl, status: 'success', video: resJson.data };
          } else {
            updated[i] = { url: lineUrl, status: 'error', error: resJson.error || 'Failed' };
          }
          return updated;
        });
      } catch (e: any) {
        setBatchResults((prev) => {
          const updated = [...prev];
          updated[i] = { url: lineUrl, status: 'error', error: e?.message || 'Network error' };
          return updated;
        });
      }
    }

    setIsLoading(false);
  };

  // Add to History after user downloads
  const handleDownloadCompleted = (formatName: string) => {
    if (!currentVideo) return;

    const newItem: DownloadHistoryItem = {
      id: `${currentVideo.id}-${Date.now()}`,
      title: currentVideo.title,
      platform: currentVideo.platform,
      url: currentVideo.originalUrl || '',
      thumbnail: currentVideo.coverUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400',
      downloadedAt: Date.now(),
      formatDownloaded: formatName,
      duration: currentVideo.duration,
    };

    setHistory((prev) => [newItem, ...prev.slice(0, 49)]); // keep last 50
  };

  // Clear all history
  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem('omnireel_history');
    } catch (e) {
      console.warn(e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-rose-500 selection:text-white">
      {/* Top Navigation */}
      <Header
        lang={lang}
        onToggleLang={toggleLanguage}
        onOpenHistory={() => setIsHistoryOpen(true)}
        historyCount={history.length}
      />

      {/* Main Container */}
      <main className="flex-1 pb-16">
        {/* Hero & Search/Input Console */}
        <HeroInput
          url={url}
          setUrl={setUrl}
          onSubmit={handleResolve}
          isLoading={isLoading}
          lang={lang}
          batchMode={batchMode}
          setBatchMode={setBatchMode}
          batchUrls={batchUrls}
          setBatchUrls={setBatchUrls}
          onBatchSubmit={handleBatchSubmit}
          error={error}
        />

        {/* Batch Queue Results (Shows rich video previews for all 2, 3, or more links) */}
        {batchMode && batchResults.length > 0 && (
          <div className="max-w-4xl mx-auto px-4 mt-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>{lang === 'en' ? 'Batch Video Previews' : 'ব্যাচ ভিডিও প্রিভিউসমূহ'}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono">
                    {batchResults.filter((r) => r.status === 'success').length} / {batchResults.length} {lang === 'en' ? 'Ready' : 'প্রস্তুত'}
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {lang === 'en'
                    ? 'Watch live preview for each reel, extract audio, or download directly to your local folder.'
                    : 'প্রতিটি রিল এখানে সরাসরি প্লে করুন, শুধু অডিও এক্সট্র্যাক্ট করুন বা ফুল এইচডি ভিডিও লোকাল ফোল্ডারে ডাউনলোড করুন।'}
                </p>
              </div>

              {/* Batch Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => {
                    const successItems = batchResults.filter((r) => r.status === 'success' && r.video);
                    successItems.forEach((item, idx) => {
                      setTimeout(() => {
                        const v = item.video!;
                        const cleanName = (v.title || 'Video').slice(0, 25).replace(/[^a-zA-Z0-9_-]/g, '_');
                        const urlToDl = v.videoUrl || v.originalUrl;
                        const dlUrl = v.platform === 'youtube' && v.id
                          ? `/api/download-youtube?id=${encodeURIComponent(v.id)}&format=1080&filename=${encodeURIComponent(`${cleanName}_HD.mp4`)}`
                          : `/api/download?url=${encodeURIComponent(urlToDl)}&filename=${encodeURIComponent(`${cleanName}_HD.mp4`)}`;
                        const link = document.createElement('a');
                        link.href = dlUrl;
                        link.setAttribute('download', `${cleanName}_HD.mp4`);
                        link.style.display = 'none';
                        document.body.appendChild(link);
                        link.click();
                        setTimeout(() => document.body.removeChild(link), 500);
                      }, idx * 600);
                    });
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white cursor-pointer shadow-md shadow-rose-600/30 flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{lang === 'en' ? 'Download All Videos' : 'সবগুলো ভিডিও ডাউনলোড'}</span>
                </button>

                <button
                  onClick={() => {
                    const successItems = batchResults.filter((r) => r.status === 'success' && r.video);
                    successItems.forEach((item, idx) => {
                      setTimeout(() => {
                        const v = item.video!;
                        const cleanName = (v.title || 'Audio').slice(0, 25).replace(/[^a-zA-Z0-9_-]/g, '_');
                        const dlUrl = v.platform === 'youtube' && v.id
                          ? `/api/download-youtube?id=${encodeURIComponent(v.id)}&format=mp3&filename=${encodeURIComponent(`${cleanName}_audio.mp3`)}`
                          : `/api/extract-audio?url=${encodeURIComponent(v.audioUrl || v.videoUrl || v.originalUrl)}&filename=${encodeURIComponent(`${cleanName}_audio.mp3`)}`;
                        const link = document.createElement('a');
                        link.href = dlUrl;
                        link.setAttribute('download', `${cleanName}_audio.mp3`);
                        link.style.display = 'none';
                        document.body.appendChild(link);
                        link.click();
                        setTimeout(() => document.body.removeChild(link), 500);
                      }, idx * 600);
                    });
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer shadow-md shadow-indigo-600/30 flex items-center gap-1.5"
                >
                  <span>🎵</span>
                  <span>{lang === 'en' ? 'Download All Audio' : 'সবগুলো অডিও ডাউনলোড'}</span>
                </button>
              </div>
            </div>

            {/* Video Preview Cards for Each Batch Item */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {batchResults.map((res, i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between space-y-3"
                >
                  {/* Status Indicator / Loading */}
                  {res.status === 'loading' && (
                    <div className="py-12 text-center space-y-2">
                      <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto" />
                      <p className="text-xs text-slate-400 font-mono truncate px-4">
                        {lang === 'en' ? 'Extracting stream for:' : 'ভিডিও বের করা হচ্ছে:'} {res.url}
                      </p>
                    </div>
                  )}

                  {res.status === 'error' && (
                    <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-2">
                      <div className="flex items-center gap-2 text-rose-400 text-xs font-bold">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{lang === 'en' ? 'Failed to resolve' : 'লোড করা সম্ভব হয়নি'}</span>
                      </div>
                      <p className="text-xs font-mono text-slate-400 truncate">{res.url}</p>
                      <p className="text-xs text-rose-300">{res.error}</p>
                    </div>
                  )}

                  {res.status === 'success' && res.video && (
                    <>
                      {/* Video Player Preview (In-Place Playback with NO redirects) */}
                      <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden bg-black border border-slate-800 group flex items-center justify-center">
                        {(res.video.platform === 'youtube' || res.video.platform === 'instagram') && res.video.embedUrl ? (
                          <div className="relative w-full h-full">
                            <iframe
                              src={res.video.embedUrl}
                              className="w-full h-full border-0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              sandbox="allow-scripts allow-same-origin allow-presentation"
                              allowFullScreen
                            />
                            {res.video.platform === 'instagram' && (
                              <div
                                className="absolute top-0 inset-x-0 h-12 z-10 cursor-default"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                }}
                              />
                            )}
                          </div>
                        ) : res.video.videoUrl ? (
                          <video
                            src={
                              res.video.videoUrl.startsWith('http') && !res.video.videoUrl.includes(window.location.host)
                                ? `/api/proxy-stream?url=${encodeURIComponent(res.video.videoUrl)}`
                                : res.video.videoUrl
                            }
                            poster={res.video.coverUrl}
                            controls
                            playsInline
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <img
                            src={res.video.coverUrl}
                            alt={res.video.title}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>

                      {/* Direct Local Folder Download Buttons */}

                      {/* Direct Local Folder Download Buttons */}
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
                        {/* Download MP4 Video Button */}
                        <button
                          onClick={() => {
                            const v = res.video!;
                            const cleanName = (v.title || 'SnapRill_Video').slice(0, 30).replace(/[^a-zA-Z0-9_-]/g, '_');
                            const dlUrl = v.platform === 'youtube' && v.id
                              ? `/api/download-youtube?id=${encodeURIComponent(v.id)}&format=1080&filename=${encodeURIComponent(`${cleanName}_HD.mp4`)}`
                              : `/api/download?url=${encodeURIComponent(v.videoUrl || v.originalUrl)}&filename=${encodeURIComponent(`${cleanName}_HD.mp4`)}`;
                            const link = document.createElement('a');
                            link.href = dlUrl;
                            link.setAttribute('download', `${cleanName}_HD.mp4`);
                            link.style.display = 'none';
                            document.body.appendChild(link);
                            link.click();
                            setTimeout(() => document.body.removeChild(link), 500);
                            handleDownloadCompleted('Batch HD Video');
                          }}
                          className="py-2.5 px-3 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center gap-1.5 cursor-pointer shadow transition-all"
                        >
                          <Download className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{lang === 'en' ? 'Download MP4' : 'ভিডিও (MP4)'}</span>
                        </button>

                        {/* Extract Audio MP3 Button */}
                        <button
                          onClick={() => {
                            const v = res.video!;
                            const cleanName = (v.title || 'SnapRill_Audio').slice(0, 30).replace(/[^a-zA-Z0-9_-]/g, '_');
                            const dlUrl = v.platform === 'youtube' && v.id
                              ? `/api/download-youtube?id=${encodeURIComponent(v.id)}&format=mp3&filename=${encodeURIComponent(`${cleanName}_audio.mp3`)}`
                              : `/api/extract-audio?url=${encodeURIComponent(v.audioUrl || v.videoUrl || v.originalUrl)}&filename=${encodeURIComponent(`${cleanName}_audio.mp3`)}`;
                            const link = document.createElement('a');
                            link.href = dlUrl;
                            link.setAttribute('download', `${cleanName}_audio.mp3`);
                            link.style.display = 'none';
                            document.body.appendChild(link);
                            link.click();
                            setTimeout(() => document.body.removeChild(link), 500);
                            handleDownloadCompleted('Batch Extracted Audio');
                          }}
                          className="py-2.5 px-3 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center gap-1.5 cursor-pointer shadow transition-all"
                        >
                          <span>🎵</span>
                          <span className="truncate">{lang === 'en' ? 'Audio (MP3)' : 'অডিও (MP3)'}</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Live Preview & Download Stage for Single Mode */}
        {currentVideo && (
          <section id="preview-section" className="max-w-4xl mx-auto px-4 mt-8 space-y-6">
            {/* Video Player & Metadata Card */}
            <VideoPreviewCard
              video={currentVideo}
              lang={lang}
              trimRange={trimRange}
              setTrimRange={setTrimRange}
            />

            {/* Direct Download Options Card */}
            <DownloadOptions
              video={currentVideo}
              lang={lang}
              onDownloadCompleted={handleDownloadCompleted}
            />

            {/* AI Creator Studio Component */}
            <AiCreatorStudio
              analysis={aiAnalysis}
              isLoading={isAiLoading}
              lang={lang}
              videoPlatform={currentVideo.platform}
              videoTitle={currentVideo.title}
              author={currentVideo.author || currentVideo.authorName}
              onGenerate={(targetPlat) => triggerAiAnalysis(currentVideo, targetPlat, lang)}
            />
          </section>
        )}

        {/* How to use, FAQs, and Fair Use Guidelines */}
        <HowToUseAndFaq lang={lang} />
      </main>

      {/* History Drawer Modal */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onClearHistory={handleClearHistory}
        lang={lang}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500 font-mono">
        <p>SnapRill Downloader & AI Studio © {new Date().getFullYear()} · Built for Content Creators</p>
      </footer>
    </div>
  );
}
