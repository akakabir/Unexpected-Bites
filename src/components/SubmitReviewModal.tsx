import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, X, Check, Gift, MessageSquarePlus } from 'lucide-react';
import { UserSubmittedReview } from '../types';

interface SubmitReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitReview: (review: UserSubmittedReview) => void;
}

export default function SubmitReviewModal({
  isOpen,
  onClose,
  onSubmitReview,
}: SubmitReviewModalProps) {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [dishOrdered, setDishOrdered] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name || !comment) return;

    const newReview: UserSubmittedReview = {
      id: `rev-${Date.now()}`,
      name,
      location: location || 'Central City Patron',
      rating,
      comment,
      dishOrdered: dishOrdered || 'Signature Wok Bowl',
      submittedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };

    onSubmitReview(newReview);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setName('');
      setLocation('');
      setDishOrdered('');
      setComment('');
      onClose();
    }, 1500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 280 }}
            className="relative w-full max-w-lg bg-[var(--theme-surface)] border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 text-[var(--theme-text)]"
          >
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 text-[var(--theme-text-subtle)] hover:text-[var(--theme-text)] rounded-full hover:bg-[var(--theme-surface)] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6 border-b border-amber-500/30 pb-4">
              <div className="p-3 bg-amber-500/20 text-amber-600 rounded-2xl border border-amber-500/30">
                <MessageSquarePlus className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-amber-600 font-bold uppercase tracking-wider flex items-center gap-1">
                  <Gift className="w-3.5 h-3.5" />
                  <span>DAY 1 SOFT LAUNCH OFFER</span>
                </span>
                <h3 className="text-xl font-serif font-bold text-[var(--theme-text)]">
                  Be Our Very First Critic!
                </h3>
              </div>
            </div>

            <p className="text-[var(--theme-text-muted)] text-xs mb-6 leading-relaxed bg-[var(--theme-surface-elevated)] p-3.5 rounded-xl border border-amber-500/20">
              Submit your authentic review below. Your review will immediately appear on the main website wall of reviews!
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[var(--theme-text-muted)] mb-1">Your Name / Handle *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex M."
                  className="w-full bg-[var(--theme-surface-elevated)] border border-stone-700 focus:border-amber-400 rounded-xl px-4 py-2.5 text-sm text-[var(--theme-text)] outline-none transition-colors"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--theme-text-muted)] mb-1">Area / City</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Downtown Central"
                    className="w-full bg-[var(--theme-surface-elevated)] border border-stone-700 focus:border-amber-400 rounded-xl px-4 py-2.5 text-sm text-[var(--theme-text)] outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--theme-text-muted)] mb-1">Dish Tasted</label>
                  <input
                    type="text"
                    value={dishOrdered}
                    onChange={(e) => setDishOrdered(e.target.value)}
                    placeholder="e.g. Truffle Mushroom Wok"
                    className="w-full bg-[var(--theme-surface-elevated)] border border-stone-700 focus:border-amber-400 rounded-xl px-4 py-2.5 text-sm text-[var(--theme-text)] outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--theme-text-muted)] mb-2">Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className="p-1 hover:scale-125 transition-transform focus:outline-none"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= rating
                            ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                            : 'text-[var(--theme-text-muted)]'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-amber-400 ml-2">{rating}/5 Stars</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--theme-text-muted)] mb-1">Honest Review & Feedback *</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell us about the wok aroma, heat level, packaging, and delivery speed..."
                  rows={3}
                  className="w-full bg-[var(--theme-surface-elevated)] border border-amber-500/30 focus:border-amber-500 rounded-xl p-3 text-sm text-[var(--theme-text)] outline-none transition-colors resize-none"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 bg-[var(--theme-surface-elevated)] hover:bg-[var(--theme-bg)] text-[var(--theme-text-muted)] rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
                >
                  {submitted ? (
                    <>
                      <Check className="w-4 h-4 text-stone-950" />
                      <span>Review Published Live!</span>
                    </>
                  ) : (
                    <span>Publish 1st Review</span>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
