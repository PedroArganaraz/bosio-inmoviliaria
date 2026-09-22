"use server";

import { revalidatePath } from "next/cache";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { obtenerUsuarioAdmin } from "@/lib/supabase/autenticacion";
import { revalidarSitioPublico } from "@/lib/revalidarSitioPublico";
import { esUuid } from "@/utilidades/esUuid";
import type { ResultadoAccionPropiedad } from "@/funcionalidades/propiedades/acciones/cambiarEstadoActiva";

export async function eliminarPropiedad(id: string): Promise<ResultadoAccionPropiedad> {
  await obtenerUsuarioAdmin();

  if (!esUuid(id)) {
    return { error: "Identificador inválido." };
  }

  const supabase = await crearClienteServidor();

  const { data: archivos, error: errorListado } = await supabase.storage
    .from("propiedades")
    .list(id);

  if (errorListado) {
    return { error: "No se pudieron revisar las imágenes de la propiedad." };
  }

  if (archivos.length > 0) {
    const rutas = archivos.map((archivo) => `${id}/${archivo.name}`);
    const { error: errorBorrado } = await supabase.storage.from("propiedades").remove(rutas);

    if (errorBorrado) {
      return { error: "No se pudieron borrar las imágenes de la propiedad." };
    }
  }

  const { data, error } = await supabase.from("propiedades").delete().eq("id", id).select("id");

  if (error || !data || data.length !== 1) {
    return { error: "No se pudo eliminar la propiedad." };
  }

  revalidatePath("/admin/propiedades");
  revalidarSitioPublico();

  return { error: null };
}
