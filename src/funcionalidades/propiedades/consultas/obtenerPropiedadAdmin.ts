import { crearClienteServidor } from "@/lib/supabase/servidor";
import { convertirEnumsPropiedad } from "@/funcionalidades/propiedades/utilidades/convertirEnumsPropiedad";
import { TipoOperacion, TipoPropiedad, Moneda } from "@/funcionalidades/propiedades/enums";
import type { Tables } from "@/tipos/baseDeDatos";

export type PropiedadAdmin = Omit<
  Tables<"propiedades">,
  "tipoOperacion" | "tipoPropiedad" | "moneda"
> & {
  tipoOperacion: TipoOperacion;
  tipoPropiedad: TipoPropiedad;
  moneda: Moneda;
};

export async function obtenerPropiedadAdmin(id: string): Promise<PropiedadAdmin | null> {
  const supabase = await crearClienteServidor();

  const { data, error } = await supabase
    .from("propiedades")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return convertirEnumsPropiedad(data);
}
