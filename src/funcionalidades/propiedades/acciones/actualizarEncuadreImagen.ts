"use server";

import { revalidatePath } from "next/cache";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { obtenerUsuarioAdmin } from "@/lib/supabase/autenticacion";
import { revalidarSitioPublico } from "@/lib/revalidarSitioPublico";
import { esUuid } from "@/funcionalidades/propiedades/utilidades/esUuid";
import type { ResultadoAccionImagen } from "@/funcionalidades/propiedades/acciones/reordenarImagenes";

function esPorcentajeValido(valor: number): boolean {
  return Number.isInteger(valor) && valor >= 0 && valor <= 100;
}

export async function actualizarEncuadreImagen(
  imagenId: string,
  puntoFocalX: number,
  puntoFocalY: number,
): Promise<ResultadoAccionImagen> {
  await obtenerUsuarioAdmin();

  if (!esUuid(imagenId) || !esPorcentajeValido(puntoFocalX) || !esPorcentajeValido(puntoFocalY)) {
    return { error: "Datos inválidos." };
  }

  const supabase = await crearClienteServidor();

  const { data, error } = await supabase
    .from("imagenesPropiedad")
    .update({ puntoFocalX, puntoFocalY })
    .eq("id", imagenId)
    .select("propiedadId");

  if (error || !data || data.length !== 1) {
    return { error: "No se pudo guardar el encuadre." };
  }

  const propiedadId = data[0].propiedadId;

  revalidatePath("/admin/propiedades");
  revalidatePath(`/admin/propiedades/${propiedadId}/editar`);
  revalidarSitioPublico();

  return { error: null };
}
