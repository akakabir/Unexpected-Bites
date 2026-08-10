import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, X, Video, Type, Phone, Tag, Check, Sparkles, RefreshCw } from 'lucide-react';
import { BrandConfig } from '../types';

interface PlaceholderEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  brandConfig: BrandConfig;
  onUpdateBrandConfig: (updated: BrandConfig) => void;
  onResetToDefaults: () => void;
}

export default function PlaceholderEditorModal({
  isOpen,
  onClose,
  brandConfig,
  onUpdateBrandConfig,
  onResetToDefaults,
}: PlaceholderEditorModalProps) {
  const [formData, setFormData] = useState<BrandConfig>(brandConfig);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    onUpdateBrandConfig(formData);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 280 }}
            className="relative w-full max-w-xl bg-[var(--theme-surface)] border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 text-[var(--theme-text)] max-h-[90vh] overflow-y-auto"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 text-[var(--theme-text-subtle)] hover:text-[var(--theme-text)] rounded-full hover:bg-[var(--theme-surface)] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-6 border-b border-stone-800 pb-4">
              <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30">
                <Settings className="w-6 h-6 animate-spin-slow" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>CUSTOMIZATION SUITE</span>
                </div>
                <h3 className="text-xl font-serif font-bold text-[var(--theme-text)]">
                  Live Brand & Video Placeholder Editor
                </h3>
              </div>
            </div>

            <p className="text-[var(--theme-text-muted)] text-xs mb-6 leading-relaxed bg-[var(--theme-surface-elevated)]/80 p-3.5 rounded-xl border border-stone-800">
              Customize text placeholders, brand identity, and video URLs directly. All changes update instantly on screen and persist in local memory.
            </p>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Brand Name */}
              <div>
                <label className="block text-xs font-bold text-[var(--theme-text-muted)] mb-1.5 flex items-center gap-1.5">
                  <Type className="w-4 h-4 text-amber-400" />
                  <span>Brand Name Placeholder:</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. [YOUR BRAND NAME]"
                  className="w-full bg-[var(--theme-surface-elevated)] border border-stone-700 focus:border-amber-400 rounded-xl px-4 py-2.5 text-sm text-[var(--theme-text)] outline-none transition-colors"
                  required
                />
              </div>

              {/* Tagline */}
              <div>
                <label className="block text-xs font-bold text-[var(--theme-text-muted)] mb-1.5 flex items-center gap-1.5">
                  <Type className="w-4 h-4 text-amber-400" />
                  <span>Hero Tagline Placeholder:</span>
                </label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  placeholder="e.g. Artisanal Wok-Tossed Bowls & Pan-Seared Delights"
                  className="w-full bg-[var(--theme-surface-elevated)] border border-stone-700 focus:border-amber-400 rounded-xl px-4 py-2.5 text-sm text-[var(--theme-text)] outline-none transition-colors"
                  required
                />
              </div>

              {/* Hero Video URL */}
              <div>
                <label className="block text-xs font-bold text-[var(--theme-text-muted)] mb-1.5 flex items-center gap-1.5">
                  <Video className="w-4 h-4 text-amber-400" />
                  <span>Hero Video Stream / MP4 URL:</span>
                </label>
                <input
                  type="url"
                  value={formData.heroVideoUrl}
                  onChange={(e) => setFormData({ ...formData, heroVideoUrl: e.target.value })}
                  placeholder="https://.../video.mp4"
                  className="w-full bg-[var(--theme-surface-elevated)] border border-stone-700 focus:border-amber-400 rounded-xl px-4 py-2.5 text-sm text-[var(--theme-text)] outline-none transition-colors"
                  required
                />
                <span className="text-[11px] text-[var(--theme-text-subtle)] block mt-1">
                  Default shows live stir-fry wok video with carrots, peas, and soy sauce sizzle.
                </span>
              </div>

              {/* Special Offer Banner */}
              <div>
                <label className="block text-xs font-bold text-[var(--theme-text-muted)] mb-1.5 flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-amber-400" />
                  <span>Soft Launch Offer Banner:</span>
                </label>
                <input
                  type="text"
                  value={formData.specialOfferText}
                  onChange={(e) => setFormData({ ...formData, specialOfferText: e.target.value })}
                  placeholder="e.g. 🚀 SOFT LAUNCH: 20% OFF FIRST 100 PATRONS"
                  className="w-full bg-[var(--theme-surface-elevated)] border border-stone-700 focus:border-amber-400 rounded-xl px-4 py-2.5 text-sm text-[var(--theme-text)] outline-none transition-colors"
                />
              </div>

              {/* Contact Phone / WhatsApp */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--theme-text-muted)] mb-1.5 flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-amber-400" />
                    <span>WhatsApp / Contact Phone:</span>
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-[var(--theme-surface-elevated)] border border-stone-700 focus:border-amber-400 rounded-xl px-4 py-2.5 text-sm text-[var(--theme-text)] outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--theme-text-muted)] mb-1.5">
                    Estimated Delivery SLA:
                  </label>
                  <input
                    type="text"
                    value={formData.avgPrepTime}
                    onChange={(e) => setFormData({ ...formData, avgPrepTime: e.target.value })}
                    placeholder="18-22 Mins"
                    className="w-full bg-[var(--theme-surface-elevated)] border border-stone-700 focus:border-amber-400 rounded-xl px-4 py-2.5 text-sm text-[var(--theme-text)] outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-stone-800 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    onResetToDefaults();
                    onClose();
                  }}
                  className="text-xs text-[var(--theme-text-subtle)] hover:text-rose-400 flex items-center gap-1.5 py-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset All Placeholders</span>
                </button>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 sm:flex-initial px-5 py-2.5 bg-[var(--theme-surface)] hover:bg-stone-700 text-[var(--theme-text-muted)] rounded-xl text-xs font-bold transition-colors"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="flex-1 sm:flex-initial px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
                  >
                    {savedSuccess ? (
                      <>
                        <Check className="w-4 h-4 text-stone-950" />
                        <span>Saved Live!</span>
                      </>
                    ) : (
                      <span>Apply Changes</span>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
