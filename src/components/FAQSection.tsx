import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FAQS } from '../data/kitchenData';
import { ChevronDown, HelpCircle, Sparkles } from 'lucide-react';

export default function FAQSection() {
  const [openId, setOpenId] = useState<string | null>(FAQS[0].id);

  const toggle = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section id="faq" className="py-20 px-4 md:px-8 max-w-4xl mx-auto relative">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center text-center gap-4 mb-12"
      >
        <div className="inline-flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-widest bg-amber-500/10 border border-amber-500/20 px-4 py-1.5 rounded-full shadow-lg">
          <Sparkles className="w-4 h-4" />
          <span>GOT QUESTIONS?</span>
        </div>

        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[var(--theme-text)]">
          Frequently Asked Questions
        </h2>
      </motion.div>

      <div className="flex flex-col gap-4">
        {FAQS.map((faq) => {
          const isOpen = openId === faq.id;
          return (
            <motion.div
              key={faq.id}
              layout
              className={`glass-panel rounded-2xl border transition-colors ${
                isOpen ? 'border-amber-500/60 bg-[var(--theme-surface-elevated)]/90 shadow-xl' : 'border-stone-800/80 hover:border-stone-700 bg-[var(--theme-surface-elevated)]/60'
              }`}
            >
              <button
                onClick={() => toggle(faq.id)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 focus:outline-none"
              >
                <span className="font-serif font-bold text-base text-[var(--theme-text)] flex items-center gap-2.5">
                  <HelpCircle className="w-4.5 h-4.5 text-amber-400 shrink-0" />
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-[var(--theme-text-subtle)] transition-transform duration-300 shrink-0 ${
                    isOpen ? 'rotate-180 text-amber-400' : ''
                  }`}
                />
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[var(--theme-text-muted)] leading-relaxed border-t border-stone-800/60 pl-11">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
