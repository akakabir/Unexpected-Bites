import { useState, useEffect } from 'react';
import { motion } from 'motion/react';

interface DrawingSvgDividerProps {
  index?: 1 | 2 | 3 | 4 | 5;
  variant?: 'wave' | 'flow' | 'curved' | 'zigzag' | 'loop';
  className?: string;
}

export default function DrawingSvgDivider({
  index = 1,
  variant,
  className = '',
}: DrawingSvgDividerProps) {
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      setIsReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    }
  }, []);

  // Map variant to index if passed as string name
  const effectiveIndex = variant
    ? variant === 'wave' ? 1
    : variant === 'flow' ? 2
    : variant === 'curved' ? 3
    : variant === 'zigzag' ? 4
    : 5
    : index;

  // 5 distinct hardcoded SVG path shapes with bold stroke definitions
  const dividerConfigs = [
    {
      // 1. Wave
      id: "divider-1-wave",
      d: "M 0 45 C 320 90, 640 0, 960 45 C 1280 90, 1600 0, 1920 45",
      height: "h-14 sm:h-20",
      gradient: "from-amber-400 via-orange-500 to-amber-400",
    },
    {
      // 2. Flow
      id: "divider-2-flow",
      d: "M 0 50 Q 480 0, 960 50 T 1920 50",
      height: "h-14 sm:h-20",
      gradient: "from-amber-500 via-yellow-400 to-red-500",
    },
    {
      // 3. Curved
      id: "divider-3-curved",
      d: "M 0 10 C 480 120, 1440 -40, 1920 80",
      height: "h-16 sm:h-24",
      gradient: "from-amber-400 via-amber-500 to-orange-600",
    },
    {
      // 4. Zigzag
      id: "divider-4-zigzag",
      d: "M 0 45 L 320 80 L 640 10 L 960 80 L 1280 10 L 1600 80 L 1920 45",
      height: "h-16 sm:h-24",
      gradient: "from-amber-500 via-red-500 to-amber-400",
    },
    {
      // 5. Loop
      id: "divider-5-loop",
      d: "M 0 50 C 400 -50, 600 150, 960 50 C 1320 -50, 1520 150, 1920 50",
      height: "h-18 sm:h-28",
      gradient: "from-orange-500 via-amber-400 to-rose-500",
    },
  ];

  const config = dividerConfigs[(effectiveIndex - 1) % 5];

  return (
    <div className={`w-full max-w-7xl mx-auto overflow-hidden pointer-events-none my-20 sm:my-28 px-4 ${className}`}>
      <svg
        viewBox="0 0 1920 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`w-full ${config.height} block`}
        preserveAspectRatio="none"
      >
        {/* Soft Ambient Glow Path */}
        <motion.path
          d={config.d}
          stroke="var(--theme-accent-500)"
          strokeWidth="30"
          strokeLinecap="round"
          className="opacity-35 blur-xl"
          initial={isReducedMotion ? { pathLength: 1 } : { pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 1.8, ease: "easeInOut" }}
        />

        {/* Primary Bold Draw-In Line */}
        <motion.path
          d={config.d}
          stroke={`url(#gradient-${config.id})`}
          strokeWidth="14"
          strokeLinecap="round"
          initial={isReducedMotion ? { pathLength: 1 } : { pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 1.8, ease: "easeInOut" }}
        />

        {/* Gradient Definition */}
        <defs>
          <linearGradient id={`gradient-${config.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--theme-accent-300)" stopOpacity="0.3" />
            <stop offset="30%" stopColor="var(--theme-accent-400)" stopOpacity="1" />
            <stop offset="70%" stopColor="var(--theme-accent-500)" stopOpacity="1" />
            <stop offset="100%" stopColor="var(--theme-accent-600)" stopOpacity="0.3" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
