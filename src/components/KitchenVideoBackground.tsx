import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, Volume2, VolumeX, Upload, RefreshCw, Flame, Sparkles } from 'lucide-react';

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
      if (document.hidden) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

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

  // Handle continuous video background autoplay loop
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = isMuted;
    video.loop = true;
    video.playbackRate = 1;

    const playVideo = () => {
      video
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.warn('Autoplay error:', err);
          setIsPlaying(false);
        });
    };

    if (video.readyState >= 2) {
      playVideo();
    } else {
      video.addEventListener('canplay', playVideo, { once: true });
    }

    return () => {
      video.removeEventListener('canplay', playVideo);
    };
  }, [currentVideoUrl, isMuted]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.playbackRate = 1;
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
        initial={{ scale: 1.15 }}
        animate={{ scale: [1.15, 1.18, 1.15] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
        className={`absolute inset-0 w-full h-full object-cover object-bottom scale-115 transition-opacity duration-1000 ${
          isLoaded && !hasError ? 'opacity-20' : 'opacity-100'
        }`}
        style={{ objectPosition: '50% 100%' }}
      />

      {/* HTML5 Video Layer */}
      <video
        ref={videoRef}
        src={currentVideoUrl}
        autoPlay
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
        className="absolute inset-0 w-full h-full object-cover object-center scale-100 transition-opacity duration-700"
        style={{ objectPosition: '50% 100%' }}
      />

      {/* Steam & Sizzle Particles Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none opacity-80"
      />

      {/* Multi-layered Vignette & Dark Overlay for Text Contrast (NO bottom fade-to-light-bg!) */}
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle at 50% 50%, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.55) 100%)`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/25 to-black/45 pointer-events-none" />
    </div>
  );
}
