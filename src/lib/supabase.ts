import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://pyjtmebdzwbxvnzmhoyi.supabase.co";
const supabaseAnonKey = "sb_publishable_hOLL0A3p6OcAoBTrYp9YSQ_wVxqr7Jm";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);