"use server";

import { revalidatePath } from "next/cache";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { obtenerUsuarioAdmin } from "@/lib/supabase/autenticacion";
import { revalidarSitioPublico } from "@/lib/revalidarSitioPublico";
import { esUuid } from "@/funcionalidades/propiedades/utilidades/esUuid";
import type { Tables } from "@/tipos/baseDeDatos";

const LIMITE_IMAGENES = 30;
const PATRON_UUID = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";

export type ResultadoRegistrarImagen =
  | { error: string; imagen: null }
  | { error: null; imagen: Tables<"imagenesPropiedad"> };

type ClienteServidor = Awaited<ReturnType<typeof crearClienteServidor>>;

export async function registrarImagen(
  propiedadId: string,
  rutaArchivo: string,
): Promise<ResultadoRegistrarImagen> {
  await obtenerUsuarioAdmin();

  if (!esUuid(propiedadId)) {
    return { error: "Identificador inválido.", imagen: null };
  }

  const regexRuta = new RegExp(`^${propiedadId}/${PATRON_UUID}\\.(webp|jpg)$`, "i");

  if (!regexRuta.test(rutaArchivo)) {
    return { error: "Ruta de archivo inválida.", imagen: null };
  }

  const supabase = await crearClienteServidor();

  const { data: propiedad, error: errorPropiedad } = await supabase
    .from("propiedades")
    .select("id")
    .eq("id", propiedadId)
    .maybeSingle();

  if (errorPropiedad || !propiedad) {
    await borrarArchivoMejorEsfuerzo(supabase, rutaArchivo);
    return { error: "La propiedad no existe.", imagen: null };
  }

  const { data: imagenesActuales, error: errorImagenes } = await supabase
    .from("imagenesPropiedad")
    .select("posicion")
    .eq("propiedadId", propiedadId);

  if (errorImagenes || !imagenesActuales) {
    await borrarArchivoMejorEsfuerzo(supabase, rutaArchivo);
    return { error: "No se pudo registrar la foto.", imagen: null };
  }

  if (imagenesActuales.length >= LIMITE_IMAGENES) {
    await borrarArchivoMejorEsfuerzo(supabase, rutaArchivo);
    return {
      error: `Ya hay ${LIMITE_IMAGENES} fotos cargadas, el máximo permitido.`,
      imagen: null,
    };
  }

  const posicion =
    imagenesActuales.length === 0
      ? 0
      : Math.max(...imagenesActuales.map((imagen) => imagen.posicion)) + 1;

  const { data: filaInsertada, error: errorInsertar } = await supabase
    .from("imagenesPropiedad")
    .insert({ propiedadId, rutaArchivo, posicion })
    .select()
    .single();

  if (errorInsertar || !filaInsertada) {
    await borrarArchivoMejorEsfuerzo(supabase, rutaArchivo);
    return { error: "No se pudo registrar la foto.", imagen: null };
  }

  revalidatePath("/admin/propiedades");
  revalidatePath(`/admin/propiedades/${propiedadId}/editar`);
  revalidarSitioPublico();

  return { error: null, imagen: filaInsertada };
}

async function borrarArchivoMejorEsfuerzo(supabase: ClienteServidor, rutaArchivo: string) {
  try {
    await supabase.storage.from("propiedades").remove([rutaArchivo]);
  } catch {
    // Mejor esfuerzo: si falla, queda un archivo huérfano en el bucket.
  }
}
