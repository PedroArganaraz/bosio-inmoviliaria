import { crearClienteServidor } from "@/lib/supabase/servidor";
import type { Tables } from "@/tipos/baseDeDatos";

export type ImagenPortada = Tables<"imagenesPortada">;

export async function listarImagenesPortada(): Promise<ImagenPortada[]> {
  const supabase = await crearClienteServidor();

  const { data, error } = await supabase
    .from("imagenesPortada")
    .select("*")
    .order("posicion", { ascending: true })
    .order("fechaCreacion", { ascending: true })
    .order("id", { ascending: true });

  if (error) {
    throw new Error("No se pudieron cargar las imágenes de portada.");
  }

  return data;
}
