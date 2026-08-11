import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GALLERY_IMAGES } from '../data/kitchenData';
import { Sparkles, Maximize2, X } from 'lucide-react';
import TiltCard from './TiltCard';

export default function FoodGallery() {
  const [selectedImg, setSelectedImg] = useState<{ url: string; title: string; subtitle: string } | null>(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.92 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", damping: 18, stiffness: 150 },
    },
  };

  return (
    <motion.section 
      id="gallery" 
      className="py-24 px-4 md:px-8 relative overflow-hidden bg-[var(--theme-bg)] text-[var(--theme-text)] border-y border-amber-500/10 shadow-[inset_0_0_100px_rgba(245,158,11,0.05)]"
      initial={{ clipPath: 'circle(10% at 50% 50%)', opacity: 0 }}
      whileInView={{ clipPath: 'circle(150% at 50% 50%)', opacity: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="max-w-7xl mx-auto relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center text-center gap-4 mb-12"
      >
        <div className="inline-flex items-center gap-2 text-amber-400 text-xs font-black uppercase tracking-widest bg-amber-500/10 border border-amber-500/30 px-4 py-1.5 rounded-full shadow-lg">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>VISUAL GALLERY</span>
        </div>

        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-extrabold text-[var(--theme-text)]">
          Behind the Kitchen Counter
        </h2>

        <p className="text-[var(--theme-text-muted)] text-sm max-w-xl">
          A glimpse into our flame-cooking techniques, artisanal packaging, and daily organic harvests.
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {GALLERY_IMAGES.map((img) => (
          <motion.div
            key={img.id}
            variants={itemVariants}
            className="w-full h-full"
          >
            <TiltCard maxTiltX={10} maxTiltY={10} scaleOnHover={1.04} className="h-full">
              <div
                onClick={() => setSelectedImg(img)}
                className="group relative h-72 rounded-3xl overflow-hidden glass-panel border border-amber-500/25 hover:border-amber-500/60 cursor-pointer shadow-none bg-[var(--theme-surface)] h-full [transform-style:preserve-3d]"
              >
                <img
                  src={img.url}
                  alt={img.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  loading="lazy"
                />

                <div
                  style={{ transform: 'translateZ(30px)' }}
                  className="absolute bottom-4 left-4 right-4 flex items-end justify-between"
                >
                  <div className="flex flex-col">
                    <span className="font-serif font-bold text-sm text-[var(--theme-text)] group-hover:text-amber-400 transition-colors">
                      {img.title}
                    </span>
                    <span className="text-[11px] text-[var(--theme-text-muted)]">
                      {img.subtitle}
                    </span>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-[var(--theme-bg)] backdrop-blur-md text-amber-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg border border-amber-500/30">
                    <Maximize2 className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </TiltCard>
          </motion.div>
        ))}
      </motion.div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4"
            onClick={() => setSelectedImg(null)}
          >
            <motion.div
              initial={{ scale: 0.75, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="relative max-w-4xl w-full glass-panel rounded-3xl overflow-hidden p-3 border border-amber-500/30 bg-[var(--theme-bg)] shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSelectedImg(null)}
                className="absolute top-6 right-6 z-10 w-10 h-10 rounded-full bg-[var(--theme-bg)] text-[var(--theme-text)] flex items-center justify-center hover:bg-amber-500 hover:text-stone-950 transition-colors shadow-lg border border-amber-500/30"
              >
                <X className="w-5 h-5" />
              </motion.button>
              <img loading="lazy"
                src={selectedImg.url}
                alt={selectedImg.title}
                className="w-full h-auto max-h-[80vh] object-contain rounded-2xl"
              />
              <div className="p-4 text-center">
                <h3 className="font-serif font-bold text-xl text-[var(--theme-text)]">{selectedImg.title}</h3>
                <p className="text-xs text-amber-400 mt-1">{selectedImg.subtitle}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </motion.section>
  );
}
