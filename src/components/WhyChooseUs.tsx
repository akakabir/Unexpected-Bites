import { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Shield, Flame, Leaf } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import TiltCard from './TiltCard';

gsap.registerPlugin(ScrollTrigger);

export default function WhyChooseUs() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const bgLayerRef = useRef<HTMLDivElement>(null);
  const cardsLayerRef = useRef<HTMLDivElement>(null);
  const badgeRefs = useRef<(HTMLDivElement | null)[]>([]);

  const cards = [
    {
      title: "Gourmet Fresh Crafting",
      desc: "Every burger patty, crispy fry order, and warm cinnamon roll dessert is prepared fresh to order using premium ingredients and secret house sauces.",
      stat: "100% Fresh Craft",
      image: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=600&q=75&fm=webp",
      icon: Flame,
    },
    {
      title: "Eco Thermal Lock System",
      desc: "Our biodegradable foil-insulated boxes keep meals at 65°C core temp for up to 45 minutes without sogginess.",
      stat: "45 Min Temp Lock",
      image: "https://images.unsplash.com/photo-1526367790999-0150786686a2?auto=format&fit=crop&w=600&q=75&fm=webp",
      icon: Shield,
    },
    {
      title: "Daily Organic Sourcing",
      desc: "Fresh produce sourced at 5:00 AM every morning from local organic cooperatives. Zero chemical preservatives or additives.",
      stat: "0% Palm Oil",
      image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=600&q=75&fm=webp",
      icon: Leaf,
    },
  ];

  useEffect(() => {
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isReduced) return;

    // Layer 1 Background Parallax
    if (bgLayerRef.current) {
      gsap.to(bgLayerRef.current, {
        y: 80,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
      });
    }

    // Layer 2 Cards Parallax
    if (cardsLayerRef.current) {
      gsap.to(cardsLayerRef.current, {
        y: -40,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.2,
        },
      });
    }

    // Layer 3 Floating Stat Badges Parallax + Rotate
    badgeRefs.current.forEach((badge, i) => {
      if (!badge) return;
      gsap.to(badge, {
        y: -30 - i * 15,
        rotate: i % 2 === 0 ? 4 : -4,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
          end: 'bottom 20%',
          scrub: 1.5,
        },
      });
    });

    return () => {
      ScrollTrigger.getAll().forEach((st) => {
        if (st.trigger === sectionRef.current) st.kill();
      });
    };
  }, []);

  return (
    <section
      id="why-choose-us"
      ref={sectionRef}
      className="py-24 px-4 md:px-8 max-w-7xl mx-auto relative overflow-hidden"
    >
      {/* Requirement 2: Layered Parallax Background Orbs */}
      <div
        ref={bgLayerRef}
        className="absolute inset-0 pointer-events-none z-0 flex items-center justify-between opacity-30"
      >
        <div className="w-96 h-96 rounded-full bg-amber-500/20 blur-3xl" />
        <div className="w-96 h-96 rounded-full bg-red-500/15 blur-3xl" />
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center text-center gap-4 mb-16 relative z-10"
      >
        <div className="inline-flex items-center gap-2 text-amber-400 text-xs font-black uppercase tracking-widest bg-amber-500/10 border border-amber-500/30 px-4 py-1.5 rounded-full shadow-lg">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>OUR UNCOMPROMISING STANDARD</span>
        </div>

        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-extrabold text-[var(--theme-text)]">
          Why Discerning Foodies Choose Us
        </h2>

        <p className="text-[var(--theme-text-muted)] text-sm max-w-xl">
          Combining culinary craft with thermal technology so your food arrives as hot as the kitchen line.
        </p>
      </motion.div>
      {/* Requirement 1: Mouse-Tracking 3D Tilt Cards */}
      <div ref={cardsLayerRef} className="flex flex-col gap-12 relative z-10 w-full max-w-5xl mx-auto">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          const isEven = idx % 2 === 0;
          return (
            <TiltCard
              key={idx}
              maxTiltX={8}
              maxTiltY={8}
              scaleOnHover={1.02}
              glareEffect={true}
              className="w-full"
            >
              <div className={`glass-panel rounded-3xl overflow-hidden border border-amber-500/25 hover:border-amber-500/60 transition-all duration-300 group flex flex-col md:flex-row ${!isEven ? 'md:flex-row-reverse' : ''} shadow-2xl bg-[var(--theme-surface)] [transform-style:preserve-3d]`}>
                {/* Image Section */}
                <div className="relative h-64 md:h-80 w-full md:w-1/2 overflow-hidden bg-[var(--theme-bg)] shrink-0">
                  <img loading="lazy"
                    src={card.image}
                    alt={card.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-[var(--theme-bg)] to-transparent ${!isEven ? 'md:bg-gradient-to-l' : ''} opacity-80 md:opacity-100`} />

                  {/* Floating Stat Badge */}
                  <div
                    ref={(el) => { badgeRefs.current[idx] = el; }}
                    style={{ transform: 'translateZ(35px)' }}
                    className={`absolute bottom-4 ${isEven ? 'right-4' : 'left-4'} bg-[var(--theme-bg)] backdrop-blur-md text-amber-400 border border-amber-500/40 font-black text-xs px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-[0_10px_25px_rgba(0,0,0,0.6)]`}
                  >
                    <Icon className="w-3.5 h-3.5 text-amber-400" />
                    <span>{card.stat}</span>
                  </div>
                </div>

                {/* Content Section */}
                <div
                  style={{ transform: 'translateZ(20px)' }}
                  className="p-8 md:p-12 flex flex-col justify-center gap-4 flex-1"
                >
                  <div>
                    <h3 className="font-serif font-bold text-2xl text-[var(--theme-text)] group-hover:text-amber-400 transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-[var(--theme-text-muted)] text-sm md:text-base leading-relaxed mt-4">
                      {card.desc}
                    </p>
                  </div>
                  <div className="pt-6 mt-6 border-t border-amber-500/20 flex items-center justify-between text-xs text-amber-400 font-bold">
                    <span>Guaranteed Quality Standard</span>
                    <Sparkles className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform duration-300" />
                  </div>
                </div>
              </div>
            </TiltCard>
          );
        })}
      </div>
    </section>
  );
}
