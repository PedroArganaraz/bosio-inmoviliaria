"use server";

import { revalidatePath } from "next/cache";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { obtenerUsuarioAdmin } from "@/lib/supabase/autenticacion";
import { revalidarSitioPublico } from "@/lib/revalidarSitioPublico";
import { esUuid } from "@/funcionalidades/propiedades/utilidades/esUuid";

export type ResultadoAccionPropiedad = {
  error: string | null;
};

export async function cambiarEstadoActiva(
  id: string,
  activa: boolean,
): Promise<ResultadoAccionPropiedad> {
  await obtenerUsuarioAdmin();

  if (!esUuid(id) || typeof activa !== "boolean") {
    return { error: "Datos inválidos." };
  }

  const supabase = await crearClienteServidor();
  const { data, error } = await supabase
    .from("propiedades")
    .update({ activa })
    .eq("id", id)
    .select("id");

  if (error || !data || data.length !== 1) {
    return { error: "No se pudo actualizar el estado de la propiedad." };
  }

  revalidatePath("/admin/propiedades");
  revalidarSitioPublico();

  return { error: null };
}
