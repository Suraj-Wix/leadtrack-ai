// src/lib/supabase.js
// Supabase client initialisation

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check .env.local')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// =============================================
// SQL SCHEMA — run this in Supabase SQL editor
// =============================================
//
// CREATE TABLE IF NOT EXISTS leads (
//   id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
//   name            TEXT NOT NULL,
//   email           TEXT NOT NULL,
//   phone           TEXT NOT NULL,
//   company         TEXT,
//   requirement     TEXT NOT NULL,
//   created_at      TIMESTAMPTZ DEFAULT now(),
//   email_sent      BOOLEAN DEFAULT false,
//   email_opened    BOOLEAN DEFAULT false,
//   email_opened_at TIMESTAMPTZ,
//   link_clicked    BOOLEAN DEFAULT false,
//   link_clicked_at TIMESTAMPTZ,
//   click_count     INTEGER DEFAULT 0,
//   category        TEXT,
//   priority        TEXT
// );
//
// -- Enable Row Level Security
// ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
//
// -- Policy: allow anonymous inserts (for the form)
// CREATE POLICY "Allow anon inserts" ON leads
//   FOR INSERT TO anon WITH CHECK (true);
//
// -- Policy: allow anonymous reads (for dashboard)
// CREATE POLICY "Allow anon reads" ON leads
//   FOR SELECT TO anon USING (true);
//
// -- Policy: allow anonymous updates (for tracking)
// CREATE POLICY "Allow anon updates" ON leads
//   FOR UPDATE TO anon USING (true);
//
// -- Tracking events log table
// CREATE TABLE IF NOT EXISTS tracking_events (
//   id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
//   lead_id    UUID REFERENCES leads(id) ON DELETE CASCADE,
//   event_type TEXT NOT NULL,  -- 'email_sent' | 'email_opened' | 'link_clicked'
//   created_at TIMESTAMPTZ DEFAULT now(),
//   metadata   JSONB
// );
//
// ALTER TABLE tracking_events ENABLE ROW LEVEL SECURITY;
// CREATE POLICY "Allow anon insert events" ON tracking_events
//   FOR INSERT TO anon WITH CHECK (true);
// CREATE POLICY "Allow anon read events" ON tracking_events
//   FOR SELECT TO anon USING (true);
