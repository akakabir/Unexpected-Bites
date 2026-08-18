import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock, Key, LogOut, Plus, Edit2, Trash2, Save, CheckCircle2, 
  AlertCircle, LayoutDashboard, Utensils, Settings, RefreshCw, 
  Search, ExternalLink, Database, ShieldAlert, Sparkles, X, ChevronRight, 
  Eye, EyeOff, MoveUp, MoveDown, ArrowUp, ArrowDown, Smartphone, Tablet, 
  Monitor, GripVertical, Sliders, Palette, MessageSquare, ShoppingBag, 
  HelpCircle, Layers, Check, RotateCcw, ArrowRight, CornerDownRight,
  Maximize2, Minimize2, Flame, PhoneCall, Grid, Columns, AlignCenter,
  AlignLeft, AlignRight, SlidersHorizontal, MousePointerClick, Box,
  Sparkle, Compass, Move, Disc, TrendingUp
} from 'lucide-react';
import { Dish, Category, BrandConfig, UserSubmittedReview, CartItem } from '../types';
import { 
  SiteContent, SectionConfig, DEFAULT_SECTIONS, FloatingButtonCorner,
  saveDishToFirebase, deleteDishFromFirebase, updateSiteContentInFirebase, 
  getFirebaseConfig 
} from '../lib/firebase';
import MainWebsiteView from './MainWebsiteView';
import AlignmentGridOverlay, { GridType, GridColor } from './AlignmentGridOverlay';
import AdminAnalytics from './AdminAnalytics';

interface AdminPanelProps {
  dishes: Dish[];
  siteContent: SiteContent;
  brandConfig: BrandConfig;
  userReviews?: UserSubmittedReview[];
  cart?: CartItem[];
  onCloseAdmin: () => void;
  onAddToCart?: (dish: Dish, quantity?: number, notes?: string) => void;
  onUpdateQuantity?: (dishId: string, quantity: number) => void;
  onRemoveItem?: (dishId: string) => void;
  onClearCart?: () => void;
  onCheckout?: () => void;
  onAddReview?: (review: UserSubmittedReview) => void;
}

type AdminViewMode = 'visual-split' | 'elements' | 'full-preview' | 'dishes' | 'content' | 'layout' | 'floating' | 'analytics' | 'firebase';
type DeviceType = 'desktop' | 'tablet' | 'mobile';

export default function AdminPanel({ 
  dishes, 
  siteContent, 
  brandConfig,
  userReviews = [],
  cart = [],
  onCloseAdmin,
  onAddToCart = () => {},
  onUpdateQuantity = () => {},
  onRemoveItem = () => {},
  onClearCart = () => {},
  onCheckout = () => {},
  onAddReview = () => {},
}: AdminPanelProps) {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('admin_auth') === 'true';
  });
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Active View Mode & Device Preview State
  const [viewMode, setViewMode] = useState<AdminViewMode>('visual-split');
  const [previewDevice, setPreviewDevice] = useState<DeviceType>('desktop');
  const [previewZoom, setPreviewZoom] = useState<number>(100);
  const [highlightedSection, setHighlightedSection] = useState<string | null>(null);

  // Alignment Grid Help Tool States
  const [isGridVisible, setIsGridVisible] = useState<boolean>(false);
  const [gridType, setGridType] = useState<GridType>('12-column');
  const [gridColor, setGridColor] = useState<GridColor>('amber');
  const [gridOpacity, setGridOpacity] = useState<number>(0.45);
  const [showRulers, setShowRulers] = useState<boolean>(true);
  const [isGridSettingsOpen, setIsGridSettingsOpen] = useState<boolean>(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Modal / Form States
  const [isDishModalOpen, setIsDishModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [deleteConfirmDish, setDeleteConfirmDish] = useState<Dish | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Live Editable Site Content & Sections State
  const [localContent, setLocalContent] = useState<SiteContent>(() => {
    return {
      ...siteContent,
      sections: siteContent.sections && siteContent.sections.length > 0 ? siteContent.sections : DEFAULT_SECTIONS
    };
  });

  // Local Editable Dishes State
  const [localDishes, setLocalDishes] = useState<Dish[]>(dishes);

  // Drag-and-drop state for sections
  const [draggedSectionIndex, setDraggedSectionIndex] = useState<number | null>(null);

  // Ref to the live preview iframe / container
  const previewScrollContainerRef = useRef<HTMLDivElement>(null);
  const deviceFrameRef = useRef<HTMLDivElement>(null);

  const handlePreviewWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (previewDevice === 'desktop') {
      if (previewScrollContainerRef.current) {
        previewScrollContainerRef.current.scrollTop += e.deltaY;
      }
    } else {
      if (deviceFrameRef.current) {
        deviceFrameRef.current.scrollTop += e.deltaY;
      }
    }
  };

  // Dish Form Inputs
  const [dishForm, setDishForm] = useState({
    id: '',
    name: '',
    category: 'chicken-burgers' as Category,
    price: 350,
    currency: '₹',
    formattedPrice: '₹350',
    description: '',
    ingredients: '',
    prepTime: '15 mins',
    calories: '550 kcal',
    rating: 4.8,
    reviewsCount: '150 Reviews',
    spicyLevel: 1,
    isVeg: false,
    isBestseller: false,
    isChefSpecial: false,
    image: '',
    tags: ''
  });

  // Firebase Config Inputs
  const [firebaseConfigForm, setFirebaseConfigForm] = useState(() => getFirebaseConfig());

  // Sync external siteContent / dishes updates when not dirty
  useEffect(() => {
    if (!hasUnsavedChanges) {
      setLocalContent({
        ...siteContent,
        sections: siteContent.sections && siteContent.sections.length > 0 ? siteContent.sections : DEFAULT_SECTIONS
      });
    }
  }, [siteContent, hasUnsavedChanges]);

  useEffect(() => {
    if (!hasUnsavedChanges) {
      setLocalDishes(dishes);
    }
  }, [dishes, hasUnsavedChanges]);

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Handle Login Submission
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() === 'adminbites' && password === 'Unexpectedbites') {
      sessionStorage.setItem('admin_auth', 'true');
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Invalid credentials. Please enter valid admin username and password.');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_auth');
    setIsAuthenticated(false);
  };

  // Section Reordering & Moving Logic
  const handleMoveSection = (sectionId: string, direction: 'up' | 'down') => {
    const currentSections = [...(localContent.sections || DEFAULT_SECTIONS)];
    const index = currentSections.findIndex((s) => s.id === sectionId);
    if (index === -1) return;

    if (direction === 'up' && index > 0) {
      const temp = currentSections[index];
      currentSections[index] = currentSections[index - 1];
      currentSections[index - 1] = temp;
    } else if (direction === 'down' && index < currentSections.length - 1) {
      const temp = currentSections[index];
      currentSections[index] = currentSections[index + 1];
      currentSections[index + 1] = temp;
    }

    setLocalContent((prev) => ({ ...prev, sections: currentSections }));
    setHasUnsavedChanges(true);
    setHighlightedSection(sectionId);
    scrollToSectionInPreview(sectionId);
  };

  const handleMoveSectionToExtreme = (sectionId: string, position: 'top' | 'bottom') => {
    const currentSections = [...(localContent.sections || DEFAULT_SECTIONS)];
    const index = currentSections.findIndex((s) => s.id === sectionId);
    if (index === -1) return;

    const [item] = currentSections.splice(index, 1);
    if (position === 'top') {
      currentSections.unshift(item);
    } else {
      currentSections.push(item);
    }

    setLocalContent((prev) => ({ ...prev, sections: currentSections }));
    setHasUnsavedChanges(true);
    setHighlightedSection(sectionId);
    scrollToSectionInPreview(sectionId);
  };

  const handleToggleSectionVisibility = (sectionId: string) => {
    const currentSections = (localContent.sections || DEFAULT_SECTIONS).map((s) =>
      s.id === sectionId ? { ...s, enabled: !s.enabled } : s
    );
    setLocalContent((prev) => ({ ...prev, sections: currentSections }));
    setHasUnsavedChanges(true);
  };

  const handleResetSectionsOrder = () => {
    setLocalContent((prev) => ({ ...prev, sections: DEFAULT_SECTIONS }));
    setHasUnsavedChanges(true);
    showNotification('info', 'Sections reset to original default hierarchy.');
  };

  // Drag and Drop handlers
  const handleDragStart = (index: number) => {
    setDraggedSectionIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedSectionIndex === null || draggedSectionIndex === targetIndex) return;

    const currentSections = [...(localContent.sections || DEFAULT_SECTIONS)];
    const [draggedItem] = currentSections.splice(draggedSectionIndex, 1);
    currentSections.splice(targetIndex, 0, draggedItem);

    setDraggedSectionIndex(targetIndex);
    setLocalContent((prev) => ({ ...prev, sections: currentSections }));
    setHasUnsavedChanges(true);
  };

  const handleDragEnd = () => {
    setDraggedSectionIndex(null);
  };

  // Scroll live preview canvas to a specific section
  const scrollToSectionInPreview = (sectionId: string) => {
    setHighlightedSection(sectionId);
    setTimeout(() => {
      const el = document.getElementById(`site-sec-${sectionId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  // Save All Changes to Firebase Realtime Database
  const handleSaveAllSiteChanges = async () => {
    setIsSaving(true);
    try {
      const success = await updateSiteContentInFirebase(localContent);
      if (success) {
        setHasUnsavedChanges(false);
        showNotification('success', 'Layout, element placements & site configurations saved live!');
      } else {
        showNotification('error', 'Failed to save changes to Firebase.');
      }
    } catch (e) {
      showNotification('error', 'Error syncing with database.');
    } finally {
      setIsSaving(false);
    }
  };

  // Dish Reordering Logic
  const handleMoveDish = (dishId: string, direction: 'up' | 'down') => {
    const list = [...localDishes];
    const index = list.findIndex((d) => d.id === dishId);
    if (index === -1) return;

    if (direction === 'up' && index > 0) {
      const temp = list[index];
      list[index] = list[index - 1];
      list[index - 1] = temp;
    } else if (direction === 'down' && index < list.length - 1) {
      const temp = list[index];
      list[index] = list[index + 1];
      list[index + 1] = temp;
    }

    setLocalDishes(list);
    setHasUnsavedChanges(true);
  };

  // Dish Modal Open
  const handleOpenAddDish = () => {
    setEditingDish(null);
    setDishForm({
      id: `dish-custom-${Date.now()}`,
      name: '',
      category: 'chicken-burgers',
      price: 350,
      currency: '₹',
      formattedPrice: '₹350',
      description: '',
      ingredients: 'Brioche Bun, Secret Sauce, Melted Cheddar',
      prepTime: '15 mins',
      calories: '550 kcal',
      rating: 4.8,
      reviewsCount: '25 Reviews',
      spicyLevel: 1,
      isVeg: false,
      isBestseller: false,
      isChefSpecial: false,
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=75&fm=webp',
      tags: 'Gourmet, Fresh'
    });
    setIsDishModalOpen(true);
  };

  const handleOpenEditDish = (dish: Dish) => {
    setEditingDish(dish);
    setDishForm({
      id: dish.id,
      name: dish.name,
      category: dish.category,
      price: dish.price,
      currency: dish.currency || '₹',
      formattedPrice: dish.formattedPrice || `₹${dish.price}`,
      description: dish.description,
      ingredients: Array.isArray(dish.ingredients) ? dish.ingredients.join(', ') : '',
      prepTime: dish.prepTime || '15 mins',
      calories: dish.calories || '500 kcal',
      rating: dish.rating || 4.8,
      reviewsCount: dish.reviewsCount || '100 Reviews',
      spicyLevel: dish.spicyLevel || 1,
      isVeg: !!dish.isVeg,
      isBestseller: !!dish.isBestseller,
      isChefSpecial: !!dish.isChefSpecial,
      image: dish.image,
      tags: Array.isArray(dish.tags) ? dish.tags.join(', ') : ''
    });
    setIsDishModalOpen(true);
  };

  // Save Dish
  const handleSaveDish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dishForm.name.trim()) {
      showNotification('error', 'Dish name is required');
      return;
    }

    const dishToSave: Dish = {
      id: dishForm.id || `dish-${Date.now()}`,
      name: dishForm.name.trim(),
      category: dishForm.category,
      price: Number(dishForm.price),
      currency: dishForm.currency,
      formattedPrice: `${dishForm.currency}${dishForm.price}`,
      description: dishForm.description.trim(),
      ingredients: dishForm.ingredients.split(',').map((s) => s.trim()).filter(Boolean),
      prepTime: dishForm.prepTime,
      calories: dishForm.calories,
      rating: Number(dishForm.rating),
      reviewsCount: dishForm.reviewsCount,
      spicyLevel: (Math.min(3, Math.max(0, Number(dishForm.spicyLevel))) as 0 | 1 | 2 | 3),
      isVeg: dishForm.isVeg,
      isBestseller: dishForm.isBestseller,
      isChefSpecial: dishForm.isChefSpecial,
      image: dishForm.image.trim() || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=75&fm=webp',
      tags: dishForm.tags.split(',').map((s) => s.trim()).filter(Boolean)
    };

    const success = await saveDishToFirebase(dishToSave);
    if (success) {
      setLocalDishes((prev) => {
        const existing = prev.findIndex((d) => d.id === dishToSave.id);
        if (existing > -1) {
          const updated = [...prev];
          updated[existing] = dishToSave;
          return updated;
        }
        return [dishToSave, ...prev];
      });
      showNotification('success', editingDish ? 'Dish updated in Realtime Database!' : 'New dish added to Realtime Database!');
      setIsDishModalOpen(false);
    } else {
      showNotification('error', 'Failed to save dish to Firebase.');
    }
  };

  // Delete Dish
  const handleDeleteDish = async () => {
    if (!deleteConfirmDish) return;
    const success = await deleteDishFromFirebase(deleteConfirmDish.id);
    if (success) {
      setLocalDishes((prev) => prev.filter((d) => d.id !== deleteConfirmDish.id));
      showNotification('success', `Removed "${deleteConfirmDish.name}" from Realtime Database.`);
      setDeleteConfirmDish(null);
    } else {
      showNotification('error', 'Failed to delete dish from Firebase.');
    }
  };

  // Save Firebase Config
  const handleSaveFirebaseConfig = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem('unexpected_bites_firebase_config', JSON.stringify(firebaseConfigForm));
      showNotification('success', 'Firebase configuration updated! Refreshing page...');
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    } catch (e) {
      showNotification('error', 'Failed to save config.');
    }
  };

  // Filtered dishes for manager
  const filteredDishes = localDishes.filter((dish) => {
    const matchesSearch = dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dish.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || dish.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Current active sections
  const activeSectionsList = localContent.sections || DEFAULT_SECTIONS;

  // Unauthenticated Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-stone-950 text-stone-100 flex items-center justify-center p-4 font-sans relative overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="w-full max-w-md bg-stone-900 border border-stone-800 rounded-2xl p-8 shadow-2xl relative z-10"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-3">
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-bold font-serif text-white tracking-tight">Unexpected Bites</h1>
            <p className="text-stone-400 text-sm mt-1">Admin Visual Studio & Layout Portal</p>
            <span className="inline-block mt-2 px-3 py-0.5 text-xs font-mono bg-stone-800 text-amber-400 rounded-full border border-stone-700">
              /admin
            </span>
          </div>

          {authError && (
            <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2">
                Admin Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter admin username"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-3 text-sm text-white placeholder-stone-600 focus:outline-none focus:border-amber-500 transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2">
                Admin Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••••••"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-3 text-sm text-white placeholder-stone-600 focus:outline-none focus:border-amber-500 transition-colors"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold py-3 px-4 rounded-xl text-sm transition-all shadow-lg shadow-amber-500/20 active:scale-[0.98] cursor-pointer"
            >
              Sign In to Visual Admin
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-stone-800 text-center">
            <button
              onClick={onCloseAdmin}
              className="text-stone-400 hover:text-white text-xs inline-flex items-center gap-1 transition-colors"
            >
              ← Return to Main Website
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Device width styling for live preview canvas
  const getDeviceContainerStyle = () => {
    switch (previewDevice) {
      case 'mobile':
        return {
          width: '390px',
          height: '844px',
          maxWidth: '100%',
          border: '12px solid #1c1917',
          borderRadius: '40px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.75), 0 0 0 1px #44403c',
          overflowY: 'auto' as const,
          transform: `scale(${previewZoom / 100})`,
          transformOrigin: 'top center',
          margin: '0 auto',
        };
      case 'tablet':
        return {
          width: '768px',
          height: '1024px',
          maxWidth: '100%',
          border: '10px solid #1c1917',
          borderRadius: '32px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.75), 0 0 0 1px #44403c',
          overflowY: 'auto' as const,
          transform: `scale(${previewZoom / 100})`,
          transformOrigin: 'top center',
          margin: '0 auto',
        };
      case 'desktop':
      default:
        return {
          width: '100%',
          minHeight: '100%',
          borderRadius: '16px',
          transform: previewZoom !== 100 ? `scale(${previewZoom / 100})` : undefined,
          transformOrigin: 'top center',
        };
    }
  };

  return (
    <div 
      data-lenis-prevent="true"
      className="min-h-screen bg-stone-950 text-stone-100 font-sans flex flex-col h-screen overflow-hidden overscroll-contain"
    >
      {/* Top Header Bar */}
      <header className="bg-stone-900 border-b border-stone-800 px-4 py-3 shrink-0 flex items-center justify-between z-30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold">
            <Utensils className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif font-bold text-base text-white">Unexpected Bites Admin</h1>
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Sync
              </span>
            </div>
          </div>
        </div>

        {/* View Mode Navigation Tabs */}
        <div className="hidden lg:flex items-center bg-stone-950 p-1 rounded-xl border border-stone-800 gap-1">
          <button
            onClick={() => setViewMode('visual-split')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'visual-split'
                ? 'bg-amber-500 text-stone-950 shadow-md font-bold'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            Visual Builder (Split)
          </button>

          <button
            onClick={() => setViewMode('elements')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'elements'
                ? 'bg-amber-500 text-stone-950 shadow-md font-bold'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            Page Elements & Buttons
          </button>

          <button
            onClick={() => setViewMode('full-preview')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'full-preview'
                ? 'bg-amber-500 text-stone-950 shadow-md font-bold'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            Live Full Canvas
          </button>

          <button
            onClick={() => setViewMode('layout')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'layout'
                ? 'bg-amber-500 text-stone-950 shadow-md font-bold'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Sections ({activeSectionsList.length})
          </button>

          <button
            onClick={() => setViewMode('floating')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'floating'
                ? 'bg-amber-500 text-stone-950 shadow-md font-bold'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <CornerDownRight className="w-3.5 h-3.5" />
            Floating Buttons
          </button>

          <button
            onClick={() => setViewMode('dishes')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'dishes'
                ? 'bg-amber-500 text-stone-950 shadow-md font-bold'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            Dishes ({localDishes.length})
          </button>

          <button
            onClick={() => setViewMode('content')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'content'
                ? 'bg-amber-500 text-stone-950 shadow-md font-bold'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            Copy & SLA
          </button>

          <button
            onClick={() => setViewMode('analytics')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'analytics'
                ? 'bg-amber-500 text-stone-950 shadow-md font-bold'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Analytics
          </button>

          <button
            onClick={() => setViewMode('firebase')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'firebase'
                ? 'bg-amber-500 text-stone-950 shadow-md font-bold'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            Firebase
          </button>
        </div>

        {/* Top Header Bar */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenAddDish()}
            className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shadow transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Dish</span>
          </button>

          <button
            onClick={() => setViewMode('firebase')}
            className="bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Key className="w-3.5 h-3.5 text-amber-400" />
            <span>API Keys</span>
          </button>
        </div>

        {/* Action Controls & Save All Button */}
        <div className="flex items-center gap-2">
          {hasUnsavedChanges && (
            <button
              onClick={handleSaveAllSiteChanges}
              disabled={isSaving}
              className="bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold px-3.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shadow-lg animate-pulse transition-all cursor-pointer"
            >
              {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Publish All
            </button>
          )}

          <button
            onClick={onCloseAdmin}
            className="px-3 py-1.5 text-xs text-stone-300 hover:text-white bg-stone-800 hover:bg-stone-700 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            Exit Admin
          </button>

          <button
            onClick={handleLogout}
            className="px-3 py-1.5 text-xs text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </button>
        </div>
      </header>

      {/* Notifications Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-16 right-6 z-50 px-4 py-3 rounded-xl border shadow-2xl flex items-center gap-2.5 text-xs font-medium ${
              notification.type === 'success'
                ? 'bg-emerald-950 border-emerald-500/40 text-emerald-200'
                : notification.type === 'error'
                ? 'bg-red-950 border-red-500/40 text-red-200'
                : 'bg-amber-950 border-amber-500/40 text-amber-200'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : notification.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            ) : (
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            )}
            <span>{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN ADMIN WORKSPACE */}
      <div className="flex-1 flex overflow-hidden">
        {/* ======================================================== */}
        {/* MODE 1: VISUAL BUILDER (SPLIT SCREEN) & FULL PREVIEW    */}
        {/* ======================================================== */}
        {(viewMode === 'visual-split' || viewMode === 'full-preview') && (
          <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden w-full">
            {/* Left Control Sidebar (shown in visual-split mode) */}
            {viewMode === 'visual-split' && (
              <div 
                data-lenis-prevent="true"
                className="w-full md:w-80 lg:w-96 bg-stone-900 border-r border-stone-800 flex flex-col shrink-0 h-full overflow-y-auto overscroll-contain"
              >
                <div className="p-4 border-b border-stone-800 flex items-center justify-between sticky top-0 bg-stone-900/95 backdrop-blur-md z-10">
                  <div>
                    <h2 className="font-serif font-bold text-sm text-white flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-amber-400" />
                      Move Everything & Sections
                    </h2>
                    <p className="text-[11px] text-stone-400">Reorder sections & live element controls</p>
                  </div>

                  <button
                    onClick={handleResetSectionsOrder}
                    title="Reset to default order"
                    className="p-1.5 hover:bg-stone-800 text-stone-400 hover:text-amber-400 rounded-lg transition-colors cursor-pointer text-xs flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Section List with Move Up / Move Down controls */}
                <div className="p-4 space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-amber-400/90 mb-1">
                    <span>Website Section Order</span>
                    <span>{activeSectionsList.filter(s => s.enabled).length} Active</span>
                  </div>

                  {activeSectionsList.map((section, idx, arr) => (
                    <div
                      key={section.id}
                      draggable
                      onDragStart={() => handleDragStart(idx)}
                      onDragOver={(e) => handleDragOver(e, idx)}
                      onDragEnd={handleDragEnd}
                      onClick={() => scrollToSectionInPreview(section.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer group ${
                        highlightedSection === section.id
                          ? 'bg-amber-500/10 border-amber-500/60 shadow-lg'
                          : section.enabled
                          ? 'bg-stone-950 border-stone-800 hover:border-stone-700'
                          : 'bg-stone-950/40 border-stone-800/40 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <GripVertical className="w-3.5 h-3.5 text-stone-600 group-hover:text-stone-400 cursor-grab shrink-0" />
                          <span className="font-mono text-[10px] text-amber-400 font-bold">#{idx + 1}</span>
                          <span className="text-xs font-bold text-white truncate">{section.name}</span>
                        </div>

                        {/* Move Buttons */}
                        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleMoveSection(section.id, 'up')}
                            disabled={idx === 0}
                            title="Move Up"
                            className="p-1 hover:bg-stone-800 disabled:opacity-20 text-stone-300 hover:text-amber-400 rounded transition-colors cursor-pointer"
                          >
                            <MoveUp className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleMoveSection(section.id, 'down')}
                            disabled={idx === arr.length - 1}
                            title="Move Down"
                            className="p-1 hover:bg-stone-800 disabled:opacity-20 text-stone-300 hover:text-amber-400 rounded transition-colors cursor-pointer"
                          >
                            <MoveDown className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleToggleSectionVisibility(section.id)}
                            title={section.enabled ? 'Hide section' : 'Show section'}
                            className={`p-1 hover:bg-stone-800 rounded transition-colors cursor-pointer ${
                              section.enabled ? 'text-emerald-400' : 'text-stone-600'
                            }`}
                          >
                            {section.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      <p className="text-[10px] text-stone-400 mt-1 line-clamp-1 pl-6">
                        {section.description}
                      </p>
                    </div>
                  ))}

                  {/* Quick Element Placement Presets */}
                  <div className="pt-4 mt-4 border-t border-stone-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Box className="w-3.5 h-3.5" />
                        Quick In-Page Presets
                      </h3>
                      <button
                        onClick={() => setViewMode('elements')}
                        className="text-[10px] text-amber-400 hover:underline flex items-center gap-0.5"
                      >
                        All Controls <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Hero Layout Mode */}
                    <div className="bg-stone-950 p-3 rounded-xl border border-stone-800 space-y-2">
                      <span className="text-xs font-medium text-stone-200">Hero Section Layout</span>
                      <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                        {[
                          { id: 'split-right', label: 'Split (Right Card)' },
                          { id: 'split-left', label: 'Split (Left Card)' },
                          { id: 'centered-stacked', label: 'Centered Stacked' },
                          { id: 'compact-minimal', label: 'Compact Minimal' },
                        ].map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              setLocalContent({ ...localContent, heroLayout: item.id as any });
                              setHasUnsavedChanges(true);
                            }}
                            className={`px-2 py-1.5 rounded border text-center transition-all cursor-pointer ${
                              localContent.heroLayout === item.id || (!localContent.heroLayout && item.id === 'split-right')
                                ? 'bg-amber-500 text-stone-950 font-bold border-amber-400'
                                : 'bg-stone-900 text-stone-400 border-stone-800 hover:border-stone-700'
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Dish Bento Grid Columns */}
                    <div className="bg-stone-950 p-3 rounded-xl border border-stone-800 space-y-2">
                      <span className="text-xs font-medium text-stone-200">Dish Grid Columns</span>
                      <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                        {[
                          { cols: 2, label: '2 Columns' },
                          { cols: 3, label: '3 Columns' },
                          { cols: 4, label: '4 Columns' },
                        ].map((item) => (
                          <button
                            key={item.cols}
                            type="button"
                            onClick={() => {
                              setLocalContent({ ...localContent, dishGridColumns: item.cols as any });
                              setHasUnsavedChanges(true);
                            }}
                            className={`px-2 py-1.5 rounded border text-center transition-all cursor-pointer ${
                              localContent.dishGridColumns === item.cols || (!localContent.dishGridColumns && item.cols === 4)
                                ? 'bg-amber-500 text-stone-950 font-bold border-amber-400'
                                : 'bg-stone-900 text-stone-400 border-stone-800 hover:border-stone-700'
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Floating Buttons Position Presets */}
                    <div className="bg-stone-950 p-3 rounded-xl border border-stone-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-stone-200">Mascot Position</span>
                        <span className="text-[10px] font-mono text-amber-400 capitalize">{localContent.mascotPosition}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                        {(['top-left', 'top-right', 'bottom-left', 'bottom-right', 'hidden'] as const).map((pos) => (
                          <button
                            key={pos}
                            type="button"
                            onClick={() => {
                              setLocalContent({ ...localContent, mascotPosition: pos });
                              setHasUnsavedChanges(true);
                            }}
                            className={`px-2 py-1 rounded border text-center capitalize transition-all cursor-pointer ${
                              localContent.mascotPosition === pos
                                ? 'bg-amber-500 text-stone-950 font-bold border-amber-400'
                                : 'bg-stone-900 text-stone-400 border-stone-800 hover:border-stone-700'
                            }`}
                          >
                            {pos.replace('-', ' ')}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="pt-4 sticky bottom-0 bg-stone-900 pb-4">
                    <button
                      onClick={handleSaveAllSiteChanges}
                      disabled={isSaving}
                      className="w-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
                    >
                      {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Save & Publish Live
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Right Live Canvas Viewport with Grid Overlay */}
            <div className="flex-1 flex flex-col bg-stone-950 h-full overflow-hidden relative">
              {/* Canvas Device & Alignment Grid Toolbar */}
              <div className="bg-stone-900/95 border-b border-stone-800 px-4 py-2 flex flex-wrap items-center justify-between gap-3 shrink-0 z-20 backdrop-blur-md">
                {/* Device Switcher */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-stone-400">Viewport:</span>
                  <div className="flex items-center bg-stone-950 rounded-lg p-0.5 border border-stone-800 text-xs">
                    <button
                      onClick={() => setPreviewDevice('desktop')}
                      className={`px-2.5 py-1 rounded flex items-center gap-1 transition-colors cursor-pointer ${
                        previewDevice === 'desktop' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-400 hover:text-white'
                      }`}
                    >
                      <Monitor className="w-3.5 h-3.5" />
                      Desktop
                    </button>
                    <button
                      onClick={() => setPreviewDevice('tablet')}
                      className={`px-2.5 py-1 rounded flex items-center gap-1 transition-colors cursor-pointer ${
                        previewDevice === 'tablet' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-400 hover:text-white'
                      }`}
                    >
                      <Tablet className="w-3.5 h-3.5" />
                      Tablet (768px)
                    </button>
                    <button
                      onClick={() => setPreviewDevice('mobile')}
                      className={`px-2.5 py-1 rounded flex items-center gap-1 transition-colors cursor-pointer ${
                        previewDevice === 'mobile' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-400 hover:text-white'
                      }`}
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      Mobile (390px)
                    </button>
                  </div>
                </div>

                {/* Canvas Controls */}
                <div className="flex items-center gap-2 relative">
                  {/* Zoom Controls */}
                  <div className="flex items-center gap-1 bg-stone-950 px-2 py-1 rounded-lg border border-stone-800 text-xs text-stone-400">
                    <span>Zoom:</span>
                    <button
                      onClick={() => setPreviewZoom((z) => Math.max(50, z - 10))}
                      className="px-1 hover:text-white cursor-pointer"
                    >
                      -
                    </button>
                    <span className="font-mono text-amber-400 font-bold">{previewZoom}%</span>
                    <button
                      onClick={() => setPreviewZoom((z) => Math.min(125, z + 10))}
                      className="px-1 hover:text-white cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  {viewMode === 'full-preview' && (
                    <button
                      onClick={() => setViewMode('visual-split')}
                      className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white rounded-lg text-xs flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Minimize2 className="w-3.5 h-3.5" />
                      Sidebar
                    </button>
                  )}
                </div>
              </div>

              {/* The Actual Rendered Live Website Component */}
              <div 
                ref={previewScrollContainerRef}
                data-lenis-prevent="true"
                onWheel={handlePreviewWheel}
                className="flex-1 overflow-y-auto p-4 md:p-6 bg-stone-950/80 flex justify-center items-start relative overscroll-contain"
              >
                <div 
                  ref={deviceFrameRef}
                  data-lenis-prevent="true"
                  style={getDeviceContainerStyle()}
                  className="transition-all duration-300 relative bg-[var(--theme-bg)] shadow-2xl overscroll-contain"
                >
                  {/* Live Website Component */}
                  <MainWebsiteView
                    currentPage="home"
                    onSelectPage={() => {}}
                    selectedCategory={selectedCategory}
                    dishes={localDishes}
                    siteContent={localContent}
                    brandConfig={brandConfig}
                    userReviews={userReviews}
                    cart={cart}
                    onAddToCart={onAddToCart}
                    onUpdateQuantity={onUpdateQuantity}
                    onRemoveItem={onRemoveItem}
                    onClearCart={onClearCart}
                    onCheckout={onCheckout}
                    onAddReview={onAddReview}
                    isAdminPreview={true}
                    activeHighlightedSection={highlightedSection}
                    onAdminSelectSection={(secId) => {
                      setHighlightedSection(secId);
                    }}
                    onAdminMoveSection={handleMoveSection}
                    onAdminToggleSection={handleToggleSectionVisibility}
                    onAdminEditDish={handleOpenEditDish}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODE 2: IN-PAGE ELEMENTS & BUTTONS CUSTOMIZER            */}
        {/* ======================================================== */}
        {viewMode === 'elements' && (
          <div 
            data-lenis-prevent="true"
            className="flex-1 overflow-y-auto p-6 max-w-5xl mx-auto w-full space-y-8 overscroll-contain"
          >
            <div>
              <h2 className="text-xl font-serif font-bold text-white flex items-center gap-2">
                <Box className="w-5 h-5 text-amber-400" />
                In-Page Elements, Button Alignment & Dish Placements
              </h2>
              <p className="text-xs text-stone-400 mt-1">
                Customize in-page layout structures, button shapes, CTA alignments, and dish card grids without writing code.
              </p>
            </div>

            {/* SECTION 1: HERO SECTION CUSTOMIZATION */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-400" />
                  Hero Section Layout & CTA Buttons
                </h3>
                <span className="text-xs font-mono text-amber-400">#hero</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Hero Layout Mode */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-stone-300">Hero Layout Archetype</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'split-right', title: 'Split (Right Dish)', desc: 'Copy on left, 3D Dish on right' },
                      { id: 'split-left', title: 'Split (Left Dish)', desc: '3D Dish on left, Copy on right' },
                      { id: 'centered-stacked', title: 'Centered Stacked', desc: 'Hero copy centered above dish' },
                      { id: 'compact-minimal', title: 'Compact Minimal', desc: 'Dense copy with right dish' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setLocalContent({ ...localContent, heroLayout: item.id as any });
                          setHasUnsavedChanges(true);
                        }}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          localContent.heroLayout === item.id || (!localContent.heroLayout && item.id === 'split-right')
                            ? 'bg-amber-500/15 border-amber-400 text-white ring-1 ring-amber-400'
                            : 'bg-stone-950 border-stone-800 text-stone-400 hover:border-stone-700'
                        }`}
                      >
                        <span className="text-xs font-bold block">{item.title}</span>
                        <span className="text-[10px] text-stone-500 block mt-0.5">{item.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Hero Button Alignment */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-stone-300">CTA Button Alignment</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'left', title: 'Left Aligned', icon: AlignLeft },
                      { id: 'center', title: 'Center Aligned', icon: AlignCenter },
                      { id: 'right', title: 'Right Aligned', icon: AlignRight },
                      { id: 'stretch', title: 'Full Width Stretch', icon: Sliders },
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setLocalContent({ ...localContent, heroButtonAlign: item.id as any });
                            setHasUnsavedChanges(true);
                          }}
                          className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all cursor-pointer ${
                            localContent.heroButtonAlign === item.id || (!localContent.heroButtonAlign && item.id === 'left')
                              ? 'bg-amber-500/15 border-amber-400 text-white ring-1 ring-amber-400'
                              : 'bg-stone-950 border-stone-800 text-stone-400 hover:border-stone-700'
                          }`}
                        >
                          <Icon className="w-4 h-4 text-amber-400" />
                          <span className="text-xs font-bold">{item.title}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Hero Button Placement & Layout */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-stone-300">CTA Button Group Arrangement</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'inline', title: 'Inline Row' },
                      { id: 'stacked', title: 'Stacked Column' },
                      { id: 'split-edges', title: 'Split Edges' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setLocalContent({ ...localContent, heroButtonPlacement: item.id as any });
                          setHasUnsavedChanges(true);
                        }}
                        className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                          localContent.heroButtonPlacement === item.id || (!localContent.heroButtonPlacement && item.id === 'inline')
                            ? 'bg-amber-500 text-stone-950 font-bold border-amber-400'
                            : 'bg-stone-950 text-stone-400 border-stone-800 hover:border-stone-700'
                        }`}
                      >
                        {item.title}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Global Button Shape Style */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-stone-300">Site Button Corner Radius</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'pill', title: 'Rounded Pill (Full)', class: 'rounded-full' },
                      { id: 'rounded', title: 'Smooth (2XL)', class: 'rounded-2xl' },
                      { id: 'sharp', title: 'Sharp Brutalist', class: 'rounded-none' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setLocalContent({ ...localContent, buttonStyle: item.id as any });
                          setHasUnsavedChanges(true);
                        }}
                        className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                          localContent.buttonStyle === item.id || (!localContent.buttonStyle && item.id === 'pill')
                            ? 'bg-amber-500 text-stone-950 font-bold border-amber-400'
                            : 'bg-stone-950 text-stone-400 border-stone-800 hover:border-stone-700'
                        }`}
                      >
                        {item.title}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2: DISHES & MENU GRID PLACEMENT */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Utensils className="w-4 h-4 text-amber-400" />
                  Menu Dishes Grid & Card Architecture
                </h3>
                <span className="text-xs font-mono text-amber-400">#menu</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Grid Columns */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-stone-300">Menu Grid Columns</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { cols: 2, title: '2 Columns', desc: 'Large showcase cards' },
                      { cols: 3, title: '3 Columns', desc: 'Standard balanced bento' },
                      { cols: 4, title: '4 Columns', desc: 'Dense feast catalog' },
                    ].map((item) => (
                      <button
                        key={item.cols}
                        type="button"
                        onClick={() => {
                          setLocalContent({ ...localContent, dishGridColumns: item.cols as any });
                          setHasUnsavedChanges(true);
                        }}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          localContent.dishGridColumns === item.cols || (!localContent.dishGridColumns && item.cols === 4)
                            ? 'bg-amber-500/15 border-amber-400 text-white ring-1 ring-amber-400'
                            : 'bg-stone-950 border-stone-800 text-stone-400 hover:border-stone-700'
                        }`}
                      >
                        <span className="text-xs font-bold block">{item.title}</span>
                        <span className="text-[10px] text-stone-500 block mt-0.5">{item.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Card Layout Style */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-stone-300">Dish Card Style</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'bento', title: 'Asymmetric Bento', desc: 'Dynamic featured card spans' },
                      { id: 'uniform-grid', title: 'Uniform Symmetrical', desc: 'Identical card dimensions' },
                      { id: 'compact-dense', title: 'Compact Dense', desc: 'Reduced height, tight padding' },
                      { id: 'horizontal-cards', title: 'Horizontal Split', desc: 'Image on left, details right' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setLocalContent({ ...localContent, dishCardStyle: item.id as any });
                          setHasUnsavedChanges(true);
                        }}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          localContent.dishCardStyle === item.id || (!localContent.dishCardStyle && item.id === 'bento')
                            ? 'bg-amber-500/15 border-amber-400 text-white ring-1 ring-amber-400'
                            : 'bg-stone-950 border-stone-800 text-stone-400 hover:border-stone-700'
                        }`}
                      >
                        <span className="text-xs font-bold block">{item.title}</span>
                        <span className="text-[10px] text-stone-500 block mt-0.5">{item.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dish Button Placement */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-stone-300">Dish Card Add-To-Cart Button</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'inline-footer', title: 'Inline Footer (Right)' },
                      { id: 'full-width', title: 'Full Width Bottom' },
                      { id: 'floating-overlay', title: 'Floating Image Button' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setLocalContent({ ...localContent, dishButtonPlacement: item.id as any });
                          setHasUnsavedChanges(true);
                        }}
                        className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                          localContent.dishButtonPlacement === item.id || (!localContent.dishButtonPlacement && item.id === 'inline-footer')
                            ? 'bg-amber-500 text-stone-950 font-bold border-amber-400'
                            : 'bg-stone-950 text-stone-400 border-stone-800 hover:border-stone-700'
                        }`}
                      >
                        {item.title}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dish Sorting Preset */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-stone-300">Default Dish Sort Arrangement</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'manual', title: 'Manual Custom Order' },
                      { id: 'featured-first', title: 'Bestsellers / Chef Specials' },
                      { id: 'price-asc', title: 'Price: Low to High' },
                      { id: 'rating-desc', title: 'Customer Rating: High' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setLocalContent({ ...localContent, dishSortMode: item.id as any });
                          setHasUnsavedChanges(true);
                        }}
                        className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer ${
                          localContent.dishSortMode === item.id || (!localContent.dishSortMode && item.id === 'manual')
                            ? 'bg-amber-500 text-stone-950 font-bold border-amber-400'
                            : 'bg-stone-950 text-stone-400 border-stone-800 hover:border-stone-700'
                        }`}
                      >
                        {item.title}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category Filter Tabs Alignment */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-stone-300">Category Filter Bar Alignment</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'left', title: 'Left Aligned' },
                      { id: 'center', title: 'Centered' },
                      { id: 'justified', title: 'Justified (Full)' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setLocalContent({ ...localContent, categoryTabsAlign: item.id as any });
                          setHasUnsavedChanges(true);
                        }}
                        className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                          localContent.categoryTabsAlign === item.id || (!localContent.categoryTabsAlign && item.id === 'left')
                            ? 'bg-amber-500 text-stone-950 font-bold border-amber-400'
                            : 'bg-stone-950 text-stone-400 border-stone-800 hover:border-stone-700'
                        }`}
                      >
                        {item.title}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tag Placement */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-stone-300">Dish Flame Tag Placement</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'top-left', title: 'Top-Left Tag' },
                      { id: 'top-right', title: 'Top-Right Tag' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setLocalContent({ ...localContent, dishTagPlacement: item.id as any });
                          setHasUnsavedChanges(true);
                        }}
                        className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                          localContent.dishTagPlacement === item.id || (!localContent.dishTagPlacement && item.id === 'top-left')
                            ? 'bg-amber-500 text-stone-950 font-bold border-amber-400'
                            : 'bg-stone-950 text-stone-400 border-stone-800 hover:border-stone-700'
                        }`}
                      >
                        {item.title}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 3: NAVBAR & FLOATING HEADER */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-amber-400" />
                  Navigation Header Position & Style
                </h3>
                <span className="text-xs font-mono text-amber-400">#navbar</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { id: 'top-floating', title: 'Floating Pill (Modern)', desc: 'Floating glass pill with backdrop blur' },
                  { id: 'top-fixed', title: 'Fixed Full Width', desc: 'Spans 100% viewport top edge' },
                  { id: 'top-static', title: 'Static in Flow', desc: 'Scrolls naturally with the page content' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setLocalContent({ ...localContent, navbarPosition: item.id as any });
                      setHasUnsavedChanges(true);
                    }}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                      localContent.navbarPosition === item.id || (!localContent.navbarPosition && item.id === 'top-floating')
                        ? 'bg-amber-500/15 border-amber-400 text-white ring-1 ring-amber-400'
                        : 'bg-stone-950 border-stone-800 text-stone-400 hover:border-stone-700'
                    }`}
                  >
                    <span className="text-xs font-bold block">{item.title}</span>
                    <span className="text-[10px] text-stone-500 block mt-1">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Save All Elements Changes Button */}
            <div className="pt-4 flex justify-end">
              <button
                onClick={handleSaveAllSiteChanges}
                disabled={isSaving}
                className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold px-8 py-3 rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
              >
                {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save & Apply Page Customizations
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODE 3: SECTIONS HIERARCHY & REORDERING                  */}
        {/* ======================================================== */}
        {viewMode === 'layout' && (
          <div 
            data-lenis-prevent="true"
            className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto w-full space-y-6 overscroll-contain"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-serif font-bold text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-amber-400" />
                  Website Section Ordering & Visibility
                </h2>
                <p className="text-xs text-stone-400 mt-1">
                  Drag and drop or use arrow buttons to move every section on the site.
                </p>
              </div>

              <button
                onClick={handleResetSectionsOrder}
                className="bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Hierarchy
              </button>
            </div>

            <div className="space-y-3">
              {activeSectionsList.map((section, idx, arr) => (
                <div
                  key={section.id}
                  draggable
                  onDragStart={() => handleDragStart(idx)}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDragEnd={handleDragEnd}
                  className={`bg-stone-900 border rounded-2xl p-4 transition-all flex items-center justify-between gap-4 ${
                    section.enabled
                      ? 'border-stone-800 hover:border-stone-700'
                      : 'border-stone-800/40 opacity-50 bg-stone-950'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <GripVertical className="w-4 h-4 text-stone-600 cursor-grab" />
                    <span className="font-mono text-xs text-amber-400 font-bold bg-stone-950 px-2 py-1 rounded-lg border border-stone-800">
                      #{idx + 1}
                    </span>
                    <div>
                      <h3 className="font-bold text-sm text-white">{section.name}</h3>
                      <p className="text-xs text-stone-400">{section.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleMoveSectionToExtreme(section.id, 'top')}
                      disabled={idx === 0}
                      title="Move to Very Top"
                      className="p-2 hover:bg-stone-800 disabled:opacity-20 rounded-lg text-stone-400 hover:text-amber-400 transition-colors cursor-pointer"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleMoveSection(section.id, 'up')}
                      disabled={idx === 0}
                      title="Move Up"
                      className="p-2 hover:bg-stone-800 disabled:opacity-20 rounded-lg text-stone-400 hover:text-amber-400 transition-colors cursor-pointer"
                    >
                      <MoveUp className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleMoveSection(section.id, 'down')}
                      disabled={idx === arr.length - 1}
                      title="Move Down"
                      className="p-2 hover:bg-stone-800 disabled:opacity-20 rounded-lg text-stone-400 hover:text-amber-400 transition-colors cursor-pointer"
                    >
                      <MoveDown className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleMoveSectionToExtreme(section.id, 'bottom')}
                      disabled={idx === arr.length - 1}
                      title="Move to Bottom"
                      className="p-2 hover:bg-stone-800 disabled:opacity-20 rounded-lg text-stone-400 hover:text-amber-400 transition-colors cursor-pointer"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleToggleSectionVisibility(section.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                        section.enabled
                          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                          : 'bg-stone-950 text-stone-500 border-stone-800'
                      }`}
                    >
                      {section.enabled ? 'Enabled' : 'Hidden'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={handleSaveAllSiteChanges}
                disabled={isSaving}
                className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold px-8 py-3 rounded-xl text-sm flex items-center gap-2 shadow-lg transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                Save Order & Publish
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODE 4: FLOATING BUTTONS & MASCOT POSITIONER            */}
        {/* ======================================================== */}
        {viewMode === 'floating' && (
          <div 
            data-lenis-prevent="true"
            className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto w-full space-y-6 overscroll-contain"
          >
            <div>
              <h2 className="text-xl font-serif font-bold text-white flex items-center gap-2">
                <CornerDownRight className="w-5 h-5 text-amber-400" />
                Floating Buttons & Mascot Position Studio
              </h2>
              <p className="text-xs text-stone-400 mt-1">
                Position floating widgets across any corner with intelligent stacking and offset presets.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Mascot Widget */}
              <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <h3 className="font-bold text-sm text-white">AI Mascot ("Bites")</h3>
                  </div>
                  <span className="text-[10px] font-mono text-amber-400 capitalize">{localContent.mascotPosition}</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {(['top-left', 'top-right', 'bottom-left', 'bottom-right'] as FloatingButtonCorner[]).map((corner) => (
                    <button
                      key={corner}
                      onClick={() => {
                        setLocalContent({ ...localContent, mascotPosition: corner });
                        setHasUnsavedChanges(true);
                      }}
                      className={`rounded-xl border flex flex-col items-center justify-center p-3 transition-all cursor-pointer text-xs font-semibold ${
                        localContent.mascotPosition === corner
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300 ring-2 ring-amber-500/40'
                          : 'bg-stone-950 border-stone-800 text-stone-400 hover:border-stone-700'
                      }`}
                    >
                      <span className="capitalize">{corner.replace('-', ' ')}</span>
                      {localContent.mascotPosition === corner && (
                        <span className="text-[9px] bg-amber-500 text-stone-950 font-bold px-1.5 py-0.5 rounded mt-1">ACTIVE</span>
                      )}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => {
                    setLocalContent({ ...localContent, mascotPosition: localContent.mascotPosition === 'hidden' ? 'bottom-left' : 'hidden' });
                    setHasUnsavedChanges(true);
                  }}
                  className={`w-full py-2 px-3 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                    localContent.mascotPosition === 'hidden'
                      ? 'bg-red-500/20 text-red-300 border-red-500/40'
                      : 'bg-stone-950 text-stone-400 border-stone-800 hover:text-white'
                  }`}
                >
                  {localContent.mascotPosition === 'hidden' ? '🚫 Mascot Hidden' : '👁️ Mascot Enabled'}
                </button>
              </div>

              {/* WhatsApp Button */}
              <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PhoneCall className="w-4 h-4 text-emerald-400" />
                    <h3 className="font-bold text-sm text-white">WhatsApp Order</h3>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 capitalize">{localContent.whatsappPosition}</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {(['top-left', 'top-right', 'bottom-left', 'bottom-right'] as FloatingButtonCorner[]).map((corner) => (
                    <button
                      key={corner}
                      onClick={() => {
                        setLocalContent({ ...localContent, whatsappPosition: corner });
                        setHasUnsavedChanges(true);
                      }}
                      className={`rounded-xl border flex flex-col items-center justify-center p-3 transition-all cursor-pointer text-xs font-semibold ${
                        localContent.whatsappPosition === corner
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/40'
                          : 'bg-stone-950 border-stone-800 text-stone-400 hover:border-stone-700'
                      }`}
                    >
                      <span className="capitalize">{corner.replace('-', ' ')}</span>
                      {localContent.whatsappPosition === corner && (
                        <span className="text-[9px] bg-emerald-500 text-stone-950 font-bold px-1.5 py-0.5 rounded mt-1">ACTIVE</span>
                      )}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => {
                    setLocalContent({ ...localContent, whatsappPosition: localContent.whatsappPosition === 'hidden' ? 'bottom-right' : 'hidden' });
                    setHasUnsavedChanges(true);
                  }}
                  className={`w-full py-2 px-3 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                    localContent.whatsappPosition === 'hidden'
                      ? 'bg-red-500/20 text-red-300 border-red-500/40'
                      : 'bg-stone-950 text-stone-400 border-stone-800 hover:text-white'
                  }`}
                >
                  {localContent.whatsappPosition === 'hidden' ? '🚫 WhatsApp Hidden' : '👁️ WhatsApp Enabled'}
                </button>
              </div>

              {/* Cart Button */}
              <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-amber-400" />
                    <h3 className="font-bold text-sm text-white">Cart Basket</h3>
                  </div>
                  <span className="text-[10px] font-mono text-amber-400 capitalize">{localContent.cartPosition}</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {(['top-left', 'top-right', 'bottom-left', 'bottom-right'] as FloatingButtonCorner[]).map((corner) => (
                    <button
                      key={corner}
                      onClick={() => {
                        setLocalContent({ ...localContent, cartPosition: corner });
                        setHasUnsavedChanges(true);
                      }}
                      className={`rounded-xl border flex flex-col items-center justify-center p-3 transition-all cursor-pointer text-xs font-semibold ${
                        localContent.cartPosition === corner
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300 ring-2 ring-amber-500/40'
                          : 'bg-stone-950 border-stone-800 text-stone-400 hover:border-stone-700'
                      }`}
                    >
                      <span className="capitalize">{corner.replace('-', ' ')}</span>
                      {localContent.cartPosition === corner && (
                        <span className="text-[9px] bg-amber-500 text-stone-950 font-bold px-1.5 py-0.5 rounded mt-1">ACTIVE</span>
                      )}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => {
                    setLocalContent({ ...localContent, cartPosition: localContent.cartPosition === 'hidden' ? 'top-right' : 'hidden' });
                    setHasUnsavedChanges(true);
                  }}
                  className={`w-full py-2 px-3 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                    localContent.cartPosition === 'hidden'
                      ? 'bg-red-500/20 text-red-300 border-red-500/40'
                      : 'bg-stone-950 text-stone-400 border-stone-800 hover:text-white'
                  }`}
                >
                  {localContent.cartPosition === 'hidden' ? '🚫 Cart Hidden' : '👁️ Cart Enabled'}
                </button>
              </div>
            </div>

            {/* Stack Direction & Corner Offsets */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-white">Stacking & Spacing Rules</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-stone-300 block mb-1.5">Stack Direction</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'vertical', label: 'Vertical Stack' },
                      { id: 'horizontal', label: 'Horizontal Stack' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setLocalContent({ ...localContent, floatingButtonsStack: item.id as any });
                          setHasUnsavedChanges(true);
                        }}
                        className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                          localContent.floatingButtonsStack === item.id || (!localContent.floatingButtonsStack && item.id === 'vertical')
                            ? 'bg-amber-500 text-stone-950 font-bold border-amber-400'
                            : 'bg-stone-950 text-stone-400 border-stone-800 hover:border-stone-700'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-300 block mb-1.5">Corner Offset Margin</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'compact', label: 'Compact (16px)' },
                      { id: 'standard', label: 'Standard (24px)' },
                      { id: 'high', label: 'High (36px)' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setLocalContent({ ...localContent, floatingButtonsOffset: item.id as any });
                          setHasUnsavedChanges(true);
                        }}
                        className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                          localContent.floatingButtonsOffset === item.id || (!localContent.floatingButtonsOffset && item.id === 'standard')
                            ? 'bg-amber-500 text-stone-950 font-bold border-amber-400'
                            : 'bg-stone-950 text-stone-400 border-stone-800 hover:border-stone-700'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={handleSaveAllSiteChanges}
                disabled={isSaving}
                className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold px-8 py-3 rounded-xl text-sm flex items-center gap-2 shadow-lg transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                Save & Publish Placements
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODE 5: DISHES DATABASE CRUD                             */}
        {/* ======================================================== */}
        {viewMode === 'dishes' && (
          <div 
            data-lenis-prevent="true"
            className="flex-1 overflow-y-auto p-6 max-w-6xl mx-auto w-full space-y-6 overscroll-contain"
          >
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-3 flex-1 max-w-2xl">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search dishes by name, description or tags..."
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="all">All Categories</option>
                  <option value="chicken-burgers">Chicken Burgers</option>
                  <option value="beef-burgers">Beef Burgers</option>
                  <option value="fries">Fries & Sides</option>
                  <option value="drinks">Drinks</option>
                  <option value="desserts">Desserts</option>
                </select>
              </div>

              <button
                onClick={handleOpenAddDish}
                className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                Add New Dish
              </button>
            </div>

            {/* Dishes Grid with Move & Reorder Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDishes.map((dish, idx) => (
                <div
                  key={dish.id}
                  className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden p-4 flex flex-col justify-between hover:border-stone-700 transition-colors relative"
                >
                  <div className="flex gap-3">
                    <img
                      src={dish.image}
                      alt={dish.name}
                      referrerPolicy="no-referrer"
                      className="w-20 h-20 rounded-xl object-cover bg-stone-800 shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=75&fm=webp';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <h3 className="font-bold text-sm text-white truncate">{dish.name}</h3>
                        <span className="text-amber-400 font-bold text-xs shrink-0">{dish.formattedPrice || `₹${dish.price}`}</span>
                      </div>
                      <span className="inline-block bg-stone-800 text-stone-400 text-[10px] px-2 py-0.5 rounded-full mt-1 capitalize">
                        {dish.category}
                      </span>
                      <p className="text-stone-400 text-xs line-clamp-2 mt-1.5 leading-relaxed">
                        {dish.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-stone-800/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1 text-[10px] text-stone-400">
                      <button
                        onClick={() => handleMoveDish(dish.id, 'up')}
                        disabled={idx === 0}
                        title="Move Up in Menu"
                        className="p-1 hover:bg-stone-800 disabled:opacity-20 rounded text-stone-300 hover:text-amber-400"
                      >
                        <MoveUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveDish(dish.id, 'down')}
                        disabled={idx === filteredDishes.length - 1}
                        title="Move Down in Menu"
                        className="p-1 hover:bg-stone-800 disabled:opacity-20 rounded text-stone-300 hover:text-amber-400"
                      >
                        <MoveDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEditDish(dish)}
                        className="p-1.5 hover:bg-stone-800 text-stone-300 hover:text-amber-400 rounded-lg transition-colors cursor-pointer"
                        title="Edit Dish"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmDish(dish)}
                        className="p-1.5 hover:bg-red-500/10 text-stone-400 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                        title="Delete Dish"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODE 6: COPY & SLA STUDIO                                */}
        {/* ======================================================== */}
        {viewMode === 'content' && (
          <div 
            data-lenis-prevent="true"
            className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto w-full space-y-6 overscroll-contain"
          >
            <div>
              <h2 className="text-xl font-serif font-bold text-white flex items-center gap-2">
                <Palette className="w-5 h-5 text-amber-400" />
                Hero Headlines & Brand Copy Studio
              </h2>
              <p className="text-xs text-stone-400 mt-1">
                Live edit marketing messaging, delivery SLA targets, and announcement copy.
              </p>
            </div>

            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-stone-300 block mb-1">Hero Line 1</label>
                  <input
                    type="text"
                    value={localContent.heroHeadline1 || ''}
                    onChange={(e) => {
                      setLocalContent({ ...localContent, heroHeadline1: e.target.value });
                      setHasUnsavedChanges(true);
                    }}
                    placeholder="Gourmet Burgers &"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-stone-300 block mb-1">Hero Line 2</label>
                  <input
                    type="text"
                    value={localContent.heroHeadline2 || ''}
                    onChange={(e) => {
                      setLocalContent({ ...localContent, heroHeadline2: e.target.value });
                      setHasUnsavedChanges(true);
                    }}
                    placeholder="Warm Artisanal Desserts"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-stone-300 block mb-1">Hero Line 3 (Delivery)</label>
                  <input
                    type="text"
                    value={localContent.heroHeadline3 || ''}
                    onChange={(e) => {
                      setLocalContent({ ...localContent, heroHeadline3: e.target.value });
                      setHasUnsavedChanges(true);
                    }}
                    placeholder="Delivered In 20 Mins."
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-300 block mb-1">Hero Subtitle</label>
                <textarea
                  rows={3}
                  value={localContent.heroSubtitle || ''}
                  onChange={(e) => {
                    setLocalContent({ ...localContent, heroSubtitle: e.target.value });
                    setHasUnsavedChanges(true);
                  }}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-stone-300 block mb-1">Delivery SLA Guarantee</label>
                  <input
                    type="text"
                    value={localContent.deliverySLA || ''}
                    onChange={(e) => {
                      setLocalContent({ ...localContent, deliverySLA: e.target.value });
                      setHasUnsavedChanges(true);
                    }}
                    placeholder="20 Mins Express SLA"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-300 block mb-1">Trust Badges / Rating</label>
                  <input
                    type="text"
                    value={localContent.trustBadgeText || ''}
                    onChange={(e) => {
                      setLocalContent({ ...localContent, trustBadgeText: e.target.value });
                      setHasUnsavedChanges(true);
                    }}
                    placeholder="4.9★ Rated Gourmet Kitchen"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={handleSaveAllSiteChanges}
                disabled={isSaving}
                className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold px-8 py-3 rounded-xl text-sm flex items-center gap-2 shadow-lg transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                Publish Copy Updates
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODE 7: WEBSITE & TRAFFIC ANALYTICS                     */}
        {/* ======================================================== */}
        {viewMode === 'analytics' && (
          <AdminAnalytics dishes={localDishes} />
        )}

        {/* ======================================================== */}
        {/* MODE 8: FIREBASE REALTIME SYNC & BACKUP                  */}
        {/* ======================================================== */}
        {viewMode === 'firebase' && (
          <div 
            data-lenis-prevent="true"
            className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto w-full space-y-6 overscroll-contain"
          >
            <div>
              <h2 className="text-xl font-serif font-bold text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-amber-400" />
                Firebase Realtime Database Management
              </h2>
              <p className="text-xs text-stone-400 mt-1">
                Review connection parameters, sync live state, and export/restore content backups.
              </p>
            </div>

            <form onSubmit={handleSaveFirebaseConfig} className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono">
                <CheckCircle2 className="w-4 h-4" />
                <span>Connected Database: {firebaseConfigForm.databaseURL}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-stone-300 block mb-1">Project ID</label>
                  <input
                    type="text"
                    value={firebaseConfigForm.projectId}
                    onChange={(e) => setFirebaseConfigForm({ ...firebaseConfigForm, projectId: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-300 block mb-1">Database URL</label>
                  <input
                    type="text"
                    value={firebaseConfigForm.databaseURL}
                    onChange={(e) => setFirebaseConfigForm({ ...firebaseConfigForm, databaseURL: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold px-6 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  Update Config
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ content: localContent, dishes: localDishes }, null, 2));
                    const downloadAnchor = document.createElement('a');
                    downloadAnchor.setAttribute("href", dataStr);
                    downloadAnchor.setAttribute("download", `unexpected-bites-backup-${Date.now()}.json`);
                    document.body.appendChild(downloadAnchor);
                    downloadAnchor.click();
                    downloadAnchor.remove();
                    showNotification('success', 'Full site JSON backup downloaded!');
                  }}
                  className="bg-stone-800 hover:bg-stone-700 text-white font-semibold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  Export JSON Backup
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* DISH CREATE / EDIT MODAL */}
      <AnimatePresence>
        {isDishModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              data-lenis-prevent="true"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-stone-900 border border-stone-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl overscroll-contain"
            >
              <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                <h2 className="text-lg font-serif font-bold text-white flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-amber-400" />
                  {editingDish ? `Edit Dish: ${editingDish.name}` : 'Add New Culinary Creation'}
                </h2>
                <button
                  onClick={() => setIsDishModalOpen(false)}
                  className="p-1 hover:bg-stone-800 rounded-lg text-stone-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveDish} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-stone-300 block mb-1">Dish Name *</label>
                    <input
                      type="text"
                      required
                      value={dishForm.name}
                      onChange={(e) => setDishForm({ ...dishForm, name: e.target.value })}
                      placeholder="e.g. Monster Crunch Burger"
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-stone-300 block mb-1">Category *</label>
                    <select
                      value={dishForm.category}
                      onChange={(e) => setDishForm({ ...dishForm, category: e.target.value as Category })}
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="chicken-burgers">Chicken Burgers</option>
                      <option value="beef-burgers">Beef Burgers</option>
                      <option value="fries">Fries & Sides</option>
                      <option value="drinks">Drinks</option>
                      <option value="desserts">Desserts</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-stone-300 block mb-1">Price (₹) *</label>
                    <input
                      type="number"
                      required
                      min="10"
                      value={dishForm.price}
                      onChange={(e) => setDishForm({ ...dishForm, price: Number(e.target.value) })}
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-stone-300 block mb-1">Prep SLA</label>
                    <input
                      type="text"
                      value={dishForm.prepTime}
                      onChange={(e) => setDishForm({ ...dishForm, prepTime: e.target.value })}
                      placeholder="15 mins"
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-stone-300 block mb-1">Spicy Level (0-3)</label>
                    <select
                      value={dishForm.spicyLevel}
                      onChange={(e) => setDishForm({ ...dishForm, spicyLevel: Number(e.target.value) as any })}
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value={0}>0 - Mild / Sweet</option>
                      <option value={1}>1 - Gentle Warmth</option>
                      <option value={2}>2 - Medium Flame</option>
                      <option value={3}>3 - Extreme Sizzle</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-300 block mb-1">Image URL</label>
                  <input
                    type="text"
                    value={dishForm.image}
                    onChange={(e) => setDishForm({ ...dishForm, image: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-300 block mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={dishForm.description}
                    onChange={(e) => setDishForm({ ...dishForm, description: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-300 block mb-1">Ingredients (comma separated)</label>
                  <input
                    type="text"
                    value={dishForm.ingredients}
                    onChange={(e) => setDishForm({ ...dishForm, ingredients: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex flex-wrap gap-4 pt-2">
                  <label className="flex items-center gap-2 text-xs text-stone-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={dishForm.isBestseller}
                      onChange={(e) => setDishForm({ ...dishForm, isBestseller: e.target.checked })}
                      className="accent-amber-500"
                    />
                    <span>⭐ Mark Bestseller</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-stone-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={dishForm.isChefSpecial}
                      onChange={(e) => setDishForm({ ...dishForm, isChefSpecial: e.target.checked })}
                      className="accent-amber-500"
                    />
                    <span>🔥 Chef's Signature</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-stone-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={dishForm.isVeg}
                      onChange={(e) => setDishForm({ ...dishForm, isVeg: e.target.checked })}
                      className="accent-emerald-500"
                    />
                    <span>🌱 Pure Vegetarian</span>
                  </label>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-stone-800">
                  <button
                    type="button"
                    onClick={() => setIsDishModalOpen(false)}
                    className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl shadow-lg"
                  >
                    Save Dish to Realtime DB
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AUTO-SNAPPED ADMIN FLOATING HOTBAR */}
      <aside 
        aria-label="Admin Quick Hotbar"
        className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1.5 p-1.5 rounded-2xl bg-stone-900/95 border border-stone-700 shadow-2xl backdrop-blur-md text-stone-200"
      >
        <button
          onClick={() => handleOpenAddDish()}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
          title="Add New Dish to Menu"
        >
          <Plus className="w-4 h-4" />
          <span>Add Dish</span>
        </button>

        <button
          onClick={() => setViewMode('firebase')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
            viewMode === 'firebase'
              ? 'bg-stone-800 text-amber-400 font-bold border border-amber-500/30'
              : 'hover:bg-stone-800/80 text-stone-300 hover:text-white'
          }`}
          title="API Keys & Database Config"
        >
          <Key className="w-3.5 h-3.5 text-amber-400" />
          <span>API Keys</span>
        </button>

        <button
          onClick={() => setViewMode('dishes')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
            viewMode === 'dishes'
              ? 'bg-stone-800 text-amber-400 font-bold border border-amber-500/30'
              : 'hover:bg-stone-800/80 text-stone-300 hover:text-white'
          }`}
          title="Manage Menu Catalog"
        >
          <Utensils className="w-3.5 h-3.5 text-stone-400" />
          <span>Dishes ({localDishes.length})</span>
        </button>

        <button
          onClick={() => setViewMode('content')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
            viewMode === 'content'
              ? 'bg-stone-800 text-amber-400 font-bold border border-amber-500/30'
              : 'hover:bg-stone-800/80 text-stone-300 hover:text-white'
          }`}
          title="Edit Copy, Timings & Details"
        >
          <Palette className="w-3.5 h-3.5 text-stone-400" />
          <span className="hidden sm:inline">Copy & SLA</span>
        </button>

        <button
          onClick={() => setViewMode('analytics')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
            viewMode === 'analytics'
              ? 'bg-stone-800 text-amber-400 font-bold border border-amber-500/30'
              : 'hover:bg-stone-800/80 text-stone-300 hover:text-white'
          }`}
          title="View Traffic & Telemetry"
        >
          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">Analytics</span>
        </button>

        {hasUnsavedChanges && (
          <button
            onClick={handleSaveAllSiteChanges}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 text-xs font-bold transition-all shadow-md animate-pulse cursor-pointer"
            title="Publish all unsaved changes"
          >
            {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>Publish</span>
          </button>
        )}
      </aside>

      {/* DELETE DISH CONFIRMATION MODAL */}
      <AnimatePresence>
        {deleteConfirmDish && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-stone-900 border border-stone-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl"
            >
              <div className="flex items-center gap-3 text-red-400">
                <AlertCircle className="w-6 h-6 shrink-0" />
                <h3 className="font-bold text-base text-white">Delete Dish?</h3>
              </div>
              <p className="text-xs text-stone-400 leading-relaxed">
                Are you sure you want to remove <strong className="text-white font-bold">{deleteConfirmDish.name}</strong> from the database? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setDeleteConfirmDish(null)}
                  className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteDish}
                  className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-lg shadow-lg cursor-pointer"
                >
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
