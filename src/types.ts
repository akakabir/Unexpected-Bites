export type PageTab = 'home' | 'menu' | 'status' | 'analytics' | '404';

export interface VideoReel {
  id: string;
  title: string;
  subtitle: string;
  videoUrl: string;
  poster: string;
  duration: string;
  tag: string;
}

export type Category = 'all' | 'chicken-burgers' | 'beef-burgers' | 'fries' | 'drinks' | 'desserts';

export interface Dish {
  id: string;
  name: string;
  category: Category;
  price: number;
  currency: string;
  formattedPrice: string;
  description: string;
  ingredients: string[];
  prepTime: string;
  calories: string;
  rating: number;
  reviewsCount: string;
  spicyLevel: 0 | 1 | 2 | 3;
  isVeg: boolean;
  isChefSpecial?: boolean;
  isBestseller?: boolean;
  image: string;
  tags: string[];
}

export interface CartItem {
  dish: Dish;
  quantity: number;
  customNotes?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  rating: number;
  comment: string;
  dishOrdered: string;
  date: string;
  avatar: string;
  isVerifiedFirstReviewer?: boolean;
}

export interface UserSubmittedReview {
  id: string;
  name: string;
  location: string;
  rating: number;
  comment: string;
  dishOrdered: string;
  submittedAt: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface OrderFormData {
  fullName: string;
  phone: string;
  email: string;
  deliveryAddress: string;
  pinCode: string;
  preferredTime: string;
  specialInstructions: string;
}

export interface BrandConfig {
  name: string;
  tagline: string;
  phone: string;
  whatsappNumber: string;
  whatsappFormatted: string;
  email: string;
  deliveryArea: string;
  avgPrepTime: string;
  heroVideoUrl: string;
  specialOfferText: string;
  emailjsServiceId: string;
  emailjsTemplateId: string;
  emailjsPublicKey: string;
}

