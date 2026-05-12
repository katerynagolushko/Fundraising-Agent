import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  user_id: string;
  sector: string;
  stage: string;
  round_size: string;
  model: string;
  geography: string[];
  problem: string;
  solution: string;
  why_now: string;
  traction: string;
  warm_connections: string;
  created_at: string;
};

export type Founder = {
  id: string;
  profile_id: string;
  name: string;
  background: string;
  linkedin: string;
};

export type InvestorRecord = {
  id: string;
  profile_id: string;
  name: string;
  fund: string;
  type: string;
  sectors: string[];
  stage: string;
  check_size: string;
  path: string;
  mutual: string;
  email: string;
  linkedin: string;
  twitter: string;
  approach: string;
  cold_message: string;
  signals: string[];
  flag: string;
  apply_url?: string;
  deadline?: string;
  accelerator_note?: string;
  status: string;
  rank: number;
  created_at: string;
};
