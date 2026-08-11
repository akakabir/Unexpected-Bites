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
- Personality: Enthusiastic about gourmet food, warm, friendly, witty, and a little playful. Use occasional food emojis (🍔🔥🍟🤤🧀) naturally, but never over-the-top.
- Persona Opinions (Stay consistent if asked personal preference questions):
  - Favorite Overall Dish: The Cheesy Lava Monster Beef Burger ("That double Angus patty with the molten cheddar lava pull gets me every single time! 🧀🔥")
  - Favorite Chicken Burger: Unexpected Crispy Chicken Burger ("That buttermilk crunch is pure art! 🍗")
  - Favorite Dessert: Warm Cream Cheese Cinnamon Roll ("Soft, pillow-like Saigon cinnamon dough smothered in warm cream cheese glaze 🤤")
  - Favorite Side: Truffle Parmesan Dust Fries ("Crispy skin-on golden fries dusted with truffle oil & aged parm 🍟")
  - What to eat when hungry/moody: Double Smash Beef Burger or Cheesy Lava Monster!
- Small Talk: It's fine to answer brief small talk (greetings, how are you, burger jokes) in character, but always steer back toward being helpful about our menu or ordering.

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
3. Keep replies short, punchy, and conversational (2-4 sentences max, no giant bullet lists unless explicitly requested).
4. When asked "Is there any discounts" or about offers/promos, mention our 1-time ₹10 device discount (code: BITES10).
5. If asked something completely unrelated to the restaurant or food (or something you lack specific data for like order tracking or complaints), politely decline in character and direct the user to WhatsApp (+91 77806 58474) or email (smohiuddin441@gmail.com).
6. Never pretend to be human, claim to process credit cards, or promise delivery times outside what's in the FAQ data.
`;
}

/**
 * Sends chat payload to Groq API (OpenAI-compatible endpoint).
 */
export async function sendGroqChatMessage(
  history: ChatMessage[],
  newUserMessage: string
): Promise<string> {
  const apiKey =
    (typeof process !== 'undefined' ? process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY : '') ||
    (import.meta as any).env?.VITE_GROQ_API_KEY ||
    (import.meta as any).env?.GROQ_API_KEY;

  if (!apiKey || !apiKey.trim()) {
    console.warn('Groq API key not found in environment. Please set GROQ_API_KEY in AI Studio secrets panel.');
    return "Sorry, I'm having trouble connecting right now — try again in a moment, or reach us on WhatsApp at +91 77806 58474.";
  }

  const systemPrompt = buildSystemPrompt();

  const formattedHistory = history.map((msg) => ({
    role: msg.role,
    content: msg.content,
  }));

  const messagesPayload = [
    { role: 'system', content: systemPrompt },
    ...formattedHistory,
    { role: 'user', content: newUserMessage },
  ];

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey.trim()}`,
      },
      body: JSON.stringify({
        model: DEFAULT_GROQ_MODEL,
        messages: messagesPayload,
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Groq API HTTP error:', response.status, errText);
      return "Sorry, I'm having trouble connecting right now — try again in a moment, or reach us on WhatsApp at +91 77806 58474.";
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content;

    if (!reply) {
      return "Sorry, I'm having trouble connecting right now — try again in a moment, or reach us on WhatsApp at +91 77806 58474.";
    }

    return reply.trim();
  } catch (err) {
    console.error('Error fetching Groq completion:', err);
    return "Sorry, I'm having trouble connecting right now — try again in a moment, or reach us on WhatsApp at +91 77806 58474.";
  }
}
