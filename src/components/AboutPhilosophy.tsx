import { motion } from 'motion/react';
import { ShieldCheck, Sparkles, Heart, Thermometer, CheckCircle2, Award } from 'lucide-react';
import { BrandConfig } from '../types';

interface AboutPhilosophyProps {
  brandConfig: BrandConfig;
}

export default function AboutPhilosophy({ brandConfig }: AboutPhilosophyProps) {
  const highlights = [
    {
      title: "Zero Preservatives & MSG",
      desc: "Every dish is cooked fresh to order using non-GMO cold-pressed oils, organic ghee, and whole hand-ground spices.",
      stat: "100% Pure",
      icon: Heart,
    },
    {
      title: "Induction Thermal Packaging",
      desc: "Double-seal tamper evident containers with thermal induction lining keep your meal steaming hot at 65°C core temp.",
      stat: "65°C Heat Lock",
      icon: Thermometer,
    },
    {
      title: "Hospital-Grade Kitchen Hygiene",
      desc: "HEPA air filtration, daily temperature logs, UV utensil sterilization, and mandatory gloves & mask hygiene protocols.",
      stat: "ISO Certified",
      icon: ShieldCheck,
    },
  ];

  return (
    <section id="story" className="py-24 px-4 md:px-8 max-w-7xl mx-auto relative overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Story Content */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.7, type: "spring", damping: 20 }}
          className="lg:col-span-6 flex flex-col gap-6"
        >
          <div className="inline-flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider bg-amber-500/10 border border-amber-500/30 px-4 py-1.5 rounded-full w-fit">
            <Sparkles className="w-4 h-4" />
            <span>OUR CULINARY WOK PHILOSOPHY</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--theme-text)] leading-tight">
            Redefining Gourmet <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500">
              Asian Cloud Dining
            </span>
          </h2>

          <p className="text-[var(--theme-text-muted)] text-base leading-relaxed">
            Founded with a commitment to authentic wok hei, <span className="text-amber-400 font-bold">{brandConfig.name}</span> bridges the gap between high-end restaurant wok techniques and hyper-fast delivery. We believe food delivered to your home should never sacrifice heat, texture, or nutritional integrity.
          </p>

          <p className="text-[var(--theme-text-subtle)] text-sm leading-relaxed">
            Our state-of-the-art kitchen features commercial high-flame wok stations, charcoal tandoor hearths, and precision saucier stations operated with surgical hygiene and farm-fresh daily sourcing.
          </p>

          {/* Key Checklist */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {[
              "5 AM Daily Organic Farm Produce",
              "Non-GMO Cold Pressed Oils",
              "Double Tamper-Evident Thermal Seal",
              "100% Sizzle & Satisfaction Pledge"
            ].map((item, idx) => (
              <motion.div
                key={idx}
                whileHover={{ x: 4 }}
                className="flex items-center gap-2.5 text-[var(--theme-text)] text-xs font-semibold"
              >
                <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
                <span>{item}</span>
              </motion.div>
            ))}
          </div>

          {/* Master Culinary Collective Box */}
          <motion.div
            whileHover={{ y: -4, scale: 1.01 }}
            className="p-4.5 rounded-2xl glass-panel border border-amber-500/30 flex items-center gap-4 mt-2 bg-[var(--theme-surface-elevated)]/80 shadow-xl relative overflow-hidden"
          >
            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-amber-400/80 shrink-0 shadow-lg">
              <img loading="lazy"
                src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=200&q=75&fm=webp"
                alt="Culinary Team"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-[var(--theme-text)] font-serif flex items-center gap-1.5">
                <span>Master Wok Culinary Collective</span>
                <Award className="w-3.5 h-3.5 text-amber-400" />
              </span>
              <span className="text-[11px] text-amber-400 font-semibold">Artisanal Flame Technique</span>
              <p className="text-[11px] text-[var(--theme-text-muted)] italic mt-0.5">
                "Every wok dish is tossed to order with high-flame wok hei — intense sizzle, vibrant garden crunch, and thermal retention excellence."
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* Right Column: High-Impact Highlight Cards */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.7, type: "spring", damping: 20 }}
          className="lg:col-span-6 flex flex-col gap-5"
        >
          {highlights.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={index}
                whileHover={{ y: -6, scale: 1.02 }}
                transition={{ type: "spring", damping: 15, stiffness: 200 }}
                className="glass-panel p-6 rounded-3xl border border-stone-800 hover:border-amber-500/50 transition-all duration-300 group relative overflow-hidden bg-[var(--theme-surface-elevated)]/80 shadow-xl"
              >
                <div className="absolute -right-10 -bottom-10 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all" />

                <div className="flex items-start justify-between gap-4 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="p-3.5 rounded-2xl bg-amber-500/20 text-amber-400 group-hover:scale-110 transition-transform shadow-md">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-serif font-bold text-lg text-[var(--theme-text)] group-hover:text-amber-400 transition-colors">
                      {item.title}
                    </h3>
                  </div>

                  <span className="bg-amber-400/20 text-amber-300 border border-amber-400/40 text-xs font-extrabold px-3.5 py-1 rounded-full whitespace-nowrap shadow-sm">
                    {item.stat}
                  </span>
                </div>

                <p className="text-[var(--theme-text-muted)] text-xs leading-relaxed mt-3 pl-14 relative z-10">
                  {item.desc}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
