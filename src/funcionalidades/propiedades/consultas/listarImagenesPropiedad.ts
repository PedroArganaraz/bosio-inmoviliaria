import { crearClienteServidor } from "@/lib/supabase/servidor";
import type { Tables } from "@/tipos/baseDeDatos";

export type ImagenPropiedad = Tables<"imagenesPropiedad">;

export async function listarImagenesPropiedad(propiedadId: string): Promise<ImagenPropiedad[]> {
  const supabase = await crearClienteServidor();

  const { data, error } = await supabase
    .from("imagenesPropiedad")
    .select("*")
    .eq("propiedadId", propiedadId)
    .order("posicion", { ascending: true })
    .order("fechaCreacion", { ascending: true })
    .order("id", { ascending: true });

  if (error) {
    throw new Error("No se pudieron cargar las fotos de la propiedad.");
  }

  return data;
}
