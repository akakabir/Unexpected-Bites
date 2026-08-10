import { useState, useEffect, useRef } from 'react';
import { motion, useAnimation, AnimatePresence } from 'motion/react';
import { Flame } from 'lucide-react';

export default function Mascot() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const [isSpeechVisible, setIsSpeechVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(
        (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(max-width: 768px)').matches) ||
        (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(pointer: coarse)').matches)
      );
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Hide speech bubble once user scrolls past the hero section
  useEffect(() => {
    const handleScroll = () => {
      const heroElement = document.getElementById('hero');
      if (heroElement) {
        const rect = heroElement.getBoundingClientRect();
        setIsSpeechVisible(rect.bottom > 200);
      } else {
        setIsSpeechVisible(window.scrollY < 350);
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Real-time cursor tracking for pupils (throttled via RAF)
  useEffect(() => {
    if (isMobile) {
      // Idle animation for mobile
      controls.start({
        x: [0, 3, 0, -3, 0],
        y: [0, -2, 0, -2, 0],
        transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' }
      });
      return;
    }

    let rafId: number | null = null;

    const handleMouseMove = (e: MouseEvent) => {
      if (document.hidden) return;
      if (rafId !== null) return;

      rafId = requestAnimationFrame(() => {
        rafId = null;
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        
        // Center of the mascot face
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const deltaX = e.clientX - centerX;
        const deltaY = e.clientY - centerY;
        
        const distance = Math.hypot(deltaX, deltaY);
        
        // Bounded clamping strictly inside small eye socket
        const maxDistanceX = 2.0;
        const maxDistanceY = 2.5;
        
        const moveX = distance > 0 ? (deltaX / distance) * Math.min(distance * 0.05, maxDistanceX) : 0;
        const moveY = distance > 0 ? (deltaY / distance) * Math.min(distance * 0.05, maxDistanceY) : 0;
        
        setMousePos({ x: moveX, y: moveY });
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [isMobile, controls]);

  return (
    <div className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-50 flex items-end gap-3 pointer-events-none">
      {/* Comic Speech Bubble - Hides on Scroll */}
      <AnimatePresence>
        {isSpeechVisible && (
          <motion.div
            key="mascot-speech-bubble"
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ duration: 0.25, type: "spring", stiffness: 140, damping: 15 }}
            className="relative bg-[var(--theme-surface)] border-3 border-[var(--theme-text)] rounded-2xl px-4 py-3 shadow-[4px_4px_0_0_var(--theme-text)] mb-8 pointer-events-auto"
          >
            <p className="font-serif font-black text-sm text-[var(--theme-text)]">
              Welcome to Unexpected Bites! 🍔
            </p>
            {/* Bubble Tail */}
            <div className="absolute -bottom-3 right-4 w-4 h-4 bg-[var(--theme-surface)] border-b-3 border-r-3 border-[var(--theme-text)] transform rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mascot Body */}
      <motion.div
        ref={containerRef}
        whileHover={{ scale: 1.1, rotate: 5 }}
        className="relative w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center border-3 border-[var(--theme-text)] shadow-[4px_4px_0_0_var(--theme-text)] pointer-events-auto cursor-pointer"
      >
        <Flame className="absolute inset-0 w-full h-full text-amber-400 opacity-50 scale-125 -z-10 blur-sm" />
        
        {/* Eyes Container */}
        <div className="flex gap-2.5 mb-2.5 z-10">
          {/* Left Eye */}
          <div className="w-2.5 h-3 bg-white rounded-full border-1.5 border-[var(--theme-text)] overflow-hidden relative">
            <motion.div
              animate={isMobile ? controls : { x: mousePos.x, y: mousePos.y }}
              transition={isMobile ? {} : { type: 'spring', stiffness: 450, damping: 28 }}
              className="absolute top-1/2 left-1/2 w-1 h-1 bg-[var(--theme-text)] rounded-full -ml-0.5 -mt-0.5"
            />
          </div>
          {/* Right Eye */}
          <div className="w-2.5 h-3 bg-white rounded-full border-1.5 border-[var(--theme-text)] overflow-hidden relative">
            <motion.div
              animate={isMobile ? controls : { x: mousePos.x, y: mousePos.y }}
              transition={isMobile ? {} : { type: 'spring', stiffness: 450, damping: 28 }}
              className="absolute top-1/2 left-1/2 w-1 h-1 bg-[var(--theme-text)] rounded-full -ml-0.5 -mt-0.5"
            />
          </div>
        </div>
        
        {/* Cute Friendly Smile */}
        <svg className="absolute bottom-3.5 w-5 h-2.5 text-[var(--theme-text)]" viewBox="0 0 20 10" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M4 2 Q 10 8 16 2" />
        </svg>
      </motion.div>
    </div>
  );
}
