import { useState, useEffect, MouseEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Dish } from '../types';
import { MENU_CATEGORIES } from '../theme/tokens';
import { Flame, Star, Sparkles, Plus, Search, Eye, ChevronRight, Check, ShoppingBag } from 'lucide-react';
import TiltCard from './TiltCard';
import { SiteContent } from '../lib/firebase';

interface MenuSectionProps {
  dishes: Dish[];
  onSelectDish: (dish: Dish) => void;
  onAddToCart: (dish: Dish) => void;
  selectedCategory?: string;
  highlightsOnly?: boolean;
  onNavigateToMenu?: () => void;
  siteContent?: SiteContent;
}

export default function MenuSection({
  dishes,
  onSelectDish,
  onAddToCart,
  selectedCategory = 'all',
  highlightsOnly = false,
  onNavigateToMenu,
  siteContent,
}: MenuSectionProps) {
  const [activeCategory, setActiveCategory] = useState<string>(selectedCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [addedMap, setAddedMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (selectedCategory) {
      setActiveCategory(selectedCategory);
    }
  }, [selectedCategory]);

  // Layout & Alignment configs
  const sortMode = siteContent?.dishSortMode || 'manual';
  const gridColumns = siteContent?.dishGridColumns || 4;
  const cardStyle = siteContent?.dishCardStyle || 'bento';
  const buttonPlacement = siteContent?.dishButtonPlacement || 'inline-footer';
  const tagPlacement = siteContent?.dishTagPlacement || 'top-left';
  const categoryAlign = siteContent?.categoryTabsAlign || 'left';
  const buttonShapeClass =
    siteContent?.buttonStyle === 'sharp'
      ? 'rounded-none'
      : siteContent?.buttonStyle === 'rounded'
      ? 'rounded-2xl'
      : 'rounded-full';

  // Apply sorting
  const rawList = [...dishes];
  if (sortMode === 'featured-first') {
    rawList.sort((a, b) => (b.isBestseller || b.isChefSpecial ? 1 : 0) - (a.isBestseller || a.isChefSpecial ? 1 : 0));
  } else if (sortMode === 'price-asc') {
    rawList.sort((a, b) => a.price - b.price);
  } else if (sortMode === 'rating-desc') {
    rawList.sort((a, b) => b.rating - a.rating);
  }

  const filteredDishes = highlightsOnly
    ? rawList.filter((dish) => dish.isBestseller || dish.isChefSpecial)
    : rawList.filter((dish) => {
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

  // Determine grid template classes
  const gridColsClass =
    gridColumns === 2
      ? 'grid-cols-1 md:grid-cols-2'
      : gridColumns === 3
      ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
      : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';

  const categoryAlignClass =
    categoryAlign === 'center'
      ? 'justify-center mx-auto'
      : categoryAlign === 'justified'
      ? 'justify-between w-full'
      : 'justify-start';

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
        <div className="inline-flex items-center gap-2 text-amber-500 text-xs font-bold uppercase tracking-widest bg-amber-500/10 border border-amber-500/30 px-4 py-1.5 rounded-full shadow-lg">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>{highlightsOnly ? "CHEF'S SIGNATURE HIGHLIGHTS" : "FRESH GOURMET FEAST SELECTIONS"}</span>
        </div>

        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-extrabold text-[var(--theme-text)]">
          {highlightsOnly ? "Menu Highlights & Bestsellers" : "Our Sizzling Gourmet Menu"}
        </h2>

        <p className="text-[var(--theme-text-muted)] text-sm max-w-xl">
          {highlightsOnly
            ? "Hand-picked customer favorites and master chef specials prepared fresh with thermal sealed packaging."
            : "Crafted live on open flames. Sealed with induction thermal barriers for peak sizzle and aroma."}
        </p>
      </motion.div>

      {/* Search & Category Filter Controls (Full Menu only) */}
      {!highlightsOnly && (
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10">
          {/* Category Tabs */}
          <div className={`flex items-center gap-2 overflow-x-auto pb-2 w-full md:w-auto scrollbar-none ${categoryAlignClass}`}>
            {MENU_CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`relative px-4 py-2.5 ${buttonShapeClass} text-xs font-bold tracking-wide transition-colors whitespace-nowrap ${
                    isActive ? 'text-stone-950 font-black' : 'text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] bg-[var(--theme-surface)] border border-amber-500/20'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeCategoryTab"
                      transition={{ type: 'spring', damping: 22, stiffness: 300 }}
                      className={`absolute inset-0 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 ${buttonShapeClass} shadow-lg shadow-amber-500/25 z-0`}
                    />
                  )}
                  <span className="relative z-10">{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-[var(--theme-text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search burgers, sides, desserts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full bg-[var(--theme-surface)] border border-amber-500/25 ${buttonShapeClass} py-2.5 pl-10 pr-4 text-xs text-[var(--theme-text)] placeholder:text-[var(--theme-text-muted)]/60 focus:outline-none focus:border-amber-400 transition-colors shadow-sm`}
            />
          </div>
        </div>
      )}

      {/* Dishes Bento/Uniform/Compact Grid with 3D Tilt Cards */}
      <motion.div layout className={`grid ${gridColsClass} auto-rows-max gap-6`}>
        <AnimatePresence mode="popLayout">
          {filteredDishes.map((dish, index) => {
            const isJustAdded = addedMap[dish.id];
            
            // Asymmetric Bento Logic (Only when cardStyle is 'bento')
            const isBento = cardStyle === 'bento';
            const isFeatured = isBento && index % 5 === 0;
            const isWide = isBento && index % 5 === 3;
            
            let gridClasses = "lg:col-span-1 lg:row-span-1";
            if (isFeatured && gridColumns >= 3) {
              gridClasses = "md:col-span-2 lg:col-span-2 lg:row-span-2";
            } else if (isWide && gridColumns >= 3) {
              gridClasses = "md:col-span-2 lg:col-span-2 lg:row-span-1";
            }

            const isHorizontal = cardStyle === 'horizontal-cards';
            const isCompactDense = cardStyle === 'compact-dense';

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
                    className={`glass-panel rounded-3xl border border-[var(--theme-text)] shadow-none transition-all duration-300 flex ${
                      isHorizontal ? 'flex-col sm:flex-row' : 'flex-col'
                    } justify-between group cursor-pointer bg-[var(--theme-surface)] relative h-full [transform-style:preserve-3d]`}
                  >
                    {/* Dish Card Image Section */}
                    <div
                      style={{ transform: 'translateZ(20px)' }}
                      className={`relative overflow-hidden bg-[var(--theme-bg)] ${
                        isHorizontal
                          ? 'w-full sm:w-2/5 h-48 sm:h-auto rounded-t-3xl sm:rounded-l-3xl sm:rounded-tr-none'
                          : `w-full rounded-t-3xl ${isFeatured ? 'h-72 sm:h-96' : isCompactDense ? 'h-44' : 'h-56'}`
                      }`}
                    >
                      <img
                        src={dish.image}
                        alt={dish.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        loading="lazy"
                      />

                      {/* Tag / Badge */}
                      <div
                        style={{ transform: 'translateZ(35px)' }}
                        className={`absolute top-3 ${
                          tagPlacement === 'top-right' ? 'right-3' : 'left-3'
                        } bg-[var(--theme-bg)] backdrop-blur-md text-amber-400 border border-amber-500/30 text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-[0_10px_20px_rgba(0,0,0,0.5)]`}
                      >
                        <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{dish.tags[0] || 'Gourmet Special'}</span>
                      </div>

                      {/* Price Badge */}
                      <div
                        style={{ transform: 'translateZ(40px)' }}
                        className={`absolute ${
                          tagPlacement === 'top-right' ? 'bottom-3 right-3' : 'top-3 right-3'
                        } bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-stone-950 font-black text-xs px-3 py-1 rounded-full shadow-[0_10px_20px_rgba(245,158,11,0.3)]`}
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

                    {/* Dish Content Body */}
                    <div
                      style={{ transform: 'translateZ(25px)' }}
                      className={`p-5 flex flex-col gap-3 flex-1 justify-between ${
                        isHorizontal ? 'w-full sm:w-3/5' : ''
                      }`}
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

                      {/* Card Actions Footer based on dishButtonPlacement */}
                      {buttonPlacement === 'full-width' ? (
                        <div className="pt-3 border-t border-amber-500/20 flex flex-col gap-2">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={(e) => handleQuickAdd(e, dish)}
                            className={`w-full flex items-center justify-center gap-2 py-2.5 ${buttonShapeClass} text-xs font-black transition-all shadow-md ${
                              isJustAdded
                                ? 'bg-emerald-500 text-stone-950'
                                : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950'
                            }`}
                          >
                            {isJustAdded ? (
                              <>
                                <Check className="w-4 h-4 stroke-[3]" />
                                <span>Added To Basket!</span>
                              </>
                            ) : (
                              <>
                                <ShoppingBag className="w-4 h-4" />
                                <span>Add To Basket • {dish.formattedPrice}</span>
                              </>
                            )}
                          </motion.button>
                        </div>
                      ) : (
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
                            className={`flex items-center gap-1.5 px-4 py-2 ${buttonShapeClass} text-xs font-black transition-all shadow-md ${
                              isJustAdded
                                ? 'bg-emerald-500 text-stone-950'
                                : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-red-500 hover:from-amber-400 hover:to-red-400 text-stone-950'
                            }`}
                          >
                            {isJustAdded ? (
                              <>
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                                <span>Added</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                                <span>Quick Add</span>
                              </>
                            )}
                          </motion.button>
                        </div>
                      )}
                    </div>
                  </div>
                </TiltCard>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* View Full Menu CTA for Highlights view */}
      {highlightsOnly && onNavigateToMenu && (
        <div className="flex justify-center mt-12">
          <button
            onClick={onNavigateToMenu}
            className={`px-8 py-3.5 ${buttonShapeClass} bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-stone-950 font-serif font-black text-sm border-2 border-[var(--theme-text)] shadow-[4px_4px_0_0_var(--theme-text)] hover:shadow-[6px_6px_0_0_var(--theme-text)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer`}
          >
            <span>Explore Full Menu ({dishes.length} Items)</span>
            <ChevronRight className="w-4 h-4 stroke-[3]" />
          </button>
        </div>
      )}

      {filteredDishes.length === 0 && (
        <div className="text-center py-16 text-[var(--theme-text-muted)]">
          <p className="text-base font-serif">No culinary items match your search filter.</p>
          <button
            onClick={() => {
              setActiveCategory('all');
              setSearchQuery('');
            }}
            className="text-xs text-amber-400 font-bold mt-2 underline hover:text-amber-300 cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      )}
    </section>
  );
}
