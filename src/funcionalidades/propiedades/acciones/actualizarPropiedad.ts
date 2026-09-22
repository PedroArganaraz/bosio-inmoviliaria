"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { obtenerUsuarioAdmin } from "@/lib/supabase/autenticacion";
import { revalidarSitioPublico } from "@/lib/revalidarSitioPublico";
import { esUuid } from "@/utilidades/esUuid";
import {
  leerValoresFormulario,
  validarDatosPropiedad,
  type EstadoFormularioPropiedad,
} from "@/funcionalidades/propiedades/acciones/validarDatosPropiedad";

export async function actualizarPropiedad(
  id: string,
  _estadoPrevio: EstadoFormularioPropiedad,
  formData: FormData,
): Promise<EstadoFormularioPropiedad> {
  await obtenerUsuarioAdmin();

  const valores = leerValoresFormulario(formData);

  if (!esUuid(id)) {
    return { valores, errores: {}, errorGeneral: "Identificador inválido." };
  }

  const resultado = validarDatosPropiedad(valores);

  if (!resultado.exito) {
    return { valores, errores: resultado.errores, errorGeneral: null };
  }

  const supabase = await crearClienteServidor();
  const { data, error } = await supabase
    .from("propiedades")
    .update(resultado.datos)
    .eq("id", id)
    .select("id");

  if (error || !data || data.length !== 1) {
    return { valores, errores: {}, errorGeneral: "No se pudieron guardar los cambios." };
  }

  revalidatePath("/admin/propiedades");
  revalidarSitioPublico();

  redirect("/admin/propiedades");
}
