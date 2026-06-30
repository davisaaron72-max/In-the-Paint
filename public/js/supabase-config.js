// Supabase client config — In The Paint
// Reuses the same CDN-import pattern as DavisFit (no build step needed).

const SUPABASE_URL = "https://znpwkelvpxykgnzqpfnv.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpucHdrZWx2cHh5a2duenFwZm52Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3ODIwOTIsImV4cCI6MjA5ODM1ODA5Mn0.Zq2-8BY4RPzpmqUo0t4yz6kNTSLQIfcdCYd3r1rMy7I";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
