import { crearClienteServidor } from "@/lib/supabase/servidor";
import { convertirEnumsPropiedad } from "@/funcionalidades/propiedades/utilidades/convertirEnumsPropiedad";
import { elegirPortada } from "@/funcionalidades/propiedades/utilidades/elegirPortada";
import type { PropiedadConPortada } from "@/funcionalidades/propiedades/consultas/listarPropiedadesAdmin";

export type { PropiedadConPortada };

export async function listarPropiedadesPublicas(): Promise<PropiedadConPortada[]> {
  const supabase = await crearClienteServidor();

  const { data, error } = await supabase
    .from("propiedades")
    .select("*, imagenesPropiedad(rutaArchivo, posicion, puntoFocalX, puntoFocalY)")
    .eq("activa", true)
    .order("fechaCreacion", { ascending: false })
    .order("id", { ascending: true });

  if (error) {
    throw new Error("No se pudieron cargar las propiedades.");
  }

  return data.map(({ imagenesPropiedad, ...propiedad }) => ({
    ...convertirEnumsPropiedad(propiedad),
    portada: elegirPortada(imagenesPropiedad),
  }));
}
