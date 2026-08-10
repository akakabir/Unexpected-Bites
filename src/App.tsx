import { useState, useEffect, lazy, Suspense } from 'react';
import Lenis from 'lenis';
import { motion, AnimatePresence } from 'motion/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import MarqueeTrustBar from './components/MarqueeTrustBar';
import MenuSection from './components/MenuSection';
import HowItWorks from './components/HowItWorks';
import WhyChooseUs from './components/WhyChooseUs';
import FoodGallery from './components/FoodGallery';
import Testimonials from './components/Testimonials';
import DrawingSvgDivider from './components/DrawingSvgDivider';
import ScrollVideoSection from './components/ScrollVideoSection';
import Footer from './components/Footer';
import Mascot from "./components/Mascot";
import AmbientBackground from './components/AmbientBackground';
import NotFoundPage from './components/NotFoundPage';
import { MENU_DISHES } from './data/kitchenData';
import { BRAND_CONFIG } from './theme/tokens';
import { CartItem, Dish, BrandConfig, UserSubmittedReview, PageTab } from './types';
import { subscribeToDishes, subscribeToSiteContent, SiteContent } from './lib/firebase';

const DishModal = lazy(() => import('./components/DishModal'));
const CartDrawer = lazy(() => import('./components/CartDrawer'));
const SubmitReviewModal = lazy(() => import('./components/SubmitReviewModal'));
const AdminPanel = lazy(() => import('./components/AdminPanel'));

export default function App() {
  // Admin & Page Routing State
  const [isAdminRoute, setIsAdminRoute] = useState<boolean>(() => {
    const p = window.location.pathname;
    return p === '/admin' || p === '/admin/';
  });

  const [currentPage, setCurrentPage] = useState<PageTab>(() => {
    const p = window.location.pathname;
    if (p === '/admin' || p === '/admin/') return 'home';
    if (p === '/' || p === '') return 'home';
    if (p === '/menu' || p === '/menu/') return 'menu';
    return '404'; // Catch-all 404 for any unmatched route e.g. /hfvber
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Realtime Database Dishes & Site Content State
  const [dishes, setDishes] = useState<Dish[]>(MENU_DISHES);
  const [siteContent, setSiteContent] = useState<SiteContent>({
    heroHeadline1: "Gourmet Burgers &",
    heroHeadline2: "Warm Artisanal Desserts",
    heroHeadline3: "Delivered In 20 Mins.",
    heroSubtitle: "Experience hand-crafted chicken and beef burgers, golden crispy fries, cold drinks, and warm cinnamon rolls and desserts prepared fresh and delivered in thermal sealed packaging.",
    buttonStyle: "pill"
  });

  // Subscribe to Firebase Realtime Database
  useEffect(() => {
    const unsubDishes = subscribeToDishes((liveDishes) => {
      setDishes(liveDishes);
    });
    const unsubContent = subscribeToSiteContent((liveContent) => {
      setSiteContent(liveContent);
    });

    return () => {
      unsubDishes();
      unsubContent();
    };
  }, []);

  // Handle URL location changes
  useEffect(() => {
    const handleLocationChange = () => {
      const p = window.location.pathname;
      const isAdmin = p === '/admin' || p === '/admin/';
      setIsAdminRoute(isAdmin);

      if (!isAdmin) {
        if (p === '/' || p === '') {
          setCurrentPage('home');
        } else if (p === '/menu' || p === '/menu/') {
          setCurrentPage('menu');
        } else {
          setCurrentPage('404');
        }
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  // Brand Configuration State
  const [brandConfig] = useState<BrandConfig>(() => {
    try {
      const saved = localStorage.getItem('wok_brand_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.name && !parsed.name.includes('[') && !parsed.name.includes('SOFT LAUNCH')) {
          return parsed;
        }
      }
      return BRAND_CONFIG;
    } catch {
      return BRAND_CONFIG;
    }
  });

  // User-submitted reviews state
  const [userReviews, setUserReviews] = useState<UserSubmittedReview[]>(() => {
    try {
      const saved = localStorage.getItem('wok_user_reviews');
      if (saved && JSON.parse(saved).length > 0) {
        return JSON.parse(saved);
      }
      return [
        { id: "rev-1", name: "Priya S.", rating: 5, comment: "Absolutely incredible! The biryani arrived steaming hot, and the flame-seared burger had that perfect smoky flavor.", date: new Date().toISOString() },
        { id: "rev-2", name: "Rahul M.", rating: 4, comment: "Fastest delivery I've experienced. Packaging kept the fries super crispy.", date: new Date().toISOString() },
        { id: "rev-3", name: "Anita K.", rating: 5, comment: "The wok-tossed noodles were authentic and packed with flavor. Loved the eco-friendly boxes!", date: new Date().toISOString() },
        { id: "rev-4", name: "Vikram R.", rating: 5, comment: "Gourmet quality right to my doorstep. The thermal sealing really works.", date: new Date().toISOString() }
      ];
    } catch {
      return [];
    }
  });

  // Cart State
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('aura_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modals & Drawers State
  const [selectedDishModal, setSelectedDishModal] = useState<Dish | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // Initialize Lenis Smooth Scrolling
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    lenis.on('scroll', () => {
      ScrollTrigger.update();
    });

    // Drive Lenis from GSAP's own ticker instead of a separate rAF loop,
    // so Lenis and ScrollTrigger's pin/scrub stay perfectly in sync.
    function raf(time: number) {
      lenis.raf(time * 1000); // gsap.ticker gives seconds, Lenis expects ms
    }
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove(raf);
    };
  }, []);

  // Save Cart to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('aura_cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart:', e);
    }
  }, [cart]);

  // Save User Reviews to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('wok_user_reviews', JSON.stringify(userReviews));
    } catch (e) {
      console.error('Failed to save user reviews:', e);
    }
  }, [userReviews]);

  // Scroll to top on page tab change
  const handleSelectPage = (page: PageTab, category?: string) => {
    setCurrentPage(page);
    if (category) {
      setSelectedCategory(category);
    } else if (page === 'menu') {
      setSelectedCategory('all');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cart Functions
  const handleAddToCart = (dish: Dish, quantity = 1, notes = '') => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.dish.id === dish.id);
      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].quantity += quantity;
        if (notes) updated[existingIndex].customNotes = notes;
        return updated;
      } else {
        return [...prevCart, { dish, quantity, customNotes: notes }];
      }
    });
  };

  const handleUpdateQuantity = (dishId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(dishId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.dish.id === dishId ? { ...item, quantity: newQuantity } : item))
    );
  };

  const handleRemoveItem = (dishId: string) => {
    setCart((prev) => prev.filter((item) => item.dish.id !== dishId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleCheckoutFromDrawer = () => {
    setIsCartOpen(false);
    const text = encodeURIComponent(
      `Hi! I'd like to place an order from ${brandConfig.name}.\n` +
      cart.map((item) => `- ${item.quantity}x ${item.dish.name} (₹${item.dish.price * item.quantity})`).join('\n')
    );
    window.open(`https://wa.me/${brandConfig.whatsappNumber}?text=${text}`, '_blank');
  };

  const handleAddReview = (newReview: UserSubmittedReview) => {
    setUserReviews((prev) => [newReview, ...prev]);
  };

  if (isAdminRoute) {
    return (
      <Suspense fallback={<div className="min-h-screen bg-stone-950 text-stone-100 flex items-center justify-center font-serif text-sm">Loading Admin Portal...</div>}>
        <AdminPanel
          dishes={dishes}
          siteContent={siteContent}
          onCloseAdmin={() => {
            window.history.pushState({}, '', '/');
            setIsAdminRoute(false);
          }}
        />
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--theme-bg)] text-[var(--theme-text)] flex flex-col selection:bg-amber-500 selection:text-stone-950">
      <AmbientBackground />
      {/* Floating Pill Navbar */}
      <Navbar
        brandConfig={brandConfig}
        cart={cart}
        onOpenCart={() => setIsCartOpen(true)}
        currentPage={currentPage}
        onSelectPage={handleSelectPage}
      />

      {/* Main Multi-Page Content */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          {currentPage === 'home' && (
            <motion.div
              key="home-page"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35 }}
            >
              <Hero
                dishes={dishes}
                brandConfig={brandConfig}
                siteContent={siteContent}
                onSelectDish={(dish) => setSelectedDishModal(dish)}
                onAddToCart={(dish) => handleAddToCart(dish, 1)}
                onOpenReviewModal={() => setIsReviewModalOpen(true)}
                onNavigateToMenu={() => handleSelectPage('menu')}
              />

              <MarqueeTrustBar />

              {/* 1. Divider One: Wave */}
              <DrawingSvgDivider index={1} variant="wave" className="my-10 sm:my-14" />

              <MenuSection
                dishes={dishes}
                onSelectDish={(dish) => setSelectedDishModal(dish)}
                onAddToCart={(dish) => handleAddToCart(dish, 1)}
                selectedCategory={selectedCategory}
                highlightsOnly={true}
                onNavigateToMenu={() => handleSelectPage('menu')}
              />

              {/* 2. Divider Two: Flow */}
              <DrawingSvgDivider index={2} variant="flow" className="my-10 sm:my-14" />

              <HowItWorks />

              {/* 3. Divider Three: Curved */}
              <DrawingSvgDivider index={3} variant="curved" className="my-10 sm:my-14" />

              <WhyChooseUs />

              {/* 4. Divider Four: Zigzag */}
              <DrawingSvgDivider index={4} variant="zigzag" className="my-10 sm:my-14" />

              <FoodGallery />

              {/* 5. Divider Five: Loop */}
              <DrawingSvgDivider index={5} variant="loop" className="my-10 sm:my-14" />

              <Testimonials
                userReviews={userReviews}
                onOpenReviewModal={() => setIsReviewModalOpen(true)}
              />
            </motion.div>
          )}

          {currentPage === 'menu' && (
            <motion.div
              key="menu-page"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35 }}
              className="pt-24"
            >
              <MenuSection
                dishes={dishes}
                onSelectDish={(dish) => setSelectedDishModal(dish)}
                onAddToCart={(dish) => handleAddToCart(dish, 1)}
                selectedCategory={selectedCategory}
              />
            </motion.div>
          )}

          {currentPage === '404' && (
            <motion.div
              key="404-page"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35 }}
            >
              <NotFoundPage
                dishes={dishes}
                onNavigate={handleSelectPage}
                onSelectDish={(dish) => setSelectedDishModal(dish)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <Footer brandConfig={brandConfig} />

      {/* Modals & Overlays */}
      <Suspense fallback={null}>
        {selectedDishModal && (
          <DishModal
            dish={selectedDishModal}
            onClose={() => setSelectedDishModal(null)}
            onAddToCart={handleAddToCart}
          />
        )}
        
        {isCartOpen && (
          <CartDrawer
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
            cart={cart}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onClearCart={handleClearCart}
            onCheckout={handleCheckoutFromDrawer}
          />
        )}

        {isReviewModalOpen && (
          <SubmitReviewModal
            isOpen={isReviewModalOpen}
            onClose={() => setIsReviewModalOpen(false)}
            onSubmitReview={handleAddReview}
          />
        )}
        <Mascot />
      </Suspense>
    </div>
  );
}
