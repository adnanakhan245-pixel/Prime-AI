import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  getDocs, 
  onSnapshot, 
  serverTimestamp, 
  increment,
  query,
  limit,
  orderBy
} from 'firebase/firestore';
import { db } from '../firebase';
import { VisitorRecord, LeadRecord, AnalyticsStats } from '../types';

const VISITOR_ID_KEY = 'prime_visitor_id';
const VISITOR_FIRST_SEEN_KEY = 'prime_visitor_first_seen';
const VISITOR_HIT_COUNT_KEY = 'prime_visitor_hit_count';
const LOCAL_LEADS_CACHE_KEY = 'prime_local_leads_cache';
const LOCAL_VISITORS_CACHE_KEY = 'prime_local_visitors_cache';

// Helper: Get or create persistent anonymous visitor ID
export function getOrCreateVisitorId(): string {
  let vid = localStorage.getItem(VISITOR_ID_KEY);
  if (!vid) {
    vid = 'vis_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);
    localStorage.setItem(VISITOR_ID_KEY, vid);
    localStorage.setItem(VISITOR_FIRST_SEEN_KEY, new Date().toISOString());
  }
  return vid;
}

// Helper: Detect Device
export function detectDevice(): 'Mobile' | 'Tablet' | 'Desktop' {
  const ua = navigator.userAgent.toLowerCase();
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'Tablet';
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(ua)) {
    return 'Mobile';
  }
  return 'Desktop';
}

// Helper: Detect human-friendly referrer source
export function detectReferrer(): string {
  const ref = document.referrer;
  if (!ref) return 'Direct Link (Direct / WhatsApp / DM)';
  try {
    const url = new URL(ref);
    const host = url.hostname.toLowerCase();
    if (host.includes('linkedin')) return 'LinkedIn';
    if (host.includes('twitter') || host.includes('t.co') || host.includes('x.com')) return 'Twitter / X';
    if (host.includes('reddit')) return 'Reddit';
    if (host.includes('facebook') || host.includes('fb.com')) return 'Facebook';
    if (host.includes('instagram')) return 'Instagram';
    if (host.includes('google')) return 'Google Search';
    if (host.includes('youtube')) return 'YouTube';
    return url.hostname;
  } catch (e) {
    return 'Web Referral';
  }
}

// Record a visitor hit across the application
export async function recordVisitorHit(params?: {
  path?: string;
  userEmail?: string | null;
  userName?: string | null;
  companyName?: string | null;
}): Promise<VisitorRecord> {
  const visitorId = getOrCreateVisitorId();
  const firstSeen = localStorage.getItem(VISITOR_FIRST_SEEN_KEY) || new Date().toISOString();
  const now = new Date().toISOString();
  
  const rawHitCount = parseInt(localStorage.getItem(VISITOR_HIT_COUNT_KEY) || '0', 10);
  const currentHits = rawHitCount + 1;
  localStorage.setItem(VISITOR_HIT_COUNT_KEY, currentHits.toString());

  const device = detectDevice();
  const referrer = detectReferrer();
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  const language = navigator.language || 'en';
  const lastPath = params?.path || window.location.pathname;

  const visitorRecord: VisitorRecord = {
    id: visitorId,
    visitorId,
    firstSeen,
    lastSeen: now,
    hits: currentHits,
    device,
    referrer,
    timezone,
    language,
    isRegistered: Boolean(params?.userEmail),
    userEmail: params?.userEmail || null,
    userName: params?.userName || null,
    companyName: params?.companyName || null,
    lastPath
  };

  // Update local cache
  try {
    const cachedRaw = localStorage.getItem(LOCAL_VISITORS_CACHE_KEY);
    const cached: VisitorRecord[] = cachedRaw ? JSON.parse(cachedRaw) : [];
    const existingIndex = cached.findIndex(v => v.visitorId === visitorId);
    if (existingIndex >= 0) {
      cached[existingIndex] = visitorRecord;
    } else {
      cached.unshift(visitorRecord);
    }
    // Keep max 50 in local cache
    localStorage.setItem(LOCAL_VISITORS_CACHE_KEY, JSON.stringify(cached.slice(0, 50)));
  } catch (e) {}

  // Sync to Firestore
  try {
    const visitorDocRef = doc(db, 'analytics_visitors', visitorId);
    await setDoc(visitorDocRef, {
      ...visitorRecord,
      updatedAtServer: serverTimestamp()
    }, { merge: true });

    // Update global aggregate summary
    const summaryRef = doc(db, 'analytics_summary', 'stats');
    const isNewVisitor = currentHits === 1;

    await setDoc(summaryRef, {
      totalHits: increment(1),
      ...(isNewVisitor ? { uniqueVisitors: increment(1) } : {}),
      lastUpdated: now,
      latestVisitor: {
        visitorId,
        device,
        referrer,
        timezone,
        timestamp: now,
        isRegistered: Boolean(params?.userEmail)
      }
    }, { merge: true });
  } catch (err) {
    console.warn('Visitor tracking notice:', err);
  }

  return visitorRecord;
}

// Record when someone registers or starts a trial
export async function recordLeadSignup(lead: {
  email: string;
  fullName: string;
  companyName: string;
  industry?: string;
  plan?: string;
}): Promise<void> {
  const cleanEmail = lead.email.trim().toLowerCase();
  
  // Ignore mock demo user registrations from generating phantom leads
  if (cleanEmail === 'ceo@apexenterprise.com' || lead.fullName.toLowerCase() === 'alexander vance') {
    return;
  }

  const visitorId = getOrCreateVisitorId();
  const leadId = 'lead_' + cleanEmail.replace(/[^a-zA-Z0-9]/g, '_');
  const now = new Date().toISOString();
  const device = detectDevice();
  const referrer = detectReferrer();

  const leadRecord: LeadRecord = {
    id: leadId,
    email: cleanEmail,
    fullName: lead.fullName,
    companyName: lead.companyName,
    industry: lead.industry || 'Enterprise SaaS',
    plan: lead.plan || '14-Day Pro Trial',
    signedUpAt: now,
    device,
    referrer
  };

  // Cache locally
  try {
    const raw = localStorage.getItem(LOCAL_LEADS_CACHE_KEY);
    const cachedLeads: LeadRecord[] = raw ? JSON.parse(raw) : [];
    const exists = cachedLeads.some(l => l.email === cleanEmail);
    if (!exists) {
      cachedLeads.unshift(leadRecord);
      localStorage.setItem(LOCAL_LEADS_CACHE_KEY, JSON.stringify(cachedLeads));
    }
  } catch (e) {}

  // Persist to Firestore
  try {
    const leadDocRef = doc(db, 'admin_leads', leadId);
    await setDoc(leadDocRef, {
      ...leadRecord,
      visitorId,
      createdAtServer: serverTimestamp()
    }, { merge: true });

    // Update total signups in summary
    const summaryRef = doc(db, 'analytics_summary', 'stats');
    await setDoc(summaryRef, {
      totalSignups: increment(1),
      lastSignupAt: now,
      latestLead: leadRecord
    }, { merge: true });

    // Update visitor record to show registered
    await recordVisitorHit({
      userEmail: cleanEmail,
      userName: lead.fullName,
      companyName: lead.companyName
    });
  } catch (err) {
    console.warn('Lead tracking notice:', err);
  }
}

// Get fallback stats from local storage
export function getLocalFallbackStats(): AnalyticsStats {
  try {
    const rawVisitors = localStorage.getItem(LOCAL_VISITORS_CACHE_KEY);
    const cachedVisitors: VisitorRecord[] = rawVisitors ? JSON.parse(rawVisitors) : [];
    const rawLeads = localStorage.getItem(LOCAL_LEADS_CACHE_KEY);
    const cachedLeads: LeadRecord[] = rawLeads ? JSON.parse(rawLeads) : [];

    const totalHits = cachedVisitors.reduce((sum, v) => sum + (v.hits || 1), 0) || 1;
    const uniqueVisitors = Math.max(cachedVisitors.length, 1);
    const totalSignups = cachedLeads.length;

    return {
      totalHits,
      uniqueVisitors,
      totalSignups,
      activeNow: 1,
      lastUpdated: new Date().toISOString(),
      recentVisitors: cachedVisitors,
      leads: cachedLeads
    };
  } catch (e) {
    return {
      totalHits: 1,
      uniqueVisitors: 1,
      totalSignups: 0,
      activeNow: 1,
      lastUpdated: new Date().toISOString(),
      recentVisitors: [],
      leads: []
    };
  }
}

// Subscribe to real-time analytics
export function subscribeToLiveAnalytics(
  onUpdate: (stats: AnalyticsStats) => void
): () => void {
  const summaryRef = doc(db, 'analytics_summary', 'stats');

  // Firestore listener
  const unsubscribeSummary = onSnapshot(summaryRef, async (snapshot) => {
    try {
      const summaryData = snapshot.data() || {};

      // Fetch recent leads
      let leads: LeadRecord[] = [];
      try {
        const leadsSnap = await getDocs(query(collection(db, 'admin_leads'), limit(30)));
        leads = leadsSnap.docs.map(d => d.data() as LeadRecord);
      } catch (e) {
        // Use local cached leads if firestore query fails
        const raw = localStorage.getItem(LOCAL_LEADS_CACHE_KEY);
        leads = raw ? JSON.parse(raw) : [];
      }

      // Fetch recent visitors
      let visitors: VisitorRecord[] = [];
      try {
        const visitorsSnap = await getDocs(query(collection(db, 'analytics_visitors'), limit(40)));
        visitors = visitorsSnap.docs.map(d => d.data() as VisitorRecord);
        // Sort descending by lastSeen
        visitors.sort((a, b) => new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime());
      } catch (e) {
        const raw = localStorage.getItem(LOCAL_VISITORS_CACHE_KEY);
        visitors = raw ? JSON.parse(raw) : [];
      }

      // Compute active now (seen in last 15 minutes)
      const fifteenMinsAgo = Date.now() - 15 * 60 * 1000;
      const activeNowCount = Math.max(
        visitors.filter(v => new Date(v.lastSeen).getTime() > fifteenMinsAgo).length,
        1
      );

      const stats: AnalyticsStats = {
        totalHits: Number(summaryData.totalHits) || Math.max(visitors.reduce((acc, v) => acc + (v.hits || 1), 0), 1),
        uniqueVisitors: Number(summaryData.uniqueVisitors) || Math.max(visitors.length, 1),
        totalSignups: Number(summaryData.totalSignups) || leads.length,
        activeNow: activeNowCount,
        lastUpdated: summaryData.lastUpdated || new Date().toISOString(),
        recentVisitors: visitors.slice(0, 25),
        leads: leads.slice(0, 25)
      };

      onUpdate(stats);
    } catch (err) {
      console.warn('Analytics snapshot error:', err);
      onUpdate(getLocalFallbackStats());
    }
  }, (err) => {
    console.warn('Analytics listener error:', err);
    onUpdate(getLocalFallbackStats());
  });

  return () => {
    unsubscribeSummary();
  };
}
