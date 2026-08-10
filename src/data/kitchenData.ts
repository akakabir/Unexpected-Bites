import { Dish, Testimonial, FAQItem, VideoReel } from '../types';

export const VIDEO_REELS: VideoReel[] = [
  {
    id: "v-1",
    title: "Searing Hot Smash Burger Sizzle",
    subtitle: "Double Angus beef patties smashed thin with crispy lacy edges & melted cheddar",
    videoUrl: "/videos/grand-wok-hero.mp4",
    poster: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=800&q=75&fm=webp",
    duration: "0:28",
    tag: "Smash Burger Sizzle"
  },
  {
    id: "v-2",
    title: "Buttermilk Crispy Chicken Dip & Fry",
    subtitle: "Golden spiced chicken thighs fried to perfection and drizzled with house sauce",
    videoUrl: "/videos/grand-wok-hero.mp4",
    poster: "https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&w=800&q=75&fm=webp",
    duration: "0:35",
    tag: "Crispy Crunch"
  },
  {
    id: "v-3",
    title: "Warm Cinnamon Roll Glaze Drizzle",
    subtitle: "Freshly baked cinnamon rolls smothered in warm cream cheese glaze",
    videoUrl: "/videos/grand-wok-hero.mp4",
    poster: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=75&fm=webp",
    duration: "0:42",
    tag: "Gooey Desserts"
  },
  {
    id: "v-4",
    title: "Thermal Sealed Express Delivery",
    subtitle: "Double tamper-evident seal locking in core heat for 12 PM - 12 AM dispatch",
    videoUrl: "/videos/grand-wok-hero.mp4",
    poster: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=75&fm=webp",
    duration: "0:20",
    tag: "Express Dispatch"
  }
];

export const MENU_DISHES: Dish[] = [
  // CHICKEN BURGERS
  {
    id: "dish-cb1",
    name: "Unexpected Crispy Chicken Burger",
    category: "chicken-burgers",
    price: 340,
    currency: "₹",
    formattedPrice: "₹340",
    description: "Crispy buttermilk fried chicken thigh, house secret bite sauce, dill pickles, and fresh butter lettuce on a toasted brioche bun.",
    ingredients: ["Buttermilk Fried Chicken", "Secret Bite Sauce", "Dill Pickles", "Brioche Bun", "Lettuce"],
    prepTime: "12 mins",
    calories: "580 kcal",
    rating: 4.9,
    reviewsCount: "245 Reviews",
    spicyLevel: 1,
    isVeg: false,
    isChefSpecial: true,
    isBestseller: true,
    image: "https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&w=800&q=75&fm=webp",
    tags: ["Signature", "Ultra Crispy", "Best Seller"]
  },
  {
    id: "dish-cb2",
    name: "Smoky BBQ Chicken Burger",
    category: "chicken-burgers",
    price: 380,
    currency: "₹",
    formattedPrice: "₹380",
    description: "Flame-grilled juicy chicken breast smothered in hickory smoked BBQ sauce, melted cheddar cheese, caramelized onions, and crisp lettuce.",
    ingredients: ["Grilled Chicken Breast", "Hickory BBQ Sauce", "Melted Cheddar", "Caramelized Onions", "Butter Lettuce"],
    prepTime: "15 mins",
    calories: "590 kcal",
    rating: 4.8,
    reviewsCount: "189 Reviews",
    spicyLevel: 1,
    isVeg: false,
    image: "https://images.unsplash.com/photo-1615297928064-24977384d0da?auto=format&fit=crop&w=800&q=75&fm=webp",
    tags: ["Smoky BBQ", "Flame Grilled"]
  },
  {
    id: "dish-cb3",
    name: "Spicy Jalapeño Crunch Chicken Burger",
    category: "chicken-burgers",
    price: 360,
    currency: "₹",
    formattedPrice: "₹360",
    description: "Spiced buttermilk chicken patty, pickled jalapeños, fiery chipotle aioli, pepper jack cheese, and crunchy cabbage slaw.",
    ingredients: ["Spiced Crispy Chicken", "Pickled Jalapeños", "Chipotle Aioli", "Pepper Jack", "Cabbage Slaw"],
    prepTime: "14 mins",
    calories: "590 kcal",
    rating: 4.9,
    reviewsCount: "172 Reviews",
    spicyLevel: 3,
    isVeg: false,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=75&fm=webp",
    tags: ["Fiery Heat", "Spicy Crunch"]
  },

  // BEEF BURGERS
  {
    id: "dish-bb1",
    name: "Unexpected Signature Smash Burger",
    category: "beef-burgers",
    price: 420,
    currency: "₹",
    formattedPrice: "₹420",
    description: "Double smashed 100% Angus beef patties with lacy crispy edges, double melted American cheese, diced sweet onions, and house relish on buttered brioche.",
    ingredients: ["100% Angus Beef", "American Cheese", "Diced Sweet Onions", "House Relish", "Brioche Bun"],
    prepTime: "12 mins",
    calories: "710 kcal",
    rating: 5.0,
    reviewsCount: "410 Reviews",
    spicyLevel: 1,
    isVeg: false,
    isChefSpecial: true,
    isBestseller: true,
    image: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=800&q=75&fm=webp",
    tags: ["Chef Signature", "Double Smash", "Bestseller"]
  },
  {
    id: "dish-bb2",
    name: "Smoky BBQ Beef Burger",
    category: "beef-burgers",
    price: 440,
    currency: "₹",
    formattedPrice: "₹440",
    description: "Flame-grilled juicy 100% Angus beef patty smothered in hickory smoked BBQ sauce, melted cheddar, caramelized onions, and house dill pickles.",
    ingredients: ["100% Angus Beef Patty", "Hickory BBQ Sauce", "Melted Cheddar", "Caramelized Onions", "Dill Pickles"],
    prepTime: "14 mins",
    calories: "690 kcal",
    rating: 4.9,
    reviewsCount: "265 Reviews",
    spicyLevel: 1,
    isVeg: false,
    isBestseller: true,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=75&fm=webp",
    tags: ["Smoky BBQ", "Angus Beef", "Bestseller"]
  },
  {
    id: "dish-bb3",
    name: "Truffle Mushroom Swiss Beef Burger",
    category: "beef-burgers",
    price: 460,
    currency: "₹",
    formattedPrice: "₹460",
    description: "Thick Angus beef patty topped with sautéed wild mushrooms, rich white truffle aioli, melted Swiss cheese, and baby arugula.",
    ingredients: ["Angus Beef Patty", "Wild Mushrooms", "White Truffle Aioli", "Aged Swiss Cheese", "Baby Arugula"],
    prepTime: "16 mins",
    calories: "680 kcal",
    rating: 4.9,
    reviewsCount: "230 Reviews",
    spicyLevel: 0,
    isVeg: false,
    image: "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?auto=format&fit=crop&w=800&q=75&fm=webp",
    tags: ["Truffle Luxury", "Gourmet Beef"]
  },
  {
    id: "dish-bb4",
    name: "Cheesy Lava Monster Beef Burger",
    category: "beef-burgers",
    price: 480,
    currency: "₹",
    formattedPrice: "₹480",
    description: "Thick flame-seared beef patty loaded with warm gooey cheese lava, crispy onion rings, dill pickles, and smoked pepper sauce.",
    ingredients: ["Juicy Beef Patty", "Gooey Cheese Sauce", "Crispy Onion Rings", "Dill Pickles", "Smoked Sauce"],
    prepTime: "15 mins",
    calories: "790 kcal",
    rating: 4.9,
    reviewsCount: "315 Reviews",
    spicyLevel: 1,
    isVeg: false,
    image: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=75&fm=webp",
    tags: ["Cheese Lava", "Extra Cheesy"]
  },

  // FRIES
  {
    id: "dish-fr1",
    name: "Unexpected Signature Seasoned Fries",
    category: "fries",
    price: 180,
    currency: "₹",
    formattedPrice: "₹180",
    description: "Crispy golden skin-on hand-cut fries tossed in house secret spice dust, served with garlic herb mayo.",
    ingredients: ["Hand-Cut Potatoes", "House Spice Dust", "Sea Salt", "Garlic Herb Mayo"],
    prepTime: "8 mins",
    calories: "340 kcal",
    rating: 4.8,
    reviewsCount: "290 Reviews",
    spicyLevel: 1,
    isVeg: true,
    isBestseller: true,
    image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=75&fm=webp",
    tags: ["Crispy Classic", "House Seasoning"]
  },
  {
    id: "dish-fr2",
    name: "Truffle Parmesan Dust Fries",
    category: "fries",
    price: 240,
    currency: "₹",
    formattedPrice: "₹240",
    description: "Hand-cut fries drizzled with aromatic black truffle oil, tossed with aged parmesan dust and chopped fresh parsley.",
    ingredients: ["Golden Fries", "Black Truffle Oil", "Aged Parmesan", "Fresh Parsley"],
    prepTime: "10 mins",
    calories: "380 kcal",
    rating: 4.9,
    reviewsCount: "210 Reviews",
    spicyLevel: 0,
    isVeg: true,
    image: "https://images.unsplash.com/photo-1630384060421-cb34d0e0649e?auto=format&fit=crop&w=800&q=75&fm=webp",
    tags: ["Truffle Oil", "Parmesan Dust"]
  },
  {
    id: "dish-fr3",
    name: "Cheesy Loaded Beef Fries",
    category: "fries",
    price: 290,
    currency: "₹",
    formattedPrice: "₹290",
    description: "Golden fries smothered in warm cheddar cheese sauce, seasoned minced beef, jalapeño slices, and chives.",
    ingredients: ["Fries", "Warm Cheese Sauce", "Seasoned Minced Beef", "Jalapeños", "Fresh Chives"],
    prepTime: "12 mins",
    calories: "520 kcal",
    rating: 5.0,
    reviewsCount: "340 Reviews",
    spicyLevel: 2,
    isVeg: false,
    image: "https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=800&q=75&fm=webp",
    tags: ["Loaded Cheesy", "Ultimate Snack"]
  },

  // COLD DRINKS
  {
    id: "dish-dr1",
    name: "Unexpected Signature Iced Cold Brew Coffee",
    category: "drinks",
    price: 180,
    currency: "₹",
    formattedPrice: "₹180",
    description: "18-hour cold brew espresso poured over chilled whole milk and house brown sugar syrup.",
    ingredients: ["18-hr Cold Brew Espresso", "Whole Milk", "Brown Sugar Syrup", "Crushed Ice"],
    prepTime: "4 mins",
    calories: "160 kcal",
    rating: 4.9,
    reviewsCount: "160 Reviews",
    spicyLevel: 0,
    isVeg: true,
    image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=800&q=75&fm=webp",
    tags: ["Cold Brew", "Caffeine Boost"]
  },
  {
    id: "dish-dr2",
    name: "Classic Vanilla Bean Milkshake",
    category: "drinks",
    price: 210,
    currency: "₹",
    formattedPrice: "₹210",
    description: "Hand-spun thick shake crafted with Madagascar vanilla bean ice cream, organic milk, and whipped cream.",
    ingredients: ["Vanilla Bean Ice Cream", "Organic Milk", "Whipped Cream"],
    prepTime: "5 mins",
    calories: "380 kcal",
    rating: 4.9,
    reviewsCount: "195 Reviews",
    spicyLevel: 0,
    isVeg: true,
    image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=800&q=75&fm=webp",
    tags: ["Creamy Shake", "Thick & Rich"]
  },
  {
    id: "dish-dr3",
    name: "Sparkling Berry Mint Cooler",
    category: "drinks",
    price: 160,
    currency: "₹",
    formattedPrice: "₹160",
    description: "Fizzy sparkling water infused with muddled wild berries, fresh garden mint leaves, and a splash of lime.",
    ingredients: ["Sparkling Water", "Wild Berries", "Fresh Mint", "Fresh Lime Juice"],
    prepTime: "4 mins",
    calories: "95 kcal",
    rating: 4.8,
    reviewsCount: "120 Reviews",
    spicyLevel: 0,
    isVeg: true,
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=75&fm=webp",
    tags: ["Refreshing", "Fizzy Cooler"]
  },

  // DESSERTS
  {
    id: "dish-ds1",
    name: "Warm Artisanal Cinnamon Roll",
    category: "desserts",
    price: 220,
    currency: "₹",
    formattedPrice: "₹220",
    description: "Freshly baked soft brioche roll layered with fragrant Saigon cinnamon, topped with a warm cream cheese glaze.",
    ingredients: ["Saigon Cinnamon", "Brioche Dough", "Cream Cheese Glazed Frosting", "Pure Butter"],
    prepTime: "8 mins",
    calories: "410 kcal",
    rating: 5.0,
    reviewsCount: "420 Reviews",
    spicyLevel: 0,
    isVeg: true,
    isChefSpecial: true,
    isBestseller: true,
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=75&fm=webp",
    tags: ["Warm Soft Roll", "Cream Cheese Glaze", "Bestseller"]
  },
  {
    id: "dish-ds2",
    name: "Caramel Pecan Cinnamon Roll",
    category: "desserts",
    price: 250,
    currency: "₹",
    formattedPrice: "₹250",
    description: "Warm cinnamon roll generously drizzled with rich salted caramel sauce and topped with toasted golden pecans.",
    ingredients: ["Cinnamon Brioche Roll", "Salted Caramel Drizzle", "Toasted Pecans", "Vanilla Cream"],
    prepTime: "8 mins",
    calories: "460 kcal",
    rating: 4.9,
    reviewsCount: "280 Reviews",
    spicyLevel: 0,
    isVeg: true,
    image: "https://images.unsplash.com/photo-1583338917451-face2751d8d5?auto=format&fit=crop&w=800&q=75&fm=webp",
    tags: ["Salted Caramel", "Crunchy Pecans"]
  },
  {
    id: "dish-ds3",
    name: "Double Chocolate Fudge Brownie",
    category: "desserts",
    price: 190,
    currency: "₹",
    formattedPrice: "₹190",
    description: "Fudgy, dense dark chocolate brownie packed with melted Belgian chocolate chunks and a crinkly shiny top.",
    ingredients: ["70% Belgian Dark Chocolate", "Dutch Cocoa", "Pure Butter", "Sea Salt"],
    prepTime: "6 mins",
    calories: "390 kcal",
    rating: 4.9,
    reviewsCount: "310 Reviews",
    spicyLevel: 0,
    isVeg: true,
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=75&fm=webp",
    tags: ["Fudgy Dark Choco", "Warm Fudge"]
  },
  {
    id: "dish-ds4",
    name: "Classic New York Baked Cheesecake",
    category: "desserts",
    price: 280,
    currency: "₹",
    formattedPrice: "₹280",
    description: "Creamy, smooth classic NY cheesecake on a buttery Graham cracker crust, served with fresh berry compote.",
    ingredients: ["Cream Cheese", "Graham Cracker Crust", "Vanilla Bean", "Berry Compote"],
    prepTime: "5 mins",
    calories: "430 kcal",
    rating: 5.0,
    reviewsCount: "260 Reviews",
    spicyLevel: 0,
    isVeg: true,
    image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=800&q=75&fm=webp",
    tags: ["Creamy Cheesecake", "New York Classic"]
  }
];

export const TESTIMONIALS: Testimonial[] = [];

export const FAQS: FAQItem[] = [
  {
    id: "faq-1",
    question: "How does Unexpected Bites ensure hot and fresh delivery?",
    answer: "Every burger is cooked fresh to order, and all desserts are warmed right before dispatch. Orders are sealed in double-layer thermal tamper-evident boxes that preserve ideal temperature during transit.",
    category: "Thermal Delivery"
  },
  {
    id: "faq-2",
    question: "What are your operating hours and delivery area?",
    answer: "Unexpected Bites is open daily from 12 PM to 12 AM. We offer express delivery across Central City and within an express delivery radius.",
    category: "Operating Hours"
  },
  {
    id: "faq-3",
    question: "How can I contact or place an order directly?",
    answer: "You can order via our interactive digital menu, WhatsApp (+91 77806 58474), or reach out to us at smohiuddin441@gmail.com.",
    category: "Ordering & Support"
  },
  {
    id: "faq-4",
    question: "Do you have vegetarian options?",
    answer: "Yes! Our fries, cold drinks, cinnamon rolls, brownies, and cheesecake desserts are 100% vegetarian friendly.",
    category: "Dietary Preferences"
  }
];

export const GALLERY_IMAGES = [
  {
    id: "gal-1",
    title: "Hand-Crafted Double Angus Smash Burger",
    subtitle: "Smashed thin over high heat with melted cheddar and house sauce",
    url: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=800&q=75&fm=webp"
  },
  {
    id: "gal-2",
    title: "Golden Buttermilk Crispy Chicken",
    subtitle: "Double-dipped in secret spices for maximum crunch",
    url: "https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&w=800&q=75&fm=webp"
  },
  {
    id: "gal-3",
    title: "Warm Artisanal Cinnamon Rolls",
    subtitle: "Freshly baked daily with Saigon cinnamon and rich cream cheese glaze",
    url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=75&fm=webp"
  },
  {
    id: "gal-4",
    title: "Hand-Cut Seasoned Fries & Dipping Sauce",
    subtitle: "Crispy skin-on golden potatoes tossed in house seasoning",
    url: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=75&fm=webp"
  }
];
