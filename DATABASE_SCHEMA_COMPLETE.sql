-- Enhanced AI Recommendations and Notifications Schema
-- Run this in Supabase SQL Editor

-- ============================================
-- AI Recommendations Table (Enhanced)
-- ============================================
CREATE TABLE IF NOT EXISTS ai_recommendations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID REFERENCES food_listings(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  rank INTEGER NOT NULL,
  match_score DECIMAL(3, 2) NOT NULL,
  reasoning TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'notified', 'claimed', 'expired', 'ignored')),
  notified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Notifications Table
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES food_listings(id) ON DELETE CASCADE,
  recommendation_id UUID REFERENCES ai_recommendations(id) ON DELETE CASCADE,
  type TEXT DEFAULT 'recommendation' CHECK (type IN ('recommendation', 'claim_update', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Match Outcomes Table
-- ============================================
CREATE TABLE IF NOT EXISTS match_outcomes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recommendation_id UUID REFERENCES ai_recommendations(id) ON DELETE CASCADE,
  outcome TEXT NOT NULL CHECK (outcome IN ('claimed', 'expired', 'ignored')),
  time_to_action INTERVAL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Enable Row Level Security
-- ============================================
ALTER TABLE ai_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_outcomes ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS Policies for ai_recommendations
-- ============================================
DROP POLICY IF EXISTS "Anyone can view recommendations" ON ai_recommendations;
DROP POLICY IF EXISTS "System can insert recommendations" ON ai_recommendations;
DROP POLICY IF EXISTS "System can update recommendations" ON ai_recommendations;

CREATE POLICY "Recipients can view their recommendations"
  ON ai_recommendations FOR SELECT
  USING (auth.uid() = recipient_id);

CREATE POLICY "System can insert recommendations"
  ON ai_recommendations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update recommendations"
  ON ai_recommendations FOR UPDATE
  USING (true);

-- ============================================
-- RLS Policies for notifications
-- ============================================
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their notifications" ON notifications;

CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = recipient_id);

CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = recipient_id);

-- ============================================
-- RLS Policies for match_outcomes
-- ============================================
DROP POLICY IF EXISTS "Anyone can view outcomes" ON match_outcomes;
DROP POLICY IF EXISTS "System can insert outcomes" ON match_outcomes;

CREATE POLICY "System can view outcomes"
  ON match_outcomes FOR SELECT
  USING (true);

CREATE POLICY "System can insert outcomes"
  ON match_outcomes FOR INSERT
  WITH CHECK (true);

-- ============================================
-- Indexes for Performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_listing ON ai_recommendations(listing_id);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_recipient ON ai_recommendations(recipient_id);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_status ON ai_recommendations(status);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_match_outcomes_recommendation ON match_outcomes(recommendation_id);

-- ============================================
-- Trigger for updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_ai_recommendations_updated_at ON ai_recommendations;
CREATE TRIGGER update_ai_recommendations_updated_at
    BEFORE UPDATE ON ai_recommendations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
