import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://jfloqicdxfphdqoajxwz.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmbG9xaWNkeGZwaGRxb2FqeHd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3ODQzMTUsImV4cCI6MjA3MzM2MDMxNX0.CkG4I8-OvtmfPYRTdI4-6Zgnwid5Ws6F5cX2imF1mdk";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);