// src/lib/supabaseFetch.ts
// Helper for calling Supabase REST API with correct headers and key

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Supabase environment variables are not set");
}

export type SupabaseTable =
  | "content"
  | "reservation"
  | "request"
  | "gallery_images"
  | "gallery_videos"
  | "offers";
// Add more table names as needed

interface SupabaseFetchOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: any;
  headers?: Record<string, string>;
  admin?: boolean; // Use service_role key if true
  query?: string; // URL query string, e.g. "id=eq.1"
}

export async function supabaseFetch<T = any>(
  table: SupabaseTable,
  options: SupabaseFetchOptions = {}
): Promise<T> {
  const { method = "GET", body, headers = {}, admin = false, query } = options;
  const apiKey = admin ? SUPABASE_SERVICE_ROLE_KEY : SUPABASE_ANON_KEY;
  let url = `${SUPABASE_URL}/rest/v1/${table}`;
  if (query) url += `?${query}`;

  const fetchOptions: RequestInit = {
    method,
    headers: {
      apikey: apiKey,
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...headers,
    },
  };
  if (body) fetchOptions.body = JSON.stringify(body);

  const res = await fetch(url, fetchOptions);
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(
      `Supabase fetch error: ${res.status} ${res.statusText} - ${errorText}`
    );
  }
  // If DELETE, no content
  if (method === "DELETE") return {} as T;
  // Prefer JSON, but allow empty
  const text = await res.text();
  return text ? JSON.parse(text) : ({} as T);
}
