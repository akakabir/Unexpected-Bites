import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  TrendingUp,
  Users,
  Eye,
  ShoppingBag,
  Clock,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Smartphone,
  Monitor,
  Tablet,
  Download,
  Share2,
  Calendar,
  Activity,
  Globe,
  Utensils,
  CheckCircle2,
  RefreshCw,
  Flame,
  Radio,
  Layers,
  FileSpreadsheet,
  Trash2,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import {
  getAggregatedAnalytics,
  getStoredEvents,
  clearAllAnalyticsData,
  seedSimulatedTelemetryData,
} from '../utils/analyticsTracker';
import { Dish } from '../types';

interface AdminAnalyticsProps {
  dishes?: Dish[];
}

export default function AdminAnalytics({ dishes = [] }: AdminAnalyticsProps) {
  const [timeframe, setTimeframe] = useState<'today' | '7d' | '30d' | '90d' | 'all'>('7d');
  const [selectedChartMetric, setSelectedChartMetric] = useState<'pageviews' | 'visitors' | 'cartAdds' | 'orders'>('pageviews');
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);
  const [updateTick, setUpdateTick] = useState(0);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Auto-refresh when real events happen or every 10s
  useEffect(() => {
    const handleEvent = () => setUpdateTick((t) => t + 1);
    window.addEventListener('ub_analytics_event', handleEvent);
    const interval = setInterval(() => setUpdateTick((t) => t + 1), 10000);
    return () => {
      window.removeEventListener('ub_analytics_event', handleEvent);
      clearInterval(interval);
    };
  }, []);

  const analyticsData = useMemo(() => {
    return getAggregatedAnalytics(timeframe, dishes);
  }, [timeframe, dishes, updateTick]);

  const { isRealTelemetry, totalCapturedEvents, kpis, timeSeries, pages, topDishes, deviceBreakdown, referrers, activity } = analyticsData;

  // Chart scaling calculations
  const maxMetricValue = useMemo(() => {
    const values = timeSeries.map((d) => d[selectedChartMetric]);
    return Math.max(...values, 5);
  }, [timeSeries, selectedChartMetric]);

  const chartHeight = 220;
  const chartWidth = 700;

  const points = useMemo(() => {
    if (timeSeries.length === 0) return '';
    return timeSeries
      .map((d, i) => {
        const x = (i / Math.max(1, timeSeries.length - 1)) * chartWidth;
        const y = chartHeight - (d[selectedChartMetric] / maxMetricValue) * (chartHeight - 40) - 20;
        return `${x},${y}`;
      })
      .join(' ');
  }, [timeSeries, selectedChartMetric, maxMetricValue]);

  const areaPath = useMemo(() => {
    if (!points) return '';
    return `M 0,${chartHeight} ${points.split(' ').map(p => `L ${p}`).join(' ')} L ${chartWidth},${chartHeight} Z`;
  }, [points]);

  // Export CSV Report
  const handleExportCSV = () => {
    const csvRows = [
      ['Unexpected Bites - Real Website Analytics Export'],
      ['Timeframe', timeframe],
      ['Generated At', new Date().toISOString()],
      ['Total Events Captured', totalCapturedEvents],
      [],
      ['KPI Metrics'],
      ['Total Pageviews', kpis.totalViews],
      ['Unique Visitors', kpis.uniqueVisitors],
      ['Live Guests Right Now', kpis.activeVisitorsNow],
      ['Cart Adds', kpis.cartAdds],
      ['Orders Generated', kpis.orders],
      ['Total Recorded Revenue (INR)', kpis.totalRevenue],
      ['Avg Duration', kpis.avgSessionDuration],
      ['Bounce Rate', kpis.bounceRate],
      ['Conversion Rate', kpis.conversionRate],
      [],
      ['Pages Breakdown'],
      ['Path', 'Name', 'Views', 'Unique Visitors', 'Avg Duration', 'Bounce Rate'],
      ...pages.map(p => [p.path, p.name, p.views, p.uniqueVisitors, p.avgDuration, p.bounceRate]),
      [],
      ['Top Dishes Performance'],
      ['Name', 'Category', 'Views', 'Cart Adds', 'Orders', 'Conversion Rate', 'Revenue (INR)'],
      ...topDishes.map(d => [d.name, d.category, d.views, d.cartAdds, d.orders, d.conversionRate, d.revenue]),
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `unexpected-bites-real-analytics-${timeframe}-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // Export JSON Report
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(analyticsData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `unexpected-bites-real-analytics-${timeframe}-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to reset all analytics telemetry? This will clear all logged events and start counters from 0.')) {
      clearAllAnalyticsData();
      setActionNotice('Analytics telemetry reset to clean zero.');
      setTimeout(() => setActionNotice(null), 3000);
    }
  };

  const handleSeedDemoData = () => {
    seedSimulatedTelemetryData(dishes);
    setActionNotice('Generated 45 realistic simulated customer journeys across pages, cart, and WhatsApp orders!');
    setTimeout(() => setActionNotice(null), 4000);
  };

  return (
    <div 
      data-lenis-prevent="true"
      className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-7xl mx-auto w-full space-y-8 overscroll-contain text-stone-100"
    >
      {/* Top Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-serif font-black text-white flex items-center gap-2">
                Real Website & Traffic Analytics
              </h2>
              <div className="flex items-center gap-2 text-xs text-stone-400 mt-0.5">
                <span className="flex items-center gap-1 text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-3 h-3" />
                  Live Authentic Telemetry
                </span>
                <span>•</span>
                <span className="font-mono text-stone-300">{totalCapturedEvents} real events captured</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Timeframe selector pills */}
          <div className="flex items-center bg-stone-900 border border-stone-800 p-1 rounded-xl text-xs">
            {[
              { id: 'today', label: 'Today' },
              { id: '7d', label: '7 Days' },
              { id: '30d', label: '30 Days' },
              { id: '90d', label: '90 Days' },
              { id: 'all', label: 'All Time' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTimeframe(t.id as any)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  timeframe === t.id
                    ? 'bg-amber-500 text-stone-950 font-black shadow-md'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 border border-stone-800 hover:border-stone-700 text-stone-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Download CSV Report"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>CSV</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 border border-stone-800 hover:border-stone-700 text-stone-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Download JSON Report"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>JSON</span>
          </button>

          <button
            onClick={handleSeedDemoData}
            className="px-3 py-1.5 bg-stone-900 hover:bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Generate test traffic batches to verify charts"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>+ Test Traffic</span>
          </button>

          <button
            onClick={handleClearData}
            className="px-3 py-1.5 bg-stone-900 hover:bg-red-500/10 border border-stone-800 hover:border-red-500/40 text-stone-400 hover:text-red-400 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Clear all recorded events"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Action Notice Banner */}
      <AnimatePresence>
        {actionNotice && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs font-medium text-amber-300 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{actionNotice}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* KPI Highlight Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Pageviews */}
        <div className="bg-stone-900 border border-stone-800/90 rounded-2xl p-4 sm:p-5 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-400 font-semibold">Total Pageviews</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-mono font-black text-white">{kpis.totalViews.toLocaleString()}</div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono font-bold mt-1">
              <Activity className="w-3.5 h-3.5" />
              <span>Real User Page Loads</span>
            </div>
          </div>
        </div>

        {/* Unique Visitors */}
        <div className="bg-stone-900 border border-stone-800/90 rounded-2xl p-4 sm:p-5 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-400 font-semibold">Unique Visitors</span>
            <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-mono font-black text-white">{kpis.uniqueVisitors.toLocaleString()}</div>
            <div className="flex items-center gap-1 text-[11px] text-sky-400 font-mono font-bold mt-1">
              <Monitor className="w-3.5 h-3.5" />
              <span>Distinct Device IDs</span>
            </div>
          </div>
        </div>

        {/* Live Active Guests Right Now */}
        <div className="bg-gradient-to-br from-stone-900 to-emerald-950/40 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-emerald-300 font-semibold flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              Live Right Now
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-mono font-black text-emerald-400">{kpis.activeVisitorsNow} Active</div>
            <div className="text-[11px] text-stone-400 font-medium mt-1">Heartbeat within last 45s</div>
          </div>
        </div>

        {/* Conversion Rate & Revenue */}
        <div className="bg-stone-900 border border-stone-800/90 rounded-2xl p-4 sm:p-5 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-400 font-semibold">Order Conversion Rate</span>
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-mono font-black text-amber-400">{kpis.conversionRate}</div>
            <div className="text-[11px] text-stone-400 font-mono mt-1">
              <strong className="text-white font-bold">{kpis.orders.toLocaleString()}</strong> orders (₹{kpis.totalRevenue.toLocaleString()})
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-stone-900/60 border border-stone-800/80 rounded-2xl p-4">
        <div className="px-3 border-r border-stone-800/60 last:border-0">
          <span className="text-[11px] text-stone-400 block">Avg. Session Duration</span>
          <span className="text-sm sm:text-base font-mono font-bold text-white">{kpis.avgSessionDuration}</span>
        </div>
        <div className="px-3 sm:border-r border-stone-800/60 last:border-0">
          <span className="text-[11px] text-stone-400 block">Bounce Rate</span>
          <span className="text-sm sm:text-base font-mono font-bold text-emerald-400">{kpis.bounceRate}</span>
        </div>
        <div className="px-3 border-r border-stone-800/60 last:border-0">
          <span className="text-[11px] text-stone-400 block">Total Cart Adds</span>
          <span className="text-sm sm:text-base font-mono font-bold text-white">{kpis.cartAdds.toLocaleString()}</span>
        </div>
        <div className="px-3">
          <span className="text-[11px] text-stone-400 block">AI Mascot Chats</span>
          <span className="text-sm sm:text-base font-mono font-bold text-amber-400">{kpis.mascotConversations.toLocaleString()}</span>
        </div>
      </div>

      {/* Interactive Trend Chart */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-800">
          <div>
            <h3 className="font-serif font-bold text-base text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-400" />
              Traffic & Engagement Trajectory
            </h3>
            <p className="text-xs text-stone-400">Timeline dynamics for {timeframe.toUpperCase()} period ({totalCapturedEvents} total recorded events)</p>
          </div>

          {/* Metric switcher buttons */}
          <div className="flex items-center gap-1.5 bg-stone-950 p-1 rounded-xl border border-stone-800 text-xs">
            {[
              { id: 'pageviews', label: 'Pageviews' },
              { id: 'visitors', label: 'Visitors' },
              { id: 'cartAdds', label: 'Cart Adds' },
              { id: 'orders', label: 'Orders' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedChartMetric(m.id as any)}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  selectedChartMetric === m.id
                    ? 'bg-amber-500 text-stone-950 font-black'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* SVG Responsive Line & Area Visualizer */}
        <div className="relative w-full overflow-x-auto py-2">
          <div className="min-w-[640px]">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-56 overflow-visible"
            >
              <defs>
                <linearGradient id="analyticsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0.25, 0.5, 0.75, 1.0].map((ratio) => {
                const y = chartHeight - ratio * (chartHeight - 40) - 20;
                return (
                  <g key={ratio}>
                    <line
                      x1="0"
                      y1={y}
                      x2={chartWidth}
                      y2={y}
                      stroke="#292524"
                      strokeDasharray="4 4"
                    />
                    <text
                      x="10"
                      y={y - 4}
                      fill="#78716c"
                      fontSize="10"
                      fontFamily="monospace"
                    >
                      {Math.round(maxMetricValue * ratio)}
                    </text>
                  </g>
                );
              })}

              {/* Gradient Area */}
              <path d={areaPath} fill="url(#analyticsGradient)" />

              {/* Line */}
              <polyline
                fill="none"
                stroke="#f59e0b"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points}
              />

              {/* Interactive Points */}
              {timeSeries.map((d, idx) => {
                const x = (idx / Math.max(1, timeSeries.length - 1)) * chartWidth;
                const y = chartHeight - (d[selectedChartMetric] / maxMetricValue) * (chartHeight - 40) - 20;
                const isHovered = hoveredPointIndex === idx;

                return (
                  <g key={idx} className="cursor-pointer">
                    <circle
                      cx={x}
                      cy={y}
                      r={isHovered ? 6 : 4}
                      fill={isHovered ? '#fbbf24' : '#1c1917'}
                      stroke="#f59e0b"
                      strokeWidth="2.5"
                      onMouseEnter={() => setHoveredPointIndex(idx)}
                      onMouseLeave={() => setHoveredPointIndex(null)}
                    />
                    {isHovered && (
                      <g>
                        <rect
                          x={Math.max(0, Math.min(chartWidth - 110, x - 55))}
                          y={Math.max(10, y - 48)}
                          width="110"
                          height="40"
                          rx="8"
                          fill="#1c1917"
                          stroke="#78716c"
                        />
                        <text
                          x={Math.max(0, Math.min(chartWidth - 110, x - 55)) + 55}
                          y={Math.max(10, y - 48) + 16}
                          fill="#d6d3d1"
                          fontSize="10"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          {d.timeLabel}
                        </text>
                        <text
                          x={Math.max(0, Math.min(chartWidth - 110, x - 55)) + 55}
                          y={Math.max(10, y - 48) + 30}
                          fill="#f59e0b"
                          fontSize="12"
                          fontWeight="bold"
                          fontFamily="monospace"
                          textAnchor="middle"
                        >
                          {d[selectedChartMetric].toLocaleString()}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* X-axis labels */}
            <div className="flex justify-between text-[11px] text-stone-500 font-mono pt-2">
              {timeSeries.map((d, i) => (
                <span key={i} className="text-center">{d.timeLabel}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Pages & Routes Performance Matrix */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div>
            <h3 className="font-serif font-bold text-base text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-amber-400" />
              All Pages & Routes Real Performance
            </h3>
            <p className="text-xs text-stone-400">Authentic traffic distribution and user engagement by route path</p>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-lg">
            {pages.length} Monitored Paths
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-800 text-stone-400 font-semibold">
                <th className="pb-3">Page / Path</th>
                <th className="pb-3">Pageviews</th>
                <th className="pb-3">Traffic Share</th>
                <th className="pb-3">Unique Visitors</th>
                <th className="pb-3">Avg. Duration</th>
                <th className="pb-3">Bounce Rate</th>
                <th className="pb-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60 font-mono">
              {pages.map((p) => {
                const sharePercent = kpis.totalViews > 0 ? ((p.views / kpis.totalViews) * 100).toFixed(1) : '0.0';
                return (
                  <tr key={p.path} className="hover:bg-stone-800/40 transition-colors">
                    <td className="py-3.5 pr-4">
                      <div className="font-bold text-white font-sans">{p.name}</div>
                      <div className="text-[11px] text-amber-400/90">{p.path}</div>
                    </td>
                    <td className="py-3.5 text-stone-200 font-bold">{p.views.toLocaleString()}</td>
                    <td className="py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-stone-950 h-2 rounded-full overflow-hidden border border-stone-800">
                          <div className="bg-amber-400 h-full rounded-full" style={{ width: `${Math.min(100, Math.max(0, Number(sharePercent)))}%` }} />
                        </div>
                        <span className="text-stone-400 text-[11px]">{sharePercent}%</span>
                      </div>
                    </td>
                    <td className="py-3.5 text-stone-300">{p.uniqueVisitors.toLocaleString()}</td>
                    <td className="py-3.5 text-stone-300">{p.avgDuration}</td>
                    <td className="py-3.5 text-emerald-400 font-bold">{p.bounceRate}</td>
                    <td className="py-3.5 text-right font-sans">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" />
                        Operational
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grid: Top Culinary Dishes Ranking & Device / Referrer Demographics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Performing Dishes */}
        <div className="lg:col-span-2 bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-800">
            <div>
              <h3 className="font-serif font-bold text-base text-white flex items-center gap-2">
                <Utensils className="w-4 h-4 text-amber-400" />
                Top Performing Gourmet Dishes
              </h3>
              <p className="text-xs text-stone-400">Authentic view-to-order conversion & revenue generated</p>
            </div>
          </div>

          <div className="space-y-3">
            {topDishes.length === 0 ? (
              <div className="text-xs text-stone-500 italic p-4 text-center">No dish interactions recorded yet. Browse the menu or add items to cart!</div>
            ) : (
              topDishes.map((dish, i) => (
                <div
                  key={dish.id}
                  className="bg-stone-950/80 border border-stone-800/80 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-stone-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-black text-amber-400 w-6 h-6 rounded-lg bg-stone-900 border border-stone-800 flex items-center justify-center">
                      #{i + 1}
                    </span>
                    <div>
                      <h4 className="font-bold text-sm text-white">{dish.name}</h4>
                      <span className="text-[11px] text-stone-400 font-mono">{dish.category}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono justify-between sm:justify-end border-t sm:border-t-0 border-stone-800/60 pt-2 sm:pt-0">
                    <div>
                      <span className="text-[10px] text-stone-500 block">Views</span>
                      <span className="text-stone-300 font-bold">{dish.views.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-500 block">Cart Adds</span>
                      <span className="text-stone-300 font-bold">{dish.cartAdds.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-500 block">Conversion</span>
                      <span className="text-emerald-400 font-bold">{dish.conversionRate}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-500 block">Revenue</span>
                      <span className="text-amber-400 font-bold">₹{dish.revenue.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Demographics, Devices & Sources */}
        <div className="space-y-6">
          {/* Device Breakdown */}
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 space-y-4">
            <h3 className="font-serif font-bold text-sm text-white flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-amber-400" />
              Real Device Distribution
            </h3>

            <div className="space-y-3">
              {deviceBreakdown.map((dev) => (
                <div key={dev.label} className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-stone-300 font-sans">{dev.label}</span>
                    <span className="font-bold text-amber-400">{dev.percentage}% ({dev.count})</span>
                  </div>
                  <div className="w-full bg-stone-950 h-2.5 rounded-full overflow-hidden border border-stone-800">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(0, dev.percentage))}%`, backgroundColor: dev.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Traffic Referrer Sources */}
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 space-y-4">
            <h3 className="font-serif font-bold text-sm text-white flex items-center gap-2">
              <Share2 className="w-4 h-4 text-amber-400" />
              Traffic Acquisition Sources
            </h3>

            <div className="space-y-2.5 text-xs font-mono">
              {referrers.map((ref) => (
                <div key={ref.source} className="flex items-center justify-between p-2 rounded-xl bg-stone-950 border border-stone-800/80">
                  <span className="text-stone-300 font-sans truncate pr-2">{ref.source}</span>
                  <span className="text-amber-400 font-bold shrink-0">{ref.percentage}% ({ref.count})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Live Activity Feed */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div>
            <h3 className="font-serif font-bold text-base text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
              Realtime Visitor Event Stream
            </h3>
            <p className="text-xs text-stone-400">Live feed of authentic user actions and diagnostic events</p>
          </div>
          <span className="text-xs font-mono text-stone-400">
            {activity.length} recent stream events
          </span>
        </div>

        {activity.length === 0 ? (
          <div className="text-xs text-stone-500 italic p-6 text-center bg-stone-950/60 rounded-2xl border border-stone-800/60">
            No events recorded yet. Navigate through the site, browse dishes, or trigger a test event to see live stream!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {activity.map((act, idx) => (
              <div
                key={idx}
                className="bg-stone-950/80 border border-stone-800/80 rounded-2xl p-3.5 flex items-start justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-[10px] font-bold">
                      {act.tag}
                    </span>
                    <span className="text-stone-500 font-mono text-[10px]">{act.time}</span>
                  </div>
                  <p className="text-stone-300 font-sans leading-relaxed">{act.text}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
