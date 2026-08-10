import { motion, AnimatePresence } from 'motion/react';
import { CartItem } from '../types';
import { X, Trash2, Plus, Minus, ShoppingBag, Phone, ArrowRight, Sparkles } from 'lucide-react';
import { BRAND_CONFIG } from '../theme/tokens';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (dishId: string, quantity: number) => void;
  onRemoveItem: (dishId: string) => void;
  onClearCart: () => void;
  onCheckout: () => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckout,
}: CartDrawerProps) {
  const subtotal = cart.reduce((acc, item) => acc + item.dish.price * item.quantity, 0);
  const deliveryFee = subtotal > 0 ? (subtotal > 800 ? 0 : 40) : 0;
  const taxes = Math.round(subtotal * 0.05);
  const grandTotal = subtotal + deliveryFee + taxes;

  const handleWhatsAppOrder = () => {
    if (cart.length === 0) return;

    let itemsText = cart
      .map(
        (item) =>
          `• ${item.quantity}x ${item.dish.name} (₹${item.dish.price * item.quantity})${
            item.customNotes ? ` [Note: ${item.customNotes}]` : ''
          }`
      )
      .join('\n');

    const message = `Hi ${BRAND_CONFIG.name}! I'd like to place an order:\n\n${itemsText}\n\nSubtotal: ₹${subtotal}\nDelivery: ${
      deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`
    }\nGST (5%): ₹${taxes}\n*Grand Total: ₹${grandTotal}*\n\nPlease confirm preparation and estimated dispatch time. Thank you!`;

    window.open(`https://wa.me/${BRAND_CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Drawer Container */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="w-full max-w-md h-full bg-[var(--theme-bg)] border-l border-amber-500/30 p-6 flex flex-col justify-between shadow-2xl relative z-10 overflow-y-auto text-[var(--theme-text)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-amber-500/20">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-serif font-bold text-lg text-[var(--theme-text)]">Your Gourmet Cart</h2>
                  <span className="text-xs text-amber-400 font-semibold">{cart.length} unique creations</span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-[var(--theme-surface)] text-[var(--theme-text-muted)] flex items-center justify-center hover:bg-amber-400 hover:text-stone-950 transition-colors"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-3">
              <AnimatePresence>
                {cart.length > 0 ? (
                  cart.map((item) => (
                    <motion.div
                      key={item.dish.id}
                      layout
                      initial={{ opacity: 0, x: 20, scale: 0.95 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: -20, scale: 0.9 }}
                      transition={{ type: 'spring', damping: 22, stiffness: 200 }}
                      className="glass-panel p-3.5 rounded-2xl border border-amber-500/20 hover:border-amber-500/50 transition-colors flex items-center gap-3 relative group bg-[var(--theme-surface)]"
                    >
                      <img loading="lazy"
                        src={item.dish.image}
                        alt={item.dish.name}
                        className="w-16 h-16 rounded-xl object-cover border border-amber-500/20 group-hover:scale-105 transition-transform"
                      />

                      <div className="flex-1 flex flex-col gap-1">
                        <div className="flex items-start justify-between pr-6">
                          <h4 className="font-serif font-bold text-xs text-[var(--theme-text)] leading-tight">
                            {item.dish.name}
                          </h4>
                        </div>

                        <span className="text-amber-400 font-extrabold text-xs">
                          ₹{item.dish.price * item.quantity}
                        </span>

                        {item.customNotes && (
                          <span className="text-[10px] text-[var(--theme-text-subtle)] italic">"{item.customNotes}"</span>
                        )}

                        {/* Quantity controls */}
                        <div className="flex items-center gap-3 pt-1">
                          <div className="flex items-center gap-2 bg-[var(--theme-bg)] rounded-lg p-1 border border-amber-500/20">
                            <motion.button
                              whileTap={{ scale: 0.8 }}
                              onClick={() => onUpdateQuantity(item.dish.id, item.quantity - 1)}
                              className="w-5 h-5 rounded bg-var(--theme-bg-surface-elevated) hover:bg-amber-500/20 text-[var(--theme-text)] flex items-center justify-center text-xs font-bold"
                            >
                              <Minus className="w-3 h-3" />
                            </motion.button>
                            <span className="text-xs font-bold text-amber-300 px-1">{item.quantity}</span>
                            <motion.button
                              whileTap={{ scale: 0.8 }}
                              onClick={() => onUpdateQuantity(item.dish.id, item.quantity + 1)}
                              className="w-5 h-5 rounded bg-var(--theme-bg-surface-elevated) hover:bg-amber-500/20 text-[var(--theme-text)] flex items-center justify-center text-xs font-bold"
                            >
                              <Plus className="w-3 h-3" />
                            </motion.button>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => onRemoveItem(item.dish.id)}
                        className="absolute top-3 right-3 text-[var(--theme-text-subtle)] hover:text-red-400 p-1 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center h-full text-center gap-3 text-[var(--theme-text-subtle)] py-16"
                  >
                    <div className="p-4 rounded-full bg-[var(--theme-surface)] border border-amber-500/20 text-[var(--theme-text-subtle)]">
                      <ShoppingBag className="w-10 h-10" />
                    </div>
                    <p className="text-sm font-medium text-[var(--theme-text-muted)]">Your gourmet order list is empty.</p>
                    <button
                      onClick={onClose}
                      className="text-xs font-bold text-amber-400 underline hover:text-amber-300"
                    >
                      Browse Fresh Menu Selections
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer Checkout Summary */}
            {cart.length > 0 && (
              <div className="pt-4 border-t border-amber-500/20 flex flex-col gap-3">
                <div className="flex flex-col gap-1.5 text-xs text-[var(--theme-text-muted)] bg-[var(--theme-surface)] p-3.5 rounded-2xl border border-amber-500/20">
                  <div className="flex justify-between">
                    <span>Items Subtotal</span>
                    <span className="text-[var(--theme-text)] font-semibold">₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Express Thermal Delivery</span>
                    <span className="text-emerald-400 font-semibold">
                      {deliveryFee === 0 ? 'FREE (Above ₹800)' : `₹${deliveryFee}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST (5%)</span>
                    <span className="text-[var(--theme-text)] font-semibold">₹{taxes}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-[var(--theme-text)] pt-2 border-t border-amber-500/20">
                    <span>Grand Total</span>
                    <span className="font-serif text-lg text-amber-400">₹{grandTotal}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 pt-1">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleWhatsAppOrder}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-500 hover:from-emerald-400 hover:to-emerald-300 text-stone-950 font-black text-sm py-3.5 rounded-2xl shadow-xl transition-all"
                  >
                    <Phone className="w-4 h-4 fill-stone-950" />
                    <span>Order via WhatsApp Direct</span>
                  </motion.button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
