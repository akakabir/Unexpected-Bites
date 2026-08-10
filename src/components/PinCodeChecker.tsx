import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, CheckCircle2, Clock, AlertCircle, Sparkles } from 'lucide-react';
import { SERVICE_PIN_CODES } from '../theme/tokens';

export default function PinCodeChecker() {
  const [pinInput, setPinInput] = useState('');
  const [result, setResult] = useState<{
    found: boolean;
    area?: string;
    estimatedMin?: number;
    message?: string;
  } | null>(null);

  const handleCheckPin = (e: FormEvent) => {
    e.preventDefault();
    const cleaned = pinInput.trim();
    if (!cleaned || cleaned.length < 5) {
      setResult({
        found: false,
        message: 'Please enter a valid 6-digit PIN code.',
      });
      return;
    }

    const match = SERVICE_PIN_CODES.find((item) => item.pin === cleaned);
    if (match) {
      setResult({
        found: true,
        area: match.area,
        estimatedMin: match.estimatedMin,
      });
    } else {
      setResult({
        found: false,
        message: `PIN Code ${cleaned} is outside our 20-min express zone, but standard delivery is available via WhatsApp concierge!`,
      });
    }
  };

  return (
    <section id="pincode" className="py-20 px-4 md:px-8 max-w-5xl mx-auto relative">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        whileInView={{ opacity: 1, scale: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6, type: "spring", damping: 20 }}
        className="glass-panel p-8 sm:p-12 rounded-3xl border border-amber-500/30 bg-[var(--theme-surface)] relative overflow-hidden shadow-2xl"
      >
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col items-center text-center gap-4 max-w-2xl mx-auto relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-600 border border-amber-500/30 flex items-center justify-center shadow-lg">
            <MapPin className="w-6 h-6" />
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[var(--theme-text)]">
            Check Express Delivery SLA
          </h2>

          <p className="text-[var(--theme-text-muted)] text-xs sm:text-sm">
            Enter your 6-digit postal PIN code to verify hyper-local 20-minute thermal dispatch eligibility.
          </p>

          {/* Form */}
          <form onSubmit={handleCheckPin} className="w-full flex flex-col sm:flex-row items-center gap-3 pt-4">
            <div className="relative w-full">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-500" />
              <input
                type="text"
                placeholder="e.g. 110001, 110016, 110024..."
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                maxLength={6}
                className="w-full bg-[var(--theme-surface-elevated)] border border-amber-500/30 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-[var(--theme-text)] placeholder-[var(--theme-text-subtle)] focus:outline-none focus:border-amber-500 transition-colors font-mono tracking-wider shadow-inner"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-extrabold text-sm px-8 py-3.5 rounded-2xl transition-all shadow-lg shadow-amber-500/25 whitespace-nowrap cursor-pointer"
            >
              Check Coverage
            </motion.button>
          </form>

          {/* Sample Valid PINs Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-[11px] text-[var(--theme-text-subtle)]">
            <span className="text-[var(--theme-text-muted)]">Popular hubs:</span>
            {SERVICE_PIN_CODES.slice(0, 4).map((p) => (
              <motion.button
                key={p.pin}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => {
                  setPinInput(p.pin);
                  setResult({ found: true, area: p.area, estimatedMin: p.estimatedMin });
                }}
                className="bg-[var(--theme-surface-elevated)] hover:bg-[var(--theme-bg)] text-[var(--theme-text)] px-3 py-1 rounded-xl border border-amber-500/30 transition-colors font-mono font-semibold cursor-pointer"
              >
                {p.pin} ({p.area.split('/')[0]})
              </motion.button>
            ))}
          </div>

          {/* Result Alert */}
          <AnimatePresence mode="wait">
            {result && (
              <motion.div
                key={result.area || result.message}
                initial={{ opacity: 0, scale: 0.9, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -10 }}
                transition={{ type: "spring", damping: 20, stiffness: 220 }}
                className="w-full mt-4"
              >
                {result.found ? (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center justify-between text-xs sm:text-sm shadow-xl">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <div className="text-left">
                        <span className="font-bold block text-emerald-950">Express Delivery Available!</span>
                        <span>Service Area: <strong>{result.area}</strong></span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 bg-emerald-100 px-3 py-1.5 rounded-xl font-bold text-emerald-800 border border-emerald-300">
                      <Clock className="w-4 h-4" />
                      <span>~{result.estimatedMin} Mins SLA</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 flex items-center gap-3 text-xs sm:text-sm text-left shadow-xl">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                    <span>{result.message}</span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </section>
  );
}
