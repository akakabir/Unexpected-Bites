import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Flame, Utensils, Home, Search, ArrowRight, Compass, Sparkles } from 'lucide-react';
import { Dish, PageTab } from '../types';

interface NotFoundPageProps {
  dishes: Dish[];
  onNavigate: (page: PageTab) => void;
  onSelectDish: (dish: Dish) => void;
}

export default function NotFoundPage({ dishes, onNavigate, onSelectDish }: NotFoundPageProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Top 3 bestsellers for quick pick
  const topPickDishes = dishes.filter(d => d.isBestseller || d.isChefSpecial).slice(0, 3);

  const filteredDishes = searchQuery.trim()
    ? dishes.filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()) || d.description.toLowerCase().includes(searchQuery.toLowerCase()))
    : topPickDishes;

  return (
    <div className="min-h-[85vh] w-full pt-32 pb-20 px-4 sm:px-6 md:px-8 max-w-6xl mx-auto flex flex-col items-center justify-center text-center relative overflow-hidden">
      {/* Decorative Glow Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex flex-col items-center max-w-2xl"
      >
        {/* Animated 404 Wok Badge */}
        <div className="relative mb-6">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-[var(--theme-surface)] border-3 border-[var(--theme-text)] shadow-[6px_6px_0_0_var(--theme-text)] flex items-center justify-center relative">
            <Flame className="w-12 h-12 text-amber-500 fill-amber-500 animate-bounce" />
            <span className="absolute -top-3 -right-3 bg-red-600 text-white font-serif font-black text-xs px-2.5 py-1 rounded-full shadow-md border border-stone-900">
              404
            </span>
          </div>
        </div>

        {/* Header Text */}
        <span className="text-amber-500 font-serif font-bold text-xs uppercase tracking-widest flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4" />
          <span>Recipe Slipped Off The Wok</span>
          <Sparkles className="w-4 h-4" />
        </span>

        <h1 className="font-serif text-3xl sm:text-5xl font-black text-[var(--theme-text)] tracking-tight leading-tight mb-4">
          404 - Page Not Found
        </h1>

        <p className="text-[var(--theme-text-muted)] text-sm sm:text-base leading-relaxed mb-8 max-w-lg">
          The page or dish you're looking for seems to have flamed away. Don't worry, our master kitchen is still firing up hot & fresh meals!
        </p>

        {/* Quick Search Input */}
        <div className="w-full max-w-md relative mb-8">
          <div className="relative flex items-center">
            <Search className="absolute left-4 w-5 h-5 text-[var(--theme-text-muted)]" />
            <input
              type="text"
              placeholder="Search dishes (e.g., Noodles, Biryani, Burgers)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-24 py-3.5 rounded-2xl bg-[var(--theme-surface)] border-2 border-[var(--theme-text)] text-[var(--theme-text)] placeholder-[var(--theme-text-muted)] text-sm shadow-[4px_4px_0_0_var(--theme-text)] focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => onNavigate('menu')}
                className="absolute right-2 px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-stone-950 font-serif font-black text-xs rounded-xl transition-all cursor-pointer"
              >
                Search
              </button>
            )}
          </div>
        </div>

        {/* Primary Navigation Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
          <button
            onClick={() => onNavigate('home')}
            className="min-h-[44px] px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-serif font-black text-sm flex items-center gap-2 border-2 border-stone-950 shadow-[4px_4px_0_0_#000] hover:translate-y-[-2px] active:translate-y-[0px] transition-all cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Back to Home</span>
          </button>

          <button
            onClick={() => onNavigate('menu')}
            className="min-h-[44px] px-6 py-3 rounded-2xl bg-[var(--theme-surface)] hover:bg-[var(--theme-surface-hover)] text-[var(--theme-text)] font-serif font-black text-sm flex items-center gap-2 border-2 border-[var(--theme-text)] shadow-[4px_4px_0_0_var(--theme-text)] hover:translate-y-[-2px] active:translate-y-[0px] transition-all cursor-pointer"
          >
            <Utensils className="w-4 h-4 text-amber-500" />
            <span>Explore Menu</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Pick Recommendations */}
        <div className="w-full text-left pt-8 border-t border-[var(--theme-text)]/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-lg font-bold text-[var(--theme-text)] flex items-center gap-2">
              <Compass className="w-5 h-5 text-amber-500" />
              <span>{searchQuery ? 'Matching Dishes' : 'Chef’s Popular Recommendations'}</span>
            </h3>
            <button
              onClick={() => onNavigate('menu')}
              className="text-xs font-bold text-amber-500 hover:text-amber-400 flex items-center gap-1 cursor-pointer"
            >
              <span>View Full Menu</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {filteredDishes.slice(0, 3).map((dish) => (
              <div
                key={dish.id}
                onClick={() => onSelectDish(dish)}
                className="bg-[var(--theme-surface)] border-2 border-[var(--theme-text)] p-3 rounded-2xl shadow-[3px_3px_0_0_var(--theme-text)] hover:translate-y-[-2px] transition-all cursor-pointer flex items-center gap-3"
              >
                <img
                  src={dish.image}
                  alt={dish.name}
                  className="w-14 h-14 rounded-xl object-cover border border-[var(--theme-text)]/20 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-serif text-xs font-bold text-[var(--theme-text)] truncate">{dish.name}</h4>
                  <p className="text-[11px] text-[var(--theme-text-muted)] truncate">{dish.description}</p>
                  <span className="text-xs font-black text-amber-500">{dish.formattedPrice}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
