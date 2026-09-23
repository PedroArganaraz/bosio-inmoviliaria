import { configuracionSitio } from "@/configuracion/configuracionSitio";
import { slugify } from "@/funcionalidades/propiedades/utilidades/slugify";

const URL_BASE = "https://nominatim.openstreetmap.org";
const TIEMPO_MAXIMO_MS = 8000;

export async function consultarNominatim<T>(
  ruta: "search" | "reverse",
  parametros: Record<string, string>,
): Promise<T | null> {
  const consulta = new URLSearchParams({ format: "json", "accept-language": "es", ...parametros });

  try {
    const respuesta = await fetch(`${URL_BASE}/${ruta}?${consulta}`, {
      headers: {
        "User-Agent": `${slugify(configuracionSitio.nombre)}/1.0 (${configuracionSitio.email})`,
      },
      cache: "no-store",
      signal: AbortSignal.timeout(TIEMPO_MAXIMO_MS),
    });

    return respuesta.ok ? ((await respuesta.json()) as T) : null;
  } catch {
    return null;
  }
}
