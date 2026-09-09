-- =========================================================================
-- PRIME AI - SUPABASE SCHEMA & ROW LEVEL SECURITY (RLS) FOR 14-DAY TRIAL
-- Rules:
-- 1. Store trial_start_date and trial_end_date in `users` & `subscriptions` table.
-- 2. Use Supabase RLS to check if trial_end_date < now() AND status != 'active'
--    then block access to premium rows (brain_memories, crm_deals, ai_logs, etc.)
-- =========================================================================

-- 1. Enhance the 'users' table with 14-day trial timestamp columns
ALTER TABLE IF EXISTS public.users 
  ADD COLUMN IF NOT EXISTS trial_start_date TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS trial_end_date TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days'),
  ADD COLUMN IF NOT EXISTS trial_status TEXT DEFAULT 'trialing';

-- 2. Create / Update 'subscriptions' table with explicit trial columns
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id TEXT NOT NULL UNIQUE,
  user_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'trialing', -- 'trialing' | 'active' | 'expired' | 'past_due'
  trial_start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  trial_end_date TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '14 days'),
  trial_ends_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  ai_actions_remaining INTEGER DEFAULT 50,
  plan TEXT DEFAULT '14-Day Free Trial',
  plan_tier TEXT DEFAULT 'Pro',
  plan_price NUMERIC DEFAULT 0,
  payment_method TEXT,
  transaction_id TEXT,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) on subscriptions
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Allow users to view their own company subscription
CREATE POLICY "Users can view own company subscription"
  ON public.subscriptions
  FOR SELECT
  USING (
    company_id = auth.jwt() ->> 'company_id' 
    OR user_id = auth.uid()::text
  );

-- Policy: Allow users to update their company subscription upon checkout
CREATE POLICY "Users can update own company subscription"
  ON public.subscriptions
  FOR ALL
  USING (
    company_id = auth.jwt() ->> 'company_id'
    OR user_id = auth.uid()::text
  );

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) HELPER FUNCTION: is_company_subscription_active()
-- Returns TRUE if:
--   - The company has status = 'active' AND (expires_at IS NULL OR expires_at > NOW())
--   - OR The company is 'trialing' AND trial_end_date > NOW()
-- =========================================================================
CREATE OR REPLACE FUNCTION public.is_company_subscription_active(target_company_id TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_status TEXT;
  v_trial_end TIMESTAMPTZ;
  v_expires_at TIMESTAMPTZ;
BEGIN
  SELECT status, trial_end_date, expires_at
  INTO v_status, v_trial_end, v_expires_at
  FROM public.subscriptions
  WHERE company_id = target_company_id
  LIMIT 1;

  -- 1. Active paid subscriber
  IF v_status = 'active' THEN
    IF v_expires_at IS NULL OR v_expires_at > NOW() THEN
      RETURN TRUE;
    ELSE
      RETURN FALSE;
    END IF;
  END IF;

  -- 2. Valid 14-day trial period
  IF v_status = 'trialing' AND v_trial_end IS NOT NULL AND v_trial_end > NOW() THEN
    RETURN TRUE;
  END IF;

  -- 3. Otherwise expired or past due
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =========================================================================
-- SUPABASE RLS POLICIES FOR PREMIUM FEATURES (Brain, Radar, Deals, Alerts)
-- =========================================================================

-- Example: Premium CRM Deals Table RLS (Restricted if trial expired)
CREATE POLICY "Allow deal reads only if trial is active or paid"
  ON public.crm_records
  FOR SELECT
  USING (
    company_id = auth.jwt() ->> 'company_id'
    AND public.is_company_subscription_active(company_id)
  );

-- Example: Brain 3.0 CEO Knowledge Base RLS
CREATE POLICY "Allow neural memory reads only if trial is active or paid"
  ON public.brain_memories
  FOR ALL
  USING (
    company_id = auth.jwt() ->> 'company_id'
    AND public.is_company_subscription_active(company_id)
  );
