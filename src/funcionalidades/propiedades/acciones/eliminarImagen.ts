"use server";

import { revalidatePath } from "next/cache";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { obtenerUsuarioAdmin } from "@/lib/supabase/autenticacion";
import { revalidarSitioPublico } from "@/lib/revalidarSitioPublico";
import { esUuid } from "@/funcionalidades/propiedades/utilidades/esUuid";
import type { ResultadoAccionImagen } from "@/funcionalidades/propiedades/acciones/reordenarImagenes";

export async function eliminarImagen(imagenId: string): Promise<ResultadoAccionImagen> {
  await obtenerUsuarioAdmin();

  if (!esUuid(imagenId)) {
    return { error: "Identificador inválido." };
  }

  const supabase = await crearClienteServidor();

  const { data: imagen, error: errorImagen } = await supabase
    .from("imagenesPropiedad")
    .select("id, propiedadId, rutaArchivo")
    .eq("id", imagenId)
    .maybeSingle();

  if (errorImagen || !imagen) {
    return { error: "No se encontró la foto." };
  }

  const { error: errorBorrado } = await supabase.storage
    .from("propiedades")
    .remove([imagen.rutaArchivo]);

  if (errorBorrado) {
    return { error: "No se pudo borrar el archivo de la foto." };
  }

  const { data, error } = await supabase
    .from("imagenesPropiedad")
    .delete()
    .eq("id", imagenId)
    .select("id");

  if (error || !data || data.length !== 1) {
    return { error: "No se pudo eliminar la foto." };
  }

  revalidatePath("/admin/propiedades");
  revalidatePath(`/admin/propiedades/${imagen.propiedadId}/editar`);
  revalidarSitioPublico();

  return { error: null };
}
