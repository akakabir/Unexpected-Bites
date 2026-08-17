import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation, AnimatePresence } from 'motion/react';
import { Flame, X, Send, Sparkles, MessageSquare, ExternalLink, Ticket, Receipt } from 'lucide-react';
import { sendGroqChatMessage, ChatMessage } from '../lib/groqChat';
import { SiteContent } from '../lib/firebase';
import { computeFloatingPositions } from '../utils/floatingButtons';
import { CartItem } from '../types';
import { BRAND_CONFIG } from '../theme/tokens';
import {
  checkDeviceDiscountStatus,
  redeemDeviceDiscount,
  generatePrewrittenOrderMessage,
} from '../utils/orderInvoice';
import { trackAnalyticsEvent } from '../utils/analyticsTracker';

const INITIAL_ASSISTANT_MSG: ChatMessage = {
  id: 'init-msg-1',
  role: 'assistant',
  content: "Hey! I'm the Unexpected Bites helper — ask me about our menu, prices, thermal delivery, or recommendations! 🍔",
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
};

const SUGGESTED_QUESTIONS = [
  "🧾 Direct order & invoice",
  "🔥 What are your bestsellers?",
  "🍔 Recommend a juicy burger",
  "⏰ Operating hours & delivery?",
];

interface MascotProps {
  siteContent?: SiteContent;
  cart?: CartItem[];
}

export default function Mascot({ siteContent, cart = [] }: MascotProps) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const [isSpeechVisible, setIsSpeechVisible] = useState(true);
  
  // Chat state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_ASSISTANT_MSG]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();

  const handleChatWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop += e.deltaY;
    }
  };

  const floatingPositions = computeFloatingPositions(siteContent);
  const mascotPosInfo = floatingPositions.mascot;
  const isLeftCorner = mascotPosInfo.corner.includes('left');
  const isTopCorner = mascotPosInfo.corner.includes('top');

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(
        (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(max-width: 768px)').matches) ||
        (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(pointer: coarse)').matches)
      );
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Hide speech bubble once user scrolls past the hero section
  useEffect(() => {
    const handleScroll = () => {
      const heroElement = document.getElementById('hero');
      if (heroElement) {
        const rect = heroElement.getBoundingClientRect();
        setIsSpeechVisible(rect.bottom > 200);
      } else {
        setIsSpeechVisible(window.scrollY < 350);
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Real-time cursor tracking for pupils (throttled via RAF)
  useEffect(() => {
    if (isMobile) {
      controls.start({
        x: [0, 3, 0, -3, 0],
        y: [0, -2, 0, -2, 0],
        transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' }
      });
      return;
    }

    let rafId: number | null = null;

    const handleMouseMove = (e: MouseEvent) => {
      if (document.hidden) return;
      if (rafId !== null) return;

      rafId = requestAnimationFrame(() => {
        rafId = null;
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const deltaX = e.clientX - centerX;
        const deltaY = e.clientY - centerY;
        
        const distance = Math.hypot(deltaX, deltaY);
        
        const maxDistanceX = 2.0;
        const maxDistanceY = 2.5;
        
        const moveX = distance > 0 ? (deltaX / distance) * Math.min(distance * 0.05, maxDistanceX) : 0;
        const moveY = distance > 0 ? (deltaY / distance) * Math.min(distance * 0.05, maxDistanceY) : 0;
        
        setMousePos({ x: moveX, y: moveY });
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [isMobile, controls]);

  // Auto scroll to bottom of chat
  useEffect(() => {
    if (isChatOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isChatOpen]);

  const toggleChat = () => {
    setIsChatOpen((prev) => !prev);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput('');
    trackAnalyticsEvent('mascot_chat', window.location.pathname || '/');

    const lower = text.toLowerCase();
    const isDiscountReq =
      lower.includes('discount') ||
      lower.includes('offer') ||
      lower.includes('promo') ||
      lower.includes('coupon') ||
      lower.includes('voucher') ||
      lower.includes('deal');

    const isDirectOrderReq =
      lower.includes('direct order') ||
      lower.includes('whatsapp order') ||
      lower.includes('invoice') ||
      lower.includes('order message');

    // 1. Handle Discount Request specifically
    if (isDiscountReq) {
      const { hasUsedDeviceDiscount } = checkDeviceDiscountStatus();
      let replyContent = '';

      if (hasUsedDeviceDiscount) {
        replyContent =
          "You have already redeemed your 1-time ₹10 device discount on this device! 🎟️\n\nHowever, you can still get **FREE Express Thermal Delivery on all orders over ₹800**! Ask me 'direct order' or click the WhatsApp order button to view your itemized invoice!";
      } else {
        redeemDeviceDiscount();
        replyContent =
          "🎉 Yes! I have activated an exclusive **₹10 Discount** for your order! 🎟️\n\nCode: **BITES10** (-₹10 off).\nI've automatically included this ₹10 discount in your cart & invoice calculation! *(Note: This welcome discount is valid ONCE per device)*.\n\nWould you like me to generate your prewritten WhatsApp direct order message & itemized invoice now? 🍔";
      }

      const assistantMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        content: replyContent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      return;
    }

    // 2. Handle Direct Order / Invoice Request
    if (isDirectOrderReq) {
      if (cart.length === 0) {
        const assistantMsg: ChatMessage = {
          id: `asst-${Date.now()}`,
          role: 'assistant',
          content:
            "Your gourmet cart is currently empty! 🛒\n\nAdd your favorite burgers or cinnamon rolls to your cart, or ask me for recommendations, and I'll generate a complete prewritten WhatsApp order & itemized invoice for you! 🍔",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, assistantMsg]);
        return;
      }

      const prewrittenMsg = generatePrewrittenOrderMessage(cart);
      const whatsappUrl = `https://wa.me/${BRAND_CONFIG.whatsappNumber}?text=${encodeURIComponent(prewrittenMsg)}`;

      const assistantMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        content: `Here is your prewritten direct WhatsApp order & itemized invoice summary:\n\n${prewrittenMsg}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        whatsappUrl,
      };
      setMessages((prev) => [...prev, assistantMsg]);
      return;
    }

    // 3. General AI Chat Query via Groq Llama 3.3
    setIsLoading(true);

    try {
      const reply = await sendGroqChatMessage(messages, text);
      const assistantMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        content: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content:
          "Sorry, I'm having trouble connecting right now — try again in a moment, or reach us on WhatsApp at +91 77806 58474.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Interactive Floating Mascot Button & Idle Speech Bubble */}
      <div 
        style={mascotPosInfo.style}
        className={`fixed z-[70] flex items-end gap-3 pointer-events-none transition-all duration-300 ${
          isLeftCorner ? 'flex-row-reverse' : 'flex-row'
        }`}
      >
        {/* Comic Speech Bubble - Hides on Scroll or when Chat is Open */}
        <AnimatePresence>
          {isSpeechVisible && !isChatOpen && (
            <motion.div
              key="mascot-speech-bubble"
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              transition={{ duration: 0.25, type: 'spring', stiffness: 140, damping: 15 }}
              onClick={toggleChat}
              className="relative bg-[var(--theme-surface)] border-3 border-[var(--theme-text)] rounded-2xl px-4 py-3 shadow-[4px_4px_0_0_var(--theme-text)] mb-8 pointer-events-auto cursor-pointer hover:bg-[var(--theme-card-bg)] transition-colors group"
            >
              <div className="flex items-center gap-2">
                <p className="font-serif font-black text-sm text-[var(--theme-text)]">
                  Welcome to Unexpected Bites! 🍔
                </p>
                <span className="text-[10px] bg-amber-500/20 text-amber-900 border border-amber-600/30 px-1.5 py-0.5 rounded-full font-bold group-hover:bg-amber-500 group-hover:text-black transition-colors">
                  Ask AI
                </span>
              </div>
              {/* Bubble Tail */}
              <div className={`absolute -bottom-3 ${isLeftCorner ? 'left-4' : 'right-4'} w-4 h-4 bg-[var(--theme-surface)] border-b-3 border-r-3 border-[var(--theme-text)] transform rotate-45 group-hover:bg-[var(--theme-card-bg)] transition-colors`} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Clickable Mascot Body */}
        <motion.button
          ref={containerRef}
          onClick={toggleChat}
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Open AI Assistant Chat"
          className="relative w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center border-3 border-[var(--theme-text)] shadow-[4px_4px_0_0_var(--theme-text)] pointer-events-auto cursor-pointer focus:outline-none focus:ring-4 focus:ring-amber-500/50"
        >
          <Flame className="absolute inset-0 w-full h-full text-amber-400 opacity-50 scale-125 -z-10 blur-sm" />
          
          {/* Eyes Container */}
          <div className="flex gap-2.5 mb-2.5 z-10">
            {/* Left Eye */}
            <div className="w-2.5 h-3 bg-[#FAF8F5] rounded-full border-1.5 border-[var(--theme-text)] overflow-hidden relative">
              <motion.div
                animate={isMobile ? controls : { x: mousePos.x, y: mousePos.y }}
                transition={isMobile ? {} : { type: 'spring', stiffness: 450, damping: 28 }}
                className="absolute top-1/2 left-1/2 w-1 h-1 bg-[var(--theme-text)] rounded-full -ml-0.5 -mt-0.5"
              />
            </div>
            {/* Right Eye */}
            <div className="w-2.5 h-3 bg-[#FAF8F5] rounded-full border-1.5 border-[var(--theme-text)] overflow-hidden relative">
              <motion.div
                animate={isMobile ? controls : { x: mousePos.x, y: mousePos.y }}
                transition={isMobile ? {} : { type: 'spring', stiffness: 450, damping: 28 }}
                className="absolute top-1/2 left-1/2 w-1 h-1 bg-[var(--theme-text)] rounded-full -ml-0.5 -mt-0.5"
              />
            </div>
          </div>
          
          {/* Cute Friendly Smile */}
          <svg className="absolute bottom-3.5 w-5 h-2.5 text-[var(--theme-text)]" viewBox="0 0 20 10" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M4 2 Q 10 8 16 2" />
          </svg>

          {/* Chat indicator badge */}
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-[var(--theme-text)] rounded-full flex items-center justify-center shadow-sm">
            <MessageSquare className="w-2.5 h-2.5 text-white" />
          </div>
        </motion.button>
      </div>

      {/* Groq Powered AI Chat Panel */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            key="mascot-chat-panel"
            data-lenis-prevent="true"
            onWheel={handleChatWheel}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 220, damping: 20 }}
            className={`fixed z-[80] inset-x-3 sm:inset-auto ${
              isTopCorner ? 'top-20 sm:top-24' : 'bottom-24 sm:bottom-28'
            } ${
              isLeftCorner ? 'sm:left-8 sm:right-auto' : 'sm:right-8 sm:left-auto'
            } w-[calc(100vw-24px)] sm:w-96 h-[500px] max-h-[80vh] bg-[var(--theme-surface)] border-3 border-[var(--theme-text)] shadow-[6px_6px_0_0_var(--theme-text)] rounded-2xl flex flex-col overflow-hidden pointer-events-auto overscroll-contain`}
          >
            {/* Panel Header */}
            <div className="bg-[var(--theme-card-bg)] border-b-2 border-[var(--theme-border)] px-4 py-3 flex items-center justify-between select-none">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-amber-500 rounded-full border-2 border-[var(--theme-text)] flex items-center justify-center relative shadow-sm">
                  <Flame className="w-5 h-5 text-amber-900" />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-1.5 border-white rounded-full" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-serif font-black text-sm text-[var(--theme-text)] leading-none">
                      Bites Assistant
                    </h3>
                    <span className="text-[10px] font-mono bg-amber-500/15 text-amber-900 border border-amber-500/30 px-1.5 py-0.2 rounded font-bold">
                      Groq Llama 3.3
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--theme-text-subtle)] font-medium mt-0.5">
                    Always hungry to help 🍔
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsChatOpen(false)}
                aria-label="Close Assistant Chat"
                className="p-1.5 text-[var(--theme-text-subtle)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-surface)] rounded-xl transition-colors border border-transparent hover:border-[var(--theme-border)] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Messages Area */}
            <div 
              ref={messagesContainerRef}
              data-lenis-prevent="true"
              onWheel={handleChatWheel}
              className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[var(--theme-surface)] overscroll-contain"
            >
              {messages.map((msg) => {
                const isAsst = msg.role === 'assistant';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isAsst ? 'items-start' : 'items-end'}`}
                  >
                    <div
                      className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-sans leading-relaxed shadow-sm ${
                        isAsst
                          ? 'bg-[var(--theme-card-bg)] text-[var(--theme-text)] border border-[var(--theme-border)] rounded-tl-xs font-serif'
                          : 'bg-[var(--theme-text)] text-[var(--theme-surface)] rounded-tr-xs font-medium'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                      {msg.whatsappUrl && (
                        <div className="mt-3 pt-2 border-t border-emerald-500/30">
                          <a
                            href={msg.whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold px-3 py-1.5 rounded-xl text-xs shadow-md transition-all"
                          >
                            <span>Launch 1-Click WhatsApp Order</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-[var(--theme-text-subtle)] font-mono mt-1 px-1 opacity-70">
                      {msg.timestamp}
                    </span>
                  </div>
                );
              })}

              {/* Loading Indicator */}
              {isLoading && (
                <div className="flex flex-col items-start">
                  <div className="bg-[var(--theme-card-bg)] text-[var(--theme-text)] border border-[var(--theme-border)] rounded-2xl rounded-tl-xs px-4 py-3 shadow-sm flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                    <span className="text-xs text-[var(--theme-text-subtle)] font-serif font-medium">
                      Bites is thinking...
                    </span>
                    <div className="flex gap-1 ml-1">
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggested Question Chips */}
            {messages.length <= 2 && !isLoading && (
              <div className="px-3 py-1.5 bg-[var(--theme-card-bg)]/60 border-t border-[var(--theme-border)] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {SUGGESTED_QUESTIONS.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(q)}
                    className="shrink-0 text-[11px] font-sans font-medium text-[var(--theme-text)] bg-[var(--theme-surface)] hover:bg-amber-500 hover:text-black border border-[var(--theme-border)] px-2.5 py-1 rounded-full transition-all text-nowrap"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Message Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-3 bg-[var(--theme-card-bg)] border-t border-[var(--theme-border)] flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Bites about burgers, prices, hours..."
                disabled={isLoading}
                className="flex-1 bg-[var(--theme-surface)] border border-[var(--theme-border)] text-[var(--theme-text)] placeholder-[var(--theme-text-subtle)] text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-amber-500 transition-colors"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                aria-label="Send message"
                className="bg-amber-500 text-black p-2.5 rounded-xl border border-[var(--theme-text)] shadow-[2px_2px_0_0_var(--theme-text)] hover:bg-amber-400 active:translate-y-0.5 active:shadow-none transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
