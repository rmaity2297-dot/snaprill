import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Scissors,
  CheckCircle,
  Music
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { VideoDetails } from '../types';
import { translations } from '../translations';

interface VideoPreviewCardProps {
  video: VideoDetails;
  lang: 'en' | 'bn';
  trimRange: [number, number];
  setTrimRange: (range: [number, number]) => void;
}

export const VideoPreviewCard: React.FC<VideoPreviewCardProps> = ({
  video,
  lang,
  trimRange,
  setTrimRange,
}) => {
  const t = translations[lang];
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(video.duration || 15);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showTrimmer, setShowTrimmer] = useState(false);
  const [trimDownloading, setTrimDownloading] = useState<'mp4' | 'mp3' | null>(null);
  const [trimNotice, setTrimNotice] = useState<string | null>(null);

  const triggerTrimDownload = (format: 'mp4' | 'mp3') => {
    if (trimDownloading) return;
    setTrimDownloading(format);
    setTrimNotice(
      lang === 'en'
        ? `📥 Trimmed ${format.toUpperCase()} download started! Check your phone notification bar.`
        : `📥 ট্রিম করা ${format.toUpperCase()} ডাউনলোড শুরু হয়েছে! আপনার ফোনের নোটিফিকেশন বার চেক করুন।`
    );

    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#6366f1', '#a855f7', '#ec4899']
    });

    const baseTitle = (video.title || 'SnapRill').slice(0, 25).replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `${baseTitle}_Trim_${Math.round(trimRange[0])}s_${Math.round(trimRange[1])}s.${format}`;
    const targetUrl = video.videoUrl || video.audioUrl || video.originalUrl || '';
    const endpoint = `/api/download-trim?url=${encodeURIComponent(targetUrl)}&start=${trimRange[0]}&end=${trimRange[1]}&format=${format}&filename=${encodeURIComponent(filename)}`;

    const link = document.createElement('a');
    link.href = endpoint;
    link.setAttribute('download', filename);
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      if (document.body.contains(link)) document.body.removeChild(link);
      setTrimDownloading(null);
    }, 2500);

    setTimeout(() => {
      setTrimNotice(null);
    }, 5000);
  };

  const hasDirectStream = Boolean(video.videoUrl && !video.videoUrl.includes('oceans.mp4'));
  const isEmbedPreferred = video.platform === 'youtube' || !hasDirectStream;
  const [useEmbed, setUseEmbed] = useState<boolean>(isEmbedPreferred);

  const getEmbedUrl = () => {
    if (video.embedUrl) return video.embedUrl;
    if (video.platform === 'youtube' && video.id) {
      return `https://www.youtube-nocookie.com/embed/${video.id}?autoplay=0&controls=1&rel=0&modestbranding=1`;
    }
    if (video.platform === 'instagram' && video.id) {
      return `https://www.instagram.com/reel/${video.id}/embed/`;
    }
    return '';
  };
  const activeEmbedUrl = getEmbedUrl();

  const rawVideoSrc = hasDirectStream ? video.videoUrl! : '';
  const proxyVideoUrl = rawVideoSrc.startsWith('http') && !rawVideoSrc.includes(window.location.host)
    ? `/api/proxy-stream?url=${encodeURIComponent(rawVideoSrc)}`
    : rawVideoSrc;

  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    const dur = video.duration || 15;
    setDuration(dur);
    setTrimRange([0, dur]);
    setUseEmbed(video.platform === 'youtube' || !hasDirectStream);
  }, [video.id, video.platform, video.videoUrl]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch((e) => console.warn('Play error:', e));
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const cur = videoRef.current.currentTime;
      setCurrentTime(cur);

      if (showTrimmer && cur >= trimRange[1]) {
        videoRef.current.currentTime = trimRange[0];
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const d = videoRef.current.duration || video.duration || 15;
      setDuration(d);
      setTrimRange([0, d]);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTime = parseFloat(e.target.value);
    setCurrentTime(seekTime);
    if (videoRef.current) {
      videoRef.current.currentTime = seekTime;
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleSpeedChange = (rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleToggleTrimmer = () => {
    if (!showTrimmer && useEmbed && hasDirectStream) {
      setUseEmbed(false);
    }
    setShowTrimmer(!showTrimmer);
  };

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 sm:p-5 shadow-xl flex flex-col items-center tilt-card-3d">
      <div className="w-full max-w-[340px] shrink-0 mx-auto">
        <div className="flex items-center justify-between mb-2 px-1 text-xs">
          <span className="font-semibold text-slate-300 flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${useEmbed ? 'bg-rose-500' : 'bg-emerald-400'} animate-pulse`} />
            {useEmbed
              ? (video.platform === 'youtube'
                  ? 'YouTube Player'
                  : video.platform === 'instagram'
                  ? 'Instagram Player'
                  : 'Live Player')
              : 'Custom Player'}
          </span>
          {activeEmbedUrl && hasDirectStream && (
            <button
              onClick={() => setUseEmbed(!useEmbed)}
              className="text-[11px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-rose-400 border border-slate-700/60 transition-colors cursor-pointer"
            >
              {useEmbed ? 'Switch to Custom Player' : 'Switch to Live Player'}
            </button>
          )}
        </div>

        <div className="relative aspect-[9/16] max-h-[500px] w-full rounded-xl overflow-hidden bg-black border border-slate-800 shadow-2xl flex items-center justify-center group">
          {useEmbed && activeEmbedUrl ? (
            <iframe
              src={activeEmbedUrl}
              title={video.title}
              className="w-full h-full border-0 rounded-xl bg-black"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              scrolling="no"
            />
          ) : proxyVideoUrl ? (
            <>
              <video
                ref={videoRef}
                src={proxyVideoUrl}
                poster={video.coverUrl}
                loop={!showTrimmer}
                playsInline
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onClick={togglePlay}
                className="w-full h-full object-cover cursor-pointer"
              />

              {!isPlaying && (
                <button
                  onClick={togglePlay}
                  className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-rose-600/90 text-white flex items-center justify-center shadow-lg shadow-rose-600/40 hover:scale-105 active:scale-95 transition-all cursor-pointer z-10"
                >
                  <Play className="w-6 h-6 fill-current ml-0.5" />
                </button>
              )}

              <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                <input
                  type="range"
                  min={0}
                  max={duration || 15}
                  step={0.1}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1.5 bg-slate-700/80 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />

                <div className="flex items-center justify-between text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <button onClick={togglePlay} className="hover:text-white cursor-pointer">
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                    </button>
                    <button onClick={toggleMute} className="hover:text-white cursor-pointer">
                      {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                    <span className="font-mono text-[11px] text-slate-400">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 font-mono text-[10px]">
                    {[0.75, 1, 1.5, 2].map((rate) => (
                      <button
                        key={rate}
                        onClick={() => handleSpeedChange(rate)}
                        className={`px-1.5 py-0.5 rounded cursor-pointer ${
                          playbackRate === rate ? 'bg-rose-500 text-white font-bold' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {rate}x
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <img
              src={video.coverUrl}
              alt="Video Preview"
              className="w-full h-full object-cover"
            />
          )}
        </div>

        <div className="mt-3">
          <button
            onClick={handleToggleTrimmer}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700/60 transition-all cursor-pointer"
          >
            <Scissors className="w-3.5 h-3.5 text-indigo-400" />
            <span>{showTrimmer ? 'Hide Trimmer' : t.trimmerTitle}</span>
          </button>
        </div>

        {showTrimmer && (
          <div className="mt-2.5 p-3 rounded-xl bg-slate-950/90 border border-slate-800 text-xs space-y-2 font-mono">
            <div className="flex justify-between text-slate-400 text-[11px]">
              <span>Start: {formatTime(trimRange[0])}</span>
              <span>End: {formatTime(trimRange[1])}</span>
              <span>Clip: {(trimRange[1] - trimRange[0]).toFixed(1)}s</span>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 block">Start Marker</label>
              <input
                type="range"
                min={0}
                max={trimRange[1] - 1}
                step={0.5}
                value={trimRange[0]}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setTrimRange([val, trimRange[1]]);
                  if (videoRef.current) videoRef.current.currentTime = val;
                }}
                className="w-full h-1 bg-slate-800 rounded appearance-none accent-indigo-400 cursor-pointer"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 block">End Marker</label>
              <input
                type="range"
                min={trimRange[0] + 1}
                max={duration}
                step={0.5}
                value={trimRange[1]}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setTrimRange([trimRange[0], val]);
                }}
                className="w-full h-1 bg-slate-800 rounded appearance-none accent-indigo-400 cursor-pointer"
              />
            </div>

            <div className="pt-2 grid grid-cols-2 gap-2 border-t border-slate-800/80">
              <button
                onClick={() => triggerTrimDownload('mp4')}
                disabled={trimDownloading !== null}
                className="py-2 px-2.5 rounded-lg text-[11px] font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
              >
                {trimDownloading === 'mp4' ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{lang === 'en' ? 'Trimming...' : 'ট্রিম হচ্ছে...'}</span>
                  </>
                ) : (
                  <>
                    <Scissors className="w-3 h-3 shrink-0" />
                    <span>{lang === 'en' ? 'Download Trim (MP4)' : 'ট্রিম ভিডিও (MP4)'}</span>
                  </>
                )}
              </button>

              <button
                onClick={() => triggerTrimDownload('mp3')}
                disabled={trimDownloading !== null}
                className="py-2 px-2.5 rounded-lg text-[11px] font-bold bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center gap-1.5 shadow-md shadow-purple-600/30 transition-all cursor-pointer disabled:opacity-50"
              >
                {trimDownloading === 'mp3' ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{lang === 'en' ? 'Trimming...' : 'ট্রিম হচ্ছে...'}</span>
                  </>
                ) : (
                  <>
                    <Music className="w-3 h-3 shrink-0" />
                    <span>{lang === 'en' ? 'Trim Audio (MP3)' : 'ট্রিম অডিও (MP3)'}</span>
                  </>
                )}
              </button>
            </div>

            {trimNotice && (
              <div className="p-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] flex items-center gap-1.5 animate-fadeIn">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{trimNotice}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
