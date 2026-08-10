import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, Volume2, VolumeX, Flame, Sparkles, Maximize2, X, Utensils, CheckCircle2 } from 'lucide-react';
import { VIDEO_REELS } from '../data/kitchenData';
import { VideoReel } from '../types';

interface VideoShowcaseProps {
  onNavigateToMenu: () => void;
}

export default function VideoShowcase({ onNavigateToMenu }: VideoShowcaseProps) {
  const [activeVideo, setActiveVideo] = useState<VideoReel>(VIDEO_REELS[0]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [fullScreenModal, setFullScreenModal] = useState<VideoReel | null>(null);

  const mainVideoRef = useRef<HTMLVideoElement>(null);
  const modalVideoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (mainVideoRef.current) {
      if (isPlaying) {
        mainVideoRef.current.pause();
      } else {
        mainVideoRef.current.playbackRate = 1;
        mainVideoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (mainVideoRef.current) {
      mainVideoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleSelectVideo = (reel: VideoReel) => {
    setActiveVideo(reel);
    setIsPlaying(true);
    if (mainVideoRef.current) {
      mainVideoRef.current.currentTime = 0;
      mainVideoRef.current.playbackRate = 1;
      mainVideoRef.current.play();
    }
  };

  return (
    <section className="py-24 px-4 md:px-8 max-w-7xl mx-auto relative">
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col items-center text-center gap-4 mb-12 relative z-10">
        <div className="inline-flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-widest bg-amber-500/10 border border-amber-500/30 px-4 py-1.5 rounded-full backdrop-blur-md">
          <Flame className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse" />
          <span>CINEMATIC KITCHEN REELS & LIVE SIZZLE</span>
        </div>

        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--theme-text)]">
          Grand Wok Culinary Reel Showcase
        </h2>

        <p className="text-[var(--theme-text-muted)] text-sm max-w-2xl leading-relaxed">
          Watch master culinary artisans in action — from high-flame wok hei sizzle and hand-pleated dim sum folds to our 20-minute thermal retention packaging in motion.
        </p>
      </div>

      {/* Main Video Cinema Deck & Playlist Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
        {/* Cinema Video Player (7 Columns) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <motion.div
            key={activeVideo.id}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="relative w-full aspect-video rounded-3xl overflow-hidden glass-panel border border-amber-500/40 shadow-2xl bg-[var(--theme-bg)] group"
          >
            <video
              ref={mainVideoRef}
              src={activeVideo.videoUrl}
              poster={activeVideo.poster}
              autoPlay
              loop
              muted={isMuted}
              playsInline
              className="w-full h-full object-cover"
            />

            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-black/40 pointer-events-none" />

            {/* Top Bar Info */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20">
              <span className="bg-[var(--theme-bg)]/80 backdrop-blur-md border border-amber-500/40 text-amber-400 text-xs font-black px-3.5 py-1 rounded-full flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                {activeVideo.tag}
              </span>

              <button
                onClick={() => setFullScreenModal(activeVideo)}
                className="p-2 bg-[var(--theme-bg)]/80 hover:bg-[var(--theme-surface-elevated)] border border-stone-700 rounded-full text-[var(--theme-text)] transition-transform active:scale-95"
                title="Expand Fullscreen"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>

            {/* Bottom Controls Bar */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between z-20">
              <div className="flex flex-col gap-1 max-w-[70%]">
                <h3 className="font-serif font-bold text-lg sm:text-xl text-[var(--theme-text)] drop-shadow-md">
                  {activeVideo.title}
                </h3>
                <p className="text-xs text-[var(--theme-text-muted)] line-clamp-1 drop-shadow">
                  {activeVideo.subtitle}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={togglePlay}
                  className="p-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black rounded-full shadow-lg transition-transform active:scale-90"
                  title={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? <Pause className="w-5 h-5 fill-stone-950" /> : <Play className="w-5 h-5 fill-stone-950" />}
                </button>

                <button
                  onClick={toggleMute}
                  className="p-3 bg-[var(--theme-surface-elevated)]/90 hover:bg-[var(--theme-surface)] border border-stone-700 text-[var(--theme-text)] rounded-full shadow-lg transition-transform active:scale-90"
                  title={isMuted ? "Unmute Sound" : "Mute Sound"}
                >
                  {isMuted ? <VolumeX className="w-5 h-5 text-[var(--theme-text-subtle)]" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
                </button>
              </div>
            </div>
          </motion.div>

          {/* Quick CTA below video player */}
          <div className="p-5 rounded-2xl glass-panel border border-stone-800 bg-[var(--theme-surface-elevated)]/70 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Utensils className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-[var(--theme-text)]">Inspired by the Sizzle?</span>
                <span className="text-[11px] text-[var(--theme-text-subtle)]">Order dishes freshly wok-tossed to order</span>
              </div>
            </div>

            <button
              onClick={onNavigateToMenu}
              className="bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-black px-4 py-2.5 rounded-xl transition-all shadow-md shrink-0"
            >
              Order Featured Dishes →
            </button>
          </div>
        </div>

        {/* Video Playlist Cards (5 Columns) */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <h3 className="font-serif font-bold text-lg text-[var(--theme-text)] px-1 flex items-center gap-2">
            <span>Select Video Reel</span>
            <span className="text-xs text-amber-400 font-sans">({VIDEO_REELS.length} Reels)</span>
          </h3>

          {VIDEO_REELS.map((reel) => {
            const isSelected = reel.id === activeVideo.id;
            return (
              <motion.div
                key={reel.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => handleSelectVideo(reel)}
                className={`p-3.5 rounded-2xl cursor-pointer transition-all border flex items-center gap-4 will-change-transform transform-gpu [backface-visibility:hidden] ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-500/60 shadow-xl'
                    : 'bg-[var(--theme-surface-elevated)]/90 border-stone-800/80 hover:border-stone-700'
                }`}
              >
                {/* Thumbnail */}
                <div className="relative w-24 h-16 rounded-xl overflow-hidden shrink-0 bg-[var(--theme-bg)]">
                  <img loading="lazy" src={reel.poster} alt={reel.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center ${isSelected ? 'bg-amber-500 text-stone-950' : 'bg-[var(--theme-surface-elevated)]/80 text-[var(--theme-text)]'}`}>
                      <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                    </div>
                  </div>
                  <span className="absolute bottom-1 right-1 bg-black/80 text-[9px] text-[var(--theme-text)] px-1 rounded font-mono">
                    {reel.duration}
                  </span>
                </div>

                {/* Meta */}
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-wider">
                    {reel.tag}
                  </span>
                  <h4 className="font-serif font-bold text-sm text-[var(--theme-text)] truncate">
                    {reel.title}
                  </h4>
                  <p className="text-[11px] text-[var(--theme-text-subtle)] truncate">
                    {reel.subtitle}
                  </p>
                </div>

                {isSelected && (
                  <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 ml-auto" />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Expanded Fullscreen Video Modal */}
      <AnimatePresence>
        {fullScreenModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[var(--theme-bg)]/95 backdrop-blur-2xl flex items-center justify-center p-4"
          >
            <div className="relative w-full max-w-5xl aspect-video rounded-3xl overflow-hidden bg-black border border-amber-500/30 shadow-2xl">
              <video
                ref={modalVideoRef}
                src={fullScreenModal.videoUrl}
                poster={fullScreenModal.poster}
                autoPlay
                controls
                playsInline
                className="w-full h-full object-cover"
              />

              <button
                onClick={() => setFullScreenModal(null)}
                className="absolute top-4 right-4 p-3 bg-[var(--theme-surface-elevated)]/90 text-[var(--theme-text)] hover:text-amber-400 rounded-full border border-stone-700 transition-colors z-30"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
