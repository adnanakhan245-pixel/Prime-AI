import { getSupabaseClient } from './crm';
import { UserSubscription, PlanTier } from '../types';

const SUBSCRIPTION_STORAGE_KEY_PREFIX = 'prime_subscription_company_';

export interface PlanConfig {
  id: PlanTier;
  name: string;
  price: number;
  period: string;
  description: string;
  tagline: string;
  badge?: string;
  popular?: boolean;
  payoneerUrl?: string;
  features: string[];
  limits: {
    pipelineLimit: string;
    aiActionsLimit: string;
    seatsLimit: string;
    integrations: string;
  };
}

export const SAAS_PLANS: Record<'Starter' | 'Pro' | 'Enterprise', PlanConfig> = {
  Starter: {
    id: 'Starter',
    name: 'Starter',
    price: 499,
    period: '/month',
    tagline: 'Essential AI Chief of Operations',
    description: 'For boutique firms, funded founders, and agencies in the US, UK, EU & Canada needing high-leverage email triage and ARR protection.',
    payoneerUrl: 'https://link.payoneer.com/Token?t=5458C90B22F3430F88E7A1FBDC6C5FDB&src=pl',
    features: [
      'Autonomous Email Triage & 1-Click Approval Queue',
      'Revenue Radar pipeline tracking up to $1M ARR',
      '500 Monthly High-Leverage AI Actions',
      'Daily 9:00 AM Executive Briefing digest',
      'Single Company Multi-Tenant Workspace',
      'Supabase Database & SOC2 tenant encryption',
      'Standard Priority Support (US/UK/EU hours)'
    ],
    limits: {
      pipelineLimit: '$1,000,000 ARR',
      aiActionsLimit: '500 Actions / month',
      seatsLimit: 'Up to 5 Executive Seats',
      integrations: 'Standard CRM + Supabase'
    }
  },
  Pro: {
    id: 'Pro',
    name: 'Pro',
    price: 1499,
    period: '/month',
    popular: true,
    badge: 'MOST POPULAR • EXECUTIVE FAVORITE',
    tagline: '24/7 Full Autonomous AI Chief of Operations',
    description: 'Replaces $250k/year C-suite overhead with unlimited 24/7 strategic velocity, CEO Digital Twin 3.0, Closer AI, and real-time revenue radar.',
    payoneerUrl: 'https://link.payoneer.com/Token?t=8333923BB69649B697D2831CEAF91E38&src=pl',
    features: [
      'Unlimited 24/7 Autonomous AI Chief of Operations (COO)',
      'CEO Digital Twin 3.0: High-Fidelity Voice & Decision Clone',
      'Unlimited Pipeline ARR Tracking & Live Radar Telemetry',
      'Unlimited Autonomous AI Actions & Strategic Consultations',
      'Closer AI: Sales Call Audio Analyzer & Objection Scoring',
      'Strategic 90-Day Execution Roadmaps & Growth Audits',
      'Automated Board Pack & Investor Deck Generator',
      'Priority Gemini 3.7 Flash High-Reasoning Engine',
      'Dedicated Account Executive & Fast-Track Slack Support'
    ],
    limits: {
      pipelineLimit: 'Unlimited Pipeline ARR',
      aiActionsLimit: 'Unlimited Actions',
      seatsLimit: 'Up to 20 Executive Seats',
      integrations: 'Full Suite (Stripe, CRM, Supabase, Calendar)'
    }
  },
  Enterprise: {
    id: 'Enterprise',
    name: 'Enterprise',
    price: 2999,
    period: '/month',
    badge: 'MAXIMUM VELOCITY & SCALE',
    tagline: 'Multi-Entity Strategic Command Center',
    description: 'For US/UK/EU enterprise scale-ups, venture portfolios, and private equity holding companies requiring multi-entity operations and custom SLAs.',
    payoneerUrl: 'https://link.payoneer.com/Token?t=F64460ABB669438DA92734B97AB9AF70&src=pl',
    features: [
      'Multi-Entity Holding Company Rollup & Consolidated View',
      'Custom Fine-Tuned Domain Models for your specific industry',
      'Unlimited Executive & Leadership Team Seats',
      'White-Glove Custom CRM, ERP, and Data Warehouse ETL',
      'Dedicated Solutions Architect & 1-Hour SLA Guarantee',
      'Custom Security Audits, GDPR, HIPAA & SOC2 Type II Telemetry',
      'On-Premise or Private VPC Supabase / Cloud Deployment'
    ],
    limits: {
      pipelineLimit: 'Unlimited Multi-Entity Rollup',
      aiActionsLimit: 'Dedicated High-Throughput Cluster',
      seatsLimit: 'Unlimited Seats',
      integrations: 'Custom API + SSO + Data Warehouses'
    }
  }
};

export function calculateDaysRemaining(trialEndsAt?: string): number {
  if (!trialEndsAt) return 0;
  try {
    const end = new Date(trialEndsAt).getTime();
    const now = Date.now();
    const diffDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  } catch (e) {
    return 0;
  }
}

export function calculateSubscriptionDaysRemaining(sub: UserSubscription | null): number {
  if (!sub) return 0;
  if (sub.status === 'active') {
    if (sub.expiresAt) {
      return calculateDaysRemaining(sub.expiresAt);
    }
    return 30; // default 1-month active
  }
  if (sub.status === 'trialing') {
    return calculateDaysRemaining(sub.trialEndDate || sub.trialEndsAt);
  }
  return 0;
}

export function isSubscriptionActive(sub: UserSubscription | null): boolean {
  if (!sub) return false;
  if (sub.status === 'active') {
    if (sub.expiresAt) {
      return new Date(sub.expiresAt).getTime() > Date.now();
    }
    return true;
  }
  if (sub.status === 'trialing') {
    const endDate = sub.trialEndDate || sub.trialEndsAt;
    if (!endDate) return false;
    return new Date(endDate).getTime() > Date.now();
  }
  return false;
}

export function isTrialExpired(sub: UserSubscription | null): boolean {
  if (!sub) return true;
  if (sub.status === 'active') {
    if (sub.expiresAt) {
      return new Date(sub.expiresAt).getTime() <= Date.now();
    }
    return false;
  }
  const endDate = sub.trialEndDate || sub.trialEndsAt;
  if (!endDate) return true;
  return new Date(endDate).getTime() <= Date.now();
}

// Check if a specific feature is locked based on 14-day trial & subscription status
// Free users can always access 'dashboard', 'plans', 'roi-calculator', 'settings', 'feedback'
// Premium features ('brain', 'radar', 'closer', 'twin', 'alerts', 'meetings', 'strategy', etc.) lock after 14 days
export function isFeatureLocked(sub: UserSubscription | null, featureKey: string): boolean {
  // Public/free views that remain accessible to free users
  const openViews = ['dashboard', 'plans', 'roi-calculator', 'feedback', 'settings', 'white-label', 'admin'];
  if (openViews.includes(featureKey)) {
    return false;
  }

  // If user has an active paid subscription, nothing is locked
  if (sub?.status === 'active' && isSubscriptionActive(sub)) {
    return false;
  }

  // If user is currently in their 14-day free trial, unlock everything
  if (sub?.status === 'trialing' && isSubscriptionActive(sub)) {
    return false;
  }

  // Otherwise, lock premium features (Brain 3.0, Revenue Radar, Alerts/Closer, etc.)
  return true;
}

// Generates 14-Day Free Trial for new user signups (No credit card required)
export function generateDefaultTrial(companyId: string, userId: string): UserSubscription {
  const now = new Date();
  const trialStartDate = now.toISOString();
  const fourteenDaysLater = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString();

  return {
    companyId: companyId || 'default_comp',
    userId: userId || 'user_anon',
    status: 'trialing',
    trialStartDate,
    trialEndDate: fourteenDaysLater,
    trialEndsAt: fourteenDaysLater,
    trial_start_date: trialStartDate,
    trial_end_date: fourteenDaysLater,
    aiActionsRemaining: 50,
    plan: '14-Day Free Trial',
    planTier: 'Pro',
    planPrice: 0,
    createdAt: trialStartDate,
    updatedAt: trialStartDate,
  };
}

// Fetch company subscription from Supabase table 'subscriptions', falling back to localStorage
export async function getSubscription(companyId: string, userId?: string): Promise<UserSubscription> {
  const resolvedCompanyId = companyId || 'default_comp';
  const resolvedUserId = userId || 'user_anon';

  // Check local cache first
  let cached: UserSubscription | null = null;
  try {
    const local = localStorage.getItem(SUBSCRIPTION_STORAGE_KEY_PREFIX + resolvedCompanyId);
    if (local) {
      cached = JSON.parse(local);
    }
  } catch (e) {}

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('company_id', resolvedCompanyId)
        .maybeSingle();

      if (!error && data) {
        const trialStart = data.trial_start_date || (cached?.trialStartDate ?? data.created_at ?? new Date().toISOString());
        const trialEnd = data.trial_end_date || data.trial_ends_at || (cached?.trialEndDate ?? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString());

        const sub: UserSubscription = {
          id: data.id,
          companyId: data.company_id || resolvedCompanyId,
          userId: data.user_id || resolvedUserId,
          status: data.status || 'trialing',
          trialStartDate: trialStart,
          trialEndDate: trialEnd,
          trialEndsAt: trialEnd,
          trial_start_date: trialStart,
          trial_end_date: trialEnd,
          expiresAt: data.expires_at || (data.status === 'active' ? (cached?.expiresAt ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()) : undefined),
          aiActionsRemaining: typeof data.ai_actions_remaining === 'number' ? data.ai_actions_remaining : 50,
          plan: data.plan || (data.status === 'active' ? 'Pro' : '14-Day Free Trial'),
          planTier: (data.plan_tier || (data.status === 'active' ? 'Pro' : 'Trial')) as PlanTier,
          planPrice: data.plan_price || (data.plan === 'Starter' ? 499 : data.plan === 'Enterprise' ? 2999 : data.status === 'active' ? 1499 : 0),
          paymentMethod: data.payment_method,
          transactionId: data.transaction_id,
          stripeCustomerId: data.stripe_customer_id,
          stripeSubscriptionId: data.stripe_subscription_id,
          createdAt: data.created_at || new Date().toISOString(),
          updatedAt: data.updated_at || new Date().toISOString(),
        };

        // Cache locally
        localStorage.setItem(SUBSCRIPTION_STORAGE_KEY_PREFIX + resolvedCompanyId, JSON.stringify(sub));
        return sub;
      } else if (!data) {
        // Create initial 14-day trial in Supabase
        const newTrial = cached || generateDefaultTrial(resolvedCompanyId, resolvedUserId);
        await saveSubscriptionToSupabase(newTrial);
        return newTrial;
      }
    } catch (err) {
      console.warn('Supabase subscription fetch notice:', err);
    }
  }

  // Fallback to cached or new trial
  if (!cached) {
    cached = generateDefaultTrial(resolvedCompanyId, resolvedUserId);
    try {
      localStorage.setItem(SUBSCRIPTION_STORAGE_KEY_PREFIX + resolvedCompanyId, JSON.stringify(cached));
    } catch (e) {}
  }
  return cached;
}

// Persist / Upsert subscription in Supabase 'subscriptions' and 'users' table
export async function saveSubscriptionToSupabase(sub: UserSubscription): Promise<boolean> {
  const companyId = sub.companyId || 'default_comp';
  const userId = sub.userId || 'user_anon';
  const trialStart = sub.trialStartDate || sub.trial_start_date || new Date().toISOString();
  const trialEnd = sub.trialEndDate || sub.trialEndsAt || sub.trial_end_date || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

  // Update local cache
  try {
    localStorage.setItem(SUBSCRIPTION_STORAGE_KEY_PREFIX + companyId, JSON.stringify(sub));
  } catch (e) {}

  const supabase = getSupabaseClient();
  if (!supabase) return true;

  try {
    const payload = {
      company_id: companyId,
      user_id: userId,
      status: sub.status,
      trial_start_date: trialStart,
      trial_end_date: trialEnd,
      trial_ends_at: trialEnd,
      expires_at: sub.expiresAt || null,
      ai_actions_remaining: sub.aiActionsRemaining,
      plan: sub.plan,
      plan_tier: sub.planTier || (sub.status === 'active' ? 'Pro' : 'Trial'),
      plan_price: sub.planPrice || 0,
      payment_method: sub.paymentMethod || null,
      transaction_id: sub.transactionId || null,
      stripe_customer_id: sub.stripeCustomerId || null,
      stripe_subscription_id: sub.stripeSubscriptionId || null,
      updated_at: new Date().toISOString(),
    };

    // 1. Upsert into Supabase 'subscriptions' table
    const { error } = await supabase
      .from('subscriptions')
      .upsert([payload], { onConflict: 'company_id' });

    if (error) {
      console.warn('Supabase subscriptions table upsert note:', error.message);
    }

    // 2. Also store trial_start_date and trial_end_date in Supabase 'users' table (Rule 2)
    try {
      await supabase
        .from('users')
        .upsert([
          {
            id: userId,
            company_id: companyId,
            trial_start_date: trialStart,
            trial_end_date: trialEnd,
            trial_status: sub.status,
            updated_at: new Date().toISOString()
          }
        ], { onConflict: 'id' });
    } catch (userErr: any) {
      console.warn('Supabase users table trial sync notice:', userErr.message || userErr);
    }

    // 3. Update company record plan & mrr in 'companies' table
    try {
      const planPrice = sub.status === 'active' ? (sub.planPrice || 999) : 0;
      await supabase
        .from('companies')
        .update({
          plan: sub.plan,
          mrr: planPrice,
          status: sub.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', companyId);
    } catch (e) {}

    return true;
  } catch (e: any) {
    console.warn('Supabase save subscription error:', e.message || e);
    return false;
  }
}

// Decrement AI action count for trial users
export async function recordAiActionUsage(companyId: string, userId: string): Promise<{ success: boolean; remaining: number }> {
  const sub = await getSubscription(companyId, userId);

  // Paid active plans have unlimited actions
  if (sub.status === 'active') {
    return { success: true, remaining: 99999 };
  }

  if (sub.aiActionsRemaining <= 0) {
    return { success: false, remaining: 0 };
  }

  const updated: UserSubscription = {
    ...sub,
    aiActionsRemaining: Math.max(0, sub.aiActionsRemaining - 1),
    updatedAt: new Date().toISOString(),
  };

  await saveSubscriptionToSupabase(updated);
  return { success: true, remaining: updated.aiActionsRemaining };
}

// Upgrade company to a paid SaaS Tier: Starter ($499/mo), Pro ($999/mo), Enterprise ($2,999/mo)
// Sets exact 1-month (30 days) validity from payment timestamp
export async function upgradeCompanyPlan(
  companyId: string, 
  userId: string, 
  planTier: 'Starter' | 'Pro' | 'Enterprise',
  stripeSubscriptionId?: string,
  paymentMethod: 'PAYONEER' | 'STRIPE' | 'CARD' | 'PADDLE' | 'LEMON_SQUEEZY' = 'STRIPE',
  transactionId?: string
): Promise<UserSubscription> {
  const current = await getSubscription(companyId, userId);
  const planInfo = SAAS_PLANS[planTier] || SAAS_PLANS.Pro;

  // 1-month exact validity (30 days)
  const oneMonthFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const upgraded: UserSubscription = {
    ...current,
    companyId,
    userId,
    status: 'active',
    plan: planTier,
    planTier: planTier,
    planPrice: planInfo.price,
    aiActionsRemaining: 99999, // Unlimited for paid active users
    expiresAt: oneMonthFromNow,
    paymentMethod,
    transactionId: transactionId || `txn_${Date.now().toString(36)}`,
    stripeSubscriptionId: stripeSubscriptionId || `sub_${paymentMethod.toLowerCase()}_${planTier.toLowerCase()}_${Date.now().toString(36)}`,
    updatedAt: new Date().toISOString(),
  };

  await saveSubscriptionToSupabase(upgraded);
  return upgraded;
}

// Record Instant Automatic Payment (Unlocks 1-month full access immediately)
export async function recordInstantAutomaticPayment(
  companyId: string,
  userId: string,
  planTier: 'Starter' | 'Pro' | 'Enterprise',
  paymentMethod: 'PAYONEER' | 'STRIPE' | 'CARD' | 'PADDLE' = 'PAYONEER',
  transactionId?: string
): Promise<UserSubscription> {
  return await upgradeCompanyPlan(companyId, userId, planTier, undefined, paymentMethod, transactionId);
}
