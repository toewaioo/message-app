import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_URL");
}
if (!supabaseAnonKey) {
  throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

// Type definition for your database schema can be generated using:
// npx supabase gen types typescript --project-id <your-project-id> > src/lib/database.types.ts
// For now, we'll use a generic SupabaseClient type.
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);
