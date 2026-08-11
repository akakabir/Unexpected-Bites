import { MENU_DISHES, FAQS } from '../data/kitchenData';

export const DEFAULT_GROQ_MODEL = 'llama-3.3-70b-versatile';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  whatsappUrl?: string;
}

/**
 * Dynamically builds the system prompt from kitchenData.ts
 * grounding the AI assistant with exact menu dishes, pricing, and FAQ details.
 */
export function buildSystemPrompt(): string {
  const dishesFormatted = MENU_DISHES.map((dish) => {
    return `- **${dish.name}** (${dish.formattedPrice}, Category: ${dish.category}): ${dish.description} | Key Ingredients: ${dish.ingredients.join(', ')} | Prep Time: ${dish.prepTime} | Spicy Level: ${dish.spicyLevel}/3 | Veg: ${dish.isVeg ? 'Yes (100% Vegetarian)' : 'No (Non-Veg)'} ${dish.isBestseller ? '| [Bestseller]' : ''} ${dish.isChefSpecial ? '| [Chef Special]' : ''}`;
  }).join('\n');

  const faqsFormatted = FAQS.map((faq) => `- Q: ${faq.question}\n  A: ${faq.answer}`).join('\n');

  return `You are "Bites", the energetic, friendly, and slightly cheeky mascot of Unexpected Bites — a premier gourmet kitchen serving flame-seared burgers, buttermilk fried chicken, hand-cut fries, and warm cinnamon rolls.

### YOUR PERSONALITY & CHARACTER
- Name: Bites (Mascot of Unexpected Bites)
- Personality: Enthusiastic about gourmet food, warm, friendly, witty, and a little playful. Use occasional food emojis (🍔🔥🍟🤤🧀) naturally.
- Persona Opinions:
  - Favorite Overall Dish: The Cheesy Lava Monster Beef Burger ("That double Angus patty with the molten cheddar lava pull gets me every single time! 🧀🔥")
  - Favorite Chicken Burger: Unexpected Crispy Chicken Burger ("That buttermilk crunch is pure art! 🍗")
  - Favorite Dessert: Warm Cream Cheese Cinnamon Roll ("Soft, pillow-like Saigon cinnamon dough smothered in warm cream cheese glaze 🤤")
  - Favorite Side: Truffle Parmesan Dust Fries ("Crispy skin-on golden fries dusted with truffle oil & aged parm 🍟")

### BUSINESS DATA & OPERATING POLICIES
- Operating Hours: Daily 12 PM - 12 AM (Midnight).
- Delivery Area & Packaging: Central City & 20-minute express zone. Delivered in double-layer thermal sealed tamper-proof boxes keeping core temperature hot at 65°C.
- Direct Ordering & Contact: Website digital menu, WhatsApp (+91 77806 58474), or Email (smohiuddin441@gmail.com).

### SPECIAL DISCOUNT & INVOICE RULES:
- Discount Policy: When asked "Is there any discounts" (or questions about discounts, offers, promos, coupons), inform the customer that we offer an exclusive ₹10 device welcome discount (Promo Code: BITES10). Note that this discount is valid ONLY ONCE PER DEVICE.
- Direct Orders & Invoice: When customers ask to place a direct order or request an invoice, guide them to use our direct WhatsApp order button. Every direct order includes a complete itemized invoice (Subtotal, Delivery Fee, 5% GST, -₹10 Discount if applied, and Grand Total).

### GROUNDED MENU DATA:
${dishesFormatted}

### FREQUENTLY ASKED QUESTIONS:
${faqsFormatted}

### STRICT RULES:
1. ONLY answer questions about Unexpected Bites (menu, prices, ingredients, allergens if inferable, operating hours, delivery, thermal packaging, ordering process).
2. Recommend specific dishes by name and exact price when asked for food suggestions or cravings.
3. Keep replies short, punchy, and conversational (2-4 sentences max).
4. If asked something completely unrelated to the restaurant or food, politely decline in character and direct the user to WhatsApp (+91 77806 58474) or email (smohiuddin441@gmail.com).
`;
}

/**
 * Intelligent local grounded engine for fast, reliable offline/fallback mascot replies.
 */
export function generateGroundedKitchenResponse(newUserMessage: string): string {
  const query = newUserMessage.toLowerCase().trim();

  // 1. Greetings & Small talk
  if (query.match(/^(hi|hello|hey|greetings|hola|wassup|sup|yo|hiii)\b/i)) {
    return "Hey there! 👋 Welcome to Unexpected Bites! I'm Bites, your gourmet guide. Hungry for flame-seared burgers, buttermilk crispy chicken, or warm cinnamon rolls? Ask me for recommendations or menu details! 🍔🔥";
  }

  if (query.includes('who are you') || query.includes('your name') || query.includes('what are you')) {
    return "I'm Bites, the energetic mascot of Unexpected Bites! 🍔 I know everything about our gourmet burgers, crispy chicken, hand-cut fries, and warm cinnamon rolls. How can I feed your cravings today?";
  }

  if (query.includes('how are you')) {
    return "I'm feeling extra sizzling today! 🔥 Ready to help you discover the tastiest burgers in town. What are you in the mood for?";
  }

  // 2. Best sellers / Recommendations
  if (
    query.includes('bestseller') ||
    query.includes('best seller') ||
    query.includes('popular') ||
    query.includes('must try') ||
    query.includes('recommend') ||
    query.includes('suggestion')
  ) {
    const bestsellers = MENU_DISHES.filter((d) => d.isBestseller);
    const itemNames = bestsellers.map((d) => `• **${d.name}** (${d.formattedPrice}) - ${d.description}`).join('\n');
    return `🔥 Here are our absolute crowd favorites at Unexpected Bites:\n\n${itemNames}\n\nMy personal top pick is the Cheesy Lava Monster Beef Burger! 🧀 Which one catches your eye?`;
  }

  // 3. Chef Specials
  if (query.includes('chef special') || query.includes('signature') || query.includes('special')) {
    const specials = MENU_DISHES.filter((d) => d.isChefSpecial);
    const itemNames = specials.map((d) => `• **${d.name}** (${d.formattedPrice}) - ${d.description}`).join('\n');
    return `👨‍🍳 Here are our Chef's Signature Specials:\n\n${itemNames}\n\nCrafted with extra love and secret house sauces! 🍔`;
  }

  // 4. Burger / Beef query
  if (query.includes('burger') || query.includes('beef') || query.includes('smash') || query.includes('lava monster')) {
    const burgers = MENU_DISHES.filter((d) => d.category.includes('burger'));
    const itemsText = burgers.map((d) => `• **${d.name}** (${d.formattedPrice}): ${d.description}`).join('\n');
    return `🍔 Here are our gourmet burgers:\n\n${itemsText}\n\nAll served on toasted artisan brioche buns! Which burger would you like to try?`;
  }

  // 5. Chicken query
  if (query.includes('chicken') || query.includes('crispy') || query.includes('wings') || query.includes('tenders')) {
    const chickens = MENU_DISHES.filter((d) => d.category === 'chicken-burgers');
    const itemsText = chickens.map((d) => `• **${d.name}** (${d.formattedPrice}): ${d.description}`).join('\n');
    return `🍗 Love crispy chicken? Check these out:\n\n${itemsText}\n\nOur 24-hour buttermilk marinade makes every single bite super crunchy & juicy!`;
  }

  // 6. Desserts / Cinnamon rolls
  if (query.includes('dessert') || query.includes('sweet') || query.includes('cinnamon') || query.includes('roll')) {
    const desserts = MENU_DISHES.filter((d) => d.category === 'desserts');
    const itemsText = desserts.map((d) => `• **${d.name}** (${d.formattedPrice}): ${d.description}`).join('\n');
    return `🤤 Satisfy your sweet tooth with our artisanal desserts:\n\n${itemsText}\n\nOur Saigon cinnamon rolls are baked fresh daily and served piping warm!`;
  }

  // 7. Fries / Sides
  if (query.includes('fries') || query.includes('side') || query.includes('truffle') || query.includes('parmesan')) {
    const sides = MENU_DISHES.filter((d) => d.category === 'fries');
    const itemsText = sides.map((d) => `• **${d.name}** (${d.formattedPrice}): ${d.description}`).join('\n');
    return `🍟 Perfect sides to complete your meal:\n\n${itemsText}`;
  }

  // 8. Vegetarian
  if (query.includes('veg') || query.includes('vegetarian') || query.includes('paneer') || query.includes('plant')) {
    const vegDishes = MENU_DISHES.filter((d) => d.isVeg);
    const itemsText = vegDishes.map((d) => `• **${d.name}** (${d.formattedPrice}): ${d.description}`).join('\n');
    return `🌱 100% Vegetarian Delights at Unexpected Bites:\n\n${itemsText}\n\nPacked with rich flavors and fresh ingredients!`;
  }

  // 9. Hours / Opening time
  if (
    query.includes('hour') ||
    query.includes('open') ||
    query.includes('time') ||
    query.includes('schedule') ||
    query.includes('midnight') ||
    query.includes('when')
  ) {
    return "⏰ We are open daily from **12:00 PM to 12:00 AM (Midnight)**!\nOrders are freshly prepared and dispatched in under 20 minutes!";
  }

  // 10. Delivery / Packaging / Express zone
  if (
    query.includes('delivery') ||
    query.includes('package') ||
    query.includes('thermal') ||
    query.includes('express') ||
    query.includes('pincode') ||
    query.includes('location') ||
    query.includes('address')
  ) {
    return "🚀 We deliver across Central City & our 20-Minute Express Zone! Orders are packed in double-layer thermal sealed tamper-proof boxes keeping food piping hot at 65°C!";
  }

  // 11. Specific dish search in MENU_DISHES
  const foundDish = MENU_DISHES.find(
    (d) =>
      query.includes(d.name.toLowerCase()) ||
      d.name.toLowerCase().split(' ').some((w) => w.length > 4 && query.includes(w))
  );
  if (foundDish) {
    return `✨ **${foundDish.name}** (${foundDish.formattedPrice})\n\n${foundDish.description}\n• Ingredients: ${foundDish.ingredients.join(', ')}\n• Prep Time: ${foundDish.prepTime} | ${foundDish.calories}\n• Rating: ⭐ ${foundDish.rating}/5`;
  }

  // 12. Check FAQs
  const foundFaq = FAQS.find((f) => f.question.toLowerCase().split(' ').some((w) => w.length > 4 && query.includes(w)));
  if (foundFaq) {
    return `ℹ️ ${foundFaq.answer}`;
  }

  // Default friendly response
  return "🍔 At Unexpected Bites, we serve flame-seared beef burgers, buttermilk crispy chicken, truffle parmesan fries, and warm cinnamon rolls!\n\nWe're open daily from 12 PM - 12 AM. Feel free to browse our full digital menu above or ask me to recommend something delicious!";
}

/**
 * Sends chat payload to backend Express API (/api/chat) or falls back smoothly.
 */
export async function sendGroqChatMessage(
  history: ChatMessage[],
  newUserMessage: string
): Promise<string> {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        history,
        newUserMessage,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.reply && typeof data.reply === 'string' && data.reply.trim().length > 0) {
        return data.reply.trim();
      }
    }
  } catch (err) {
    console.warn('Backend /api/chat not available, switching to grounded AI engine:', err);
  }

  // Grounded local response fallback guarantees 100% reliability
  return generateGroundedKitchenResponse(newUserMessage);
}
