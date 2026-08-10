import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Flame, Sparkles, Utensils } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

interface ScrollVideoSectionProps {
  onNavigateToMenu?: () => void;
}

export default function ScrollVideoSection({ onNavigateToMenu }: ScrollVideoSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isInView, setIsInView] = useState(false);

  // Lazy play/pause video based on viewport intersection
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsInView(entry.isIntersecting);
          if (videoRef.current) {
            if (entry.isIntersecting) {
              videoRef.current.play().catch(() => {});
            } else {
              videoRef.current.pause();
            }
          }
        });
      },
      { rootMargin: '150px' }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // GSAP ScrollTrigger scale animation
  useEffect(() => {
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isReduced) return;

    if (containerRef.current && sectionRef.current) {
      const animation = gsap.fromTo(
        containerRef.current,
        {
          scale: 0.84,
          borderRadius: '2.5rem',
        },
        {
          scale: 1,
          borderRadius: '1.75rem',
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 85%',
            end: 'center 45%',
            scrub: 0.5,
            invalidateOnRefresh: true,
          },
        }
      );

      return () => {
        animation.kill();
      };
    }
  }, []);

  const videoUrl = "/videos/grand-wok-hero.mp4";
  const fallbackVideoUrl = "https://samplelib.com/lib/preview/mp4/sample-10s.mp4";

  return (
    <section ref={sectionRef} className="py-20 px-4 md:px-8 max-w-7xl mx-auto relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Info */}
      <div className="flex flex-col items-center text-center gap-3 mb-10 relative z-10">
        <div className="inline-flex items-center gap-2 bg-amber-500/15 border-2 border-[var(--theme-text)] shadow-[3px_3px_0_0_var(--theme-text)] px-4 py-1.5 rounded-full text-xs font-serif font-black text-[var(--theme-text)]">
          <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-pulse" />
          <span>LIVE WOK HEI SIZZLE IN MOTION</span>
        </div>

        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--theme-text)] max-w-3xl leading-tight">
          Witness Artisanal High-Flame Wok Craftsmanship
        </h2>

        <p className="text-[var(--theme-text-muted)] text-sm md:text-base max-w-2xl leading-relaxed">
          Watch master culinary artisans toss live flame-grilled bowls, searing white-hot woks at 800°F before sealing in thermal retention dispatch boxes.
        </p>
      </div>

      {/* Scroll-Scale Video Container */}
      <div className="w-full flex justify-center relative z-10">
        <div
          ref={containerRef}
          className="relative w-full max-w-6xl aspect-video overflow-hidden border-3 border-[var(--theme-text)] shadow-[8px_8px_0_0_var(--theme-text)] bg-[var(--theme-surface)] will-change-transform"
        >
          <video
            ref={videoRef}
            preload="auto"
            autoPlay
            loop
            muted
            playsInline
            onCanPlay={(e) => e.currentTarget.play()}
            className="w-full h-full object-cover"
          >
            <source src={videoUrl} type="video/mp4" />
            <source src={fallbackVideoUrl} type="video/mp4" />
          </video>

          {/* Dark Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-stone-950/30 pointer-events-none" />

          {/* Top Left Badge */}
          <div className="absolute top-4 left-4 sm:top-6 sm:left-6 flex items-center gap-2 bg-[var(--theme-surface)]/90 border-2 border-[var(--theme-text)] shadow-[3px_3px_0_0_var(--theme-text)] px-3.5 py-1.5 rounded-full z-20">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-serif font-black text-[var(--theme-text)] uppercase tracking-wide">
              800°F Live Sizzle
            </span>
          </div>

          {/* Bottom Info Overlay */}
          <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 z-20">
            <div className="flex flex-col gap-1">
              <h3 className="font-serif font-black text-xl sm:text-2xl text-white drop-shadow-md">
                Flame-Seared & Wok-Tossed to Order
              </h3>
              <p className="text-xs text-stone-300 drop-shadow max-w-md">
                Every dish is cooked live upon order receipt to guarantee crispy vegetables and authentic smokiness.
              </p>
            </div>

            {onNavigateToMenu && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onNavigateToMenu}
                className="bg-amber-400 hover:bg-amber-300 text-stone-950 font-serif font-black text-xs sm:text-sm px-5 py-2.5 rounded-full border-2 border-[var(--theme-text)] shadow-[3px_3px_0_0_var(--theme-text)] transition-all flex items-center gap-2 shrink-0 cursor-pointer"
              >
                <Utensils className="w-4 h-4" />
                <span>Order Live Wok Dishes →</span>
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
