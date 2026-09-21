import { createClient } from "@supabase/supabase-js";

// getPublicUrl no hace red ni necesita sesión: alcanza con un cliente
// liviano, sirve tanto en Server Components como en Client Components.
const supabasePublico = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export function construirUrlImagen(rutaArchivo: string): string {
  return supabasePublico.storage.from("propiedades").getPublicUrl(rutaArchivo).data.publicUrl;
}
