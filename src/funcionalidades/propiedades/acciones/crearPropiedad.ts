"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { obtenerUsuarioAdmin } from "@/lib/supabase/autenticacion";
import { revalidarSitioPublico } from "@/lib/revalidarSitioPublico";
import { slugify, generarSufijoAleatorio } from "@/funcionalidades/propiedades/utilidades/slugify";
import {
  leerValoresFormulario,
  validarDatosPropiedad,
  type EstadoFormularioPropiedad,
} from "@/funcionalidades/propiedades/acciones/validarDatosPropiedad";

const INTENTOS_SLUG = 3;
const CODIGO_UNIQUE_VIOLATION = "23505";

export async function crearPropiedad(
  _estadoPrevio: EstadoFormularioPropiedad,
  formData: FormData,
): Promise<EstadoFormularioPropiedad> {
  await obtenerUsuarioAdmin();

  const valores = leerValoresFormulario(formData);
  const resultado = validarDatosPropiedad(valores);

  if (!resultado.exito) {
    return { valores, errores: resultado.errores, errorGeneral: null };
  }

  const supabase = await crearClienteServidor();
  const base = slugify(resultado.datos.titulo);

  let idCreado: string | null = null;

  for (let intento = 0; intento < INTENTOS_SLUG && !idCreado; intento++) {
    const slug = `${base}-${generarSufijoAleatorio()}`;
    const { data, error } = await supabase
      .from("propiedades")
      .insert({ ...resultado.datos, slug })
      .select("id")
      .single();

    if (!error && data) {
      idCreado = data.id;
    } else if (error && error.code !== CODIGO_UNIQUE_VIOLATION) {
      return { valores, errores: {}, errorGeneral: "No se pudo crear la propiedad." };
    }
  }

  if (!idCreado) {
    return {
      valores,
      errores: {},
      errorGeneral: "No se pudo generar un identificador único. Probá de nuevo.",
    };
  }

  revalidatePath("/admin/propiedades");
  revalidarSitioPublico();

  redirect(`/admin/propiedades/${idCreado}/editar?creada=1`);
}
