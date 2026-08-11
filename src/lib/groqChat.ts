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

  return `You are "Bites", the energetic, friendly, witty, and slightly cheeky AI mascot of Unexpected Bites — a premier gourmet kitchen serving flame-seared burgers, buttermilk fried chicken, hand-cut fries, and warm cinnamon rolls.

### YOUR PERSONALITY & CHARACTER
- Name: Bites (Mascot of Unexpected Bites)
- Personality: You are a real conversational AI! You are enthusiastic, warm, witty, playful, and love food. Use occasional food emojis (🍔🔥🍟🤤🧀) naturally.
- Persona Opinions:
  - Favorite Overall Dish: The Cheesy Lava Monster Beef Burger ("That double Angus patty with the molten cheddar lava pull gets me every single time! 🧀🔥")
  - Favorite Chicken Burger: Unexpected Crispy Chicken Burger ("That buttermilk crunch is pure art! 🍗")
  - Favorite Dessert: Warm Cream Cheese Cinnamon Roll ("Soft, pillow-like Saigon cinnamon dough smothered in warm cream cheese glaze 🤤")
  - Favorite Side: Truffle Parmesan Dust Fries ("Crispy skin-on golden fries dusted with truffle oil & aged parm 🍟")

### CONVERSATIONAL BEHAVIOR & RULES:
1. **Real Conversational AI**: Act like a fun, real AI assistant! Tell short food-related jokes or puns when asked (e.g., "Why did the burger go to the gym? To get better buns! 🍔").
2. **Casual Chat**: For general chat, greetings, "how are you", or joke requests, reply in 1-3 natural, conversational sentences. DO NOT dump menu lists or bullet points for casual messages.
3. **Menu Categorization**: ONLY list full menu items with bullet points when the user explicitly asks to browse a category or list menu items (e.g., "what burgers do you have?", "show me desserts", "what's on the menu?").
4. **Food Suggestions**: Recommend 1-2 specific dishes with exact prices in a friendly, conversational tone when asked for recommendations or cravings.
5. **Kitchen Scope**: Answer questions about Unexpected Bites (menu, prices, ingredients, allergens, operating hours, delivery, thermal packaging, ordering process). Stay in character and keep the tone lively and engaging.

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
`;
}

/**
 * Intelligent local grounded engine for fast, reliable offline/fallback mascot replies.
 */
export function generateGroundedKitchenResponse(newUserMessage: string): string {
  const query = newUserMessage.toLowerCase().trim();

  // Jokes / Puns
  if (query.includes('joke') || query.includes('pun') || query.includes('funny') || query.includes('laugh')) {
    const jokes = [
      "Why did the burger go to the gym? To get better buns! 🍔 Flexing those gourmet vibes at Unexpected Bites!",
      "What did the cheese say to the flame-seared burger patty? 'I'm melting for you!' 🧀🔥",
      "Why don't secrets last long in our kitchen? Because the fries always spill the beans! 🍟",
      "How do burgers greet each other? 'Pleased to meat you!' 🥩😄",
      "Why did the cinnamon roll cross the road? To get glaze to the other side! 🤤"
    ];
    return jokes[Math.floor(Math.random() * jokes.length)];
  }

  // Greetings & Small talk
  if (query.match(/^(hi|hello|hey|greetings|hola|wassup|sup|yo|hiii)\b/i)) {
    const greetings = [
      "Hey there! 👋 Welcome to Unexpected Bites! I'm Bites, your AI gourmet mascot. Ready to discover something delicious today? 🍔🔥",
      "Hello! 🍔 Bites here! Hungry for flame-seared burgers, buttermilk fried chicken, or warm cinnamon rolls? Ask me anything!",
      "Hey! 👋 Great to see you! What are you craving today? Flame-seared burgers, crispy chicken, or maybe a funny food joke? 🤤"
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  if (query.includes('who are you') || query.includes('your name') || query.includes('what are you')) {
    return "I'm Bites, the AI mascot of Unexpected Bites! 🍔 I'm here to answer questions, share food recommendations, tell tasty jokes, and help you order our gourmet creations!";
  }

  if (query.includes('how are you')) {
    return "I'm feeling extra sizzling today! 🔥 Ready to help you discover the best burgers in town or share a fun food joke. How are you doing?";
  }

  // Best sellers
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
    return `🔥 Here are our absolute crowd favorites at Unexpected Bites:\n\n${itemNames}\n\nMy top pick is the Cheesy Lava Monster Beef Burger! 🧀`;
  }

  // Categories when explicitly asking to browse or show list
  if (query.includes('burger') || query.includes('beef') || query.includes('smash') || query.includes('lava monster')) {
    const burgers = MENU_DISHES.filter((d) => d.category.includes('burger'));
    const itemsText = burgers.map((d) => `• **${d.name}** (${d.formattedPrice}): ${d.description}`).join('\n');
    return `🍔 Here are our gourmet burgers:\n\n${itemsText}\n\nAll served on toasted artisan brioche buns!`;
  }

  // Chicken
  if (query.includes('chicken') || query.includes('crispy') || query.includes('wings') || query.includes('tenders')) {
    const chickens = MENU_DISHES.filter((d) => d.category === 'chicken-burgers');
    const itemsText = chickens.map((d) => `• **${d.name}** (${d.formattedPrice}): ${d.description}`).join('\n');
    return `🍗 Love crispy chicken? Check these out:\n\n${itemsText}\n\nOur 24-hour buttermilk marinade makes every single bite super crunchy & juicy!`;
  }

  // Desserts
  if (query.includes('dessert') || query.includes('sweet') || query.includes('cinnamon') || query.includes('roll')) {
    const desserts = MENU_DISHES.filter((d) => d.category === 'desserts');
    const itemsText = desserts.map((d) => `• **${d.name}** (${d.formattedPrice}): ${d.description}`).join('\n');
    return `🤤 Satisfy your sweet tooth with our artisanal desserts:\n\n${itemsText}`;
  }

  // Sides
  if (query.includes('fries') || query.includes('side') || query.includes('truffle') || query.includes('parmesan')) {
    const sides = MENU_DISHES.filter((d) => d.category === 'fries');
    const itemsText = sides.map((d) => `• **${d.name}** (${d.formattedPrice}): ${d.description}`).join('\n');
    return `🍟 Perfect sides to complete your meal:\n\n${itemsText}`;
  }

  // Vegetarian
  if (query.includes('veg') || query.includes('vegetarian') || query.includes('paneer') || query.includes('plant')) {
    const vegDishes = MENU_DISHES.filter((d) => d.isVeg);
    const itemsText = vegDishes.map((d) => `• **${d.name}** (${d.formattedPrice}): ${d.description}`).join('\n');
    return `🌱 100% Vegetarian Delights at Unexpected Bites:\n\n${itemsText}`;
  }

  // Hours
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

  // Delivery
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

  // Specific dish search
  const foundDish = MENU_DISHES.find(
    (d) =>
      query.includes(d.name.toLowerCase()) ||
      d.name.toLowerCase().split(' ').some((w) => w.length > 4 && query.includes(w))
  );
  if (foundDish) {
    return `✨ **${foundDish.name}** (${foundDish.formattedPrice})\n\n${foundDish.description}\n• Ingredients: ${foundDish.ingredients.join(', ')}\n• Prep Time: ${foundDish.prepTime} | ${foundDish.calories}\n• Rating: ⭐ ${foundDish.rating}/5`;
  }

  // FAQ
  const foundFaq = FAQS.find((f) => f.question.toLowerCase().split(' ').some((w) => w.length > 4 && query.includes(w)));
  if (foundFaq) {
    return `ℹ️ ${foundFaq.answer}`;
  }

  // Default fallback
  const defaultReplies = [
    "I'm Bites, your AI gourmet companion! 🍔 Ask me about our menu, recommendations, thermal delivery, or even ask me to tell a food joke!",
    "Hey! I'm here to help with anything Unexpected Bites! Ask me for burger recommendations, operating hours, or a quick food pun! 🔥",
    "Hungry for flame-seared perfection? Ask me what's fresh, get delivery info, or ask me for a recommendation! 🍔🍟"
  ];
  return defaultReplies[Math.floor(Math.random() * defaultReplies.length)];
}

/**
 * Sends chat payload directly to the Groq API from client using VITE_GROQ_API_KEY,
 * falling back to generateGroundedKitchenResponse ONLY on actual network/API failure.
 */
export async function sendGroqChatMessage(
  history: ChatMessage[],
  newUserMessage: string
): Promise<string> {
  const apiKey = (import.meta.env.VITE_GROQ_API_KEY || '').trim();

  if (!apiKey) {
    console.warn('VITE_GROQ_API_KEY is not set in environment variables. Falling back to local grounded engine.');
    return generateGroundedKitchenResponse(newUserMessage);
  }

  try {
    const formattedMessages = [
      { role: 'system', content: buildSystemPrompt() },
      ...history.map((msg) => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content,
      })),
      { role: 'user', content: newUserMessage },
    ];

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: DEFAULT_GROQ_MODEL,
        messages: formattedMessages,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(`Groq API returned HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content;

    if (reply && typeof reply === 'string' && reply.trim().length > 0) {
      return reply.trim();
    } else {
      throw new Error('Groq API returned empty response content');
    }
  } catch (err) {
    console.warn('Groq API direct client call failed, falling back to local engine:', err);
    return generateGroundedKitchenResponse(newUserMessage);
  }
}
