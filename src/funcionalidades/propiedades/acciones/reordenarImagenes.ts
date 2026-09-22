"use server";

import { revalidatePath } from "next/cache";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { obtenerUsuarioAdmin } from "@/lib/supabase/autenticacion";
import { revalidarSitioPublico } from "@/lib/revalidarSitioPublico";
import { esUuid } from "@/funcionalidades/propiedades/utilidades/esUuid";

export type ResultadoAccionImagen = {
  error: string | null;
};

export async function reordenarImagenes(
  propiedadId: string,
  idsEnOrden: string[],
): Promise<ResultadoAccionImagen> {
  await obtenerUsuarioAdmin();

  if (!esUuid(propiedadId) || idsEnOrden.some((id) => !esUuid(id))) {
    return { error: "Datos inválidos." };
  }

  const supabase = await crearClienteServidor();

  const { data: imagenesActuales, error: errorImagenes } = await supabase
    .from("imagenesPropiedad")
    .select("id, rutaArchivo")
    .eq("propiedadId", propiedadId);

  if (errorImagenes || !imagenesActuales) {
    return { error: "No se pudo reordenar las fotos." };
  }

  const idsNuevos = new Set(idsEnOrden);
  const coincideConjunto =
    idsNuevos.size === idsEnOrden.length &&
    idsNuevos.size === imagenesActuales.length &&
    imagenesActuales.every((imagen) => idsNuevos.has(imagen.id));

  if (!coincideConjunto) {
    return { error: "El orden enviado no coincide con las fotos actuales." };
  }

  const rutaPorId = new Map(imagenesActuales.map((imagen) => [imagen.id, imagen.rutaArchivo]));

  const filas = idsEnOrden.map((id, indice) => ({
    id,
    propiedadId,
    rutaArchivo: rutaPorId.get(id)!,
    posicion: indice,
  }));

  const { error } = await supabase.from("imagenesPropiedad").upsert(filas, { onConflict: "id" });

  if (error) {
    return { error: "No se pudo reordenar las fotos." };
  }

  revalidatePath("/admin/propiedades");
  revalidatePath(`/admin/propiedades/${propiedadId}/editar`);
  revalidarSitioPublico();

  return { error: null };
}
