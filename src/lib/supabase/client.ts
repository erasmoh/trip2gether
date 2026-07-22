import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !publishableKey) {
  throw new Error(
    "Faltan NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. Copia .env.example a .env.local y completa los valores (`supabase status`).",
  );
}

// Single browser client for the whole app. The app is 100% client-rendered
// (no Server Components/Proxy read the session), so the default
// localStorage-backed session storage from supabase-js is enough — no need
// for the @supabase/ssr cookie-based clients.
export const supabase = createClient<Database>(url, publishableKey);
