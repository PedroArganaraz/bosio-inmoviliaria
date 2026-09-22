import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/tipos/baseDeDatos";

const PATRON_UUID = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";
const BUCKET = "propiedades";

export function esPorcentajeValido(valor: number): boolean {
  return Number.isInteger(valor) && valor >= 0 && valor <= 100;
}

export function esRutaImagenValida(prefijoRuta: string, rutaArchivo: string): boolean {
  const regex = new RegExp(`^${prefijoRuta}/${PATRON_UUID}\\.(webp|jpg)$`, "i");
  return regex.test(rutaArchivo);
}

export async function borrarArchivoMejorEsfuerzo(
  supabase: SupabaseClient<Database>,
  rutaArchivo: string,
) {
  try {
    await supabase.storage.from(BUCKET).remove([rutaArchivo]);
  } catch {
    // Mejor esfuerzo: si falla, queda un archivo huérfano en el bucket.
  }
}
