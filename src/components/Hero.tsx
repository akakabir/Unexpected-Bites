import { useState, useEffect, useRef, MouseEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, Star, Flame, ChevronRight, ShieldCheck, Zap, Utensils } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Dish, BrandConfig } from '../types';
import AnimatedCounter from './AnimatedCounter';
import TiltCard from './TiltCard';
import MagneticButton from './MagneticButton';
import KitchenVideoBackground from './KitchenVideoBackground';

import { SiteContent } from '../lib/firebase';

gsap.registerPlugin(ScrollTrigger);

interface HeroProps {
  dishes: Dish[];
  brandConfig: BrandConfig;
  siteContent?: SiteContent;
  onSelectDish: (dish: Dish) => void;
  onAddToCart: (dish: Dish) => void;
  onOpenReviewModal: () => void;
  onNavigateToMenu?: () => void;
}

export default function Hero({
  dishes,
  brandConfig,
  siteContent,
  onSelectDish,
  onAddToCart,
  onOpenReviewModal,
  onNavigateToMenu,
}: HeroProps) {
  const [currentDishIndex, setCurrentDishIndex] = useState(0);
  const heroSectionRef = useRef<HTMLDivElement>(null);
  const videoLayerRef = useRef<HTMLDivElement>(null);
  const copyLayerRef = useRef<HTMLDivElement>(null);
  const cardDeckLayerRef = useRef<HTMLDivElement>(null);

  // Signature hero dishes stack
  const heroDishes = dishes.slice(0, 4);

  // Cycle dish cards every 4.5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDishIndex((prev) => (prev + 1) % heroDishes.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [heroDishes.length]);

  // Subtle parallax scale for Hero elements during pinned background video scrub
  useEffect(() => {
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isReduced) return;

    // Gentle scale effect on hero cards during pin
    if (cardDeckLayerRef.current && heroSectionRef.current) {
      gsap.to(cardDeckLayerRef.current, {
        scale: 0.98,
        ease: 'none',
        scrollTrigger: {
          trigger: heroSectionRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });
    }

    return () => {
      ScrollTrigger.getAll().forEach((st) => {
        if (st.trigger === heroSectionRef.current) st.kill();
      });
    };
  }, []);

  const currentDish = heroDishes[currentDishIndex] || heroDishes[0];
  const posterImage = "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1920&q=80";

  // Staggered word animation variants
  const wordContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const wordChildVariants = {
    hidden: { opacity: 0, y: 30, rotateX: -20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      scale: 1,
      transition: {
        type: "spring",
        damping: 18,
        stiffness: 140,
      },
    },
  };

  return (
    <section
      ref={heroSectionRef}
      id="hero"
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden pt-28 pb-16 px-4 md:px-8 bg-[var(--theme-bg)]"
    >
      {/* Layer 1 Background Video Layer with GSAP Scroll Scrub */}
      <div
        ref={videoLayerRef}
        className="absolute inset-0 z-0 overflow-hidden"
      >
        <KitchenVideoBackground
          posterImage="/images/wok_fried_rice_cooking.jpg"
          defaultVideoUrl="/videos/grand-wok-hero.mp4"
          heroRef={heroSectionRef}
        />

        {/* Floating Embers */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -150, -300],
              x: [0, (i % 2 === 0 ? 20 : -20), 0],
              opacity: [0, 0.8, 0],
              scale: [0.5, 1.2, 0.5],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              delay: i * 0.8,
              ease: "easeInOut",
            }}
            style={{
              left: `${15 + i * 14}%`,
              bottom: "10%",
            }}
            className="absolute w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.8)] pointer-events-none"
          />
        ))}
      </div>

      {/* Dynamic Hero Layout & Component Placements */}
      {(() => {
        const layout = siteContent?.heroLayout || 'split-right';
        const buttonAlign = siteContent?.heroButtonAlign || 'left';
        const buttonPlacement = siteContent?.heroButtonPlacement || 'inline';
        const buttonShapeClass = siteContent?.buttonStyle === 'sharp' ? 'rounded-none' : siteContent?.buttonStyle === 'rounded' ? 'rounded-2xl' : 'rounded-full';

        const alignClasses =
          buttonAlign === 'center'
            ? 'items-center text-center mx-auto'
            : buttonAlign === 'right'
            ? 'items-end text-right ml-auto'
            : buttonAlign === 'stretch'
            ? 'items-stretch w-full'
            : 'items-start text-left';

        const buttonGroupAlignClasses =
          buttonAlign === 'center'
            ? 'justify-center mx-auto'
            : buttonAlign === 'right'
            ? 'justify-end ml-auto'
            : buttonAlign === 'stretch'
            ? 'w-full'
            : 'justify-start';

        const buttonLayoutClasses =
          buttonPlacement === 'stacked'
            ? 'flex flex-col gap-4 w-full sm:max-w-md'
            : buttonPlacement === 'split-edges'
            ? 'flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 w-full'
            : 'flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-6 w-full';

        const isCentered = layout === 'centered-stacked';
        const isLeftDish = layout === 'split-left';
        const isCompact = layout === 'compact-minimal';

        return (
          <div
            className={`relative z-10 max-w-7xl mx-auto w-full grid gap-12 items-center ${
              isCentered
                ? 'grid-cols-1 justify-items-center'
                : isCompact
                ? 'grid-cols-1 lg:grid-cols-12'
                : 'grid-cols-1 lg:grid-cols-12'
            }`}
          >
            {/* Hero Copy Column */}
            <div
              ref={copyLayerRef}
              className={`flex flex-col gap-8 relative z-10 ${alignClasses} ${
                isCentered
                  ? 'max-w-3xl w-full text-center'
                  : isCompact
                  ? 'lg:col-span-8'
                  : isLeftDish
                  ? 'lg:col-span-7 order-first lg:order-last'
                  : 'lg:col-span-7'
              }`}
            >
              {/* Staggered Animated Headline */}
              <motion.h1
                variants={wordContainerVariants}
                initial="hidden"
                animate="visible"
                className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-extrabold text-amber-500 leading-[1.08] tracking-tight drop-shadow-sm ${
                  buttonAlign === 'center' || isCentered ? 'text-center' : buttonAlign === 'right' ? 'text-right' : 'text-left'
                }`}
              >
                <motion.span variants={wordChildVariants} className="inline-block text-amber-500">
                  {siteContent?.heroHeadline1 || "Gourmet Burgers &"}
                </motion.span>{" "}
                <br />
                <motion.span
                  variants={wordChildVariants}
                  className="inline-block text-amber-500 font-extrabold"
                >
                  {siteContent?.heroHeadline2 || "Warm Artisanal Desserts"}
                </motion.span>{" "}
                <br />
                <motion.span variants={wordChildVariants} className="inline-block text-amber-500">
                  {siteContent?.heroHeadline3 || <>Delivered In <AnimatedCounter to={20} suffix=" Mins." className="text-amber-600 font-black" /></>}
                </motion.span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className={`text-white drop-shadow-md text-base md:text-lg max-w-2xl leading-relaxed font-medium ${
                  buttonAlign === 'center' || isCentered ? 'text-center mx-auto' : buttonAlign === 'right' ? 'text-right ml-auto' : 'text-left'
                }`}
              >
                {siteContent?.heroSubtitle || "Experience hand-crafted chicken and beef burgers, golden crispy fries, cold drinks, and warm cinnamon rolls and desserts prepared fresh and delivered in thermal sealed packaging."}
              </motion.p>

              {/* Trust Metrics Bar */}
              <motion.div
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className={`flex flex-wrap items-center gap-6 pt-1 ${buttonGroupAlignClasses}`}
              >
                <div className="flex items-center gap-3 bg-[var(--theme-surface)] border-3 border-[var(--theme-text)] px-5 py-2.5 rounded-2xl shadow-[4px_4px_0_0_var(--theme-text)]">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-black text-[var(--theme-text)] flex items-center gap-1 font-serif tracking-wide">
                      <AnimatedCounter to={4.9} decimals={1} suffix="★" /> Rated Gourmet Kitchen
                    </span>
                    <span className="text-xs text-[var(--theme-text-muted)] font-bold tracking-wide">
                      <AnimatedCounter to={2500} suffix="+" /> Satisfied Orders
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Call To Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className={`${buttonLayoutClasses} ${buttonGroupAlignClasses} pt-4 z-20 relative`}
              >
                <MagneticButton
                  onClick={onNavigateToMenu}
                  className={`group bg-amber-500 hover:bg-amber-400 text-stone-950 font-serif font-black text-lg px-8 py-4 ${buttonShapeClass} border-3 border-[var(--theme-text)] shadow-[6px_6px_0_0_var(--theme-text)] transition-transform active:translate-y-1 active:translate-x-1 active:shadow-[0px_0px_0_0_var(--theme-text)] gap-2.5 ${buttonAlign === 'stretch' ? 'w-full justify-center' : ''}`}
                >
                  <span className="relative z-10">Explore Feast Menu</span>
                  <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1.5 transition-transform stroke-[3]" />
                </MagneticButton>

                <motion.a
                  href={`https://wa.me/${brandConfig.whatsappNumber}?text=${encodeURIComponent('Hi Unexpected Bites! 👋 I would like to place a direct order. Please send me the menu & current specials, or help me generate my itemized order invoice!')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center justify-center gap-2 bg-emerald-400 hover:bg-emerald-300 text-stone-950 font-serif font-black text-lg px-8 py-4 ${buttonShapeClass} border-3 border-[var(--theme-text)] shadow-[6px_6px_0_0_var(--theme-text)] transition-transform active:translate-y-1 active:translate-x-1 active:shadow-[0px_0px_0_0_var(--theme-text)] ${buttonAlign === 'stretch' ? 'w-full' : ''}`}
                >
                  <span>WhatsApp Order</span>
                </motion.a>
              </motion.div>
            </div>

            {/* Interactive 3D Tilting Card Deck for Signature Dishes */}
            <div
              ref={cardDeckLayerRef}
              className={`flex flex-col justify-center items-center relative ${
                isCentered
                  ? 'w-full max-w-md mx-auto mt-4'
                  : isCompact
                  ? 'lg:col-span-4'
                  : isLeftDish
                  ? 'lg:col-span-5 order-last lg:order-first lg:pr-10 xl:pr-16'
                  : 'lg:col-span-5 lg:pl-10 xl:pl-20'
              }`}
            >
              <div className="relative w-full max-w-[280px] sm:max-w-[320px] aspect-[4/5] flex items-center justify-center">
                {/* 3D Tilt Wrapper */}
                <TiltCard maxTiltX={14} maxTiltY={14} scaleOnHover={1.03} glareEffect={true} className="w-full h-full">
                  <div className="relative w-full h-full [transform-style:preserve-3d]">
                    {/* Glowing Backdrop Aura */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/35 via-red-500/20 to-yellow-500/15 blur-3xl rounded-full pointer-events-none animate-pulse" />

                    {/* Floating Badge */}
                    <motion.div
                      style={{ transform: 'translateZ(45px)' }}
                      animate={{ y: [0, 10, 0] }}
                      transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                      className="absolute -bottom-6 -right-6 z-30 bg-emerald-400 border-3 border-[var(--theme-text)] p-3 rounded-2xl shadow-none flex items-center gap-2.5 text-stone-950 pointer-events-none"
                    >
                      <div className="w-9 h-9 rounded-xl bg-emerald-300 border-2 border-stone-950 flex items-center justify-center font-black">
                        <Zap className="w-5 h-5 fill-stone-950" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-serif font-black text-stone-950 leading-tight">20-Min SLA</span>
                        <span className="text-xs font-bold text-stone-800 leading-tight">Express Dispatch</span>
                      </div>
                    </motion.div>

                    {/* Card Content - Signature Dishes */}
                    <div className="relative w-full h-full [transform-style:preserve-3d]">
                      <AnimatePresence mode="wait">
                        {currentDish && (
                          <motion.div
                            key={currentDish.id}
                            initial={{ opacity: 0, scale: 0.85, y: 40, rotate: -4 }}
                            animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
                            exit={{ opacity: 0, scale: 0.92, y: -30, rotate: 4 }}
                            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                            className="absolute inset-0 rounded-3xl overflow-hidden border-3 border-[var(--theme-text)] shadow-none flex flex-col justify-between p-5 group bg-[var(--theme-surface)] [transform-style:preserve-3d]"
                          >
                            {/* Dish Image */}
                            <div
                              style={{ transform: 'translateZ(20px)' }}
                              className="relative w-full h-64 rounded-2xl overflow-hidden cursor-pointer"
                              onClick={() => onSelectDish(currentDish)}
                            >
                              <img
                                src={currentDish.image}
                                alt={currentDish.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                              />

                              {/* Floating Badge */}
                              <div
                                style={{ transform: 'translateZ(30px)' }}
                                className="absolute top-3 left-3 bg-[var(--theme-bg)] backdrop-blur-md text-amber-400 border border-amber-500/40 font-bold text-xs px-3 py-1 rounded-full flex items-center gap-1 shadow-lg"
                              >
                                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                                <span>{currentDish.tags[0] || 'Gourmet Special'}</span>
                              </div>

                              {/* Price Tag */}
                              <div
                                style={{ transform: 'translateZ(35px)' }}
                                className="absolute top-3 right-3 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-stone-950 font-black text-sm px-3.5 py-1 rounded-full shadow-lg"
                              >
                                {currentDish.formattedPrice}
                              </div>
                            </div>

                            {/* Dish Details */}
                            <div
                              style={{ transform: 'translateZ(25px)' }}
                              className="flex flex-col gap-2 pt-2"
                            >
                              <div className="flex items-center justify-between text-xs">
                                <span className="uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1">
                                  <Utensils className="w-3.5 h-3.5" />
                                  <span>Signature Selection</span>
                                </span>
                                <div className="flex items-center gap-1 text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                                  <Star className="w-3 h-3 fill-emerald-400" />
                                  <span>{currentDish.reviewsCount}</span>
                                </div>
                              </div>

                              <h3
                                onClick={() => onSelectDish(currentDish)}
                                className="font-serif text-lg sm:text-xl font-bold text-[var(--theme-text)] group-hover:text-amber-400 transition-colors line-clamp-1 cursor-pointer"
                              >
                                {currentDish.name}
                              </h3>

                              <p className="text-[var(--theme-text-muted)] text-xs line-clamp-2 leading-relaxed">
                                {currentDish.description}
                              </p>

                              {/* Card Actions */}
                              <div className="flex items-center justify-between pt-3 border-t border-amber-500/20 mt-1">
                                <button
                                  onClick={() => onSelectDish(currentDish)}
                                  className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors cursor-pointer"
                                >
                                  <span>View Details</span>
                                  <ChevronRight className="w-4 h-4" />
                                </button>

                                <motion.button
                                  whileHover={{ scale: 1.08 }}
                                  whileTap={{ scale: 0.92 }}
                                  onClick={() => onAddToCart(currentDish)}
                                  className={`bg-gradient-to-r from-amber-500 via-yellow-400 to-red-500 hover:from-amber-400 hover:to-red-400 text-stone-950 text-xs font-black px-4 py-2 ${buttonShapeClass} shadow-md transition-all cursor-pointer`}
                                >
                                  Quick Add +
                                </motion.button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </TiltCard>

                {/* Deck Indicators */}
                <div className="absolute -bottom-10 flex items-center gap-2 z-20">
                  {heroDishes.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentDishIndex(idx)}
                      className={`h-2 rounded-full transition-all ${
                        idx === currentDishIndex ? 'w-8 bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.6)]' : 'w-2 bg-stone-700 hover:bg-stone-500'
                      }`}
                      aria-label={`Jump to hero dish ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </section>
  );
}
