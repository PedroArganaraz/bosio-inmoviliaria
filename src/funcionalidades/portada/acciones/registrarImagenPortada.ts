"use server";

import { revalidatePath } from "next/cache";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { obtenerUsuarioAdmin } from "@/lib/supabase/autenticacion";
import { revalidarSitioPublico } from "@/lib/revalidarSitioPublico";
import {
  esRutaImagenValida,
  borrarArchivoMejorEsfuerzo,
} from "@/utilidades/gestionImagenesServidor";
import type { Tables } from "@/tipos/baseDeDatos";

const LIMITE_IMAGENES = 8;
const PREFIJO_RUTA = "portada";

export type ResultadoRegistrarImagenPortada =
  | { error: string; imagen: null }
  | { error: null; imagen: Tables<"imagenesPortada"> };

export async function registrarImagenPortada(
  rutaArchivo: string,
): Promise<ResultadoRegistrarImagenPortada> {
  await obtenerUsuarioAdmin();

  if (!esRutaImagenValida(PREFIJO_RUTA, rutaArchivo)) {
    return { error: "Ruta de archivo inválida.", imagen: null };
  }

  const supabase = await crearClienteServidor();

  const { data: imagenesActuales, error: errorImagenes } = await supabase
    .from("imagenesPortada")
    .select("posicion");

  if (errorImagenes || !imagenesActuales) {
    await borrarArchivoMejorEsfuerzo(supabase, rutaArchivo);
    return { error: "No se pudo registrar la imagen.", imagen: null };
  }

  if (imagenesActuales.length >= LIMITE_IMAGENES) {
    await borrarArchivoMejorEsfuerzo(supabase, rutaArchivo);
    return {
      error: `Ya hay ${LIMITE_IMAGENES} imágenes cargadas, el máximo permitido.`,
      imagen: null,
    };
  }

  const posicion =
    imagenesActuales.length === 0
      ? 0
      : Math.max(...imagenesActuales.map((imagen) => imagen.posicion)) + 1;

  const { data: filaInsertada, error: errorInsertar } = await supabase
    .from("imagenesPortada")
    .insert({ rutaArchivo, posicion })
    .select()
    .single();

  if (errorInsertar || !filaInsertada) {
    await borrarArchivoMejorEsfuerzo(supabase, rutaArchivo);
    return { error: "No se pudo registrar la imagen.", imagen: null };
  }

  revalidatePath("/admin/portada");
  revalidarSitioPublico();

  return { error: null, imagen: filaInsertada };
}
