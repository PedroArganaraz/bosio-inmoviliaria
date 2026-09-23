"use server";

import { obtenerUsuarioAdmin } from "@/lib/supabase/autenticacion";
import { consultarNominatim } from "@/funcionalidades/propiedades/utilidades/consultarNominatim";

type RespuestaInversa = {
  address?: {
    road?: string;
    house_number?: string;
    suburb?: string;
    neighbourhood?: string;
    quarter?: string;
    city_district?: string;
  };
};

export type ResultadoGeocodificacionInversa =
  | { direccion: string; barrio: string }
  | { error: string };

export async function geocodificarInversa(
  lat: number,
  lng: number,
): Promise<ResultadoGeocodificacionInversa> {
  await obtenerUsuarioAdmin();

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return { error: "Ubicación inválida." };
  }

  const respuesta = await consultarNominatim<RespuestaInversa>("reverse", {
    lat: String(lat),
    lon: String(lng),
    zoom: "18",
    addressdetails: "1",
  });

  const datos = respuesta?.address;
  const direccion = [datos?.road, datos?.house_number].filter(Boolean).join(" ");
  const barrio = datos?.suburb ?? datos?.neighbourhood ?? datos?.quarter ?? datos?.city_district ?? "";

  if (direccion === "" && barrio === "") {
    return { error: "No pudimos obtener la dirección de ese punto." };
  }

  return { direccion, barrio };
}
