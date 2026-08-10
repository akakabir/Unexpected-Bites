import { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { ChefHat, ShieldCheck, Navigation, UtensilsCrossed, Sparkles, Flame } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import TiltCard from './TiltCard';

gsap.registerPlugin(ScrollTrigger);

export default function HowItWorks() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const pinContainerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const iconRefs = useRef<(HTMLDivElement | null)[]>([]);

  const steps = [
    {
      num: "01",
      title: "Flame-Seared Grill Station",
      desc: "Order received directly at our chef station. Gourmet patties & seasoned ingredients are seared over open flame in under 12 minutes.",
      icon: ChefHat,
      color: "from-amber-500 to-amber-600",
    },
    {
      num: "02",
      title: "Thermal Induction Sealing",
      desc: "Packed into insulated foil containers with tamper-proof double seals, locking in juices, aroma, and 65°C core heat.",
      icon: ShieldCheck,
      color: "from-emerald-500 to-emerald-600",
    },
    {
      num: "03",
      title: "Express Hyper-Local Dispatch",
      desc: "Dedicated rider assigned instantly with heated thermal dispatch bags for direct 8-10 minute transit to your location.",
      icon: Navigation,
      color: "from-blue-500 to-blue-600",
    },
    {
      num: "04",
      title: "Sizzling Gourmet Feast",
      desc: "Unbox restaurant-quality culinary creations. Steaming hot, beautifully layered, and ready to savor immediately.",
      icon: UtensilsCrossed,
      color: "from-rose-500 to-rose-600",
    },
  ];

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Draw SVG connecting line between steps
    if (pathRef.current && !isReduced) {
      const length = pathRef.current.getTotalLength();
      gsap.set(pathRef.current, {
        strokeDasharray: length,
        strokeDashoffset: length,
      });

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 70%',
        end: 'bottom 20%',
        scrub: 1,
        onUpdate: (self) => {
          if (pathRef.current) {
            gsap.set(pathRef.current, {
              strokeDashoffset: length * (1 - self.progress),
            });
          }
        },
      });
    }

    // Item icon rotation/scale scroll transforms
    iconRefs.current.forEach((iconEl, idx) => {
      if (!iconEl || isReduced) return;
      gsap.fromTo(
        iconEl,
        { rotate: -30, scale: 0.8 },
        {
          rotate: 360,
          scale: 1.15,
          ease: 'power1.out',
          scrollTrigger: {
            trigger: stepRefs.current[idx] || sectionRef.current,
            start: 'top 85%',
            end: 'bottom 40%',
            scrub: 1,
          },
        }
      );
    });

    // Item depth cards scroll transform sequence
    stepRefs.current.forEach((stepEl, idx) => {
      if (!stepEl || isReduced) return;
      gsap.fromTo(
        stepEl,
        { y: 60, opacity: 0.3, scale: 0.92, rotateX: 15 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          rotateX: 0,
          scrollTrigger: {
            trigger: stepEl,
            start: 'top 85%',
            end: 'top 50%',
            scrub: 0.8,
          },
        }
      );
    });

    // Step card highlight animation as user scrolls through the section naturally
    if (sectionRef.current) {
      const highlightTrigger = ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 70%',
        end: 'bottom 30%',
        scrub: 1,
        onUpdate: (self) => {
          const progress = self.progress;
          stepRefs.current.forEach((stepEl, i) => {
            if (!stepEl) return;
            const targetProg = i / (steps.length - 1);
            const dist = Math.abs(progress - targetProg);
            if (dist < 0.25) {
              gsap.to(stepEl, {
                scale: 1.05,
                borderColor: 'rgba(245, 158, 11, 0.8)',
                boxShadow: '0 20px 40px rgba(245, 158, 11, 0.2)',
                duration: 0.2,
              });
            } else {
              gsap.to(stepEl, {
                scale: 1,
                borderColor: 'rgba(245, 158, 11, 0.2)',
                boxShadow: '0 10px 20px rgba(0, 0, 0, 0.5)',
                duration: 0.2,
              });
            }
          });
        },
      });

      return () => {
        highlightTrigger.kill();
        ScrollTrigger.getAll().forEach((st) => {
          if (st.trigger === sectionRef.current) st.kill();
        });
      };
    }
  }, []);

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="py-20 px-4 md:px-8 max-w-7xl mx-auto relative overflow-hidden"
    >
      <div ref={pinContainerRef} className="w-full">
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-4 mb-16 relative z-10">
          <div className="inline-flex items-center gap-2 text-amber-400 text-xs font-black uppercase tracking-widest bg-amber-500/10 border border-amber-500/30 px-4 py-1.5 rounded-full shadow-lg">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>PRECISION FLAME DISPATCH PROCESS</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-extrabold text-[var(--theme-text)] tracking-tight">
            How Your Meal Reaches You Sizzling Hot
          </h2>

          <p className="text-[var(--theme-text-muted)] text-sm max-w-xl">
            Engineered from grill flame to dining table so every bite maintains peak flavor, texture, and aroma.
          </p>
        </div>

        {/* Steps Timeline Grid with Connected Scroll-Drawn SVG Line */}
        <div className="relative z-10">
          {/* Scroll-Drawn Connecting Path (Desktop) */}
          <div className="hidden lg:block absolute inset-0 z-0 pointer-events-none">
            <svg
              viewBox="0 0 1000 400"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full"
              preserveAspectRatio="none"
            >
              <path
                ref={pathRef}
                d="M 50 80 Q 250 250, 400 150 T 850 300"
                stroke="url(#step-line-grad)"
                strokeWidth="4"
                strokeLinecap="round"
                className="opacity-60"
              />
              <defs>
                <linearGradient id="step-line-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="var(--theme-accent-300)" />
                  <stop offset="50%" stopColor="var(--theme-accent-500)" />
                  <stop offset="100%" stopColor="var(--theme-accent-600)" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-8 lg:gap-4 relative z-10 w-full min-h-[400px] pt-8">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              // Staggered margin-top for an asymmetrical timeline look
              const mtClasses = [
                'lg:mt-0',
                'lg:mt-24',
                'lg:mt-8',
                'lg:mt-32'
              ];
              // Varying widths for organic feel
              const widthClasses = [
                'lg:w-[22%]',
                'lg:w-[26%]',
                'lg:w-[20%]',
                'lg:w-[25%]'
              ];
              
              return (
                <div
                  key={idx}
                  ref={(el) => { stepRefs.current[idx] = el; }}
                  className={`w-full ${widthClasses[idx]} ${mtClasses[idx]}`}
                >
                  <TiltCard
                    maxTiltX={10}
                    maxTiltY={10}
                    scaleOnHover={1.04}
                    className="h-full"
                  >
                    <div className="glass-panel p-6 rounded-3xl border border-amber-500/20 hover:border-amber-500/60 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden bg-[var(--theme-surface)] shadow-2xl h-full [transform-style:preserve-3d]">
                      {/* Depth Layer 0: Giant Step Number */}
                      <span
                        style={{ transform: 'translateZ(10px)' }}
                        className="absolute top-2 right-4 font-serif font-black text-6xl text-amber-500/10 select-none group-hover:text-amber-500/25 transition-colors"
                      >
                        {step.num}
                      </span>

                      <div className="flex flex-col gap-4 relative z-10 [transform-style:preserve-3d]">
                        {/* Depth Layer 2: Icon with Scroll Rotation */}
                        <div
                          ref={(el) => { iconRefs.current[idx] = el; }}
                          style={{ transform: 'translateZ(30px)' }}
                          className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.color} text-stone-950 flex items-center justify-center font-bold shadow-xl shadow-amber-500/20 group-hover:scale-110 transition-transform`}
                        >
                          <Icon className="w-7 h-7 stroke-[2.2]" />
                        </div>

                        {/* Depth Layer 1: Content */}
                        <div
                          style={{ transform: 'translateZ(20px)' }}
                          className="flex flex-col gap-2 pt-2"
                        >
                          <span className="text-[10px] font-black tracking-widest text-amber-400 uppercase flex items-center gap-1">
                            <Flame className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span>Phase {step.num}</span>
                          </span>
                          <h3 className="font-serif font-bold text-lg text-[var(--theme-text)] group-hover:text-amber-400 transition-colors">
                            {step.title}
                          </h3>
                          <p className="text-[var(--theme-text-muted)] text-xs leading-relaxed">
                            {step.desc}
                          </p>
                        </div>
                      </div>
                    </div>
                  </TiltCard>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
