import { TipoOperacion, TipoPropiedad } from "@/funcionalidades/propiedades/enums";

export const etiquetasTipoOperacion: Record<TipoOperacion, string> = {
  [TipoOperacion.Venta]: "Venta",
  [TipoOperacion.Alquiler]: "Alquiler",
};

export const etiquetasTipoPropiedad: Record<TipoPropiedad, string> = {
  [TipoPropiedad.Casa]: "Casa",
  [TipoPropiedad.Departamento]: "Departamento",
  [TipoPropiedad.Duplex]: "Dúplex",
  [TipoPropiedad.Terreno]: "Terreno",
  [TipoPropiedad.Otro]: "Otro",
};
