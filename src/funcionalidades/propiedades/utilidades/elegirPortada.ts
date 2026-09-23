export type PortadaPropiedad = {
  rutaArchivo: string;
  puntoFocalX: number;
  puntoFocalY: number;
};

export function elegirPortada(
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
