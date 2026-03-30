import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

let supabaseInstance: any = null
export const getSupabaseClient = () => {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
  }
  return supabaseInstance
}

export const supabase = getSupabaseClient()

// Only create admin client if service key is available and valid
let supabaseAdminInstance: any = null
export const getSupabaseAdminClient = () => {
  // NEVER import getSupabaseAdminClient in client components
  // Only use in API routes (server-side) to avoid exposing service_role key
  if (!supabaseAdminInstance) {
    supabaseAdminInstance = (supabaseServiceKey && supabaseServiceKey.length > 10 && !supabaseServiceKey.includes('YOUR_'))
      ? createClient(supabaseUrl, supabaseServiceKey)
      : createClient(supabaseUrl, supabaseAnonKey)
  }
  return supabaseAdminInstance
}

export const supbaseAdmin = getSupabaseAdminClient()
