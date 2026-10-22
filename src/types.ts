export type Platform = 'facebook' | 'youtube' | 'instagram' | 'tiktok' | 'general';

export interface VideoFormat {
  quality: string;
  format: string;
  size: string;
  url: string;
  isImageCover?: boolean;
  isDirectDownload?: boolean;
  ytId?: string;
}

export interface VideoDetails {
  id: string;
  platform: Platform;
  originalUrl: string;
  title: string;
  author: string;
  authorName: string;
  authorAvatar?: string;
  videoUrl?: string;
  watermarkVideoUrl?: string;
  audioUrl?: string;
  coverUrl?: string;
  embedUrl?: string;
  duration?: number;
  views?: string;
  likes?: string;
  comments?: string;
  formats: VideoFormat[];
}

export interface AiCaption {
  style: string;
  text: string;
  bestFor: string;
}

export interface AiAnalysisData {
  platform: string;
  formattedContent: string;
}

export interface DownloadHistoryItem {
  id: string;
  title: string;
  platform: Platform;
  url: string;
  thumbnail: string;
  downloadedAt: number;
  formatDownloaded: string;
  duration?: number;
}
