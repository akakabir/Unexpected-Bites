import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, Volume2, VolumeX, Upload, RefreshCw, Flame, Sparkles } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface KitchenVideoBackgroundProps {
  posterImage?: string;
  defaultVideoUrl?: string;
  overlayOpacity?: number; // 0 to 1
  heroRef?: React.RefObject<HTMLDivElement | null>;
}

export default function KitchenVideoBackground({
  posterImage = "/images/wok_fried_rice_cooking.jpg",
  defaultVideoUrl = "/videos/grand-wok-hero.mp4",
  overlayOpacity = 0.4,
  heroRef,
}: KitchenVideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [currentVideoUrl, setCurrentVideoUrl] = useState<string>(defaultVideoUrl);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(false);
  const [customUrlInput, setCustomUrlInput] = useState<string>('');

  // Particle steam effect canvas for realistic cooking atmosphere
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Steam & Sizzle Ember particles
    interface Particle {
      x: number;
      y: number;
      size: number;
      speedY: number;
      speedX: number;
      opacity: number;
      life: number;
      maxLife: number;
      type: 'steam' | 'ember' | 'sauceDrop';
    }

    const particles: Particle[] = [];

    const createParticle = () => {
      const isEmber = Math.random() > 0.7;
      particles.push({
        x: width * 0.3 + Math.random() * (width * 0.4),
        y: height * 0.6 + Math.random() * (height * 0.2),
        size: isEmber ? Math.random() * 3 + 1 : Math.random() * 25 + 15,
        speedY: isEmber ? -(Math.random() * 1.5 + 0.5) : -(Math.random() * 0.8 + 0.3),
        speedX: (Math.random() - 0.5) * 0.8,
        opacity: isEmber ? Math.random() * 0.8 + 0.2 : Math.random() * 0.15 + 0.05,
        life: 0,
        maxLife: Math.random() * 120 + 80,
        type: isEmber ? 'ember' : 'steam',
      });
    };

    for (let i = 0; i < 25; i++) {
      createParticle();
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      if (particles.length < 35 && Math.random() < 0.3) {
        createParticle();
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;
        p.y += p.speedY;
        p.x += p.speedX;

        if (p.type === 'steam') {
          p.size += 0.15;
          const fadeProgress = p.life / p.maxLife;
          const currentOpacity = p.opacity * (1 - fadeProgress);

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 245, 230, ${currentOpacity})`;
          ctx.fill();
        } else {
          // Ember
          const currentOpacity = p.opacity * (1 - p.life / p.maxLife);
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 160, 50, ${currentOpacity})`;
          ctx.fill();
        }

        if (p.life >= p.maxLife || p.y < 0) {
          particles.splice(i, 1);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Handle Video scroll-scrub playback or mobile fallback
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const isMobileDevice = typeof window !== 'undefined' && (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      window.innerWidth < 768
    );
    const isReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Mobile / Reduced Motion Fallback: normal background loop, no scroll pinning
    if (isMobileDevice || isReducedMotion || !heroRef || !heroRef.current) {
      video.muted = isMuted;
      video.loop = true;
      video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      return;
    }

    // Desktop Scroll-Scrub Mode:
    // 1. Video stays strictly paused (on frame 0 / 0.001) when page first loads
    video.pause();
    try {
      video.currentTime = 0.001;
    } catch {
      // Ignore initial seek error if metadata not fully ready
    }
    setIsPlaying(false);

    let scrollTriggerInstance: ScrollTrigger | null = null;

    const setupScrollScrub = () => {
      if (!heroRef.current || !videoRef.current) return;
      const v = videoRef.current;
      v.pause();

      if (scrollTriggerInstance) {
        scrollTriggerInstance.kill();
      }

      // Pin the hero section while scrubbing video frame-by-frame
      scrollTriggerInstance = ScrollTrigger.create({
        trigger: heroRef.current,
        pin: true,
        pinSpacing: true,
        start: 'top top',
        end: '+=1400', // 1400px scroll scrub distance
        scrub: 0.1,
        anticipatePin: 1,
        onUpdate: (self) => {
          if (v && v.duration && !isNaN(v.duration) && v.duration > 0) {
            // Map scroll progress (0.0 to 1.0) directly to currentTime
            const targetTime = Math.max(0.001, Math.min(v.duration - 0.05, self.progress * v.duration));
            v.currentTime = targetTime;
          }
        },
        onLeave: () => {
          if (v && v.duration) {
            v.currentTime = Math.max(0.001, v.duration - 0.05);
          }
        },
        onLeaveBack: () => {
          if (v) {
            v.currentTime = 0.001;
          }
        }
      });

      ScrollTrigger.refresh();
    };

    if (video.readyState >= 1) {
      setupScrollScrub();
    } else {
      video.addEventListener('loadedmetadata', setupScrollScrub, { once: true });
      video.addEventListener('canplay', setupScrollScrub, { once: true });
    }

    return () => {
      if (scrollTriggerInstance) {
        scrollTriggerInstance.kill();
      }
      if (video) {
        video.removeEventListener('loadedmetadata', setupScrollScrub);
        video.removeEventListener('canplay', setupScrollScrub);
      }
    };
  }, [currentVideoUrl, isMuted, heroRef]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCurrentVideoUrl(url);
      setHasError(false);
    }
  };

  const handleApplyCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (customUrlInput.trim()) {
      setCurrentVideoUrl(customUrlInput.trim());
      setHasError(false);
      setCustomUrlInput('');
    }
  };

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-0">
      {/* Background Poster Image Cinemagraph with subtle pan animation as fallback / base */}
      <motion.img
        src={posterImage}
        alt="Pan-Seared Fried Rice with Peas and Carrots in Wok"
        initial={{ scale: 1.05 }}
        animate={{ scale: [1.05, 1.08, 1.05] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
          isLoaded && !hasError ? 'opacity-20' : 'opacity-100'
        }`}
      />

      {/* HTML5 Video Layer */}
      <video
        ref={videoRef}
        src={currentVideoUrl}
        loop
        muted={isMuted}
        playsInline
        preload="auto"
        onLoadedData={() => {
          setIsLoaded(true);
          setHasError(false);
        }}
        onError={() => {
          console.warn("Video failed to play, switching to cinemagraph fallback.");
          setHasError(true);
        }}
        className="absolute inset-0 w-full h-full object-cover scale-105 transition-opacity duration-700"
      />

      {/* Steam & Sizzle Particles Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none opacity-80"
      />

      {/* Multi-layered Vignette & Brand Gradient Overlay */}
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle at 50% 50%, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.65) 100%)`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--theme-bg)] via-[var(--theme-bg)]/30 to-black/50" />
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[var(--theme-bg)] to-transparent" />

      {/* Interactive Control Trigger for Video Switch / Custom Upload (Interactive pointer events enabled) */}
      <div className="absolute bottom-6 left-6 z-20 pointer-events-auto flex items-center gap-2">
        <button
          onClick={() => setShowControls(!showControls)}
          className="px-3.5 py-2 rounded-full bg-stone-950/80 hover:bg-stone-900 border border-amber-500/40 text-amber-300 font-serif font-bold text-xs flex items-center gap-2 shadow-lg backdrop-blur-md transition-all cursor-pointer hover:scale-105"
          title="Video Background Settings"
        >
          <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>Live Kitchen Loop</span>
          <Sparkles className="w-3 h-3 text-amber-400" />
        </button>

        <button
          onClick={toggleMute}
          className="p-2 rounded-full bg-stone-950/80 hover:bg-stone-900 border border-stone-800 text-stone-300 hover:text-amber-400 shadow-lg backdrop-blur-md transition-all cursor-pointer"
          title={isMuted ? "Unmute Sizzle Sound" : "Mute Sound"}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
        </button>
      </div>

      {/* Video Control Drawer / Modal */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-20 left-6 z-30 pointer-events-auto w-80 p-4 rounded-2xl bg-stone-950/95 border-2 border-stone-800 text-stone-100 shadow-2xl backdrop-blur-xl"
          >
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-stone-800">
              <h4 className="font-serif font-bold text-xs text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Flame className="w-4 h-4" />
                <span>Background Video Source</span>
              </h4>
              <button
                onClick={() => setShowControls(false)}
                className="text-stone-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-stone-400 mb-3">
              Watching live wok fried rice stir-fry (peas, carrots, soy sauce drizzle, and scallions).
            </p>

            <div className="flex items-center gap-2 mb-3">
              <button
                onClick={togglePlay}
                className="flex-1 py-1.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-serif font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlaying ? 'Pause Loop' : 'Play Loop'}</span>
              </button>

              <button
                onClick={() => setCurrentVideoUrl(defaultVideoUrl)}
                className="py-1.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
                title="Reset to default video"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>

            {/* Custom File Upload */}
            <div className="space-y-2 pt-2 border-t border-stone-800/80">
              <label className="block text-[11px] font-bold text-stone-300 uppercase">
                Upload Custom MP4 Video
              </label>
              <label className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-dashed border-stone-700 hover:border-amber-400 bg-stone-900/50 hover:bg-stone-900 text-stone-300 hover:text-amber-300 text-xs cursor-pointer transition-all">
                <Upload className="w-3.5 h-3.5" />
                <span>Choose MP4 File...</span>
                <input
                  type="file"
                  accept="video/mp4,video/webm"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Direct URL Form */}
            <form onSubmit={handleApplyCustomUrl} className="mt-3 space-y-1.5">
              <label className="block text-[11px] font-bold text-stone-300 uppercase">
                Or Paste MP4 Video URL
              </label>
              <div className="flex gap-1.5">
                <input
                  type="url"
                  placeholder="https://.../video.mp4"
                  value={customUrlInput}
                  onChange={(e) => setCustomUrlInput(e.target.value)}
                  className="flex-1 bg-stone-900 border border-stone-800 rounded-lg px-2.5 py-1 text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-400"
                />
                <button
                  type="submit"
                  className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-lg transition-all cursor-pointer"
                >
                  Apply
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
