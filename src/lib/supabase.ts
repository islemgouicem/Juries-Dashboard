import { createClient } from "@supabase/supabase-js";

// Vite handles the process.env equivalent by injecting them via import.meta.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Note: In a production Vite environment, only variables starting with VITE_ are exposed.

if (!supabaseUrl || !supabaseAnonKey) {
  // It's vital to have these keys for the app to function.
  // Make sure you have the .env file with these variables:
  // VITE_SUPABASE_URL="YOUR_SUPABASE_PROJECT_URL"
  // VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_PUBLIC_KEY"
  console.error("Missing Supabase environment variables. Check your .env file.");
  throw new Error("Missing Supabase environment variables.");
}

// NOTE: Using 'any' as the Database type as the specific generated type declarations 
// for the Supabase schema (database.types) are not present in this project.
export const supabase = createClient<any>(supabaseUrl, supabaseAnonKey);

// Define Database types for Supabase usage if needed (optional)
// export type Database = any; // You can generate this type with Supabase CLI