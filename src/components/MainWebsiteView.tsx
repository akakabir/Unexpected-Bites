import React, { useState, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Navbar from './Navbar';
import Hero from './Hero';
import MarqueeTrustBar from './MarqueeTrustBar';
import MenuSection from './MenuSection';
import HowItWorks from './HowItWorks';
import WhyChooseUs from './WhyChooseUs';
import FoodGallery from './FoodGallery';
import AboutPhilosophy from './AboutPhilosophy';
import ScrollVideoSection from './ScrollVideoSection';
import FAQSection from './FAQSection';
import Testimonials from './Testimonials';
import DrawingSvgDivider from './DrawingSvgDivider';
import Footer from './Footer';
import Mascot from './Mascot';
import AmbientBackground from './AmbientBackground';
import NotFoundPage from './NotFoundPage';
import StatusPage from './StatusPage';
import AnalyticsPage from './AnalyticsPage';
import { CartItem, Dish, BrandConfig, UserSubmittedReview, PageTab } from '../types';
import { SiteContent, DEFAULT_SECTIONS } from '../lib/firebase';
import { MoveUp, MoveDown, Eye, Settings2, Edit3 } from 'lucide-react';

const DishModal = lazy(() => import('./DishModal'));
const CartDrawer = lazy(() => import('./CartDrawer'));
const SubmitReviewModal = lazy(() => import('./SubmitReviewModal'));

export interface MainWebsiteViewProps {
  currentPage: PageTab;
  onSelectPage: (page: PageTab, category?: string) => void;
  selectedCategory: string;
  dishes: Dish[];
  siteContent: SiteContent;
  brandConfig: BrandConfig;
  userReviews: UserSubmittedReview[];
  cart: CartItem[];
  onAddToCart: (dish: Dish, quantity?: number, notes?: string) => void;
  onUpdateQuantity: (dishId: string, quantity: number) => void;
  onRemoveItem: (dishId: string) => void;
  onClearCart: () => void;
  onCheckout: () => void;
  onAddReview: (review: UserSubmittedReview) => void;
  
  // Admin visual preview & inspector props
  isAdminPreview?: boolean;
  activeHighlightedSection?: string | null;
  onAdminSelectSection?: (sectionId: string) => void;
  onAdminMoveSection?: (sectionId: string, direction: 'up' | 'down') => void;
  onAdminToggleSection?: (sectionId: string) => void;
  onAdminEditDish?: (dish: Dish) => void;
}

export default function MainWebsiteView({
  currentPage,
  onSelectPage,
  selectedCategory,
  dishes,
  siteContent,
  brandConfig,
  userReviews,
  cart,
  onAddToCart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckout,
  onAddReview,
  isAdminPreview = false,
  activeHighlightedSection = null,
  onAdminSelectSection,
  onAdminMoveSection,
  onAdminToggleSection,
  onAdminEditDish,
}: MainWebsiteViewProps) {
  const [selectedDishModal, setSelectedDishModal] = useState<Dish | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // Determine active section order
  const activeSections = siteContent.sections && siteContent.sections.length > 0
    ? siteContent.sections
    : DEFAULT_SECTIONS;

  const handleDishClick = (dish: Dish) => {
    if (isAdminPreview && onAdminEditDish) {
      onAdminEditDish(dish);
    } else {
      setSelectedDishModal(dish);
    }
  };

  const renderSectionComponent = (sectionId: string, index: number) => {
    switch (sectionId) {
      case 'hero':
        return (
          <Hero
            dishes={dishes}
            brandConfig={brandConfig}
            siteContent={siteContent}
            onSelectDish={handleDishClick}
            onAddToCart={(dish) => onAddToCart(dish, 1)}
            onOpenReviewModal={() => setIsReviewModalOpen(true)}
            onNavigateToMenu={() => onSelectPage('menu')}
          />
        );
      case 'marquee':
        return <MarqueeTrustBar />;
      case 'menu-highlights':
        return (
          <>
            <DrawingSvgDivider index={1} variant="wave" className="my-8 sm:my-12" />
            <MenuSection
              dishes={dishes}
              onSelectDish={handleDishClick}
              onAddToCart={(dish) => onAddToCart(dish, 1)}
              selectedCategory={selectedCategory}
              highlightsOnly={true}
              onNavigateToMenu={() => onSelectPage('menu')}
              siteContent={siteContent}
            />
          </>
        );
      case 'how-it-works':
        return (
          <>
            <DrawingSvgDivider index={2} variant="flow" className="my-8 sm:my-12" />
            <HowItWorks />
          </>
        );
      case 'why-choose-us':
        return (
          <>
            <DrawingSvgDivider index={3} variant="curved" className="my-8 sm:my-12" />
            <WhyChooseUs />
          </>
        );
      case 'food-gallery':
        return (
          <>
            <DrawingSvgDivider index={4} variant="zigzag" className="my-8 sm:my-12" />
            <FoodGallery />
          </>
        );
      case 'about-philosophy':
        return (
          <>
            <DrawingSvgDivider index={5} variant="loop" className="my-8 sm:my-12" />
            <AboutPhilosophy brandConfig={brandConfig} />
          </>
        );
      case 'scroll-video':
        return (
          <>
            <DrawingSvgDivider index={1} variant="flow" className="my-8 sm:my-12" />
            <ScrollVideoSection onNavigateToMenu={() => onSelectPage('menu')} />
          </>
        );
      case 'faq-section':
        return (
          <>
            <DrawingSvgDivider index={2} variant="wave" className="my-8 sm:my-12" />
            <FAQSection />
          </>
        );
      case 'testimonials':
        return (
          <>
            <DrawingSvgDivider index={3} variant="curved" className="my-8 sm:my-12" />
            <Testimonials
              userReviews={userReviews}
              onOpenReviewModal={() => setIsReviewModalOpen(true)}
            />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen bg-[var(--theme-bg)] text-[var(--theme-text)] flex flex-col selection:bg-amber-500 selection:text-stone-950 relative ${isAdminPreview ? 'rounded-2xl overflow-hidden' : ''}`}>
      <AmbientBackground />
      
      {/* Floating Pill Navbar */}
      <Navbar
        brandConfig={brandConfig}
        cart={cart}
        onOpenCart={() => setIsCartOpen(true)}
        currentPage={currentPage}
        onSelectPage={onSelectPage}
        siteContent={siteContent}
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
              {activeSections
                .filter((s) => s.enabled)
                .map((sec, index, arr) => {
                  const isHighlighted = activeHighlightedSection === sec.id;
                  return (
                    <div
                      key={sec.id}
                      id={`site-sec-${sec.id}`}
                      className={`relative transition-all duration-300 ${
                        isAdminPreview ? 'group/section' : ''
                      } ${
                        isHighlighted
                          ? 'ring-4 ring-amber-500 ring-offset-4 ring-offset-stone-950 rounded-2xl bg-amber-500/5 my-2'
                          : ''
                      }`}
                    >
                      {/* Admin Section Inspector Bar */}
                      {isAdminPreview && (
                        <div className="absolute top-4 left-4 z-40 flex items-center gap-1.5 opacity-0 group-hover/section:opacity-100 transition-opacity bg-stone-900/95 backdrop-blur-md border border-amber-500/40 text-white px-3 py-1.5 rounded-xl shadow-2xl text-xs font-sans">
                          <span className="font-bold font-mono text-amber-400">#{index + 1}</span>
                          <span className="font-semibold text-stone-200">{sec.name}</span>
                          
                          <div className="h-3 w-px bg-stone-700 mx-1" />

                          {onAdminMoveSection && (
                            <div className="flex items-center gap-0.5">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onAdminMoveSection(sec.id, 'up');
                                }}
                                disabled={index === 0}
                                title="Move Section Up"
                                className="p-1 hover:bg-stone-800 disabled:opacity-30 rounded text-stone-300 hover:text-amber-400 cursor-pointer"
                              >
                                <MoveUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onAdminMoveSection(sec.id, 'down');
                                }}
                                disabled={index === arr.length - 1}
                                title="Move Section Down"
                                className="p-1 hover:bg-stone-800 disabled:opacity-30 rounded text-stone-300 hover:text-amber-400 cursor-pointer"
                              >
                                <MoveDown className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}

                          {onAdminToggleSection && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onAdminToggleSection(sec.id);
                              }}
                              title="Hide Section"
                              className="p-1 hover:bg-stone-800 rounded text-stone-300 hover:text-red-400 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {onAdminSelectSection && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onAdminSelectSection(sec.id);
                              }}
                              className="ml-1 px-2 py-0.5 bg-amber-500 text-stone-950 font-bold rounded-md hover:bg-amber-400 transition-colors flex items-center gap-1 text-[11px]"
                            >
                              <Settings2 className="w-3 h-3" />
                              Configure
                            </button>
                          )}
                        </div>
                      )}

                      {renderSectionComponent(sec.id, index)}
                    </div>
                  );
                })}
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
                onSelectDish={handleDishClick}
                onAddToCart={(dish) => onAddToCart(dish, 1)}
                selectedCategory={selectedCategory}
                siteContent={siteContent}
              />
            </motion.div>
          )}

          {currentPage === 'status' && (
            <motion.div
              key="status-page"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35 }}
            >
              <StatusPage
                brandConfig={brandConfig}
                dishes={dishes}
                onNavigate={onSelectPage}
              />
            </motion.div>
          )}

          {currentPage === 'analytics' && (
            <motion.div
              key="analytics-page"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35 }}
            >
              <AnalyticsPage
                brandConfig={brandConfig}
                dishes={dishes}
                onNavigate={onSelectPage}
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
                onNavigate={onSelectPage}
                onSelectDish={handleDishClick}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <Footer brandConfig={brandConfig} />

      {/* Modals & Overlays */}
      <Suspense fallback={null}>
        {selectedDishModal && !isAdminPreview && (
          <DishModal
            dish={selectedDishModal}
            onClose={() => setSelectedDishModal(null)}
            onAddToCart={onAddToCart}
          />
        )}
        
        {isCartOpen && (
          <CartDrawer
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
            cart={cart}
            onUpdateQuantity={onUpdateQuantity}
            onRemoveItem={onRemoveItem}
            onClearCart={onClearCart}
            onCheckout={onCheckout}
          />
        )}

        {isReviewModalOpen && (
          <SubmitReviewModal
            isOpen={isReviewModalOpen}
            onClose={() => setIsReviewModalOpen(false)}
            onSubmitReview={onAddReview}
          />
        )}
        
        <Mascot siteContent={siteContent} cart={cart} />
      </Suspense>
    </div>
  );
}
