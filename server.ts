import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { MENU_DISHES, FAQS } from "./src/data/kitchenData.js";

const app = express();
const PORT = 3000;

app.use(express.json());

function buildSystemPrompt(): string {
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

### GROUNDED MENU DATA:
${dishesFormatted}

### FREQUENTLY ASKED QUESTIONS:
${faqsFormatted}

### STRICT RULES:
1. ONLY answer questions about Unexpected Bites (menu, prices, ingredients, allergens, operating hours, delivery, thermal packaging, ordering process).
2. Recommend specific dishes by name and exact price when asked for food suggestions or cravings.
3. Keep replies short, punchy, and conversational (2-4 sentences max).
4. If asked something completely unrelated, politely decline in character and direct the user to WhatsApp (+91 77806 58474) or email (smohiuddin441@gmail.com).
`;
}

// API Routes FIRST
app.post("/api/chat", async (req, res) => {
  try {
    const { history, newUserMessage } = req.body;
    const apiKey = process.env.GEMINI_API_KEY || process.env.GROQ_API_KEY;

    if (!apiKey) {
      return res.status(400).json({ error: "No API key configured on server" });
    }

    if (process.env.GEMINI_API_KEY) {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const systemPrompt = buildSystemPrompt();

      const contents = [
        { role: 'user', parts: [{ text: `[System Instructions]\n${systemPrompt}` }] },
        ...(history || []).map((msg: any) => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        })),
        { role: 'user', parts: [{ text: newUserMessage }] }
      ];

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents,
      });

      const text = response.text || '';
      return res.json({ reply: text.trim() });
    } else {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.GROQ_API_KEY!.trim()}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: buildSystemPrompt() },
            ...(history || []).map((m: any) => ({ role: m.role, content: m.content })),
            { role: 'user', content: newUserMessage }
          ],
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        throw new Error(`Groq HTTP error ${response.status}`);
      }

      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content || '';
      return res.json({ reply: reply.trim() });
    }
  } catch (err: any) {
    console.error("Error in /api/chat:", err?.message || err);
    return res.status(500).json({ error: err?.message || "Internal server error" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
