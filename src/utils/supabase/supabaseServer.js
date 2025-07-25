// src/utils/supabase/supabaseServer.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL,
	process.env.SUPABASE_SERVICE_ROLE_KEY,
	{
		auth: { persistSession: false, detectSessionInUrl: false },
	}
);

export { supabase };
