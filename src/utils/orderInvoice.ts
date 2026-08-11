import { CartItem } from '../types';
import { BRAND_CONFIG } from '../theme/tokens';

export const DEVICE_DISCOUNT_USED_KEY = 'ub_device_discount_used_v1';
export const DEVICE_DISCOUNT_ACTIVE_KEY = 'ub_device_discount_active_v1';

export interface CustomerDetails {
  fullName?: string;
  phone?: string;
  email?: string;
  deliveryAddress?: string;
  pinCode?: string;
  specialInstructions?: string;
}

export interface InvoiceTotals {
  subtotal: number;
  deliveryFee: number;
  taxes: number;
  discountAmount: number;
  grandTotal: number;
  hasDiscountApplied: boolean;
}

/**
 * Checks if the current device has already claimed the 1-time ₹10 discount.
 */
export function checkDeviceDiscountStatus(): {
  hasUsedDeviceDiscount: boolean;
  isDiscountActive: boolean;
} {
  try {
    const hasUsed = localStorage.getItem(DEVICE_DISCOUNT_USED_KEY) === 'true';
    const isActive = localStorage.getItem(DEVICE_DISCOUNT_ACTIVE_KEY) === 'true';
    return {
      hasUsedDeviceDiscount: hasUsed,
      isDiscountActive: isActive && hasUsed,
    };
  } catch {
    return { hasUsedDeviceDiscount: false, isDiscountActive: false };
  }
}

/**
 * Attempts to apply the 1-time ₹10 device discount.
 */
export function redeemDeviceDiscount(): {
  success: boolean;
  alreadyUsed: boolean;
  discountAmount: number;
  message: string;
} {
  try {
    const hasUsed = localStorage.getItem(DEVICE_DISCOUNT_USED_KEY) === 'true';
    if (hasUsed) {
      return {
        success: false,
        alreadyUsed: true,
        discountAmount: 0,
        message: 'This ₹10 discount has already been redeemed on this device.',
      };
    }

    localStorage.setItem(DEVICE_DISCOUNT_USED_KEY, 'true');
    localStorage.setItem(DEVICE_DISCOUNT_ACTIVE_KEY, 'true');

    // Dispatch event so all components react immediately
    window.dispatchEvent(new CustomEvent('ub_discount_changed'));

    return {
      success: true,
      alreadyUsed: false,
      discountAmount: 10,
      message: '₹10 Discount applied successfully!',
    };
  } catch {
    return {
      success: false,
      alreadyUsed: false,
      discountAmount: 0,
      message: 'Unable to access local storage.',
    };
  }
}

/**
 * Calculates complete itemized invoice breakdown including ₹10 discount if active.
 */
export function calculateInvoice(cart: CartItem[], forceDiscountActive?: boolean): InvoiceTotals {
  const subtotal = cart.reduce((acc, item) => acc + item.dish.price * item.quantity, 0);
  const deliveryFee = subtotal > 0 ? (subtotal > 800 ? 0 : 40) : 0;
  const taxes = Math.round(subtotal * 0.05);

  const { isDiscountActive } = checkDeviceDiscountStatus();
  const hasDiscountApplied = forceDiscountActive ?? isDiscountActive;
  
  // ₹10 discount applied to subtotal (capped at subtotal if subtotal < 10)
  const discountAmount = (hasDiscountApplied && subtotal > 0) ? Math.min(10, subtotal) : 0;
  const grandTotal = Math.max(0, subtotal + deliveryFee + taxes - discountAmount);

  return {
    subtotal,
    deliveryFee,
    taxes,
    discountAmount,
    grandTotal,
    hasDiscountApplied: discountAmount > 0,
  };
}

/**
 * Formats a clean, professional prewritten WhatsApp message containing order items & itemized invoice.
 */
export function generatePrewrittenOrderMessage(
  cart: CartItem[],
  customerDetails?: CustomerDetails,
  forceDiscountActive?: boolean
): string {
  const invoice = calculateInvoice(cart, forceDiscountActive);

  if (cart.length === 0) {
    let msg = `Hi ${BRAND_CONFIG.name}! 👋 I'd like to place a direct gourmet order.\n\n`;
    msg += `🧾 *DIRECT ORDER & INVOICE INQUIRY*\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    if (customerDetails?.fullName) msg += `👤 Customer: ${customerDetails.fullName}\n`;
    if (customerDetails?.phone) msg += `📞 Phone: ${customerDetails.phone}\n`;
    if (customerDetails?.deliveryAddress) msg += `📍 Address: ${customerDetails.deliveryAddress}\n`;
    if (customerDetails?.pinCode) msg += `📮 PIN Code: ${customerDetails.pinCode}\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `Please share your current chef specials or help me customize an order!`;
    return msg;
  }

  const dateStr = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  let itemsText = cart
    .map(
      (item, idx) =>
        `${idx + 1}. *${item.quantity}x ${item.dish.name}* (₹${item.dish.price * item.quantity})${
          item.customNotes ? `\n   └ Note: ${item.customNotes}` : ''
        }`
    )
    .join('\n');

  let text = `Hi ${BRAND_CONFIG.name}! 👋 I'd like to place a direct order:\n\n`;
  text += `🧾 *INVOICE / RECEIPT SUMMARY*\n`;
  text += `📅 Date: ${dateStr}\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
  text += `*ITEMS ORDERED:*\n${itemsText}\n\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `*ITEMIZED INVOICE Breakdown:*\n`;
  text += `• Subtotal: ₹${invoice.subtotal}\n`;
  text += `• Delivery Fee: ${invoice.deliveryFee === 0 ? 'FREE (Over ₹800)' : `₹${invoice.deliveryFee}`}\n`;
  text += `• GST & Packaging (5%): ₹${invoice.taxes}\n`;
  
  if (invoice.hasDiscountApplied) {
    text += `• AI Voucher Discount (BITES10): -₹${invoice.discountAmount} (Applied)\n`;
  }
  
  text += `\n*👉 GRAND TOTAL PAYABLE: ₹${invoice.grandTotal}*\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

  if (customerDetails && (customerDetails.fullName || customerDetails.phone || customerDetails.deliveryAddress)) {
    text += `*CUSTOMER & DELIVERY DETAILS:*\n`;
    if (customerDetails.fullName) text += `👤 Name: ${customerDetails.fullName}\n`;
    if (customerDetails.phone) text += `📞 Phone: ${customerDetails.phone}\n`;
    if (customerDetails.email) text += `✉️ Email: ${customerDetails.email}\n`;
    if (customerDetails.deliveryAddress) text += `📍 Address: ${customerDetails.deliveryAddress}\n`;
    if (customerDetails.pinCode) text += `📮 PIN: ${customerDetails.pinCode}\n`;
    if (customerDetails.specialInstructions) text += `📝 Note: ${customerDetails.specialInstructions}\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
  }

  text += `Please confirm kitchen preparation & estimated dispatch time. Thank you!`;
  return text;
}
