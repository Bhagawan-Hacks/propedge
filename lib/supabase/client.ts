import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/database.types';

export function createClient() {
  return createBrowserClient<any>(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mockprojectid.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock_key'
  );
}
