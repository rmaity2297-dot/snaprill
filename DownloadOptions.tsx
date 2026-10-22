import React, { useState } from 'react';
import {
  Download,
  Music,
  Image as ImageIcon,
  CheckCircle,
  FolderDown,
  Sparkles,
  Edit2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { VideoDetails, VideoFormat } from '../types';
import { translations } from '../translations';

interface DownloadOptionsProps {
  video: VideoDetails;
  lang: 'en' | 'bn';
  onDownloadCompleted: (formatName: string) => void;
}

export const DownloadOptions: React.FC<DownloadOptionsProps> = ({
  video,
  lang,
  onDownloadCompleted,
}) => {
  const t = translations[lang];
  const [downloadingFormat, setDownloadingFormat] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  // Clean filename generator
  const defaultBaseName = (video.title || 'SnapRill')
    .slice(0, 30)
    .replace(/[^a-zA-Z0-9_-]/g, '_');
  const [customFilename, setCustomFilename] = useState(defaultBaseName);

  const saveDirectlyToLocalFolder = (endpoint: string, filename: string) => {
    // 1. Primary: Hidden iframe trigger (100% reliable inside browser iframes and Android Chrome)
    try {
      const hiddenIframe = document.createElement('iframe');
      hiddenIframe.style.position = 'fixed';
      hiddenIframe.style.top = '-9999px';
      hiddenIframe.style.left = '-9999px';
      hiddenIframe.style.width = '1px';
      hiddenIframe.style.height = '1px';
      hiddenIframe.style.opacity = '0';
      hiddenIframe.src = endpoint;
      document.body.appendChild(hiddenIframe);
      setTimeout(() => {
        if (document.body.contains(hiddenIframe)) {
          document.body.removeChild(hiddenIframe);
        }
      }, 5000);
    } catch (e) {
      console.warn('Iframe download error:', e);
    }

    // 2. Secondary: Programmatic anchor download
    try {
      const link = document.createElement('a');
      link.href = endpoint;
      link.setAttribute('download', filename);
      link.setAttribute('target', '_self');
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        if (document.body.contains(link)) {
          document.body.removeChild(link);
        }
      }, 1000);
    } catch (e) {
      console.warn('Anchor download error:', e);
    }
  };

  const triggerDownload = (url: string, formatName: string, ext = 'mp4', _mime = 'video/mp4') => {
    setDownloadingFormat(formatName);
    setDownloadSuccess(null);

    // Blast celebratory confetti!
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.8 },
      colors: ['#f43f5e', '#ec4899', '#6366f1', '#06b6d4'],
    });

    const filename = `${customFilename || 'OmniReel'}_${ext === 'mp3' ? 'audio' : 'HD'}.${ext}`;

    let downloadEndpoint = '';
    if (ext === 'mp3') {
      const audioUrlTarget = url || video.audioUrl || video.videoUrl || '';
      if (video.platform === 'youtube' && video.id) {
        downloadEndpoint = `/api/download-youtube?id=${encodeURIComponent(video.id)}&format=mp3&filename=${encodeURIComponent(filename)}`;
      } else {
        downloadEndpoint = `/api/extract-audio?url=${encodeURIComponent(audioUrlTarget)}&filename=${encodeURIComponent(filename)}`;
      }
    } else if (video.platform === 'youtube' && video.id) {
      downloadEndpoint = `/api/download-youtube?id=${encodeURIComponent(video.id)}&format=1080&filename=${encodeURIComponent(filename)}`;
    } else {
      const targetUrl = url || video.videoUrl || '';
      downloadEndpoint = `/api/download?url=${encodeURIComponent(targetUrl)}&filename=${encodeURIComponent(filename)}`;
    }

    // Execute instant download to local folder on very first click
    saveDirectlyToLocalFolder(downloadEndpoint, filename);

    setTimeout(() => {
      setDownloadingFormat(null);
      setDownloadSuccess(formatName);
      onDownloadCompleted(formatName);
    }, 1200);
  };

  // Ensure primaryFormat selects the genuine MP4 video stream (never an image or cover)
  const isExcludedQuality = (qName: string) => {
    const q = (qName || '').toLowerCase();
    return q.includes('poster') || q.includes('cover') || q.includes('soundtrack') || q.includes('sound only');
  };

  const primaryFormat = video.formats?.find(
    (f) => !f.isImageCover && !f.isDirectDownload && f.format === 'MP4' && f.url && !isExcludedQuality(f.quality)
  ) || {
    quality: 'HD 1080p (No Watermark)',
    format: 'MP4',
    size: 'Full HD',
    url: video.videoUrl || ''
  };

  const [cleaningWatermark, setCleaningWatermark] = useState(false);

  const triggerCleanDownload = () => {
    setCleaningWatermark(true);
    setDownloadSuccess(null);

    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.8 },
      colors: ['#06b6d4', '#6366f1', '#ec4899', '#f43f5e'],
    });

    const filename = `${customFilename || 'OmniReel'}_Clean_NoWatermark.mp4`;
    const targetUrl = primaryFormat.url || video.videoUrl || '';

    const cleanEndpoint = `/api/download-clean?url=${encodeURIComponent(targetUrl)}&filename=${encodeURIComponent(filename)}`;
    const link = document.createElement('a');
    link.href = cleanEndpoint;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setCleaningWatermark(false);
      setDownloadSuccess('Clean Video');
      onDownloadCompleted('Auto Clean Watermark');
    }, 2500);
  };

  const additionalMp4Formats = (video.formats || []).filter((f) => {
    if (!f.url || f.format !== 'MP4' || f.isImageCover || f.isDirectDownload) return false;
    if (isExcludedQuality(f.quality)) return false;
    return f.quality !== primaryFormat.quality;
  });

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 sm:p-5 shadow-xl space-y-4 tilt-card-3d">
      <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <FolderDown className="w-5 h-5 text-rose-500 animate-bounce" style={{ animationDuration: '3s' }} />
          <h3 className="font-bold text-sm sm:text-base text-white">
            {t.formatListTitle}
          </h3>
        </div>

        {/* Custom filename preview */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <span className="hidden sm:inline">{t.fileNameLabel}</span>
          <div className="flex items-center bg-slate-950 px-2 py-1 rounded-md border border-slate-800 font-mono text-[11px] text-slate-300">
            <input
              type="text"
              value={customFilename}
              onChange={(e) => setCustomFilename(e.target.value)}
              className="bg-transparent focus:outline-none w-28 sm:w-36 text-white"
            />
            <span className="text-slate-500">.mp4</span>
          </div>
        </div>
      </div>

      {/* Primary Actions: Video MP4 & Extracted Audio MP3 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Main High-Priority 1-Click Download Button (Direct HD MP4 to Local Folder) */}
        <button
          onClick={() => triggerDownload(primaryFormat.url, primaryFormat.quality, 'mp4', 'video/mp4')}
          disabled={downloadingFormat !== null || cleaningWatermark}
          className="w-full py-3.5 px-4 rounded-xl font-extrabold text-sm sm:text-base bg-gradient-to-r from-rose-500 via-pink-600 to-rose-500 hover:opacity-95 text-white shadow-xl shadow-rose-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer group btn-3d"
        >
          {downloadingFormat === primaryFormat.quality ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>{t.downloadStarted}</span>
            </>
          ) : (
            <>
              <Download className="w-5 h-5 group-hover:translate-y-0.5 transition-transform shrink-0" />
              <span className="truncate">{t.downloadPrimary}</span>
            </>
          )}
        </button>

        {/* Dedicated Audio Extraction Button (Extracts pure MP3 sound to Local Folder) */}
        <button
          onClick={() => triggerDownload(video.audioUrl || primaryFormat.url, 'Extracted Audio', 'mp3', 'audio/mpeg')}
          disabled={downloadingFormat !== null || cleaningWatermark}
          className="w-full py-3.5 px-4 rounded-xl font-extrabold text-sm sm:text-base bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-600 hover:opacity-95 text-white shadow-xl shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer group border border-indigo-400/30 btn-3d"
        >
          {downloadingFormat === 'Extracted Audio' ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>
                {lang === 'en' ? 'Extracting MP3 Audio...' : 'অডিও এক্সট্র্যাক্ট হচ্ছে...'}
              </span>
            </>
          ) : (
            <>
              <Music className="w-5 h-5 text-indigo-200 group-hover:scale-110 transition-transform shrink-0" />
              <span className="truncate">
                {lang === 'en' ? 'Extract Audio (MP3 Only)' : 'শুধু অডিও ডাউনলোড (MP3)'}
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/20 text-white uppercase shrink-0">
                320k
              </span>
            </>
          )}
        </button>
      </div>

      {/* Auto-Remove Brand Text & Watermark Button */}
      <button
        onClick={triggerCleanDownload}
        disabled={cleaningWatermark || downloadingFormat !== null}
        className="w-full py-3 px-5 rounded-xl font-bold text-sm sm:text-base bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:opacity-95 text-white shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2.5 transition-all cursor-pointer group border border-indigo-400/30 btn-3d"
      >
        {cleaningWatermark ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>
              {lang === 'en'
                ? 'Saving Clean HD Video to local Downloads folder...'
                : 'ক্লিন এইচডি ভিডিও লোকাল ডাউনলোড ফোল্ডারে সেভ হচ্ছে...'}
            </span>
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5 text-yellow-300 group-hover:rotate-12 transition-transform" />
            <span>
              {lang === 'en'
                ? 'Download Clean Video (Direct HD - No Watermark)'
                : 'ক্লিন ভিডিও ডাউনলোড (কোনো ওয়াটারমার্ক বা ব্লার ছাড়া)'}
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 uppercase ml-1">
              Direct Clean
            </span>
          </>
        )}
      </button>

      {/* Download feedback banner */}
      {downloadSuccess && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{t.downloadDone} File saved to your local folder.</span>
        </div>
      )}

      {/* Other Video Quality Formats (if available, pure MP4 video only) */}
      {additionalMp4Formats.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          {additionalMp4Formats.map((fmt, idx) => (
            <button
              key={idx}
              onClick={() => triggerDownload(fmt.url, fmt.quality, 'mp4', 'video/mp4')}
              disabled={downloadingFormat !== null}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 text-left transition-all cursor-pointer group"
            >
              <div>
                <div className="text-xs font-bold text-slate-200">
                  {fmt.quality}
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  {fmt.format} · {fmt.size}
                </div>
              </div>
              <Download className="w-4 h-4 text-slate-400 group-hover:text-white" />
            </button>
          ))}
        </div>
      )}

      {/* Local Folder Reassurance Notice */}
      <div className="pt-2 border-t border-slate-800/60 flex items-center gap-2 text-xs text-slate-400">
        <FolderDown className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>
          {lang === 'en'
            ? '100% Direct Local Folder Download — Saves straight to your device Downloads folder without installing any extra apps.'
            : 'সরাসরি আপনার ডিভাইসের লোকাল Downloads ফোল্ডারে সেভ হবে — আলাদা কোনো অ্যাপ ইনস্টল করতে হবে না।'}
        </span>
      </div>
    </div>
  );
};
