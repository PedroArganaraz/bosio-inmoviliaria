import type { CSSProperties } from "react";

type ImagenConPuntoFocal = {
  puntoFocalX: number;
  puntoFocalY: number;
};

export function estiloObjectPosition(imagen: ImagenConPuntoFocal): CSSProperties {
  return { objectPosition: `${imagen.puntoFocalX}% ${imagen.puntoFocalY}%` };
}
