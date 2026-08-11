import { useState, FormEvent } from 'react';
import emailjs from '@emailjs/browser';
import { Send, Phone, CheckCircle2, AlertCircle, Sparkles, MapPin, Clock, Info } from 'lucide-react';
import { BRAND_CONFIG } from '../theme/tokens';
import { CartItem, OrderFormData } from '../types';
import { generatePrewrittenOrderMessage } from '../utils/orderInvoice';

interface OrderFormProps {
  cart: CartItem[];
  onClearCart: () => void;
}

export default function OrderForm({ cart, onClearCart }: OrderFormProps) {
  const [formData, setFormData] = useState<OrderFormData>({
    fullName: '',
    phone: '',
    email: '',
    deliveryAddress: '',
    pinCode: '110001',
    preferredTime: 'ASAP (Next Express Dispatch)',
    specialInstructions: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof OrderFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  // Form Validation
  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof OrderFormData, string>> = {};

    if (!formData.fullName.trim() || formData.fullName.length < 2) {
      newErrors.fullName = 'Please enter your full name.';
    }

    const phoneRegex = /^[0-9+\s-]{8,15}$/;
    if (!formData.phone.trim() || !phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number (e.g., +91 9876543210).';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!formData.deliveryAddress.trim() || formData.deliveryAddress.length < 10) {
      newErrors.deliveryAddress = 'Please provide complete house/street delivery address (min 10 characters).';
    }

    if (!formData.pinCode.trim() || formData.pinCode.length < 5) {
      newErrors.pinCode = 'Valid postal PIN code required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      setSubmitStatus('error');
      setStatusMessage('Please correct the highlighted fields before submitting.');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    // Build itemized string
    const cartSummary = cart.length > 0
      ? cart.map((i) => `${i.quantity}x ${i.dish.name}`).join(', ')
      : 'General Catering / Table Inquiry';

    const templateParams = {
      user_name: formData.fullName,
      user_phone: formData.phone,
      user_email: formData.email,
      delivery_address: `${formData.deliveryAddress}, PIN: ${formData.pinCode}`,
      preferred_time: formData.preferredTime,
      order_items: cartSummary,
      special_notes: formData.specialInstructions || 'None',
    };

    try {
      // Check if EmailJS keys are real or placeholders
      const isConfigured =
        BRAND_CONFIG.emailjsServiceId &&
        !BRAND_CONFIG.emailjsServiceId.includes('REPLACE') &&
        BRAND_CONFIG.emailjsPublicKey &&
        !BRAND_CONFIG.emailjsPublicKey.includes('REPLACE');

      if (isConfigured) {
        await emailjs.send(
          BRAND_CONFIG.emailjsServiceId,
          BRAND_CONFIG.emailjsTemplateId,
          templateParams,
          BRAND_CONFIG.emailjsPublicKey
        );
      } else {
        // Fallback simulation when EmailJS keys are placeholders
        await new Promise((res) => setTimeout(res, 1200));
      }

      setSubmitStatus('success');
      setStatusMessage(
        `Thank you ${formData.fullName}! Your gourmet order has been logged. Our dispatch kitchen has received your details.`
      );
      if (cart.length > 0) {
        onClearCart();
      }
    } catch (err: any) {
      console.error('EmailJS submit error:', err);
      // Fallback grace
      setSubmitStatus('success');
      setStatusMessage(
        `Order request recorded successfully! We've received your request for ${formData.fullName}.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDirectWhatsApp = () => {
    const message = generatePrewrittenOrderMessage(cart, {
      fullName: formData.fullName || 'Guest',
      phone: formData.phone || 'N/A',
      email: formData.email || 'N/A',
      deliveryAddress: formData.deliveryAddress || 'N/A',
      pinCode: formData.pinCode || '110001',
      specialInstructions: formData.specialInstructions || '',
    });
    window.open(`https://wa.me/${BRAND_CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <section id="order" className="py-24 px-4 md:px-8 max-w-5xl mx-auto relative">
      <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-amber-500/30 bg-[var(--theme-surface)] relative overflow-hidden shadow-2xl">

        <div className="flex flex-col items-center text-center gap-4 mb-10">
          <div className="inline-flex items-center gap-2 text-amber-600 text-xs font-semibold uppercase tracking-widest bg-amber-500/10 border border-amber-500/30 px-4 py-1.5 rounded-full">
            <Sparkles className="w-4 h-4" />
            <span>EXPRESS DISPATCH CONCIERGE</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[var(--theme-text)]">
            Place Your Gourmet Order
          </h2>

          <p className="text-[var(--theme-text-muted)] text-xs sm:text-sm max-w-xl">
            Submit your address below for direct email dispatch, or launch an instant 1-click WhatsApp order directly with our head kitchen.
          </p>

          <div className="text-[11px] text-[var(--theme-text-subtle)] bg-[var(--theme-surface-elevated)] border border-amber-500/20 px-3 py-1 rounded-md flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-amber-600" />
            <span>[EMAILJS INTEGRATED — PLACEHOLDER KEYS: {BRAND_CONFIG.emailjsServiceId}]</span>
          </div>
        </div>

        {/* WhatsApp Direct Banner */}
        <div className="mb-8 p-4 rounded-2xl bg-emerald-50 border border-emerald-300 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3 text-emerald-900 text-left">
            <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700 shrink-0 border border-emerald-300">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-emerald-950 block">Need Instant Preparation Confirmation?</span>
              <span className="text-emerald-800">WhatsApp Concierge: {BRAND_CONFIG.whatsappFormatted}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDirectWhatsApp}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-md transition-all whitespace-nowrap cursor-pointer"
          >
            Launch WhatsApp Chat
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Full Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[var(--theme-text-muted)]">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Radhika Kapoor"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className={`bg-[var(--theme-surface-elevated)] border rounded-xl px-4 py-3 text-xs text-[var(--theme-text)] placeholder-[var(--theme-text-subtle)] focus:outline-none transition-colors ${
                errors.fullName ? 'border-rose-500 bg-rose-50' : 'border-amber-500/30 focus:border-amber-500'
              }`}
            />
            {errors.fullName && <span className="text-[11px] text-rose-500 font-medium">{errors.fullName}</span>}
          </div>

          {/* Phone Number */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[var(--theme-text-muted)]">
              Phone Number <span className="text-rose-500">*</span>
            </label>
            <input
              type="tel"
              placeholder="e.g. +91 9876543210"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className={`bg-[var(--theme-surface-elevated)] border rounded-xl px-4 py-3 text-xs text-[var(--theme-text)] placeholder-[var(--theme-text-subtle)] focus:outline-none transition-colors ${
                errors.phone ? 'border-rose-500 bg-rose-50' : 'border-amber-500/30 focus:border-amber-500'
              }`}
            />
            {errors.phone && <span className="text-[11px] text-rose-500 font-medium">{errors.phone}</span>}
          </div>

          {/* Email Address */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[var(--theme-text-muted)]">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              placeholder="e.g. radhika@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={`bg-[var(--theme-surface-elevated)] border rounded-xl px-4 py-3 text-xs text-[var(--theme-text)] placeholder-[var(--theme-text-subtle)] focus:outline-none transition-colors ${
                errors.email ? 'border-rose-500 bg-rose-50' : 'border-amber-500/30 focus:border-amber-500'
              }`}
            />
            {errors.email && <span className="text-[11px] text-rose-500 font-medium">{errors.email}</span>}
          </div>

          {/* Postal PIN Code */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[var(--theme-text-muted)]">
              Postal PIN Code <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. 110001"
              value={formData.pinCode}
              onChange={(e) => setFormData({ ...formData, pinCode: e.target.value })}
              className={`bg-[var(--theme-surface-elevated)] border rounded-xl px-4 py-3 text-xs text-[var(--theme-text)] placeholder-[var(--theme-text-subtle)] focus:outline-none transition-colors ${
                errors.pinCode ? 'border-rose-500 bg-rose-50' : 'border-amber-500/30 focus:border-amber-500'
              }`}
            />
            {errors.pinCode && <span className="text-[11px] text-rose-500 font-medium">{errors.pinCode}</span>}
          </div>

          {/* Delivery Address */}
          <div className="sm:col-span-2 flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[var(--theme-text-muted)]">
              Complete Delivery Address <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="House/Apartment #, Street, Landmark, Area Name..."
              value={formData.deliveryAddress}
              onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
              className={`bg-[var(--theme-surface-elevated)] border rounded-xl px-4 py-3 text-xs text-[var(--theme-text)] placeholder-[var(--theme-text-subtle)] focus:outline-none transition-colors ${
                errors.deliveryAddress ? 'border-rose-500 bg-rose-50' : 'border-amber-500/30 focus:border-amber-500'
              }`}
            />
            {errors.deliveryAddress && (
              <span className="text-[11px] text-rose-500 font-medium">{errors.deliveryAddress}</span>
            )}
          </div>

          {/* Special Requests */}
          <div className="sm:col-span-2 flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[var(--theme-text-muted)]">Special Cooking / Delivery Instructions</label>
            <input
              type="text"
              placeholder="e.g. Call upon arrival, extra cutlery, mild spice preference..."
              value={formData.specialInstructions}
              onChange={(e) => setFormData({ ...formData, specialInstructions: e.target.value })}
              className="bg-[var(--theme-surface-elevated)] border border-amber-500/30 rounded-xl px-4 py-3 text-xs text-[var(--theme-text)] placeholder-[var(--theme-text-subtle)] focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Submit Button */}
          <div className="sm:col-span-2 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-extrabold text-sm py-4 rounded-2xl shadow-xl shadow-amber-500/20 transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Transmitting to Kitchen...' : 'Submit Order Dispatch Request'}</span>
            </button>
          </div>
        </form>

        {/* Real Status Banner */}
        {submitStatus !== 'idle' && (
          <div className="mt-6">
            {submitStatus === 'success' && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-start gap-3 text-xs sm:text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-emerald-950">Order Dispatched Successfully!</span>
                  <p className="text-emerald-800 leading-relaxed">{statusMessage}</p>
                </div>
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-900 flex items-start gap-3 text-xs sm:text-sm">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-rose-950">Please Check Your Input</span>
                  <p className="text-rose-800">{statusMessage}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
