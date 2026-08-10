import { BrandConfig } from '../types';
import { Phone, Mail, MapPin, Clock, Heart, ShieldCheck, Flame } from 'lucide-react';
import { motion } from 'motion/react';

interface FooterProps {
  brandConfig: BrandConfig;
}

export default function Footer({ brandConfig }: FooterProps) {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6 }}
      className="bg-[var(--theme-bg)] border-t border-amber-500/20 text-[var(--theme-text-muted)] text-xs py-16 px-4 md:px-8"
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Brand Column */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2.5">
            <img
              src="/images/unexpected-bites-logo.png"
              alt="Unexpected Bites"
              className="w-8 h-8 rounded-full object-cover"
            />
            <span className="font-serif font-bold text-lg text-[var(--theme-text)]">{brandConfig.name}</span>
          </div>
          <p className="text-[var(--theme-text-muted)] leading-relaxed text-xs">
            {brandConfig.tagline}
          </p>
          <div className="flex items-center gap-2 text-[var(--theme-text)] font-medium">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>Open Daily: 12:00 PM — 12:00 AM</span>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex flex-col gap-3">
          <h4 className="font-serif font-bold text-[var(--theme-text)] text-sm">Navigation</h4>
          <a href="#home" className="hover:text-amber-400 transition-colors">Home</a>
          <a href="#menu" className="hover:text-amber-400 transition-colors">Gourmet Menu</a>
          <a
            href={`https://wa.me/${brandConfig.whatsappNumber}?text=${encodeURIComponent('Hi! I would like to place an order.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors"
          >
            WhatsApp Direct Order
          </a>
        </div>

        {/* Contact Info */}
        <div className="flex flex-col gap-3">
          <h4 className="font-serif font-bold text-[var(--theme-text)] text-sm">Direct Order Helpline</h4>
          <div className="flex items-center gap-2 text-[var(--theme-text-muted)]">
            <Phone className="w-4 h-4 text-amber-400" />
            <span>{brandConfig.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-[var(--theme-text-muted)]">
            <Mail className="w-4 h-4 text-amber-400" />
            <span>{brandConfig.email}</span>
          </div>
          <div className="flex items-center gap-2 text-[var(--theme-text-muted)]">
            <MapPin className="w-4 h-4 text-amber-400" />
            <span>{brandConfig.deliveryArea}</span>
          </div>
        </div>

        {/* Kitchen Status Column */}
        <div className="flex flex-col gap-3">
          <h4 className="font-serif font-bold text-[var(--theme-text)] text-sm">Kitchen Standards</h4>
          <p className="text-[var(--theme-text-muted)] text-xs leading-relaxed">
            Every burger and dessert is prepared fresh to order and dispatched in double tamper-evident thermal retention containers.
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="bg-[var(--theme-surface)] border border-amber-500/30 text-amber-400 font-bold px-3 py-1 rounded-lg flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              65°C Thermal Sealed
            </span>
            <span className="bg-[var(--theme-surface)] border border-emerald-500/30 text-emerald-400 font-bold px-3 py-1 rounded-lg">
              20-Min SLA Zone
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-amber-500/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[var(--theme-text-subtle)] text-[11px]">
        <span>© {new Date().getFullYear()} {brandConfig.name}. All rights reserved.</span>
        <span className="flex items-center gap-1">
          Crafted with <Heart className="w-3 h-3 text-red-500 fill-red-500 inline" /> for artisanal burger & feast lovers.
        </span>
      </div>
    </motion.footer>
  );
}
