import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock, Key, LogOut, Plus, Edit2, Trash2, Save, CheckCircle2, 
  AlertCircle, LayoutDashboard, Utensils, Settings, RefreshCw, 
  Search, ExternalLink, Database, ShieldAlert, Sparkles, X, ChevronRight, Eye
} from 'lucide-react';
import { Dish, Category } from '../types';
import { 
  SiteContent, saveDishToFirebase, deleteDishFromFirebase, 
  updateSiteContentInFirebase, getFirebaseConfig 
} from '../lib/firebase';

interface AdminPanelProps {
  dishes: Dish[];
  siteContent: SiteContent;
  onCloseAdmin: () => void;
}

export default function AdminPanel({ dishes, siteContent, onCloseAdmin }: AdminPanelProps) {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('admin_auth') === 'true';
  });
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Active Tab State
  const [activeTab, setActiveTab] = useState<'dishes' | 'content' | 'firebase'>('dishes');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Modal / Form States
  const [isDishModalOpen, setIsDishModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [deleteConfirmDish, setDeleteConfirmDish] = useState<Dish | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

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

  // Site Content Inputs
  const [contentForm, setContentForm] = useState<SiteContent>({
    heroHeadline1: siteContent.heroHeadline1 || "Gourmet Burgers &",
    heroHeadline2: siteContent.heroHeadline2 || "Warm Artisanal Desserts",
    heroHeadline3: siteContent.heroHeadline3 || "Delivered In 20 Mins.",
    heroSubtitle: siteContent.heroSubtitle || "Experience hand-crafted chicken and beef burgers, golden crispy fries, cold drinks, and warm cinnamon rolls and desserts prepared fresh and delivered in thermal sealed packaging.",
    buttonStyle: siteContent.buttonStyle || "pill",
    specialOfferText: siteContent.specialOfferText || "⚡ COMPLIMENTARY CINNAMON ROLL ON ORDERS OVER ₹599 | CODE: BITES20",
    whatsappPosition: siteContent.whatsappPosition || "top-right",
    cartPosition: siteContent.cartPosition || "top-right",
    mascotPosition: siteContent.mascotPosition || "bottom-right",
  });

  // Firebase Config Inputs
  const [firebaseConfigForm, setFirebaseConfigForm] = useState(() => getFirebaseConfig());

  useEffect(() => {
    setContentForm({
      heroHeadline1: siteContent.heroHeadline1 || "Gourmet Burgers &",
      heroHeadline2: siteContent.heroHeadline2 || "Warm Artisanal Desserts",
      heroHeadline3: siteContent.heroHeadline3 || "Delivered In 20 Mins.",
      heroSubtitle: siteContent.heroSubtitle || "Experience hand-crafted chicken and beef burgers, golden crispy fries, cold drinks, and warm cinnamon rolls and desserts prepared fresh and delivered in thermal sealed packaging.",
      buttonStyle: siteContent.buttonStyle || "pill",
      specialOfferText: siteContent.specialOfferText || "⚡ COMPLIMENTARY CINNAMON ROLL ON ORDERS OVER ₹599 | CODE: BITES20",
      whatsappPosition: siteContent.whatsappPosition || "top-right",
      cartPosition: siteContent.cartPosition || "top-right",
      mascotPosition: siteContent.mascotPosition || "bottom-right",
    });
  }, [siteContent]);

  const showNotification = (type: 'success' | 'error', message: string) => {
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

  // Handle Dish Modal Open
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
      ingredients: 'Fresh Buns, Secret Sauce, Melted Cheese',
      prepTime: '15 mins',
      calories: '550 kcal',
      rating: 4.8,
      reviewsCount: '10 Reviews',
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

  // Save Dish to Firebase Realtime Database
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
      showNotification('success', editingDish ? 'Dish updated successfully in Realtime Database!' : 'New dish added to Realtime Database!');
      setIsDishModalOpen(false);
    } else {
      showNotification('error', 'Failed to save dish to Firebase Realtime Database.');
    }
  };

  // Delete Dish
  const handleDeleteDish = async () => {
    if (!deleteConfirmDish) return;
    const success = await deleteDishFromFirebase(deleteConfirmDish.id);
    if (success) {
      showNotification('success', `Removed "${deleteConfirmDish.name}" from Realtime Database.`);
      setDeleteConfirmDish(null);
    } else {
      showNotification('error', 'Failed to delete dish from Firebase.');
    }
  };

  // Save Site Content Changes
  const handleSaveContent = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await updateSiteContentInFirebase(contentForm);
    if (success) {
      showNotification('success', 'Site content & button presets updated in Realtime Database!');
    } else {
      showNotification('error', 'Failed to update site content in Firebase.');
    }
  };

  // Save Firebase Config
  const handleSaveFirebaseConfig = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem('unexpected_bites_firebase_config', JSON.stringify(firebaseConfigForm));
      showNotification('success', 'Firebase configuration updated! Refreshing page to re-initialize...');
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    } catch (e) {
      showNotification('error', 'Failed to save config to local storage.');
    }
  };

  // Filtered dishes
  const filteredDishes = dishes.filter((dish) => {
    const matchesSearch = dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dish.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || dish.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // If NOT authenticated, render Login Page
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-stone-950 text-stone-100 flex items-center justify-center p-4 font-sans relative overflow-hidden">
        {/* Background glow effects */}
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
            <p className="text-stone-400 text-sm mt-1">Admin Portal Control Panel</p>
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
              <label className="block text-xs font-medium text-stone-300 mb-1.5">
                Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="adminbites"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-stone-600 focus:outline-none focus:border-amber-500 transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-stone-600 focus:outline-none focus:border-amber-500 transition-colors"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold py-3 px-4 rounded-xl shadow-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm cursor-pointer"
            >
              <Key className="w-4 h-4" />
              Authenticate & Access Panel
            </button>
          </form>

          {/* Security & Database Status Notice */}
          <div className="mt-8 pt-6 border-t border-stone-800/80 text-xs text-stone-500 space-y-2">
            <div className="flex items-center gap-1.5 text-amber-400/90 font-medium">
              <Database className="w-3.5 h-3.5" />
              <span>Firebase Realtime Database: Connected</span>
            </div>
            <p className="text-[11px] leading-relaxed text-stone-500">
              Database URL: <code className="text-stone-400">https://unexpected-bites-default-rtdb.firebaseio.com</code>
            </p>
            <div className="p-2.5 rounded-lg bg-stone-950/60 border border-stone-800 text-[10px] text-stone-400 leading-snug">
              <span className="text-amber-400 font-bold">Security Note:</span> Client-side password check enabled for administration. For enterprise multi-user RBAC, Firebase Auth rule isolation can be enabled in production settings.
            </div>
          </div>

          <div className="mt-4 text-center">
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

  // Admin Dashboard View
  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-sans flex flex-col">
      {/* Top Banner & Header */}
      <header className="bg-stone-900 border-b border-stone-800 px-4 lg:px-8 py-4 sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif font-bold text-lg text-white">Unexpected Bites Admin</h1>
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Sync Active
              </span>
            </div>
            <p className="text-xs text-stone-400">Realtime Database: <code className="text-amber-400/90 font-mono">unexpected-bites-default-rtdb.firebaseio.com</code></p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onCloseAdmin}
            className="px-3 py-1.5 text-xs text-stone-300 hover:text-white bg-stone-800 hover:bg-stone-700 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            View Live Site
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
            className={`fixed top-20 right-6 z-50 px-4 py-3 rounded-xl border shadow-xl flex items-center gap-2.5 text-xs font-medium ${
              notification.type === 'success'
                ? 'bg-emerald-950 border-emerald-500/40 text-emerald-200'
                : 'bg-red-950 border-red-500/40 text-red-200'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span>{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex border-b border-stone-800 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('dishes')}
            className={`px-4 py-3 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'dishes'
                ? 'border-amber-400 text-amber-400 bg-stone-900/50'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Utensils className="w-4 h-4" />
            Dish Management ({dishes.length})
          </button>

          <button
            onClick={() => setActiveTab('content')}
            className={`px-4 py-3 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'content'
                ? 'border-amber-400 text-amber-400 bg-stone-900/50'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Hero Content & Button Presets
          </button>

          <button
            onClick={() => setActiveTab('firebase')}
            className={`px-4 py-3 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'firebase'
                ? 'border-amber-400 text-amber-400 bg-stone-900/50'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Database className="w-4 h-4" />
            Firebase Connection Settings
          </button>
        </div>

        {/* TAB 1: DISH MANAGEMENT */}
        {activeTab === 'dishes' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-3 flex-1 max-w-2xl">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search dishes by name or description..."
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

            {/* Dishes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDishes.map((dish) => (
                <div
                  key={dish.id}
                  className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden p-4 flex flex-col justify-between hover:border-stone-700 transition-colors"
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
                    <div className="flex items-center gap-1.5 text-[10px] text-stone-400">
                      {dish.isBestseller && (
                        <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded">
                          Bestseller
                        </span>
                      )}
                      {dish.isVeg ? (
                        <span className="text-emerald-400">Veg</span>
                      ) : (
                        <span className="text-red-400">Non-Veg</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEditDish(dish)}
                        className="px-2.5 py-1 text-stone-300 hover:text-white bg-stone-800 hover:bg-stone-700 rounded-lg flex items-center gap-1 text-xs transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3 h-3" />
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteConfirmDish(dish)}
                        className="px-2.5 py-1 text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 rounded-lg flex items-center gap-1 text-xs transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: SITE CONTENT & BUTTON PRESETS */}
        {activeTab === 'content' && (
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 max-w-3xl space-y-6">
            <div>
              <h2 className="text-lg font-serif font-bold text-white">Edit Hero Copy & Layout Styles</h2>
              <p className="text-xs text-stone-400 mt-0.5">
                Changes saved here update the live hero text and button corner presets across all website visitors.
              </p>
            </div>

            <form onSubmit={handleSaveContent} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1">
                  Hero Headline - Line 1
                </label>
                <input
                  type="text"
                  value={contentForm.heroHeadline1 || ''}
                  onChange={(e) => setContentForm({ ...contentForm, heroHeadline1: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1">
                  Hero Headline - Line 2 (Highlighted Gradient)
                </label>
                <input
                  type="text"
                  value={contentForm.heroHeadline2 || ''}
                  onChange={(e) => setContentForm({ ...contentForm, heroHeadline2: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1">
                  Hero Headline - Line 3
                </label>
                <input
                  type="text"
                  value={contentForm.heroHeadline3 || ''}
                  onChange={(e) => setContentForm({ ...contentForm, heroHeadline3: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1">
                  Hero Subtitle Paragraph
                </label>
                <textarea
                  rows={3}
                  value={contentForm.heroSubtitle || ''}
                  onChange={(e) => setContentForm({ ...contentForm, heroSubtitle: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1">
                  Button Corner Shape Preset
                </label>
                <select
                  value={contentForm.buttonStyle || 'pill'}
                  onChange={(e) => setContentForm({ ...contentForm, buttonStyle: e.target.value as any })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="pill">Pill (Rounded Full)</option>
                  <option value="rounded">Rounded 2XL (Soft Corners)</option>
                  <option value="sharp">Sharp / Minimal (Rounded Large)</option>
                </select>
                <p className="text-[11px] text-stone-500 mt-1">
                  Adjusts button geometry globally on the live site.
                </p>
              </div>

              {/* Floating Action Buttons Layout Section */}
              <div className="pt-4 border-t border-stone-800 space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
                    Layout & Floating Buttons Position
                  </h4>
                  <p className="text-[11px] text-stone-400">
                    Control which corner each action button appears in. Buttons sharing a corner will stack vertically without overlapping.
                  </p>
                </div>

                {/* WhatsApp Button Position */}
                <div className="bg-stone-950 p-3.5 rounded-xl border border-stone-800 space-y-2">
                  <span className="text-xs font-medium text-stone-200 block">
                    WhatsApp Concierge Button
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {(['top-left', 'top-right', 'bottom-left', 'bottom-right'] as const).map((pos) => (
                      <button
                        key={pos}
                        type="button"
                        onClick={() => setContentForm({ ...contentForm, whatsappPosition: pos })}
                        className={`px-3 py-1.5 rounded-lg border text-center capitalize transition-all cursor-pointer ${
                          (contentForm.whatsappPosition || 'top-right') === pos
                            ? 'bg-amber-500 text-stone-950 font-bold border-amber-400'
                            : 'bg-stone-900 text-stone-400 border-stone-800 hover:border-stone-700'
                        }`}
                      >
                        {pos.replace('-', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cart Button Position */}
                <div className="bg-stone-950 p-3.5 rounded-xl border border-stone-800 space-y-2">
                  <span className="text-xs font-medium text-stone-200 block">
                    Gourmet Cart Button
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {(['top-left', 'top-right', 'bottom-left', 'bottom-right'] as const).map((pos) => (
                      <button
                        key={pos}
                        type="button"
                        onClick={() => setContentForm({ ...contentForm, cartPosition: pos })}
                        className={`px-3 py-1.5 rounded-lg border text-center capitalize transition-all cursor-pointer ${
                          (contentForm.cartPosition || 'top-right') === pos
                            ? 'bg-amber-500 text-stone-950 font-bold border-amber-400'
                            : 'bg-stone-900 text-stone-400 border-stone-800 hover:border-stone-700'
                        }`}
                      >
                        {pos.replace('-', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mascot Chat Assistant Position */}
                <div className="bg-stone-950 p-3.5 rounded-xl border border-stone-800 space-y-2">
                  <span className="text-xs font-medium text-stone-200 block">
                    AI Mascot Chat Assistant
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {(['top-left', 'top-right', 'bottom-left', 'bottom-right'] as const).map((pos) => (
                      <button
                        key={pos}
                        type="button"
                        onClick={() => setContentForm({ ...contentForm, mascotPosition: pos })}
                        className={`px-3 py-1.5 rounded-lg border text-center capitalize transition-all cursor-pointer ${
                          (contentForm.mascotPosition || 'bottom-right') === pos
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

              <div className="pt-2">
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  Save Content Changes to Realtime Database
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 3: FIREBASE SETTINGS */}
        {activeTab === 'firebase' && (
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 max-w-3xl space-y-6">
            <div>
              <h2 className="text-lg font-serif font-bold text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-amber-400" />
                Firebase Realtime Database Settings
              </h2>
              <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                Database Endpoint: <code className="text-amber-400 font-mono">https://unexpected-bites-default-rtdb.firebaseio.com</code>
              </p>
            </div>

            <form onSubmit={handleSaveFirebaseConfig} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1">
                  Firebase Database URL
                </label>
                <input
                  type="text"
                  value={firebaseConfigForm.databaseURL || ''}
                  onChange={(e) => setFirebaseConfigForm({ ...firebaseConfigForm, databaseURL: e.target.value })}
                  placeholder="https://unexpected-bites-default-rtdb.firebaseio.com"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1">
                  Firebase API Key (apiKey)
                </label>
                <input
                  type="text"
                  value={firebaseConfigForm.apiKey || ''}
                  onChange={(e) => setFirebaseConfigForm({ ...firebaseConfigForm, apiKey: e.target.value })}
                  placeholder="AIzaSy..."
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1">
                  App ID (appId)
                </label>
                <input
                  type="text"
                  value={firebaseConfigForm.appId || ''}
                  onChange={(e) => setFirebaseConfigForm({ ...firebaseConfigForm, appId: e.target.value })}
                  placeholder="1:1234567890:web:abcdef..."
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">
                    Project ID
                  </label>
                  <input
                    type="text"
                    value={firebaseConfigForm.projectId || ''}
                    onChange={(e) => setFirebaseConfigForm({ ...firebaseConfigForm, projectId: e.target.value })}
                    placeholder="unexpected-bites"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">
                    Auth Domain
                  </label>
                  <input
                    type="text"
                    value={firebaseConfigForm.authDomain || ''}
                    onChange={(e) => setFirebaseConfigForm({ ...firebaseConfigForm, authDomain: e.target.value })}
                    placeholder="unexpected-bites.firebaseapp.com"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  Save & Connect Realtime Database Credentials
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* DISH ADD/EDIT MODAL */}
      <AnimatePresence>
        {isDishModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative my-8"
            >
              <button
                onClick={() => setIsDishModalOpen(false)}
                className="absolute top-4 right-4 text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-lg font-serif font-bold text-white mb-4">
                {editingDish ? 'Edit Dish in Realtime Database' : 'Add New Dish to Realtime Database'}
              </h2>

              <form onSubmit={handleSaveDish} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1">Dish Name *</label>
                    <input
                      type="text"
                      value={dishForm.name}
                      onChange={(e) => setDishForm({ ...dishForm, name: e.target.value })}
                      required
                      placeholder="e.g. Double Cheesy Angus Burger"
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1">Category *</label>
                    <select
                      value={dishForm.category}
                      onChange={(e) => setDishForm({ ...dishForm, category: e.target.value as Category })}
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
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
                    <label className="block text-xs font-medium text-stone-300 mb-1">Price (₹) *</label>
                    <input
                      type="number"
                      value={dishForm.price}
                      onChange={(e) => setDishForm({ ...dishForm, price: Number(e.target.value) })}
                      required
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1">Prep Time</label>
                    <input
                      type="text"
                      value={dishForm.prepTime}
                      onChange={(e) => setDishForm({ ...dishForm, prepTime: e.target.value })}
                      placeholder="15 mins"
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1">Calories</label>
                    <input
                      type="text"
                      value={dishForm.calories}
                      onChange={(e) => setDishForm({ ...dishForm, calories: e.target.value })}
                      placeholder="550 kcal"
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">Description *</label>
                  <textarea
                    rows={2}
                    value={dishForm.description}
                    onChange={(e) => setDishForm({ ...dishForm, description: e.target.value })}
                    required
                    placeholder="Crispy patty with house secret sauce and fresh lettuce."
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">Image URL</label>
                  <input
                    type="text"
                    value={dishForm.image}
                    onChange={(e) => setDishForm({ ...dishForm, image: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">Ingredients (comma separated)</label>
                  <input
                    type="text"
                    value={dishForm.ingredients}
                    onChange={(e) => setDishForm({ ...dishForm, ingredients: e.target.value })}
                    placeholder="Patty, Lettuce, Melted Cheddar, House Sauce"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 text-xs text-stone-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={dishForm.isVeg}
                      onChange={(e) => setDishForm({ ...dishForm, isVeg: e.target.checked })}
                      className="rounded accent-amber-500"
                    />
                    Vegetarian
                  </label>

                  <label className="flex items-center gap-2 text-xs text-stone-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={dishForm.isBestseller}
                      onChange={(e) => setDishForm({ ...dishForm, isBestseller: e.target.checked })}
                      className="rounded accent-amber-500"
                    />
                    Bestseller Badge
                  </label>

                  <label className="flex items-center gap-2 text-xs text-stone-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={dishForm.isChefSpecial}
                      onChange={(e) => setDishForm({ ...dishForm, isChefSpecial: e.target.checked })}
                      className="rounded accent-amber-500"
                    />
                    Chef Special Badge
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-800">
                  <button
                    type="button"
                    onClick={() => setIsDishModalOpen(false)}
                    className="px-4 py-2 text-xs text-stone-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold px-5 py-2 rounded-xl text-xs flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save Dish
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CONFIRM DELETE DIALOG */}
      <AnimatePresence>
        {deleteConfirmDish && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative"
            >
              <h3 className="text-base font-bold text-white mb-2">Remove Dish Confirmation</h3>
              <p className="text-xs text-stone-400 leading-relaxed mb-6">
                Are you sure you want to remove <strong className="text-white">{deleteConfirmDish.name}</strong>? This will delete the dish from Firebase Realtime Database for all site visitors.
              </p>

              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setDeleteConfirmDish(null)}
                  className="px-4 py-2 text-xs text-stone-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteDish}
                  className="bg-red-500 hover:bg-red-400 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Confirm Remove
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
