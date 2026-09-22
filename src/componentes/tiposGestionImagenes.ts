export type ImagenGestionable = {
  id: string;
  rutaArchivo: string;
  posicion: number;
  puntoFocalX: number;
  puntoFocalY: number;
};

export type ResultadoAccionImagenGestionable = {
  error: string | null;
};

export type ResultadoRegistrarImagenGestionable =
  | { error: string; imagen: null }
  | { error: null; imagen: ImagenGestionable };
