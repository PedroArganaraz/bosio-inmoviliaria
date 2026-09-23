"use server";

import { obtenerUsuarioAdmin } from "@/lib/supabase/autenticacion";
import { consultarNominatim } from "@/funcionalidades/propiedades/utilidades/consultarNominatim";

const MENSAJE_SIN_RESULTADO =
  "No pudimos encontrar esa dirección. Ubicá el punto arrastrándolo en el mapa.";

export type ResultadoGeocodificacion = { lat: number; lng: number } | { error: string };

export async function geocodificarDireccion(
  direccion: string,
  barrio: string,
  ciudad: string,
): Promise<ResultadoGeocodificacion> {
  await obtenerUsuarioAdmin();

  const direccionLimpia = direccion.trim();
  if (direccionLimpia === "") {
    return { error: MENSAJE_SIN_RESULTADO };
  }

  const consulta = [direccionLimpia, barrio.trim(), ciudad.trim(), "Argentina"]
    .filter((parte) => parte !== "")
    .join(", ");

  const resultados = await consultarNominatim<{ lat?: string; lon?: string }[]>("search", {
    q: consulta,
    limit: "1",
  });

  const lat = Number(resultados?.[0]?.lat);
  const lng = Number(resultados?.[0]?.lon);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return { error: MENSAJE_SIN_RESULTADO };
  }

  return { lat, lng };
}
