import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Dish } from '../types';
import { X, Star, Clock, Flame, Plus, Minus, Check, ShoppingBag, Sparkles } from 'lucide-react';

interface DishModalProps {
  dish: Dish | null;
  onClose: () => void;
  onAddToCart: (dish: Dish, quantity: number, notes?: string) => void;
}

const DEFAULT_DISH_IMAGE = "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80";

export default function DishModal({ dish, onClose, onAddToCart }: DishModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [added, setAdded] = useState(false);
  const [imgSrc, setImgSrc] = useState<string>(() => dish?.image || DEFAULT_DISH_IMAGE);

  useEffect(() => {
    if (dish) {
      setImgSrc(dish.image || DEFAULT_DISH_IMAGE);
      setQuantity(1);
      setNotes('');
      setAdded(false);
    }
  }, [dish]);

  const handleAdd = () => {
    if (!dish) return;
    onAddToCart(dish, quantity, notes);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 800);
  };

  return (
    <AnimatePresence>
      {dish && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.82, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.88, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 280 }}
            className="relative w-full max-w-xl glass-panel rounded-3xl overflow-hidden border border-amber-500/40 my-8 shadow-none z-10 bg-[var(--theme-bg)] text-[var(--theme-text)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-[var(--theme-surface)] text-[var(--theme-text-muted)] flex items-center justify-center hover:bg-amber-400 hover:text-stone-950 transition-colors shadow-lg"
              aria-label="Close detail modal"
            >
              <X className="w-5 h-5" />
            </motion.button>

            {/* Header Image */}
            <div className="relative h-64 w-full bg-[var(--theme-surface)] overflow-hidden">
              <img
                key={dish.id}
                src={imgSrc || DEFAULT_DISH_IMAGE}
                alt={dish.name}
                referrerPolicy="no-referrer"
                onError={() => {
                  console.warn("Dish modal image failed to load, switching to fallback.");
                  if (imgSrc !== DEFAULT_DISH_IMAGE) {
                    setImgSrc(DEFAULT_DISH_IMAGE);
                  }
                }}
                className="w-full h-full object-cover"
              />

              {/* Badge */}
              <div className="absolute bottom-4 left-4 flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold text-stone-950 uppercase tracking-wider ${dish.isVeg ? 'bg-emerald-400' : 'bg-red-500 text-white'}`}>
                  {dish.isVeg ? '100% Veg' : 'Non-Veg'}
                </span>
                <span className="bg-[var(--theme-bg)] text-amber-400 border border-amber-500/30 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{dish.rating} ({dish.reviewsCount})</span>
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 flex flex-col gap-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-serif font-bold text-2xl text-[var(--theme-text)]">{dish.name}</h3>
                  <p className="text-[var(--theme-text-muted)] text-xs leading-relaxed mt-1">{dish.description}</p>
                </div>
                <div className="font-serif font-extrabold text-2xl text-amber-400 whitespace-nowrap">
                  {dish.formattedPrice}
                </div>
              </div>

              {/* Nutrition & Prep Time Specs */}
              <div className="grid grid-cols-3 gap-3 bg-[var(--theme-surface)] p-3 rounded-2xl border border-amber-500/20 text-center text-xs">
                <div>
                  <span className="text-[var(--theme-text-subtle)] block text-[10px] uppercase font-semibold">Prep Time</span>
                  <span className="font-bold text-emerald-400">{dish.prepTime}</span>
                </div>
                <div>
                  <span className="text-[var(--theme-text-subtle)] block text-[10px] uppercase font-semibold">Calories</span>
                  <span className="font-bold text-[var(--theme-text)]">{dish.calories}</span>
                </div>
                <div>
                  <span className="text-[var(--theme-text-subtle)] block text-[10px] uppercase font-semibold">Spice Level</span>
                  <span className="font-bold text-amber-400 flex items-center justify-center gap-0.5">
                    {dish.spicyLevel === 0 ? 'Mild' : [...Array(dish.spicyLevel)].map((_, i) => <Flame key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />)}
                  </span>
                </div>
              </div>

              {/* Special Kitchen Notes Input */}
              <div>
                <label className="text-[var(--theme-text-muted)] font-semibold text-xs uppercase tracking-wider block mb-1">
                  Custom Kitchen Request
                </label>
                <input
                  type="text"
                  placeholder="e.g. Extra spicy, double cheese, sauce on the side..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-[var(--theme-surface)] border border-amber-500/30 rounded-xl px-3.5 py-2.5 text-xs text-[var(--theme-text)] placeholder-[var(--theme-text-muted)] focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>

              {/* Quantity & Add Action */}
              <div className="pt-3 border-t border-amber-500/20 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 bg-[var(--theme-surface)] border border-amber-500/20 rounded-2xl p-1.5">
                  <motion.button
                    whileTap={{ scale: 0.85 }}
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded-xl bg-var(--theme-bg-surface-elevated) hover:bg-amber-500/20 text-[var(--theme-text)] flex items-center justify-center font-bold"
                  >
                    <Minus className="w-4 h-4" />
                  </motion.button>
                  <span className="font-bold text-sm text-[var(--theme-text)] px-2">{quantity}</span>
                  <motion.button
                    whileTap={{ scale: 0.85 }}
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 rounded-xl bg-var(--theme-bg-surface-elevated) hover:bg-amber-500/20 text-[var(--theme-text)] flex items-center justify-center font-bold"
                  >
                    <Plus className="w-4 h-4" />
                  </motion.button>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAdd}
                  disabled={added}
                  className={`flex-1 flex items-center justify-center gap-2 font-black text-sm py-3.5 rounded-2xl shadow-xl transition-all ${
                    added
                      ? 'bg-emerald-500 text-stone-950'
                      : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-red-500 hover:from-amber-400 hover:to-red-400 text-stone-950 shadow-amber-500/20'
                  }`}
                >
                  {added ? (
                    <>
                      <Check className="w-5 h-5 stroke-[3]" />
                      <span>Added to Order!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-5 h-5" />
                      <span>Add {quantity} to Order • ₹{dish.price * quantity}</span>
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
