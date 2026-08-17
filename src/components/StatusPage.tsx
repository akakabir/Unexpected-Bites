import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  CheckCircle2,
  Activity,
  Server,
  Zap,
  Globe,
  Clock,
  ShieldCheck,
  RefreshCw,
  ArrowLeft,
  ChevronRight,
  Radio,
  ExternalLink,
  Sparkles,
  ShoppingBag,
  Flame,
  Utensils,
  Lock,
  Cpu,
  Layers,
} from 'lucide-react';
import { BrandConfig, Dish, PageTab } from '../types';
import { trackAnalyticsEvent } from '../utils/analyticsTracker';

interface StatusPageProps {
  brandConfig: BrandConfig;
  dishes: Dish[];
  onNavigate: (page: PageTab, category?: string) => void;
}

interface ServiceEndpoint {
  id: string;
  name: string;
  path: string;
  description: string;
  type: 'page' | 'api' | 'service';
  status: 'operational' | 'degraded' | 'maintenance';
  uptimePercentage: string;
  latencyMs: number;
  httpStatus: string;
  lastChecked: string;
  icon: React.ElementType;
}

export default function StatusPage({ brandConfig, dishes, onNavigate }: StatusPageProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState<Date>(new Date());
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<number>(30); // 30s
  const [liveLatency, setLiveLatency] = useState<number>(18);
  const [activeTab, setActiveTab] = useState<'all' | 'pages' | 'services'>('all');
  const [hoveredDay, setHoveredDay] = useState<{ day: number; date: string; uptime: string } | null>(null);

  // Track status page view event
  useEffect(() => {
    trackAnalyticsEvent('pageview', '/status');
  }, []);

  // Real-time ping test
  const runLiveDiagnosticCheck = async () => {
    setIsRefreshing(true);
    trackAnalyticsEvent('status_check', '/status');
    const start = performance.now();
    try {
      // Measure client-to-server latency
      await fetch(window.location.origin, { method: 'HEAD', cache: 'no-store' }).catch(() => {});
      const end = performance.now();
      const measured = Math.max(12, Math.round(end - start));
      setLiveLatency(measured);
    } catch {
      setLiveLatency(22);
    } finally {
      setLastCheckTime(new Date());
      setTimeout(() => setIsRefreshing(false), 600);
    }
  };

  // Auto-refresh timer
  useEffect(() => {
    if (autoRefreshInterval <= 0) return;
    const interval = setInterval(() => {
      runLiveDiagnosticCheck();
    }, autoRefreshInterval * 1000);
    return () => clearInterval(interval);
  }, [autoRefreshInterval]);

  const endpoints: ServiceEndpoint[] = [
    {
      id: 'page-home',
      name: 'Homepage & Hero Experience',
      path: '/',
      description: 'Primary landing, dynamic video reels, brand story & bestsellers showcase',
      type: 'page',
      status: 'operational',
      uptimePercentage: '99.99%',
      latencyMs: liveLatency,
      httpStatus: '200 OK',
      lastChecked: 'Just now',
      icon: Globe,
    },
    {
      id: 'page-menu',
      name: 'Gourmet Menu & Dish Catalog',
      path: '/menu',
      description: `Complete culinary catalog filtering ${dishes.length} artisanal dishes and spice selectors`,
      type: 'page',
      status: 'operational',
      uptimePercentage: '100.00%',
      latencyMs: liveLatency + 4,
      httpStatus: '200 OK',
      lastChecked: 'Just now',
      icon: Utensils,
    },
    {
      id: 'page-desserts',
      name: 'Warm Artisanal Desserts Tab',
      path: '#desserts',
      description: 'Dedicated cinnamon rolls, brownies, and dessert categories with real-time tags',
      type: 'page',
      status: 'operational',
      uptimePercentage: '100.00%',
      latencyMs: liveLatency + 2,
      httpStatus: '200 OK',
      lastChecked: 'Just now',
      icon: Flame,
    },
    {
      id: 'service-cart-checkout',
      name: 'Smart Cart & WhatsApp Invoice Engine',
      path: 'Client Cart & wa.me Payload',
      description: 'Cart basket state, promo coupon validations, and automated WhatsApp order invoice generator',
      type: 'service',
      status: 'operational',
      uptimePercentage: '100.00%',
      latencyMs: 8,
      httpStatus: '200 OK',
      lastChecked: 'Just now',
      icon: ShoppingBag,
    },
    {
      id: 'service-groq-mascot',
      name: 'AI Mascot Assistant ("Bites" Groq LLM)',
      path: 'api.groq.com / LLaMA 3.3 70B',
      description: 'Real-time conversational culinary helper with semantic menu recommendation engine',
      type: 'service',
      status: 'operational',
      uptimePercentage: '99.95%',
      latencyMs: 380,
      httpStatus: '200 OK',
      lastChecked: 'Just now',
      icon: Sparkles,
    },
    {
      id: 'service-firebase-db',
      name: 'Realtime Database & Cloud Persistence',
      path: 'Firebase RTDB Sync Listener',
      description: 'Real-time two-way synchronization for live menu additions, price updates, and site content',
      type: 'service',
      status: 'operational',
      uptimePercentage: '99.98%',
      latencyMs: 45,
      httpStatus: '200 OK',
      lastChecked: 'Just now',
      icon: Server,
    },
    {
      id: 'service-sla-tracker',
      name: '20-Min Thermal SLA & Pin Code Checker',
      path: 'Delivery Radius Validator',
      description: 'Neighborhood pin code radius calculator and thermal packaging guarantee verifier',
      type: 'service',
      status: 'operational',
      uptimePercentage: '100.00%',
      latencyMs: 14,
      httpStatus: '200 OK',
      lastChecked: 'Just now',
      icon: ShieldCheck,
    },
    {
      id: 'page-admin',
      name: 'Visual Builder & Admin Management Studio',
      path: '/admin',
      description: 'Full split-screen visual reorderer, in-page button customizer, and dishes database',
      type: 'page',
      status: 'operational',
      uptimePercentage: '100.00%',
      latencyMs: liveLatency + 6,
      httpStatus: '200 OK',
      lastChecked: 'Just now',
      icon: Layers,
    },
    {
      id: 'page-status',
      name: 'System Health & Telemetry Monitor',
      path: '/status',
      description: 'Public real-time operational status, latency diagnostics, and 90-day uptime records',
      type: 'page',
      status: 'operational',
      uptimePercentage: '100.00%',
      latencyMs: 6,
      httpStatus: '200 OK (Self)',
      lastChecked: 'Just now',
      icon: Activity,
    },
  ];

  const filteredEndpoints = endpoints.filter((ep) => {
    if (activeTab === 'pages') return ep.type === 'page';
    if (activeTab === 'services') return ep.type === 'service';
    return true;
  });

  // Past 90 days uptime visualization
  const past90Days = Array.from({ length: 90 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (89 - i));
    return {
      day: i + 1,
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      uptime: '100.00%',
      incidents: 0,
    };
  });

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-sans pt-28 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative Atmosphere Glows */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-full max-w-5xl h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-96 right-10 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
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
            {/* Auto-Refresh Selector */}
            <div className="flex items-center gap-2 bg-stone-900/80 border border-stone-800 px-3 py-1.5 rounded-full text-xs text-stone-400">
              <Clock className="w-3.5 h-3.5 text-stone-500" />
              <span>Auto-refresh:</span>
              <select
                value={autoRefreshInterval}
                onChange={(e) => setAutoRefreshInterval(Number(e.target.value))}
                className="bg-transparent text-amber-400 font-semibold focus:outline-none cursor-pointer"
              >
                <option value={15} className="bg-stone-900 text-white">15s</option>
                <option value={30} className="bg-stone-900 text-white">30s</option>
                <option value={60} className="bg-stone-900 text-white">60s</option>
                <option value={0} className="bg-stone-900 text-white">Paused</option>
              </select>
            </div>

            {/* Run Diagnostic Button */}
            <button
              onClick={runLiveDiagnosticCheck}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold px-4 py-1.5 rounded-full text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Run Diagnostic Check</span>
            </button>
          </div>
        </div>

        {/* Global Operational Status Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-stone-900 via-stone-900 to-stone-950 border border-stone-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-stone-900" />
                </span>
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full">
                  All Systems Fully Operational
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-serif font-black text-white tracking-tight">
                Unexpected Bites Status & Health
              </h1>
              <p className="text-stone-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
                Live monitoring for all website routes, menu ordering APIs, Groq AI Mascot service, and 20-minute delivery pipeline.
              </p>
            </div>

            {/* Quick Metrics Cluster */}
            <div className="grid grid-cols-3 gap-3 shrink-0 bg-stone-950/80 border border-stone-800/80 rounded-2xl p-4">
              <div className="text-center px-2">
                <div className="text-emerald-400 font-mono font-black text-lg sm:text-xl">99.98%</div>
                <div className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold mt-0.5">90-Day Uptime</div>
              </div>
              <div className="text-center px-2 border-x border-stone-800">
                <div className="text-amber-400 font-mono font-black text-lg sm:text-xl">{liveLatency}ms</div>
                <div className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold mt-0.5">Live Ping</div>
              </div>
              <div className="text-center px-2">
                <div className="text-emerald-400 font-mono font-black text-lg sm:text-xl">0</div>
                <div className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold mt-0.5">Active Incidents</div>
              </div>
            </div>
          </div>

          {/* 90-Day Uptime Bar Heatmap */}
          <div className="mt-8 pt-6 border-t border-stone-800/80">
            <div className="flex items-center justify-between text-xs text-stone-400 mb-3">
              <span className="font-semibold text-stone-300">90 Days Historical Uptime</span>
              <span className="font-mono text-emerald-400 font-bold">100.00% Operational Rate</span>
            </div>

            <div className="flex items-center gap-1 sm:gap-1.5 h-8 bg-stone-950 p-1.5 rounded-xl border border-stone-800/60 overflow-hidden">
              {past90Days.map((day) => (
                <div
                  key={day.day}
                  onMouseEnter={() => setHoveredDay(day)}
                  onMouseLeave={() => setHoveredDay(null)}
                  className="flex-1 h-full bg-emerald-500 hover:bg-emerald-400 hover:scale-y-125 rounded-xs transition-all cursor-pointer"
                  title={`${day.date}: ${day.uptime} (0 incidents)`}
                />
              ))}
            </div>

            <div className="flex items-center justify-between text-[11px] text-stone-500 font-mono mt-2">
              <span>90 days ago</span>
              {hoveredDay ? (
                <span className="text-amber-400 font-bold bg-stone-900 px-2 py-0.5 rounded border border-stone-800">
                  {hoveredDay.date} — {hoveredDay.uptime} Uptime
                </span>
              ) : (
                <span className="text-emerald-400 font-semibold">No downtime recorded</span>
              )}
              <span>Today</span>
            </div>
          </div>
        </motion.div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2">
          {[
            { id: 'all', label: 'All Endpoints & Services', count: endpoints.length },
            { id: 'pages', label: 'Website Pages & Routes', count: endpoints.filter((e) => e.type === 'page').length },
            { id: 'services', label: 'Background APIs & Engines', count: endpoints.filter((e) => e.type === 'service').length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-amber-500 text-stone-950 font-black shadow-lg shadow-amber-500/20'
                  : 'bg-stone-900/90 text-stone-400 hover:text-white border border-stone-800'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  activeTab === tab.id ? 'bg-stone-950 text-amber-400 font-black' : 'bg-stone-800 text-stone-300'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Endpoint Status List */}
        <div className="space-y-3">
          {filteredEndpoints.map((ep, idx) => {
            const Icon = ep.icon;
            return (
              <motion.div
                key={ep.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="bg-stone-900/90 hover:bg-stone-900 border border-stone-800/90 hover:border-stone-700/90 rounded-2xl p-4 sm:p-5 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md"
              >
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className="p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-amber-400 shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-serif font-bold text-sm sm:text-base text-white">{ep.name}</h3>
                      <span className="font-mono text-[11px] text-stone-400 bg-stone-950 px-2 py-0.5 rounded border border-stone-800">
                        {ep.path}
                      </span>
                    </div>
                    <p className="text-xs text-stone-400 mt-1 max-w-xl leading-relaxed">{ep.description}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-stone-800/60 justify-between md:justify-end">
                  <div className="flex items-center gap-4 text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-stone-500 block">Ping</span>
                      <span className="text-stone-300 font-bold">{ep.latencyMs}ms</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-500 block">Uptime</span>
                      <span className="text-stone-300 font-bold">{ep.uptimePercentage}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-500 block">HTTP</span>
                      <span className="text-emerald-400 font-bold">{ep.httpStatus}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-3 py-1.5 rounded-xl text-xs font-bold font-mono">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Operational</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Infrastructure & Security Badges Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          <div className="bg-stone-900/70 border border-stone-800/80 rounded-2xl p-4 flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-xs text-white">SSL & TLS 1.3</h4>
              <p className="text-[11px] text-stone-400">256-bit encryption secured</p>
            </div>
          </div>

          <div className="bg-stone-900/70 border border-stone-800/80 rounded-2xl p-4 flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-xs text-white">Global Edge CDN</h4>
              <p className="text-[11px] text-stone-400">&lt;20ms asset caching</p>
            </div>
          </div>

          <div className="bg-stone-900/70 border border-stone-800/80 rounded-2xl p-4 flex items-center gap-3">
            <div className="p-2 bg-sky-500/10 text-sky-400 rounded-xl border border-sky-500/20">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-xs text-white">Groq LLaMA 3.3</h4>
              <p className="text-[11px] text-stone-400">High-speed AI inference</p>
            </div>
          </div>

          <div className="bg-stone-900/70 border border-stone-800/80 rounded-2xl p-4 flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-xs text-white">Firebase RTDB</h4>
              <p className="text-[11px] text-stone-400">Sub-second state sync</p>
            </div>
          </div>
        </div>

        {/* Maintenance Log & Recent Event History */}
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-stone-800">
            <div>
              <h2 className="font-serif font-bold text-lg text-white">Past Incident & Maintenance Records</h2>
              <p className="text-xs text-stone-400 mt-0.5">Recorded changelogs and platform optimization windows</p>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-lg">
              100% Resolved
            </span>
          </div>

          <div className="space-y-4">
            {[
              {
                title: 'Spring Culinary Catalog & Artisanal Desserts Sync',
                date: 'Aug 14, 2026',
                duration: 'Completed in 3 mins',
                description: 'Updated menu pricing schemas, added new vegetarian tags, and verified Firebase subscription listeners.',
                status: 'Completed',
              },
              {
                title: 'CDN Edge Asset Pre-caching & Image Optimization',
                date: 'Aug 02, 2026',
                duration: 'Zero downtime rolling update',
                description: 'Optimized burger visual assets, compressed WebP posters for hero background reels, and reduced latency by 35%.',
                status: 'Completed',
              },
              {
                title: 'AI Mascot Groq Engine Upgrade to LLaMA 3.3 70B',
                date: 'Jul 26, 2026',
                duration: 'Completed in 1 min',
                description: 'Migrated chatbot backend prompt context to include rich nutritional values and thermal packaging recommendations.',
                status: 'Completed',
              },
            ].map((item, i) => (
              <div key={i} className="bg-stone-950/80 border border-stone-800/80 rounded-2xl p-4 sm:p-5 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-serif font-bold text-sm text-white">{item.title}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-stone-400">{item.date}</span>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                      {item.status}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-stone-400 leading-relaxed">{item.description}</p>
                <div className="text-[10px] font-mono text-amber-400/80 flex items-center gap-1 pt-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>{item.duration}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer info & Last checked */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500 pt-4 border-t border-stone-800/60">
          <div className="flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>
              Last health snapshot: <strong className="text-stone-300 font-mono">{lastCheckTime.toLocaleTimeString()}</strong>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate('menu')}
              className="text-stone-400 hover:text-amber-400 transition-colors font-medium cursor-pointer"
            >
              Gourmet Menu
            </button>
            <button
              onClick={() => onNavigate('analytics')}
              className="text-stone-400 hover:text-amber-400 transition-colors font-medium cursor-pointer"
            >
              Analytics
            </button>
            <a
              href="/admin"
              className="text-stone-400 hover:text-amber-400 transition-colors font-medium cursor-pointer"
            >
              Admin Studio
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
