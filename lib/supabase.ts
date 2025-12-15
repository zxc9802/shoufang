import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// 只在客户端或有环境变量时创建真实客户端
export const supabase = supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null as any

// 检查Supabase是否可用
export const isSupabaseConfigured = () => {
    return !!supabaseUrl && !!supabaseAnonKey
}
