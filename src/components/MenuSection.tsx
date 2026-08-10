import { useState, useEffect, MouseEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Dish } from '../types';
import { MENU_CATEGORIES } from '../theme/tokens';
import { Flame, Star, Sparkles, Plus, Search, Eye, ChevronRight, Check } from 'lucide-react';
import TiltCard from './TiltCard';

interface MenuSectionProps {
  dishes: Dish[];
  onSelectDish: (dish: Dish) => void;
  onAddToCart: (dish: Dish) => void;
  selectedCategory?: string;
}

export default function MenuSection({
  dishes,
  onSelectDish,
  onAddToCart,
  selectedCategory = 'all',
}: MenuSectionProps) {
  const [activeCategory, setActiveCategory] = useState<string>(selectedCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [addedMap, setAddedMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (selectedCategory) {
      setActiveCategory(selectedCategory);
    }
  }, [selectedCategory]);

  const filteredDishes = dishes.filter((dish) => {
    const matchesCategory = activeCategory === 'all' || dish.category === activeCategory;
    const matchesSearch =
      dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dish.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dish.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleQuickAdd = (e: MouseEvent, dish: Dish) => {
    e.stopPropagation();
    onAddToCart(dish);
    setAddedMap((prev) => ({ ...prev, [dish.id]: true }));
    setTimeout(() => {
      setAddedMap((prev) => ({ ...prev, [dish.id]: false }));
    }, 1200);
  };

  return (
    <section id="menu" className="py-24 px-4 md:px-8 max-w-7xl mx-auto relative">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center text-center gap-4 mb-12"
      >
        <div className="inline-flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-widest bg-amber-500/10 border border-amber-500/30 px-4 py-1.5 rounded-full shadow-lg">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>FRESH GOURMET FEAST SELECTIONS</span>
        </div>

        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-extrabold text-[var(--theme-text)]">
          Our Sizzling Gourmet Menu
        </h2>

        <p className="text-[var(--theme-text-muted)] text-sm max-w-xl">
          Crafted live on open flames. Sealed with induction thermal barriers for peak sizzle and aroma.
        </p>
      </motion.div>

      {/* Search & Category Filter Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10">
        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 w-full md:w-auto scrollbar-none">
          {MENU_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`relative px-4 py-2.5 rounded-2xl text-xs font-bold tracking-wide transition-colors whitespace-nowrap ${
                  isActive ? 'text-stone-950 font-black' : 'text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] bg-[var(--theme-surface)] border border-amber-500/20'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeCategoryTab"
                    transition={{ type: 'spring', damping: 22, stiffness: 300 }}
                    className="absolute inset-0 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 rounded-2xl shadow-lg shadow-amber-500/25 z-0"
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <span>{cat.label}</span>
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
          <input
            type="text"
            placeholder="Search gourmet dishes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[var(--theme-surface)] border border-amber-500/30 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-[var(--theme-text)] placeholder-stone-500 focus:outline-none focus:border-amber-400 transition-colors"
          />
        </div>
      </div>

      {/* Dishes Bento Grid with 3D Tilt Cards */}
      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 auto-rows-max gap-6">
        <AnimatePresence mode="popLayout">
          {filteredDishes.map((dish, index) => {
            const isJustAdded = addedMap[dish.id];
            
            // Asymmetric Bento Logic
            const isFeatured = index % 5 === 0;
            const isWide = index % 5 === 3;
            
            let gridClasses = "lg:col-span-1 lg:row-span-1";
            if (isFeatured) {
              gridClasses = "md:col-span-2 lg:col-span-2 lg:row-span-2";
            } else if (isWide) {
              gridClasses = "md:col-span-2 lg:col-span-2 lg:row-span-1";
            }

            return (
              <motion.div
                key={dish.id}
                layout
                initial={{ opacity: 0, scale: 0.92, y: 40 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                transition={{
                  type: 'spring',
                  damping: 22,
                  stiffness: 180,
                  delay: (index % 3) * 0.08,
                }}
                className={`w-full h-full ${gridClasses}`}
              >
                <TiltCard
                  maxTiltX={8}
                  maxTiltY={8}
                  scaleOnHover={1.02}
                  glareEffect={true}
                  className="h-full"
                >
                  <div
                    onClick={() => onSelectDish(dish)}
                    className="glass-panel rounded-3xl border border-[var(--theme-text)] shadow-[4px_4px_0_0_var(--theme-text)] hover:shadow-[6px_6px_0_0_var(--theme-text)] transition-all duration-300 flex flex-col justify-between group cursor-pointer bg-[var(--theme-surface)] relative h-full [transform-style:preserve-3d]"
                  >
                    {/* Dish Card Top Image Section */}
                    <div
                      style={{ transform: 'translateZ(20px)' }}
                      className={`relative w-full rounded-t-3xl overflow-hidden bg-[var(--theme-bg)] ${isFeatured ? 'h-72 sm:h-96' : 'h-56'}`}
                    >
                      <img
                        src={dish.image}
                        alt={dish.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[var(--theme-bg)] via-[var(--theme-bg)]/30 to-transparent" />

                      {/* Flame Badge (translateZ(35px)) */}
                      <div
                        style={{ transform: 'translateZ(35px)' }}
                        className="absolute top-3 left-3 bg-[var(--theme-bg)] backdrop-blur-md text-amber-400 border border-amber-500/30 text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
                      >
                        <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{dish.tags[0] || 'Gourmet Special'}</span>
                      </div>

                      {/* Price Badge (translateZ(40px)) */}
                      <div
                        style={{ transform: 'translateZ(40px)' }}
                        className="absolute top-3 right-3 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-stone-950 font-black text-xs px-3 py-1 rounded-full shadow-[0_10px_20px_rgba(245,158,11,0.3)]"
                      >
                        {dish.formattedPrice}
                      </div>

                      {/* Quick View Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 backdrop-blur-sm">
                        <span className="bg-[var(--theme-surface-elevated)]/95 text-amber-300 border border-amber-500/40 text-xs font-bold px-4 py-2 rounded-full flex items-center gap-1.5 shadow-xl">
                          <Eye className="w-4 h-4" />
                          <span>View Dish Details</span>
                        </span>
                      </div>
                    </div>

                    {/* Dish Content Body (translateZ(25px)) */}
                    <div
                      style={{ transform: 'translateZ(25px)' }}
                      className="p-5 flex flex-col gap-3 flex-1 justify-between"
                    >
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-amber-400 font-bold uppercase tracking-wider">
                            {dish.prepTime} Prep SLA
                          </span>
                          <div className="flex items-center gap-1 text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                            <Star className="w-3 h-3 fill-emerald-400" />
                            <span>{dish.reviewsCount}</span>
                          </div>
                        </div>

                        <h3 className="font-serif font-bold text-lg text-[var(--theme-text)] group-hover:text-amber-400 transition-colors line-clamp-1">
                          {dish.name}
                        </h3>

                        <p className="text-[var(--theme-text-muted)] text-xs line-clamp-2 leading-relaxed">
                          {dish.description}
                        </p>
                      </div>

                      {/* Card Actions Footer */}
                      <div className="flex items-center justify-between pt-3 border-t border-amber-500/20">
                        <button
                          onClick={() => onSelectDish(dish)}
                          className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
                        >
                          <span>View Details</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>

                        <motion.button
                          whileHover={{ scale: 1.08 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => handleQuickAdd(e, dish)}
                          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all shadow-md ${
                            isJustAdded
                              ? 'bg-emerald-500 text-stone-950'
                              : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-red-500 hover:from-amber-400 hover:to-red-400 text-stone-950'
                          }`}
                        >
                          {isJustAdded ? (
                            <>
                              <Check className="w-4 h-4 stroke-[3]" />
                              <span>Added!</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-4 h-4 stroke-[2.5]" />
                              <span>Add +</span>
                            </>
                          )}
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </TiltCard>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {filteredDishes.length === 0 && (
        <div className="text-center py-16 text-[var(--theme-text-muted)]">
          <p className="text-base font-serif">No culinary items match your search filter.</p>
          <button
            onClick={() => {
              setActiveCategory('all');
              setSearchQuery('');
            }}
            className="text-xs text-amber-400 font-bold mt-2 underline hover:text-amber-300"
          >
            Clear Filters
          </button>
        </div>
      )}
    </section>
  );
}
