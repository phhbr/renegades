/**
 * `Access-Control-Allow-Methods` is the response header; `Access-Control-Request-Method`
 * is what the browser sends on the preflight. The previous value here was the request
 * header's name (pluralised), so the preflight reply never actually declared POST — the
 * forms only worked because the Supabase gateway fills the gap. A JSON body makes these
 * non-simple requests, so the preflight has to be correct on its own.
 */
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, DELETE, PUT',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
