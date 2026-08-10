import { motion, AnimatePresence } from 'motion/react';
import { Star, Quote, CheckCircle2, PlusCircle, Gift, Award } from 'lucide-react';
import { UserSubmittedReview } from '../types';
import TiltCard from './TiltCard';

interface TestimonialsProps {
  userReviews: UserSubmittedReview[];
  onOpenReviewModal: () => void;
}

export default function Testimonials({ userReviews, onOpenReviewModal }: TestimonialsProps) {
  return (
    <section id="reviews" className="py-24 px-4 md:px-8 max-w-7xl mx-auto relative">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 via-transparent to-transparent pointer-events-none rounded-3xl" />

      {/* Header */}
      <div className="flex flex-col items-center text-center gap-4 mb-14 relative z-10">
        <div className="inline-flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-widest bg-amber-500/10 border border-amber-500/30 px-4 py-1.5 rounded-full backdrop-blur-md">
          <Award className="w-4 h-4 text-amber-400" />
          <span>LOVED BY 2,500+ GOURMET FOODIES</span>
        </div>

        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-extrabold text-[var(--theme-text)]">
          Patron Reviews & Praise
        </h2>

        <p className="text-[var(--theme-text-muted)] text-sm max-w-2xl leading-relaxed">
          Read genuine feedback from foodies who have experienced our flame sizzle and 20-minute thermal dispatch.
        </p>

        {/* Action Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onOpenReviewModal}
          className="mt-2 inline-flex items-center gap-2.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-red-500 text-stone-950 font-black text-sm px-6 py-3.5 rounded-full shadow-xl shadow-amber-500/20 hover:from-amber-400 hover:to-red-400 transition-all"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Share Your Foodie Review</span>
        </motion.button>
      </div>

      {/* Stacked Hand of Cards Reviews */}
      <div className="flex flex-row overflow-x-auto pb-16 pt-8 px-8 gap-0 relative z-10 snap-x snap-mandatory hide-scrollbar group/deck">
        {userReviews.length === 0 && (
          <div className="col-span-full py-16 px-6 glass-panel rounded-3xl border border-amber-500/30 bg-[var(--theme-surface)] text-center flex flex-col items-center justify-center gap-4 max-w-2xl mx-auto shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-2xl">
              ⭐
            </div>
            <h3 className="font-serif font-bold text-xl text-[var(--theme-text)]">
              100% Genuine Patron Reviews
            </h3>
            <p className="text-[var(--theme-text-muted)] text-sm leading-relaxed max-w-md">
              We do not pre-load fake reviews. Be the very first foodie to share your authentic experience with Grand Wok Kitchen!
            </p>
            <button
              onClick={onOpenReviewModal}
              className="mt-2 inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-black text-sm px-6 py-3 rounded-full shadow-lg transition-transform active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Submit First Patron Review</span>
            </button>
          </div>
        )}

        {/* User Submitted Live Reviews First */}
        <AnimatePresence>
          {userReviews.map((review, index) => {
            // Stacked card rotation & overlap math
            const maxCards = Math.min(userReviews.length, 5);
            const relativeIndex = index % maxCards;
            const isEven = relativeIndex % 2 === 0;
            const rotation = isEven ? (relativeIndex * 2) - 4 : (relativeIndex * -2) + 2;
            const translateY = (Math.abs(relativeIndex - 2) * 8) - 10;
            
            return (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, scale: 0.9, y: 50, rotate: 0 }}
                animate={{ opacity: 1, scale: 1, y: translateY, rotate: rotation }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", damping: 15, stiffness: 100, delay: index * 0.1 }}
                whileHover={{ 
                  scale: 1.05, 
                  y: -30, 
                  rotate: 0, 
                  zIndex: 50,
                  transition: { type: "spring", stiffness: 300, damping: 20 }
                }}
                className="w-80 h-96 shrink-0 snap-center relative -ml-16 first:ml-0 hover:z-50 cursor-grab active:cursor-grabbing transition-transform"
                style={{ zIndex: 10 + index }}
              >
                <TiltCard maxTiltX={5} maxTiltY={5} scaleOnHover={1.02} className="h-full w-full">
                  <div className="glass-panel p-6 rounded-3xl border border-amber-500/30 bg-[var(--theme-surface)] shadow-2xl flex flex-col justify-between relative h-full [transform-style:preserve-3d]">
                    <Quote className="absolute top-6 right-6 w-10 h-10 text-amber-500/20 pointer-events-none" />
                    <div className="flex flex-col gap-4 relative z-10 [transform-style:preserve-3d]">
                      <div
                        style={{ transform: 'translateZ(30px)' }}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-1 text-amber-400">
                          {[...Array(review.rating)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-amber-400" />
                          ))}
                        </div>
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Gift className="w-3 h-3" />
                          Verified Patron
                        </span>
                      </div>
                      <p
                        style={{ transform: 'translateZ(20px)' }}
                        className="text-[var(--theme-text)] text-xs sm:text-sm leading-relaxed italic font-medium"
                      >
                        "{review.comment}"
                      </p>
                    </div>

                    <div
                      style={{ transform: 'translateZ(25px)' }}
                      className="pt-6 mt-6 border-t border-amber-500/20 flex items-center gap-3"
                    >
                      <div className="w-11 h-11 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 font-bold flex items-center justify-center text-sm shadow-[0_5px_15px_rgba(0,0,0,0.5)]">
                        {review.name.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className="font-serif font-bold text-sm text-[var(--theme-text)]">{review.name}</span>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        </div>
                        <span className="text-[11px] text-[var(--theme-text-muted)]">
                          {review.location} • <span className="text-amber-400">{review.dishOrdered}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </TiltCard>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </section>
  );
}
