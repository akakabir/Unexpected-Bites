import { motion } from 'motion/react';
import { Sparkles, Flame, ShieldCheck, Heart, Clock, Award, Star } from 'lucide-react';
import { MARQUEE_PARTNERS } from '../theme/tokens';

export default function MarqueeTrustBar() {
  const marqueeItems = [
    ...MARQUEE_PARTNERS,
    ...MARQUEE_PARTNERS,
    ...MARQUEE_PARTNERS,
  ];

  return (
    <div className="relative py-7 bg-[var(--theme-bg)] border-y border-amber-500/20 overflow-hidden shadow-2xl">
      {/* Background Subtle Accent Glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-amber-500/10 pointer-events-none animate-pulse" />

      {/* Side Fade Masks for Seamless Marquee Infinite Look */}
      <div className="absolute left-0 top-0 bottom-0 w-28 bg-gradient-to-r from-[var(--theme-bg)] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-28 bg-gradient-to-l from-[var(--theme-bg)] to-transparent z-10 pointer-events-none" />

      {/* Infinite Continuous Ticker Animation */}
      <div className="flex overflow-hidden whitespace-nowrap py-1">
        <motion.div
          animate={{ x: ['0%', '-50%'] }}
          transition={{
            repeat: Infinity,
            ease: 'linear',
            duration: 22,
          }}
          className="flex items-center gap-6 pr-6 w-max"
        >
          {marqueeItems.map((item, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.08, y: -2 }}
              className="inline-flex shrink-0 items-center gap-3 px-5 py-2.5 rounded-full bg-[var(--theme-surface-elevated)] border border-amber-500/20 text-[var(--theme-text)] text-xs sm:text-sm font-extrabold tracking-wider uppercase shadow-xl hover:border-amber-500/60 transition-all cursor-pointer backdrop-blur-md"
            >
              <Flame className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse shrink-0" />
              <span className="whitespace-nowrap">{item}</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-400/80 shrink-0" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
