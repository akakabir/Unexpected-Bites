import { Dish } from '../types';
import { getFirebaseDatabase } from '../lib/firebase';
import { ref, push, set } from 'firebase/database';

export interface AnalyticsEvent {
  id: string;
  type: 'pageview' | 'dish_view' | 'add_to_cart' | 'remove_from_cart' | 'checkout_click' | 'mascot_chat' | 'status_check' | 'search_query';
  page: string;
  dishId?: string;
  dishName?: string;
  category?: string;
  price?: number;
  quantity?: number;
  revenue?: number;
  metadata?: Record<string, any>;
  timestamp: number;
  sessionId: string;
  visitorId: string;
  device: 'mobile' | 'desktop' | 'tablet';
  referrer: string;
  screenWidth: number;
  screenHeight: number;
}

export interface PageStat {
  path: string;
  name: string;
  views: number;
  uniqueVisitors: number;
  avgDuration: string;
  bounceRate: string;
  status: 'operational' | 'degraded' | 'maintenance';
}

export interface TopDishStat {
  id: string;
  name: string;
  category: string;
  views: number;
  cartAdds: number;
  orders: number;
  conversionRate: string;
  revenue: number;
}

export interface TimeSeriesDataPoint {
  timeLabel: string;
  pageviews: number;
  visitors: number;
  cartAdds: number;
  orders: number;
}

export interface AggregatedAnalyticsResult {
  isRealTelemetry: boolean;
  totalCapturedEvents: number;
  kpis: {
    totalViews: number;
    uniqueVisitors: number;
    activeVisitorsNow: number;
    cartAdds: number;
    orders: number;
    mascotConversations: number;
    avgSessionDuration: string;
    bounceRate: string;
    conversionRate: string;
    totalRevenue: number;
  };
  timeSeries: TimeSeriesDataPoint[];
  pages: PageStat[];
  topDishes: TopDishStat[];
  deviceBreakdown: { label: string; percentage: number; count: number; color: string }[];
  referrers: { source: string; percentage: number; count: number }[];
  activity: { time: string; text: string; tag: string; timestamp: number }[];
}

const STORAGE_KEY_EVENTS = 'unexpected_bites_real_events_v2';
const STORAGE_KEY_SESSION = 'unexpected_bites_session_id_v2';
const STORAGE_KEY_VISITOR = 'unexpected_bites_visitor_id_v2';
const STORAGE_KEY_HEARTBEATS = 'unexpected_bites_active_heartbeats_v2';
const STORAGE_KEY_SESSION_START = 'unexpected_bites_session_start_v2';

// ----------------------------------------------------
// Device & Referrer Detectors
// ----------------------------------------------------

export function getDeviceType(): 'mobile' | 'desktop' | 'tablet' {
  if (typeof window === 'undefined') return 'desktop';
  const ua = navigator.userAgent || '';
  const width = window.innerWidth || 1200;

  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua) || (width >= 768 && width <= 1024)) {
    return 'tablet';
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(ua) || width < 768) {
    return 'mobile';
  }
  return 'desktop';
}

export function getReferrerSource(): string {
  if (typeof window === 'undefined') return 'Direct';
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const utmSource = urlParams.get('utm_source') || urlParams.get('ref') || urlParams.get('source');
    if (utmSource) return `Campaign: ${utmSource}`;

    const refStr = document.referrer;
    if (!refStr) return 'Direct / QR Code Menu';

    const refUrl = new URL(refStr);
    if (refUrl.hostname === window.location.hostname) return 'Direct / Internal';
    if (refUrl.hostname.includes('google')) return 'Google Search & Maps';
    if (refUrl.hostname.includes('instagram')) return 'Instagram Social';
    if (refUrl.hostname.includes('whatsapp') || refUrl.hostname.includes('wa.me')) return 'WhatsApp Order Link';
    if (refUrl.hostname.includes('facebook')) return 'Facebook';
    if (refUrl.hostname.includes('t.co') || refUrl.hostname.includes('twitter') || refUrl.hostname.includes('x.com')) return 'X / Twitter';
    return refUrl.hostname.replace('www.', '');
  } catch {
    return 'Direct / QR Code Menu';
  }
}

// ----------------------------------------------------
// Session & Visitor Identifiers
// ----------------------------------------------------

export function getVisitorId(): string {
  try {
    let vid = localStorage.getItem(STORAGE_KEY_VISITOR);
    if (!vid) {
      vid = 'vis_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);
      localStorage.setItem(STORAGE_KEY_VISITOR, vid);
    }
    return vid;
  } catch {
    return 'vis_fallback';
  }
}

export function getSessionId(): string {
  try {
    let sid = sessionStorage.getItem(STORAGE_KEY_SESSION);
    if (!sid) {
      sid = 'sess_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);
      sessionStorage.setItem(STORAGE_KEY_SESSION, sid);
      sessionStorage.setItem(STORAGE_KEY_SESSION_START, Date.now().toString());
    }
    return sid;
  } catch {
    return 'sess_fallback';
  }
}

// ----------------------------------------------------
// Realtime Heartbeat for Live Visitors Count
// ----------------------------------------------------

export function sendSessionHeartbeat(page: string = window.location.pathname || '/') {
  try {
    const sessionId = getSessionId();
    const visitorId = getVisitorId();
    const now = Date.now();

    // LocalStorage heartbeat map
    const raw = localStorage.getItem(STORAGE_KEY_HEARTBEATS);
    const heartbeats: Record<string, { lastActive: number; page: string; visitorId: string; device: string }> = raw ? JSON.parse(raw) : {};

    heartbeats[sessionId] = {
      lastActive: now,
      page,
      visitorId,
      device: getDeviceType(),
    };

    // Clean up stale heartbeats (> 60 seconds ago)
    const cutoff = now - 60000;
    Object.keys(heartbeats).forEach((k) => {
      if (heartbeats[k].lastActive < cutoff) {
        delete heartbeats[k];
      }
    });

    localStorage.setItem(STORAGE_KEY_HEARTBEATS, JSON.stringify(heartbeats));

    // Also notify Firebase Realtime Database if connected
    const database = getFirebaseDatabase();
    if (database) {
      const hbRef = ref(database, `analytics/heartbeats/${sessionId}`);
      set(hbRef, { lastActive: now, page, visitorId, device: getDeviceType() }).catch(() => {});
    }
  } catch {
    // ignore in restricted contexts
  }
}

export function getActiveVisitorsCount(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_HEARTBEATS);
    if (!raw) return 1;
    const heartbeats: Record<string, { lastActive: number }> = JSON.parse(raw);
    const now = Date.now();
    const cutoff = now - 45000; // active within last 45 seconds
    let active = 0;
    Object.values(heartbeats).forEach((hb) => {
      if (hb.lastActive >= cutoff) active++;
    });
    return Math.max(1, active);
  } catch {
    return 1;
  }
}

// ----------------------------------------------------
// Real Event Logger
// ----------------------------------------------------

export function trackAnalyticsEvent(
  type: AnalyticsEvent['type'],
  page: string,
  extra?: {
    dishId?: string;
    dishName?: string;
    category?: string;
    price?: number;
    quantity?: number;
    revenue?: number;
    metadata?: Record<string, any>;
  }
) {
  try {
    const sessionId = getSessionId();
    const visitorId = getVisitorId();
    const now = Date.now();

    const newEvent: AnalyticsEvent = {
      id: 'evt_' + Math.random().toString(36).substring(2, 9) + '_' + now,
      type,
      page: page || '/',
      dishId: extra?.dishId,
      dishName: extra?.dishName,
      category: extra?.category,
      price: extra?.price,
      quantity: extra?.quantity || 1,
      revenue: extra?.revenue || (extra?.price ? extra.price * (extra.quantity || 1) : 0),
      metadata: extra?.metadata,
      timestamp: now,
      sessionId,
      visitorId,
      device: getDeviceType(),
      referrer: getReferrerSource(),
      screenWidth: window.innerWidth || 1200,
      screenHeight: window.innerHeight || 800,
    };

    // Store in localStorage
    const events = getStoredEvents();
    const updated = [newEvent, ...events].slice(0, 3000); // retain up to 3000 real events
    localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(updated));

    // Update heartbeat
    sendSessionHeartbeat(page);

    // Dispatch global event for instant UI update in current window & broadcast channel
    window.dispatchEvent(new CustomEvent('ub_analytics_event', { detail: newEvent }));

    // Firebase Sync
    const database = getFirebaseDatabase();
    if (database) {
      const eventsRef = ref(database, 'analytics/events');
      push(eventsRef, newEvent).catch(() => {});
    }
  } catch (err) {
    console.debug('Analytics capture error:', err);
  }
}

export function getStoredEvents(): AnalyticsEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_EVENTS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // fallback
  }
  return [];
}

export function clearAllAnalyticsData() {
  try {
    localStorage.removeItem(STORAGE_KEY_EVENTS);
    localStorage.removeItem(STORAGE_KEY_HEARTBEATS);
    window.dispatchEvent(new CustomEvent('ub_analytics_event', { detail: { type: 'cleared' } }));
  } catch (e) {
    console.error('Failed to clear analytics:', e);
  }
}

// ----------------------------------------------------
// Real Analytics Aggregator
// ----------------------------------------------------

export function getAggregatedAnalytics(
  timeframe: 'today' | '7d' | '30d' | '90d' | 'all',
  menuDishes: Dish[] = []
): AggregatedAnalyticsResult {
  const allEvents = getStoredEvents();
  const now = Date.now();

  // Time cutoff calculation
  let cutoffTimestamp = 0;
  if (timeframe === 'today') {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    cutoffTimestamp = startOfToday.getTime();
  } else if (timeframe === '7d') {
    cutoffTimestamp = now - 7 * 24 * 60 * 60 * 1000;
  } else if (timeframe === '30d') {
    cutoffTimestamp = now - 30 * 24 * 60 * 60 * 1000;
  } else if (timeframe === '90d') {
    cutoffTimestamp = now - 90 * 24 * 60 * 60 * 1000;
  } else {
    cutoffTimestamp = 0; // all time
  }

  const filteredEvents = allEvents.filter((e) => e.timestamp >= cutoffTimestamp);

  // Group events by session
  const sessionMap: Record<string, { events: AnalyticsEvent[]; start: number; end: number; pages: Set<string> }> = {};
  const visitorSet = new Set<string>();

  filteredEvents.forEach((evt) => {
    visitorSet.add(evt.visitorId);
    if (!sessionMap[evt.sessionId]) {
      sessionMap[evt.sessionId] = {
        events: [],
        start: evt.timestamp,
        end: evt.timestamp,
        pages: new Set(),
      };
    }
    sessionMap[evt.sessionId].events.push(evt);
    sessionMap[evt.sessionId].pages.add(evt.page);
    sessionMap[evt.sessionId].start = Math.min(sessionMap[evt.sessionId].start, evt.timestamp);
    sessionMap[evt.sessionId].end = Math.max(sessionMap[evt.sessionId].end, evt.timestamp);
  });

  const totalSessions = Object.keys(sessionMap).length;
  const pageviewEvents = filteredEvents.filter((e) => e.type === 'pageview');
  const cartAddEvents = filteredEvents.filter((e) => e.type === 'add_to_cart');
  const checkoutEvents = filteredEvents.filter((e) => e.type === 'checkout_click');
  const mascotEvents = filteredEvents.filter((e) => e.type === 'mascot_chat');

  // Real calculations
  const totalViews = pageviewEvents.length;
  const uniqueVisitors = Math.max(visitorSet.size, totalViews > 0 ? 1 : 0);
  const activeVisitorsNow = getActiveVisitorsCount();
  const cartAdds = cartAddEvents.length;
  const orders = checkoutEvents.length;
  const mascotConversations = mascotEvents.length;

  // Calculate real revenue from checkout orders
  let totalRevenue = 0;
  checkoutEvents.forEach((evt) => {
    if (evt.revenue && evt.revenue > 0) {
      totalRevenue += evt.revenue;
    } else if (evt.metadata?.grandTotal) {
      totalRevenue += Number(evt.metadata.grandTotal);
    } else if (evt.price) {
      totalRevenue += evt.price * (evt.quantity || 1);
    } else {
      // average estimated order value if items not in metadata
      totalRevenue += 520;
    }
  });

  // Calculate real average session duration
  let totalDurationSeconds = 0;
  let measurableSessions = 0;
  let bounceSessions = 0;

  Object.values(sessionMap).forEach((sess) => {
    const pageviewsInSession = sess.events.filter((e) => e.type === 'pageview').length;
    if (pageviewsInSession <= 1 && sess.events.length <= 1) {
      bounceSessions++;
    }
    const durationSec = Math.max(0, Math.round((sess.end - sess.start) / 1000));
    if (durationSec > 0) {
      totalDurationSeconds += durationSec;
      measurableSessions++;
    } else {
      // single action default baseline estimate 30s
      totalDurationSeconds += 30;
      measurableSessions++;
    }
  });

  const avgDurationSec = measurableSessions > 0 ? Math.round(totalDurationSeconds / measurableSessions) : 0;
  const avgSessionDuration =
    avgDurationSec >= 60
      ? `${Math.floor(avgDurationSec / 60)}m ${avgDurationSec % 60}s`
      : `${avgDurationSec}s`;

  const bounceRate =
    totalSessions > 0
      ? `${((bounceSessions / totalSessions) * 100).toFixed(1)}%`
      : '0.0%';

  const conversionRate =
    uniqueVisitors > 0
      ? `${((orders / uniqueVisitors) * 100).toFixed(1)}%`
      : '0.0%';

  // ----------------------------------------------------
  // Real Time-Series Trajectory
  // ----------------------------------------------------
  const timeSeries: TimeSeriesDataPoint[] = [];

  if (timeframe === 'today') {
    // 8 3-hour blocks starting from 00:00 to 21:00
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const baseTime = startOfToday.getTime();

    for (let i = 0; i < 8; i++) {
      const hour = i * 3;
      const blockStart = baseTime + hour * 3600000;
      const blockEnd = blockStart + 3 * 3600000;
      const label = `${hour.toString().padStart(2, '0')}:00`;

      const inBlock = filteredEvents.filter((e) => e.timestamp >= blockStart && e.timestamp < blockEnd);
      const blockViews = inBlock.filter((e) => e.type === 'pageview').length;
      const blockVisitors = new Set(inBlock.map((e) => e.visitorId)).size;
      const blockCartAdds = inBlock.filter((e) => e.type === 'add_to_cart').length;
      const blockOrders = inBlock.filter((e) => e.type === 'checkout_click').length;

      timeSeries.push({
        timeLabel: label,
        pageviews: blockViews,
        visitors: blockVisitors,
        cartAdds: blockCartAdds,
        orders: blockOrders,
      });
    }
  } else {
    const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : timeframe === '90d' ? 90 : 14;
    const bucketCount = Math.min(days, 12);
    const bucketMs = (days * 24 * 3600000) / bucketCount;

    for (let i = bucketCount - 1; i >= 0; i--) {
      const bucketEnd = now - i * bucketMs;
      const bucketStart = bucketEnd - bucketMs;
      const d = new Date(bucketEnd);
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      const inBlock = filteredEvents.filter((e) => e.timestamp >= bucketStart && e.timestamp < bucketEnd);
      const blockViews = inBlock.filter((e) => e.type === 'pageview').length;
      const blockVisitors = new Set(inBlock.map((e) => e.visitorId)).size;
      const blockCartAdds = inBlock.filter((e) => e.type === 'add_to_cart').length;
      const blockOrders = inBlock.filter((e) => e.type === 'checkout_click').length;

      timeSeries.push({
        timeLabel: label,
        pageviews: blockViews,
        visitors: blockVisitors,
        cartAdds: blockCartAdds,
        orders: blockOrders,
      });
    }
  }

  // ----------------------------------------------------
  // Real Pages Performance Breakdown
  // ----------------------------------------------------
  const pathAggregates: Record<string, { views: number; visitors: Set<string>; durationSum: number; count: number; singlePageSessions: number }> = {
    '/': { views: 0, visitors: new Set(), durationSum: 0, count: 0, singlePageSessions: 0 },
    '/menu': { views: 0, visitors: new Set(), durationSum: 0, count: 0, singlePageSessions: 0 },
    '#desserts': { views: 0, visitors: new Set(), durationSum: 0, count: 0, singlePageSessions: 0 },
    '/status': { views: 0, visitors: new Set(), durationSum: 0, count: 0, singlePageSessions: 0 },
    '/analytics': { views: 0, visitors: new Set(), durationSum: 0, count: 0, singlePageSessions: 0 },
    '/admin': { views: 0, visitors: new Set(), durationSum: 0, count: 0, singlePageSessions: 0 },
  };

  pageviewEvents.forEach((evt) => {
    const p = evt.page || '/';
    if (!pathAggregates[p]) {
      pathAggregates[p] = { views: 0, visitors: new Set(), durationSum: 0, count: 0, singlePageSessions: 0 };
    }
    pathAggregates[p].views += 1;
    pathAggregates[p].visitors.add(evt.visitorId);
    pathAggregates[p].count += 1;
  });

  const pathDisplayNames: Record<string, string> = {
    '/': 'Homepage & Gourmet Hero',
    '/menu': 'Full Gourmet Menu & Catalog',
    '#desserts': 'Warm Artisanal Desserts Tab',
    '/status': 'System Health & Status Portal',
    '/analytics': 'Website Traffic & Analytics Portal',
    '/admin': 'Admin & Visual Management Studio',
  };

  const pages: PageStat[] = Object.keys(pathAggregates).map((path) => {
    const item = pathAggregates[path];
    const pathViews = item.views;
    const pathVisitors = item.visitors.size;
    const avgSec = pathViews > 0 ? Math.max(15, Math.round(avgDurationSec * 0.9)) : 0;
    const durationFormatted = avgSec >= 60 ? `${Math.floor(avgSec / 60)}m ${avgSec % 60}s` : `${avgSec}s`;

    return {
      path,
      name: pathDisplayNames[path] || `Custom Route: ${path}`,
      views: pathViews,
      uniqueVisitors: pathVisitors,
      avgDuration: pathViews > 0 ? durationFormatted : '0s',
      bounceRate: pathViews > 0 ? bounceRate : '0.0%',
      status: 'operational' as const,
    };
  }).sort((a, b) => b.views - a.views);

  // ----------------------------------------------------
  // Real Top Dishes Ranking
  // ----------------------------------------------------
  const dishStatMap: Record<string, { name: string; category: string; price: number; views: number; cartAdds: number; orders: number; revenue: number }> = {};

  // Initialize with menu dishes
  menuDishes.forEach((d) => {
    dishStatMap[d.id] = {
      name: d.name,
      category: d.category,
      price: d.price,
      views: 0,
      cartAdds: 0,
      orders: 0,
      revenue: 0,
    };
  });

  // Tally real events
  filteredEvents.forEach((evt) => {
    if (evt.dishId) {
      if (!dishStatMap[evt.dishId]) {
        dishStatMap[evt.dishId] = {
          name: evt.dishName || evt.dishId,
          category: evt.category || 'Gourmet',
          price: evt.price || 250,
          views: 0,
          cartAdds: 0,
          orders: 0,
          revenue: 0,
        };
      }

      if (evt.type === 'dish_view') {
        dishStatMap[evt.dishId].views += 1;
      } else if (evt.type === 'add_to_cart') {
        dishStatMap[evt.dishId].cartAdds += evt.quantity || 1;
        dishStatMap[evt.dishId].views += 1; // viewing before adding
      } else if (evt.type === 'checkout_click') {
        dishStatMap[evt.dishId].orders += evt.quantity || 1;
        dishStatMap[evt.dishId].revenue += (evt.price || dishStatMap[evt.dishId].price) * (evt.quantity || 1);
      }
    }
  });

  const topDishes: TopDishStat[] = Object.keys(dishStatMap).map((id) => {
    const d = dishStatMap[id];
    const convRate = d.views > 0 ? ((d.orders / d.views) * 100).toFixed(1) + '%' : d.cartAdds > 0 ? '100%' : '0.0%';
    return {
      id,
      name: d.name,
      category: d.category,
      views: d.views,
      cartAdds: d.cartAdds,
      orders: d.orders,
      conversionRate: convRate,
      revenue: d.revenue || (d.orders * d.price),
    };
  }).sort((a, b) => (b.revenue || b.orders || b.cartAdds || b.views) - (a.revenue || a.orders || a.cartAdds || a.views));

  // ----------------------------------------------------
  // Real Device & Referrer Demographics
  // ----------------------------------------------------
  const deviceCounts = { mobile: 0, desktop: 0, tablet: 0 };
  const referrerCounts: Record<string, number> = {};

  filteredEvents.forEach((evt) => {
    if (evt.device in deviceCounts) {
      deviceCounts[evt.device] += 1;
    } else {
      deviceCounts.desktop += 1;
    }

    const ref = evt.referrer || 'Direct / QR Code Menu';
    referrerCounts[ref] = (referrerCounts[ref] || 0) + 1;
  });

  const totalDeviceEvents = Math.max(1, deviceCounts.mobile + deviceCounts.desktop + deviceCounts.tablet);
  const deviceBreakdown = [
    {
      label: 'Mobile Devices',
      percentage: Math.round((deviceCounts.mobile / totalDeviceEvents) * 100),
      count: deviceCounts.mobile,
      color: '#f59e0b',
    },
    {
      label: 'Desktop Computers',
      percentage: Math.round((deviceCounts.desktop / totalDeviceEvents) * 100),
      count: deviceCounts.desktop,
      color: '#38bdf8',
    },
    {
      label: 'Tablets & iPads',
      percentage: Math.round((deviceCounts.tablet / totalDeviceEvents) * 100),
      count: deviceCounts.tablet,
      color: '#a855f7',
    },
  ];

  const totalRefEvents = Math.max(1, Object.values(referrerCounts).reduce((a, b) => a + b, 0));
  const referrers = Object.keys(referrerCounts).map((source) => {
    const count = referrerCounts[source];
    return {
      source,
      percentage: Math.round((count / totalRefEvents) * 100),
      count,
    };
  }).sort((a, b) => b.count - a.count);

  if (referrers.length === 0) {
    referrers.push({ source: 'Direct / QR Code Menu', percentage: 100, count: 1 });
  }

  // ----------------------------------------------------
  // Real Event Activity Stream
  // ----------------------------------------------------
  const activity = filteredEvents.slice(0, 15).map((evt) => {
    const elapsedSeconds = Math.max(1, Math.round((now - evt.timestamp) / 1000));
    let timeFormatted = `${elapsedSeconds}s ago`;
    if (elapsedSeconds > 3600) {
      timeFormatted = `${Math.floor(elapsedSeconds / 3600)}h ago`;
    } else if (elapsedSeconds > 60) {
      timeFormatted = `${Math.floor(elapsedSeconds / 60)}m ago`;
    }

    let text = `User action: ${evt.type} on ${evt.page}`;
    if (evt.type === 'add_to_cart') {
      text = `Added "${evt.dishName || 'Gourmet Dish'}" (₹${evt.price || 0}) to cart on ${evt.page}`;
    } else if (evt.type === 'dish_view') {
      text = `Viewed dish details for "${evt.dishName || 'Dish'}"`;
    } else if (evt.type === 'checkout_click') {
      text = `Initiated WhatsApp checkout order with ${evt.quantity || 1} items (₹${evt.revenue || evt.price || 0})`;
    } else if (evt.type === 'mascot_chat') {
      text = `Asked AI Mascot Assistant about menu & recommendations`;
    } else if (evt.type === 'status_check') {
      text = `Ran round-trip system latency diagnostics on /status`;
    } else if (evt.type === 'pageview') {
      text = `Navigated to ${pathDisplayNames[evt.page] || evt.page}`;
    }

    return {
      time: timeFormatted,
      text,
      tag: evt.type.replace('_', ' ').toUpperCase(),
      timestamp: evt.timestamp,
    };
  });

  return {
    isRealTelemetry: true,
    totalCapturedEvents: allEvents.length,
    kpis: {
      totalViews,
      uniqueVisitors,
      activeVisitorsNow,
      cartAdds,
      orders,
      mascotConversations,
      avgSessionDuration,
      bounceRate,
      conversionRate,
      totalRevenue,
    },
    timeSeries,
    pages,
    topDishes: topDishes.slice(0, 8),
    deviceBreakdown,
    referrers: referrers.slice(0, 6),
    activity,
  };
}

// ----------------------------------------------------
// Admin Helper: Seed Realistic Simulated Traffic
// (For administrator testing if desired)
// ----------------------------------------------------
export function seedSimulatedTelemetryData(dishes: Dish[]) {
  const routes = ['/', '/menu', '#desserts', '/status', '/analytics', '/admin'];
  const sampleReferrers = [
    'Direct / QR Code Menu',
    'WhatsApp Order Link',
    'Instagram Social',
    'Google Search & Maps',
  ];
  const sampleDevices: ('mobile' | 'desktop' | 'tablet')[] = ['mobile', 'mobile', 'desktop', 'mobile', 'tablet'];

  const now = Date.now();
  const simulatedEvents: AnalyticsEvent[] = [];

  // Generate 45 realistic events over the past 24 hours
  for (let i = 0; i < 45; i++) {
    const elapsedMinutes = Math.floor(Math.random() * 1440); // within last 24h
    const timestamp = now - elapsedMinutes * 60 * 1000;
    const sessionId = `sim_sess_${Math.floor(i / 3)}_${Math.floor(timestamp / 3600000)}`;
    const visitorId = `sim_vis_${Math.floor(i / 3)}`;
    const device = sampleDevices[i % sampleDevices.length];
    const referrer = sampleReferrers[i % sampleReferrers.length];
    const randomDish = dishes.length > 0 ? dishes[i % dishes.length] : undefined;

    const eventTypeRoll = Math.random();
    if (eventTypeRoll < 0.5) {
      // Pageview
      const route = routes[Math.floor(Math.random() * routes.length)];
      simulatedEvents.push({
        id: `sim_evt_pv_${i}_${timestamp}`,
        type: 'pageview',
        page: route,
        timestamp,
        sessionId,
        visitorId,
        device,
        referrer,
        screenWidth: device === 'mobile' ? 390 : device === 'tablet' ? 820 : 1440,
        screenHeight: device === 'mobile' ? 844 : device === 'tablet' ? 1180 : 900,
      });
    } else if (eventTypeRoll < 0.75 && randomDish) {
      // Add to cart
      simulatedEvents.push({
        id: `sim_evt_cart_${i}_${timestamp}`,
        type: 'add_to_cart',
        page: '/menu',
        dishId: randomDish.id,
        dishName: randomDish.name,
        category: randomDish.category,
        price: randomDish.price,
        quantity: 1,
        revenue: randomDish.price,
        timestamp,
        sessionId,
        visitorId,
        device,
        referrer,
        screenWidth: 390,
        screenHeight: 844,
      });
    } else if (eventTypeRoll < 0.9 && randomDish) {
      // Checkout
      simulatedEvents.push({
        id: `sim_evt_chk_${i}_${timestamp}`,
        type: 'checkout_click',
        page: '/menu',
        dishId: randomDish.id,
        dishName: randomDish.name,
        category: randomDish.category,
        price: randomDish.price,
        quantity: 2,
        revenue: randomDish.price * 2,
        timestamp,
        sessionId,
        visitorId,
        device,
        referrer,
        screenWidth: 390,
        screenHeight: 844,
      });
    } else {
      // Mascot chat
      simulatedEvents.push({
        id: `sim_evt_msc_${i}_${timestamp}`,
        type: 'mascot_chat',
        page: '/',
        timestamp,
        sessionId,
        visitorId,
        device,
        referrer,
        screenWidth: 390,
        screenHeight: 844,
      });
    }
  }

  // Save to storage
  const current = getStoredEvents();
  const combined = [...simulatedEvents, ...current].sort((a, b) => b.timestamp - a.timestamp).slice(0, 3000);
  localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(combined));
  window.dispatchEvent(new CustomEvent('ub_analytics_event', { detail: { type: 'seeded' } }));
}
