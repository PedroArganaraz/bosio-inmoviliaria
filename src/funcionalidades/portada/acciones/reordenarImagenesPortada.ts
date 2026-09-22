"use server";

import { revalidatePath } from "next/cache";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { obtenerUsuarioAdmin } from "@/lib/supabase/autenticacion";
import { revalidarSitioPublico } from "@/lib/revalidarSitioPublico";
import { esUuid } from "@/utilidades/esUuid";

export type ResultadoAccionImagenPortada = {
  error: string | null;
};

export async function reordenarImagenesPortada(
  idsEnOrden: string[],
): Promise<ResultadoAccionImagenPortada> {
  await obtenerUsuarioAdmin();

  if (idsEnOrden.some((id) => !esUuid(id))) {
    return { error: "Datos inválidos." };
  }

  const supabase = await crearClienteServidor();

  const { data: imagenesActuales, error: errorImagenes } = await supabase
    .from("imagenesPortada")
    .select("id, rutaArchivo");

  if (errorImagenes || !imagenesActuales) {
    return { error: "No se pudo reordenar las imágenes." };
  }

  const idsNuevos = new Set(idsEnOrden);
  const coincideConjunto =
    idsNuevos.size === idsEnOrden.length &&
    idsNuevos.size === imagenesActuales.length &&
    imagenesActuales.every((imagen) => idsNuevos.has(imagen.id));

  if (!coincideConjunto) {
    return { error: "El orden enviado no coincide con las imágenes actuales." };
  }

  const rutaPorId = new Map(imagenesActuales.map((imagen) => [imagen.id, imagen.rutaArchivo]));

  const filas = idsEnOrden.map((id, indice) => ({
    id,
    rutaArchivo: rutaPorId.get(id)!,
    posicion: indice,
  }));

  const { error } = await supabase.from("imagenesPortada").upsert(filas, { onConflict: "id" });

  if (error) {
    return { error: "No se pudo reordenar las imágenes." };
  }

  revalidatePath("/admin/portada");
  revalidarSitioPublico();

  return { error: null };
}
