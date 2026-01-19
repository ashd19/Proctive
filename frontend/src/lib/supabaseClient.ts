import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://vnwpomlydchytkudgwvh.supabase.co";
const supabaseAnonKey = "sb_publishable_3o8VYzLKISrXEl7iIWaVPw_vaWhcVqR";

export const supabase = createClient(supabaseUrl, supabaseAnonKey)