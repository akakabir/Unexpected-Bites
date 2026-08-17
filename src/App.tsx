import { useState, useEffect, lazy, Suspense } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import MainWebsiteView from './components/MainWebsiteView';
import { MENU_DISHES } from './data/kitchenData';
import { BRAND_CONFIG } from './theme/tokens';
import { CartItem, Dish, BrandConfig, UserSubmittedReview, PageTab } from './types';
import { subscribeToDishes, subscribeToSiteContent, SiteContent } from './lib/firebase';
import { generatePrewrittenOrderMessage } from './utils/orderInvoice';
import { trackAnalyticsEvent, sendSessionHeartbeat } from './utils/analyticsTracker';

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
    if (p === '/status' || p === '/status/') return 'status';
    if (p === '/analytics' || p === '/analytics/') return 'analytics';
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
    buttonStyle: "pill",
    whatsappPosition: "top-right",
    cartPosition: "top-right",
    mascotPosition: "bottom-right",
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
          trackAnalyticsEvent('pageview', '/');
        } else if (p === '/menu' || p === '/menu/') {
          setCurrentPage('menu');
          trackAnalyticsEvent('pageview', '/menu');
        } else if (p === '/status' || p === '/status/') {
          setCurrentPage('status');
          trackAnalyticsEvent('pageview', '/status');
        } else if (p === '/analytics' || p === '/analytics/') {
          setCurrentPage('analytics');
          trackAnalyticsEvent('pageview', '/analytics');
        } else {
          setCurrentPage('404');
          trackAnalyticsEvent('pageview', p);
        }
      } else {
        trackAnalyticsEvent('pageview', '/admin');
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
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0 && !parsed[0].comment?.includes('biryani') && !parsed[0].comment?.includes('noodles')) {
          return parsed;
        }
      }
      return [
        {
          id: "rev-1",
          name: "Rohan Sharma",
          location: "Connaught Place",
          rating: 5,
          dishOrdered: "Classic Double Smash Beef Burger",
          comment: "The double smash patty had incredible crispy lacy edges and melted cheddar. Delivered piping hot in sealed thermal packaging. Hands down the best burger in town!",
          submittedAt: "2 hours ago"
        },
        {
          id: "rev-2",
          name: "Aanya Kapoor",
          location: "Khan Market",
          rating: 5,
          dishOrdered: "Unexpected Crispy Chicken Burger",
          comment: "That buttermilk fried chicken crunch is unreal! The secret bite sauce is divine, and the fries were still golden and super crispy upon delivery.",
          submittedAt: "Yesterday"
        },
        {
          id: "rev-3",
          name: "Karan Verma",
          location: "Defence Colony",
          rating: 5,
          dishOrdered: "Warm Cream Cheese Cinnamon Roll",
          comment: "The cinnamon roll was warm, pillow-soft, and smothered in rich cream cheese glaze. Paired with their cold brew coffee—pure bliss!",
          submittedAt: "1 day ago"
        },
        {
          id: "rev-4",
          name: "Meera Nair",
          location: "Greater Kailash",
          rating: 5,
          dishOrdered: "Truffle Parmesan Dust Fries",
          comment: "The thermal sealing really works! The truffle fries stayed hot and crispy, and the bacon cheddar beef burger was juicy perfection.",
          submittedAt: "2 days ago"
        },
        {
          id: "rev-5",
          name: "Aman Preet",
          location: "Vasant Kunj",
          rating: 5,
          dishOrdered: "Cheesy Lava Monster Beef Burger",
          comment: "Express 20-min delivery and the cheesy lava beef burger was huge and packed with flavor. Loved the eco-friendly thermal sealed box!",
          submittedAt: "3 days ago"
        }
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
    if (prefersReducedMotion || isAdminRoute) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      prevent: (node) => {
        return Boolean(node?.hasAttribute?.('data-lenis-prevent') || node?.closest?.('[data-lenis-prevent]'));
      },
    });

    (window as any).lenis = lenis;

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
      (window as any).lenis = null;
      lenis.destroy();
      gsap.ticker.remove(raf);
    };
  }, [isAdminRoute]);

  // Track initial page load and periodic active heartbeat
  useEffect(() => {
    const p = window.location.pathname || '/';
    trackAnalyticsEvent('pageview', p);
    sendSessionHeartbeat(p);

    const hbInterval = setInterval(() => {
      sendSessionHeartbeat(window.location.pathname || '/');
    }, 20000);

    return () => clearInterval(hbInterval);
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
    
    // Update browser URL smoothly
    if (page === 'home') {
      window.history.pushState({}, '', '/');
      trackAnalyticsEvent('pageview', '/');
    } else if (page === 'menu') {
      window.history.pushState({}, '', '/menu');
      trackAnalyticsEvent('pageview', '/menu');
    } else if (page === 'status') {
      window.history.pushState({}, '', '/status');
      trackAnalyticsEvent('pageview', '/status');
    } else if (page === 'analytics') {
      window.history.pushState({}, '', '/analytics');
      trackAnalyticsEvent('pageview', '/analytics');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cart Functions
  const handleAddToCart = (dish: Dish, quantity = 1, notes = '') => {
    trackAnalyticsEvent('add_to_cart', currentPage === 'menu' ? '/menu' : '/', {
      dishId: dish.id,
      dishName: dish.name,
      metadata: { quantity, price: dish.price },
    });

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
    trackAnalyticsEvent('checkout_click', currentPage === 'menu' ? '/menu' : '/', {
      metadata: { itemsCount: cart.length },
    });
    const message = generatePrewrittenOrderMessage(cart);
    window.open(`https://wa.me/${brandConfig.whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleAddReview = (newReview: UserSubmittedReview) => {
    setUserReviews((prev) => [newReview, ...prev]);
  };

  if (isAdminRoute) {
    return (
      <Suspense fallback={<div className="min-h-screen bg-stone-950 text-stone-100 flex items-center justify-center font-serif text-sm">Loading Admin Studio...</div>}>
        <AdminPanel
          dishes={dishes}
          siteContent={siteContent}
          brandConfig={brandConfig}
          userReviews={userReviews}
          cart={cart}
          onCloseAdmin={() => {
            window.history.pushState({}, '', '/');
            setIsAdminRoute(false);
          }}
          onAddToCart={handleAddToCart}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onClearCart={handleClearCart}
          onCheckout={handleCheckoutFromDrawer}
          onAddReview={handleAddReview}
        />
      </Suspense>
    );
  }

  return (
    <MainWebsiteView
      currentPage={currentPage}
      onSelectPage={handleSelectPage}
      selectedCategory={selectedCategory}
      dishes={dishes}
      siteContent={siteContent}
      brandConfig={brandConfig}
      userReviews={userReviews}
      cart={cart}
      onAddToCart={handleAddToCart}
      onUpdateQuantity={handleUpdateQuantity}
      onRemoveItem={handleRemoveItem}
      onClearCart={handleClearCart}
      onCheckout={handleCheckoutFromDrawer}
      onAddReview={handleAddReview}
    />
  );
}
