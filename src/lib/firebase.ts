import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, push, remove, update, Database } from 'firebase/database';
import { Dish } from '../types';
import { MENU_DISHES } from '../data/kitchenData';

export type FloatingButtonCorner = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';

export interface SiteContent {
  heroHeadline1?: string;
  heroHeadline2?: string;
  heroHeadline3?: string;
  heroSubtitle?: string;
  buttonStyle?: 'pill' | 'rounded' | 'sharp';
  specialOfferText?: string;
  whatsappPosition?: FloatingButtonCorner;
  cartPosition?: FloatingButtonCorner;
  mascotPosition?: FloatingButtonCorner;
}

const DEFAULT_SITE_CONTENT: SiteContent = {
  heroHeadline1: "Gourmet Burgers &",
  heroHeadline2: "Warm Artisanal Desserts",
  heroHeadline3: "Delivered In 20 Mins.",
  heroSubtitle: "Experience hand-crafted chicken and beef burgers, golden crispy fries, cold drinks, and warm cinnamon rolls and desserts prepared fresh and delivered in thermal sealed packaging.",
  buttonStyle: "pill",
  specialOfferText: "⚡ COMPLIMENTARY CINNAMON ROLL ON ORDERS OVER ₹599 | CODE: BITES20",
  whatsappPosition: "top-right",
  cartPosition: "top-right",
  mascotPosition: "bottom-right",
};

// Helper to get saved config from localStorage or env
export function getFirebaseConfig() {
  try {
    const custom = localStorage.getItem('unexpected_bites_firebase_config');
    if (custom) {
      const parsed = JSON.parse(custom);
      if (parsed.apiKey || parsed.databaseURL) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to parse custom firebase config:', e);
  }

  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "unexpected-bites.firebaseapp.com",
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://unexpected-bites-default-rtdb.firebaseio.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "unexpected-bites",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "unexpected-bites.appspot.com",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
  };
}

let app: FirebaseApp | null = null;
let db: Database | null = null;

export function getFirebaseDatabase(): Database | null {
  if (db) return db;
  try {
    const config = getFirebaseConfig();
    if (!getApps().length) {
      app = initializeApp(config);
    } else {
      app = getApp();
    }
    db = getDatabase(app);
    return db;
  } catch (err) {
    console.error("Firebase database initialization failed:", err);
    return null;
  }
}

// Subscribe to Dishes in Realtime Database
export function subscribeToDishes(onData: (dishes: Dish[]) => void): () => void {
  const database = getFirebaseDatabase();
  if (!database) {
    onData(MENU_DISHES);
    return () => {};
  }

  const dishesRef = ref(database, 'dishes');
  const unsubscribe = onValue(dishesRef, (snapshot) => {
    if (snapshot.exists()) {
      const val = snapshot.val();
      const loadedDishes: Dish[] = [];
      
      if (Array.isArray(val)) {
        val.forEach((item, index) => {
          if (item) loadedDishes.push({ ...item, id: item.id || `dish-${index}` });
        });
      } else if (typeof val === 'object' && val !== null) {
        Object.keys(val).forEach((key) => {
          if (val[key]) {
            loadedDishes.push({ ...val[key], id: val[key].id || key });
          }
        });
      }

      if (loadedDishes.length > 0) {
        onData(loadedDishes);
      } else {
        // Seed default dishes if empty
        seedDefaultDishes();
        onData(MENU_DISHES);
      }
    } else {
      // Seed default dishes if snapshot does not exist
      seedDefaultDishes();
      onData(MENU_DISHES);
    }
  }, (error) => {
    console.warn("Firebase onValue error (falling back to local dishes):", error);
    onData(MENU_DISHES);
  });

  return () => unsubscribe();
}

// Seed default dishes to Firebase
export async function seedDefaultDishes() {
  const database = getFirebaseDatabase();
  if (!database) return;
  try {
    const dishesRef = ref(database, 'dishes');
    const dishesObj: Record<string, Dish> = {};
    MENU_DISHES.forEach((dish) => {
      dishesObj[dish.id] = dish;
    });
    await set(dishesRef, dishesObj);
    
    // Seed default site content as well
    const siteContentRef = ref(database, 'siteContent/main');
    await set(siteContentRef, DEFAULT_SITE_CONTENT);
  } catch (e) {
    console.warn("Could not seed default dishes to Firebase:", e);
  }
}

// Add a new dish
export async function saveDishToFirebase(dish: Dish): Promise<boolean> {
  const database = getFirebaseDatabase();
  if (!database) return false;
  try {
    const dishRef = ref(database, `dishes/${dish.id}`);
    await set(dishRef, dish);
    return true;
  } catch (err) {
    console.error("Failed to save dish to Firebase:", err);
    return false;
  }
}

// Delete a dish
export async function deleteDishFromFirebase(dishId: string): Promise<boolean> {
  const database = getFirebaseDatabase();
  if (!database) return false;
  try {
    const dishRef = ref(database, `dishes/${dishId}`);
    await remove(dishRef);
    return true;
  } catch (err) {
    console.error("Failed to delete dish from Firebase:", err);
    return false;
  }
}

// Subscribe to Site Content in Realtime Database
export function subscribeToSiteContent(onData: (content: SiteContent) => void): () => void {
  const database = getFirebaseDatabase();
  if (!database) {
    onData(DEFAULT_SITE_CONTENT);
    return () => {};
  }

  const contentRef = ref(database, 'siteContent/main');
  const unsubscribe = onValue(contentRef, (snapshot) => {
    if (snapshot.exists()) {
      onData({ ...DEFAULT_SITE_CONTENT, ...snapshot.val() });
    } else {
      onData(DEFAULT_SITE_CONTENT);
    }
  }, (err) => {
    console.warn("Firebase siteContent error:", err);
    onData(DEFAULT_SITE_CONTENT);
  });

  return () => unsubscribe();
}

// Update Site Content
export async function updateSiteContentInFirebase(content: SiteContent): Promise<boolean> {
  const database = getFirebaseDatabase();
  if (!database) return false;
  try {
    const contentRef = ref(database, 'siteContent/main');
    await update(contentRef, content);
    return true;
  } catch (err) {
    console.error("Failed to update site content in Firebase:", err);
    return false;
  }
}
