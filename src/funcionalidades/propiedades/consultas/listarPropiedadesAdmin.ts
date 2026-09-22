import { crearClienteServidor } from "@/lib/supabase/servidor";
import { TipoOperacion, TipoPropiedad, Moneda } from "@/funcionalidades/propiedades/enums";
import { convertirEnumsPropiedad } from "@/funcionalidades/propiedades/utilidades/convertirEnumsPropiedad";
import type { Tables } from "@/tipos/baseDeDatos";

export type PortadaPropiedad = {
  rutaArchivo: string;
  puntoFocalX: number;
  puntoFocalY: number;
};

export type PropiedadConPortada = Omit<
  Tables<"propiedades">,
  "tipoOperacion" | "tipoPropiedad" | "moneda"
> & {
  tipoOperacion: TipoOperacion;
  tipoPropiedad: TipoPropiedad;
  moneda: Moneda;
  portada: PortadaPropiedad | null;
};

export async function listarPropiedadesAdmin(): Promise<PropiedadConPortada[]> {
  const supabase = await crearClienteServidor();

  const { data, error } = await supabase
    .from("propiedades")
    .select("*, imagenesPropiedad(rutaArchivo, posicion, puntoFocalX, puntoFocalY)")
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

function elegirPortada(
  imagenes: (PortadaPropiedad & { posicion: number })[],
): PortadaPropiedad | null {
  if (imagenes.length === 0) {
    return null;
  }

  const portada = imagenes.reduce((menor, actual) =>
    actual.posicion < menor.posicion ? actual : menor,
  );

  return {
    rutaArchivo: portada.rutaArchivo,
    puntoFocalX: portada.puntoFocalX,
    puntoFocalY: portada.puntoFocalY,
  };
}
