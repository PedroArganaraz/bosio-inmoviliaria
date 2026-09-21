import { Moneda } from "@/funcionalidades/propiedades/enums";

const formateadorMiles = new Intl.NumberFormat("es-AR", {
  maximumFractionDigits: 0,
});

export function formatearPrecio(precio: number | null, moneda: Moneda): string {
  if (precio === null) {
    return "Consultar";
  }

  const prefijo = moneda === Moneda.Usd ? "U$S" : "$";

  return `${prefijo} ${formateadorMiles.format(precio)}`;
}
