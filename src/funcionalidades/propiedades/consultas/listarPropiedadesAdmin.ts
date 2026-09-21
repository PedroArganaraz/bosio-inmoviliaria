import { crearClienteServidor } from "@/lib/supabase/servidor";
import { TipoOperacion, TipoPropiedad, Moneda } from "@/funcionalidades/propiedades/enums";
import type { Tables } from "@/tipos/baseDeDatos";

export type PropiedadConPortada = Omit<
  Tables<"propiedades">,
  "tipoOperacion" | "tipoPropiedad" | "moneda"
> & {
  tipoOperacion: TipoOperacion;
  tipoPropiedad: TipoPropiedad;
  moneda: Moneda;
  portada: string | null;
};

export async function listarPropiedadesAdmin(): Promise<PropiedadConPortada[]> {
  const supabase = await crearClienteServidor();

  const { data, error } = await supabase
    .from("propiedades")
    .select("*, imagenesPropiedad(rutaArchivo, posicion)")
    .order("fechaCreacion", { ascending: false })
    .order("id", { ascending: true });

  if (error) {
    throw new Error("No se pudieron cargar las propiedades.");
  }

  return data.map(({ imagenesPropiedad, ...propiedad }) => ({
    ...propiedad,
    tipoOperacion: propiedad.tipoOperacion as TipoOperacion,
    tipoPropiedad: propiedad.tipoPropiedad as TipoPropiedad,
    moneda: propiedad.moneda as Moneda,
    portada: elegirPortada(imagenesPropiedad),
  }));
}

function elegirPortada(imagenes: { rutaArchivo: string; posicion: number }[]): string | null {
  if (imagenes.length === 0) {
    return null;
  }

  return imagenes.reduce((menor, actual) => (actual.posicion < menor.posicion ? actual : menor))
    .rutaArchivo;
}
