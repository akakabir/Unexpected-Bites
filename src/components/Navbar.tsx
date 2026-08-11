import { useState, useEffect } from 'react';
import { ShoppingBag, Phone, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BrandConfig, CartItem, PageTab } from '../types';
import { SiteContent } from '../lib/firebase';
import { computeFloatingPositions } from '../utils/floatingButtons';
import { generatePrewrittenOrderMessage } from '../utils/orderInvoice';

interface NavbarProps {
  brandConfig: BrandConfig;
  cart: CartItem[];
  onOpenCart: () => void;
  currentPage: PageTab;
  onSelectPage: (page: PageTab, category?: string) => void;
  siteContent?: SiteContent;
}

export default function Navbar({
  brandConfig,
  cart,
  onOpenCart,
  currentPage,
  onSelectPage,
  siteContent,
}: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const floatingPositions = computeFloatingPositions(siteContent);
  const whatsappInfo = floatingPositions.whatsapp;
  const cartInfo = floatingPositions.cart;

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const navTabs: { id: string; name: string; category?: string }[] = [
    { id: 'home', name: 'Home' },
    { id: 'menu', name: 'Menu' },
    { id: 'desserts', name: 'Desserts', category: 'desserts' },
  ];

  const handleWhatsAppClick = () => {
    const text = generatePrewrittenOrderMessage(cart);
    window.open(`https://wa.me/${brandConfig.whatsappNumber}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <>
      {/* Floating Pill Header */}
      <header
        className={`fixed top-4 inset-x-2 sm:inset-x-6 md:max-w-6xl md:mx-auto z-50 transition-all duration-300 border ${
          mobileMenuOpen
            ? 'bg-[var(--theme-bg)] shadow-2xl border-amber-500/40 py-4 px-4 sm:px-6 rounded-3xl lg:rounded-full lg:py-3 lg:px-6'
            : isScrolled
            ? 'glass-pill bg-[var(--theme-surface-elevated)]/95 shadow-2xl border-amber-500/40 py-2.5 px-3 sm:px-6 rounded-full backdrop-blur-2xl'
            : 'glass-pill bg-[var(--theme-bg)]/95 backdrop-blur-2xl border-amber-500/20 py-3 px-3 sm:px-6 rounded-full'
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          {/* Logo / Brand Name */}
          <button
            onClick={() => onSelectPage('home')}
            className="flex items-center gap-2.5 group text-left cursor-pointer"
          >
            <img
              src="/images/unexpected-bites-logo.png"
              alt="Unexpected Bites"
              className="w-9 h-9 rounded-full object-cover group-hover:scale-105 transition-transform shrink-0"
            />
            <div className="flex flex-col">
              <span className="font-serif font-bold text-base sm:text-lg tracking-wider text-[var(--theme-text)] group-hover:text-amber-400 transition-colors flex items-center gap-1.5">
                {brandConfig.name}
              </span>
              <span className="text-[10px] text-amber-400 tracking-widest uppercase font-extrabold -mt-1 hidden sm:block">
                Gourmet Burgers, Fries & Desserts
              </span>
            </div>
          </button>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1.5 text-xs font-bold text-[var(--theme-text-muted)] bg-[var(--theme-surface)] p-1 rounded-full border border-amber-500/20">
            {navTabs.map((tab) => {
              const isActive = currentPage === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    if (tab.category) {
                      onSelectPage('menu', tab.category);
                    } else {
                      onSelectPage(tab.id as PageTab);
                    }
                  }}
                  className={`transition-all relative px-4 py-1.5 rounded-full flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'text-stone-950 font-black bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 shadow-md'
                      : 'text-[var(--theme-text-muted)] hover:text-amber-400 hover:bg-[var(--theme-surface-elevated)]'
                  }`}
                >
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5">
            {/* WhatsApp Direct Order - In Navbar if top-right */}
            {!whatsappInfo.isFloating && (
              <button
                onClick={handleWhatsAppClick}
                className="inline-flex items-center gap-1.5 bg-emerald-400 hover:bg-emerald-300 text-stone-950 border-2 sm:border-2.5 border-[var(--theme-text)] shadow-[3px_3px_0_0_var(--theme-text)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_0_var(--theme-text)] text-xs font-serif font-black px-3 py-1.5 rounded-full transition-all cursor-pointer"
                title="Order via WhatsApp"
              >
                <Phone className="w-3.5 h-3.5 stroke-[2.5]" />
                <span className="hidden sm:inline-block">WhatsApp</span>
              </button>
            )}

            {/* Cart Button - In Navbar if top-right */}
            {!cartInfo.isFloating && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onOpenCart}
                className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-black transition-all border-2 sm:border-2.5 border-[var(--theme-text)] shadow-[3px_3px_0_0_var(--theme-text)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_0_var(--theme-text)] cursor-pointer"
                aria-label="Open Cart"
              >
                <ShoppingBag className="w-4.5 h-4.5 stroke-[2.5]" />
                {totalCartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-stone-950 text-amber-400 font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-[var(--theme-text)] shadow-sm animate-bounce">
                    {totalCartCount}
                  </span>
                )}
              </motion.button>
            )}

            {/* Mobile Hamburger Icons - Sticker Style */}
            <div className="flex items-center gap-1.5 lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="flex items-center justify-center p-2 rounded-xl bg-[var(--theme-surface)] text-[var(--theme-text)] border-2 sm:border-2.5 border-[var(--theme-text)] shadow-[3px_3px_0_0_var(--theme-text)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_0_var(--theme-text)] cursor-pointer"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5 stroke-[2.5]" /> : <Menu className="w-5 h-5 stroke-[2.5]" />}
              </button>
            </div>
          </div>
        </div>

        {/* Floating WhatsApp Button if positioned outside top-right */}
        {whatsappInfo.isFloating && (
          <button
            onClick={handleWhatsAppClick}
            style={whatsappInfo.style}
            className="inline-flex items-center gap-2 bg-emerald-400 hover:bg-emerald-300 text-stone-950 border-2.5 border-[var(--theme-text)] shadow-[4px_4px_0_0_var(--theme-text)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_0_var(--theme-text)] text-xs font-serif font-black px-4 py-2.5 rounded-full transition-all cursor-pointer z-[70]"
            title="Order via WhatsApp"
          >
            <Phone className="w-4 h-4 stroke-[2.5]" />
            <span>WhatsApp</span>
          </button>
        )}

        {/* Floating Cart Button if positioned outside top-right */}
        {cartInfo.isFloating && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onOpenCart}
            style={cartInfo.style}
            className="relative flex items-center justify-center w-12 h-12 rounded-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-black transition-all border-2.5 border-[var(--theme-text)] shadow-[4px_4px_0_0_var(--theme-text)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_0_var(--theme-text)] cursor-pointer z-[70]"
            aria-label="Open Cart"
          >
            <ShoppingBag className="w-5 h-5 stroke-[2.5]" />
            {totalCartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-stone-950 text-amber-400 font-black text-xs w-5.5 h-5.5 rounded-full flex items-center justify-center border-2 border-[var(--theme-text)] shadow-sm animate-bounce">
                {totalCartCount}
              </span>
            )}
          </motion.button>
        )}

        {/* Mobile Slide-down Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="lg:hidden mt-4 pt-4 border-t border-[var(--theme-accent-500)]/20 flex flex-col gap-2 px-1 pb-4 relative z-10 bg-[var(--theme-bg)]"
            >
              {navTabs.map((tab) => {
                const isActive = currentPage === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      if (tab.category) {
                        onSelectPage('menu', tab.category);
                      } else {
                        onSelectPage(tab.id as PageTab);
                      }
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full text-center text-lg py-3.5 px-4 rounded-2xl transition-all font-bold border-2 cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-stone-950 border-transparent shadow-md'
                        : 'bg-[var(--theme-surface)] text-[var(--theme-text-muted)] border-amber-500/20 hover:border-amber-500/50 hover:text-[var(--theme-text)] shadow-sm'
                    }`}
                  >
                    {tab.name}
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}

