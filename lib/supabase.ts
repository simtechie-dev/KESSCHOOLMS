import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Singleton client
export const supabase = (globalThis as any).supabase || createClient(supabaseUrl, supabaseAnonKey)
if (process.env.NODE_ENV !== 'production') (globalThis as any).supabase = supabase

export const getSupabaseClient = () => supabase

let supabaseAdminInstance: any = null
export const getSupabaseAdminClient = () => {
  if (!supabaseAdminInstance) {
    supabaseAdminInstance = (supabaseServiceKey && supabaseServiceKey.length > 10 && !supabaseServiceKey.includes('YOUR_'))
      ? createClient(supabaseUrl, supabaseServiceKey)
      : createClient(supabaseUrl, supabaseAnonKey)
  }
  return supabaseAdminInstance
}

export const supbaseAdmin = getSupabaseAdminClient()
