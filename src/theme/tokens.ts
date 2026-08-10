import { BrandConfig } from '../types';

export const BRAND_CONFIG: BrandConfig = {
  name: "Unexpected Bites",
  tagline: "Gourmet Chicken & Beef Burgers, Crispy Fries & Artisanal Desserts",
  phone: "+91 77806 58474",
  whatsappNumber: "917780658474",
  whatsappFormatted: "+91 77806 58474",
  email: "smohiuddin441@gmail.com",
  deliveryArea: "Central City & Express Delivery Zone",
  avgPrepTime: "15-20 Mins",
  heroVideoUrl: "/videos/grand-wok-hero.mp4",
  specialOfferText: "⚡ COMPLIMENTARY CINNAMON ROLL ON ORDERS OVER ₹599 | CODE: BITES20",
  emailjsServiceId: "service_unexpectedbites",
  emailjsTemplateId: "template_unexpectedbites",
  emailjsPublicKey: "public_unexpectedbites_key",
};

export const MENU_CATEGORIES = [
  { id: "all", label: "All Selections" },
  { id: "chicken-burgers", label: "Chicken Burgers" },
  { id: "beef-burgers", label: "Beef Burgers" },
  { id: "fries", label: "Fries" },
  { id: "drinks", label: "Cold Drinks" },
  { id: "desserts", label: "Desserts" },
];

export const COLOR_TOKENS = {
  background: "#F7F2E8", // Cream Beige
  surface: "#FFFFFF", // White Surface
  surfaceElevated: "#EDE3D2", // Warm Beige Surface
  border: "rgba(139, 90, 43, 0.28)", // Warm Amber-Brown Border
  accentGold: "#A87747", // Golden Chestnut
  accentCrimson: "#8B5A2B", // Rich Brown
  accentEmerald: "#5D3918", // Deep Chocolate
  accentBun: "#CFA376", // Warm Accent
  textPrimary: "#281B12", // Dark Espresso Text
  textSecondary: "#523B2A", // Medium Warm Brown Text
  textMuted: "#7F6652", // Soft Taupe Text
};

export const MARQUEE_PARTNERS = [
  "🍔 GOURMET HAND-CRAFTED BURGERS",
  "⭐ 4.9★ RATED BY 3,000+ BURGER LOVERS",
  "🍟 GOLDEN CRISPY HAND-CUT FRIES",
  "🧁 ARTISANAL CINNAMON ROLLS & DESSERTS",
  "🌿 100% FRESH PREMIUM INGREDIENTS",
  "📦 HYGIENIC THERMAL TAMPER-PROOF PACKAGING",
  "⚡ EXPRESS DISPATCH (12 PM – 12 AM)",
  "💯 100% UNEXPECTED DELICIOUSNESS GUARANTEED",
];

export const SERVICE_PIN_CODES = [
  { pin: "110001", area: "Connaught Place / Central", estimatedMin: 18, status: "Available" },
  { pin: "110003", area: "Khan Market / Golf Links", estimatedMin: 20, status: "Available" },
  { pin: "110016", area: "Hauz Khas / Green Park", estimatedMin: 22, status: "Available" },
  { pin: "110024", area: "Lajpat Nagar / Defence Colony", estimatedMin: 19, status: "Available" },
  { pin: "110048", area: "Greater Kailash / CR Park", estimatedMin: 25, status: "Available" },
  { pin: "110070", area: "Vasant Kunj / Aerocity", estimatedMin: 28, status: "Available" },
];
