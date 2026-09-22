"use server";

import { revalidatePath } from "next/cache";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { obtenerUsuarioAdmin } from "@/lib/supabase/autenticacion";
import { revalidarSitioPublico } from "@/lib/revalidarSitioPublico";
import { esUuid } from "@/utilidades/esUuid";
import type { ResultadoAccionImagenPortada } from "@/funcionalidades/portada/acciones/reordenarImagenesPortada";

export async function eliminarImagenPortada(imagenId: string): Promise<ResultadoAccionImagenPortada> {
  await obtenerUsuarioAdmin();

  if (!esUuid(imagenId)) {
    return { error: "Identificador inválido." };
  }

  const supabase = await crearClienteServidor();

  const { data: imagen, error: errorImagen } = await supabase
    .from("imagenesPortada")
    .select("id, rutaArchivo")
    .eq("id", imagenId)
    .maybeSingle();

  if (errorImagen || !imagen) {
    return { error: "No se encontró la imagen." };
  }

  const { error: errorBorrado } = await supabase.storage
    .from("propiedades")
    .remove([imagen.rutaArchivo]);

  if (errorBorrado) {
    return { error: "No se pudo borrar el archivo de la imagen." };
  }

  const { data, error } = await supabase
    .from("imagenesPortada")
    .delete()
    .eq("id", imagenId)
    .select("id");

  if (error || !data || data.length !== 1) {
    return { error: "No se pudo eliminar la imagen." };
  }

  revalidatePath("/admin/portada");
  revalidarSitioPublico();

  return { error: null };
}
