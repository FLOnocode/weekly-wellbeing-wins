import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types pour TypeScript
export interface Profile {
  id: string
  user_id: string
  nickname: string
  goal_weight: number
  current_weight: number
  created_at: string
  updated_at: string
}

export interface WeightEntry {
  id: string
  user_id: string
  weight: number
  photo_url?: string
  notes?: string
  created_at: string
}