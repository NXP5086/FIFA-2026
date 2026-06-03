-- =============================================================
-- World Cup '26 Prediction Pool — Supabase Schema
-- Run this in your Supabase project's SQL Editor.
-- =============================================================

-- -------------------------------------------------------
-- 1. PROFILES
-- Maps each Supabase auth user to the app's internal config
-- (name, colour, initials as defined in participants.js).
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id           UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  internal_id  TEXT NOT NULL UNIQUE,   -- 'u1' – 'u9'
  name         TEXT NOT NULL,
  initials     TEXT NOT NULL,
  color        TEXT NOT NULL,
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_own"    ON public.profiles;
CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "profiles_own" ON public.profiles
  FOR ALL TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- -------------------------------------------------------
-- 2. PREDICTIONS (match predictions)
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.predictions (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id          UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  internal_user_id TEXT NOT NULL,         -- 'u1'–'u9', for client-side keying
  match_id         TEXT NOT NULL,         -- 'G01'–'G72', 'M73'–'M104'
  round_key        TEXT NOT NULL,         -- 'MD1'|'MD23'|'R32'|'R16'|'QF'|'SF'|'F3RD'
  home             INTEGER,
  away             INTEGER,
  ending           TEXT CHECK (ending IN ('NT','ET','PENS')),
  submitted        BOOLEAN DEFAULT FALSE,
  submitted_at     TIMESTAMPTZ,
  updated_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, match_id)
);

ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "predictions_select" ON public.predictions;
DROP POLICY IF EXISTS "predictions_insert" ON public.predictions;
DROP POLICY IF EXISTS "predictions_update" ON public.predictions;
DROP POLICY IF EXISTS "predictions_delete" ON public.predictions;
CREATE POLICY "predictions_select" ON public.predictions
  FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "predictions_insert" ON public.predictions
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "predictions_update" ON public.predictions
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "predictions_delete" ON public.predictions
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- -------------------------------------------------------
-- 3. AWARD PREDICTIONS
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.award_predictions (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id          UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  internal_user_id TEXT NOT NULL,
  award_id         TEXT NOT NULL,         -- 'golden_ball' | 'golden_boot' | etc.
  pick             TEXT NOT NULL,
  submitted        BOOLEAN DEFAULT FALSE,
  submitted_at     TIMESTAMPTZ,
  updated_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, award_id)
);

ALTER TABLE public.award_predictions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "award_preds_select" ON public.award_predictions;
DROP POLICY IF EXISTS "award_preds_insert" ON public.award_predictions;
DROP POLICY IF EXISTS "award_preds_update" ON public.award_predictions;
DROP POLICY IF EXISTS "award_preds_delete" ON public.award_predictions;
CREATE POLICY "award_preds_select" ON public.award_predictions
  FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "award_preds_insert" ON public.award_predictions
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "award_preds_update" ON public.award_predictions
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "award_preds_delete" ON public.award_predictions
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- -------------------------------------------------------
-- 4. Trigger: auto-update updated_at on every write
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER predictions_updated_at
  BEFORE UPDATE ON public.predictions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER award_preds_updated_at
  BEFORE UPDATE ON public.award_predictions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- -------------------------------------------------------
-- 5. MATCH RESULTS
-- Populated by the sync-results Edge Function (auto)
-- or the admin panel (manual). Clients subscribe via
-- Supabase Realtime — all 27 users see updates instantly.
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.match_results (
  match_id     TEXT PRIMARY KEY,          -- 'G01'–'G72', 'M73'–'M104'
  status       TEXT NOT NULL DEFAULT 'upcoming',  -- upcoming | live | final
  home_score   INTEGER,
  away_score   INTEGER,
  live_minute  INTEGER,
  ending       TEXT CHECK (ending IN ('NT', 'ET', 'PENS')),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.match_results ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "match_results_select" ON public.match_results;
DROP POLICY IF EXISTS "match_results_admin"  ON public.match_results;
-- All authenticated users can read results
CREATE POLICY "match_results_select" ON public.match_results
  FOR SELECT TO authenticated USING (TRUE);
-- Only service role (Edge Function / admin script) can write
-- No authenticated INSERT/UPDATE policy — writes go via service role only

CREATE OR REPLACE TRIGGER match_results_updated_at
  BEFORE UPDATE ON public.match_results
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Enable Realtime on match_results so clients get instant pushes
ALTER PUBLICATION supabase_realtime ADD TABLE public.match_results;
