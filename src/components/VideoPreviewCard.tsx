import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  RotateCcw,
  Scissors,
  Eye,
  Heart,
  MessageCircle,
  Clock,
  ExternalLink,
  Layers
} from 'lucide-react';
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

  // Stream proxy URL for seamless HTML5 video playback without CORS blocking
  const rawVideoSrc = video.videoUrl || 'https://vjs.zencdn.net/v/oceans.mp4';
  const proxyVideoUrl = rawVideoSrc.startsWith('http') && !rawVideoSrc.includes(window.location.host)
    ? `/api/proxy-stream?url=${encodeURIComponent(rawVideoSrc)}`
    : rawVideoSrc;

  useEffect(() => {
    // Reset player state when new video loads
    setIsPlaying(false);
    setCurrentTime(0);
    const dur = video.duration || 15;
    setDuration(dur);
    setTrimRange([0, dur]);
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

      // Loop within trimmer range if trimmer active
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

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 sm:p-5 shadow-xl flex flex-col items-center tilt-card-3d">
      {/* 9:16 Video Player Stage — Clean & Focused purely on the video */}
      <div className="w-full max-w-[340px] shrink-0 mx-auto">
        <div className="relative aspect-[9/16] max-h-[500px] w-full rounded-xl overflow-hidden bg-black border border-slate-800 shadow-2xl flex items-center justify-center group">
          {proxyVideoUrl ? (
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
          ) : (
            <img
              src={video.coverUrl}
              alt="Video Preview"
              className="w-full h-full object-cover"
            />
          )}

          {/* Play Overlay Button */}
          {!isPlaying && (
            <button
              onClick={togglePlay}
              className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-rose-600/90 text-white flex items-center justify-center shadow-lg shadow-rose-600/40 hover:scale-105 active:scale-95 transition-all cursor-pointer z-10"
            >
              <Play className="w-6 h-6 fill-current ml-0.5" />
            </button>
          )}

          {/* Bottom Custom Control Bar */}
          <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
            {/* Timeline Scrubber */}
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

              {/* Playback speed buttons */}
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
        </div>

        {/* Trimmer Trigger Button */}
        <div className="mt-3">
          <button
            onClick={() => setShowTrimmer(!showTrimmer)}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700/60 transition-all cursor-pointer"
          >
            <Scissors className="w-3.5 h-3.5 text-indigo-400" />
            <span>{showTrimmer ? 'Hide Trimmer' : t.trimmerTitle}</span>
          </button>
        </div>

        {/* Video Trimmer Sliders */}
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
          </div>
        )}
      </div>
    </div>
  );
};
