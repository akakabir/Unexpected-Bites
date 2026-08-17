import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Activity, Layers, ShieldCheck, Sparkles } from 'lucide-react';
import AdminAnalytics from './AdminAnalytics';
import { BrandConfig, Dish, PageTab } from '../types';
import { trackAnalyticsEvent } from '../utils/analyticsTracker';

interface AnalyticsPageProps {
  brandConfig: BrandConfig;
  dishes: Dish[];
  onNavigate: (page: PageTab, category?: string) => void;
}

export default function AnalyticsPage({ brandConfig, dishes, onNavigate }: AnalyticsPageProps) {
  useEffect(() => {
    trackAnalyticsEvent('pageview', '/analytics');
  }, []);

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-sans pt-28 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Atmosphere Glows */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-full max-w-5xl h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-96 right-10 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        {/* Navigation Breadcrumb / Top Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-800/80">
          <button
            onClick={() => onNavigate('home')}
            className="inline-flex items-center gap-2 text-xs font-bold text-stone-400 hover:text-amber-400 transition-colors cursor-pointer bg-stone-900/80 border border-stone-800 px-3.5 py-1.5 rounded-full backdrop-blur-md"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Main Website</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('status')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-400 hover:text-emerald-400 bg-stone-900/80 border border-stone-800 px-3.5 py-1.5 rounded-full transition-colors cursor-pointer"
            >
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>System Status</span>
            </button>

            <a
              href="/admin"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-400 hover:text-amber-400 bg-stone-900/80 border border-stone-800 px-3.5 py-1.5 rounded-full transition-colors cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>Admin Studio</span>
            </a>
          </div>
        </div>

        {/* Render the full analytics suite */}
        <AdminAnalytics dishes={dishes} />
      </div>
    </div>
  );
}
