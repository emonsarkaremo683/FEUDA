
import React, { useRef, useState, useCallback, useEffect } from 'react';

interface VideoItem {
  id: number | string;
  videoUrl: string;
  thumbnail?: string;
  title: string;
  description?: string;
}

interface VideoSectionProps {
  // Legacy single-video props (backward compat)
  videoUrl?: string;
  label?: string;
  showLabel?: boolean;
  // New multi-video props
  sectionTitle?: string;
  videos?: VideoItem[];
  autoPlayEnabled?: boolean;
  title?: string;
  subtitle?: string;
}

const VideoSection: React.FC<VideoSectionProps> = ({
  videoUrl = '',
  label = 'Watch Reel',
  showLabel = true,
  sectionTitle = '',
  videos = [],
  autoPlayEnabled = true,
  title,
  subtitle
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoPlay, setAutoPlay] = useState(autoPlayEnabled);
  const [progress, setProgress] = useState(0);
  const progressInterval = useRef<any>(null);

  // Build the effective video list — support both legacy single-video and new multi-video
  const effectiveVideos: VideoItem[] = videos.length > 0
    ? videos
    : videoUrl
      ? [{ id: 'legacy', videoUrl, title: title || label || 'Video', description: subtitle || '' }]
      : [];

  const activeVideo = effectiveVideos[activeIndex] || null;

  // If no videos at all, render nothing
  if (effectiveVideos.length === 0) return null;

  const handleItemHover = useCallback((index: number) => {
    if (!autoPlay) return;
    setActiveIndex(index);
    setIsPlaying(true);
    setProgress(0);
  }, [autoPlay]);

  const handleItemLeave = useCallback(() => {
    if (!autoPlay) return;
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  }, [autoPlay]);

  const handleItemClick = useCallback((index: number) => {
    setActiveIndex(index);
    setIsPlaying(true);
    setProgress(0);
  }, []);

  // Auto-play video when activeVideo changes and isPlaying is true
  useEffect(() => {
    if (isPlaying && videoRef.current && activeVideo) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }
  }, [activeIndex, isPlaying, activeVideo]);

  // Track progress
  useEffect(() => {
    if (progressInterval.current) clearInterval(progressInterval.current);

    if (isPlaying && videoRef.current) {
      progressInterval.current = setInterval(() => {
        if (videoRef.current && videoRef.current.duration) {
          setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100);
        }
      }, 100);
    }

    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, [isPlaying, activeIndex]);

  // Single video legacy layout
  if (effectiveVideos.length === 1 && !sectionTitle) {
    const singleVideo = effectiveVideos[0];
    return (
      <section className="max-w-7xl mx-auto px-4 py-10">
        <div
          className="relative w-full aspect-[16/9] md:h-[600px] rounded-[3rem] overflow-hidden bg-black shadow-2xl group cursor-pointer transition-transform duration-500 hover:scale-[1.01]"
          onMouseEnter={() => {
            setIsPlaying(true);
            if (videoRef.current) videoRef.current.play().catch(() => {});
          }}
          onMouseLeave={() => {
            setIsPlaying(false);
            if (videoRef.current) videoRef.current.pause();
          }}
        >
          <video
            ref={videoRef}
            src={singleVideo.videoUrl}
            loop
            muted
            playsInline
            className="w-full h-full object-cover transition-opacity duration-700 opacity-80 group-hover:opacity-100"
          />
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px] transition-all">
              <div className="w-20 h-20 rounded-full bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-md">
                <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-white border-b-[10px] border-b-transparent ml-1"></div>
              </div>
            </div>
          )}
          {showLabel && (
            <div className="absolute top-8 left-8">
              <span className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                {label}
              </span>
            </div>
          )}
          {(singleVideo.title || singleVideo.description) && (
            <div className="absolute bottom-12 left-12 right-12 transition-all duration-500 transform group-hover:-translate-y-2">
              <div className="max-w-2xl">
                {singleVideo.title && (
                  <h2 className="text-white text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none mb-4 drop-shadow-2xl">
                    {singleVideo.title}
                  </h2>
                )}
                {singleVideo.description && (
                  <p className="text-white/70 text-xs md:text-sm font-bold uppercase tracking-[0.3em] drop-shadow-lg">
                    {singleVideo.description}
                  </p>
                )}
              </div>
            </div>
          )}
          <div className="absolute bottom-0 left-0 h-1 bg-white/30 w-full overflow-hidden">
            <div className={`h-full bg-white transition-all duration-[10s] linear ${isPlaying ? 'w-full' : 'w-0'}`} />
          </div>
        </div>
      </section>
    );
  }

  // Multi-video layout with section title (matches reference design)
  return (
    <section className="max-w-7xl mx-auto px-4 py-16 md:py-24">
      {/* Header Row: Title + Auto Play Toggle */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        {sectionTitle && (
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 uppercase tracking-tight leading-tight max-w-2xl">
            {sectionTitle}
          </h2>
        )}
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Auto Play</span>
          <button
            onClick={() => setAutoPlay(!autoPlay)}
            className={`relative w-14 h-7 rounded-full transition-all duration-300 ${autoPlay ? 'bg-orange-500' : 'bg-slate-300'}`}
            aria-label="Toggle auto play"
          >
            <span
              className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ${autoPlay ? 'left-7' : 'left-0.5'}`}
            />
          </button>
        </div>
      </div>

      {/* Main Content: Video Player + List */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Video Player */}
        <div className="lg:col-span-3 relative aspect-[16/9] rounded-3xl overflow-hidden bg-black shadow-2xl group">
          {activeVideo && (
            <>
              <video
                ref={videoRef}
                src={activeVideo.videoUrl}
                loop
                muted
                playsInline
                className="w-full h-full object-cover transition-opacity duration-500"
                style={{ opacity: isPlaying ? 1 : 0.7 }}
              />

              {/* Play button overlay when not playing */}
              {!isPlaying && (
                <div
                  className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[2px] cursor-pointer transition-all duration-300"
                  onClick={() => handleItemClick(activeIndex)}
                >
                  <div className="w-20 h-20 rounded-full bg-white/10 border-2 border-white/30 flex items-center justify-center backdrop-blur-md hover:scale-110 transition-transform duration-300">
                    <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              )}

              {/* Video info overlay */}
              <div className="absolute bottom-6 left-6 right-6 transition-all duration-500">
                <h3 className="text-white text-xl md:text-2xl font-black uppercase tracking-tight drop-shadow-lg">
                  {activeVideo.title}
                </h3>
                {activeVideo.description && (
                  <p className="text-white/60 text-xs font-bold uppercase tracking-widest mt-1 drop-shadow-md">
                    {activeVideo.description}
                  </p>
                )}
              </div>

              {/* Progress bar */}
              <div className="absolute bottom-0 left-0 h-1 bg-white/20 w-full">
                <div
                  className="h-full bg-orange-500 transition-all duration-100 ease-linear"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </>
          )}
        </div>

        {/* Video List */}
        <div className="lg:col-span-2 flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
          {effectiveVideos.map((video, index) => (
            <div
              key={video.id}
              className={`
                flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-300 group/item
                ${activeIndex === index
                  ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20 scale-[1.02]'
                  : 'bg-white hover:bg-slate-50 text-slate-900 border border-slate-100 hover:border-slate-200 hover:shadow-md'
                }
              `}
              onMouseEnter={() => handleItemHover(index)}
              onMouseLeave={handleItemLeave}
              onClick={() => handleItemClick(index)}
            >
              {/* Thumbnail / Index */}
              <div className={`
                w-14 h-14 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 overflow-hidden
                ${activeIndex === index ? 'bg-orange-500' : 'bg-slate-100 group-hover/item:bg-slate-200'}
              `}>
                {video.thumbnail ? (
                  <img src={video.thumbnail} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <span className={`text-lg font-black ${activeIndex === index ? 'text-white' : 'text-slate-400'}`}>
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>
                )}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <h4 className={`text-sm font-bold uppercase tracking-tight truncate ${activeIndex === index ? 'text-white' : 'text-slate-900'}`}>
                  {video.title}
                </h4>
                {video.description && (
                  <p className={`text-[11px] font-medium truncate mt-0.5 ${activeIndex === index ? 'text-white/60' : 'text-slate-400'}`}>
                    {video.description}
                  </p>
                )}
              </div>

              {/* Play indicator */}
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300
                ${activeIndex === index && isPlaying
                  ? 'bg-white/20'
                  : 'bg-transparent group-hover/item:bg-slate-100'
                }
              `}>
                {activeIndex === index && isPlaying ? (
                  /* Equalizer animation */
                  <div className="flex items-end gap-0.5 h-3">
                    <span className="w-[3px] bg-orange-400 rounded-full animate-pulse" style={{ height: '60%', animationDelay: '0ms' }} />
                    <span className="w-[3px] bg-orange-400 rounded-full animate-pulse" style={{ height: '100%', animationDelay: '150ms' }} />
                    <span className="w-[3px] bg-orange-400 rounded-full animate-pulse" style={{ height: '40%', animationDelay: '300ms' }} />
                  </div>
                ) : (
                  <svg className={`w-3.5 h-3.5 ml-0.5 ${activeIndex === index ? 'text-white/50' : 'text-slate-300'}`} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom scrollbar styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 999px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </section>
  );
};

export default VideoSection;
