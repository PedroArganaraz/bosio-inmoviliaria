"use server";

import { revalidatePath } from "next/cache";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { obtenerUsuarioAdmin } from "@/lib/supabase/autenticacion";
import { revalidarSitioPublico } from "@/lib/revalidarSitioPublico";
import { esUuid } from "@/utilidades/esUuid";
import { esPorcentajeValido } from "@/utilidades/gestionImagenesServidor";
import type { ResultadoAccionImagenPortada } from "@/funcionalidades/portada/acciones/reordenarImagenesPortada";

export async function actualizarEncuadrePortada(
  imagenId: string,
  puntoFocalX: number,
  puntoFocalY: number,
): Promise<ResultadoAccionImagenPortada> {
  await obtenerUsuarioAdmin();

  if (!esUuid(imagenId) || !esPorcentajeValido(puntoFocalX) || !esPorcentajeValido(puntoFocalY)) {
    return { error: "Datos inválidos." };
  }

  const supabase = await crearClienteServidor();

  const { data, error } = await supabase
    .from("imagenesPortada")
    .update({ puntoFocalX, puntoFocalY })
    .eq("id", imagenId)
    .select("id");

  if (error || !data || data.length !== 1) {
    return { error: "No se pudo guardar el encuadre." };
  }

  revalidatePath("/admin/portada");
  revalidarSitioPublico();

  return { error: null };
}
