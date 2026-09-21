import { TipoOperacion, TipoPropiedad, Moneda } from "@/funcionalidades/propiedades/enums";
import type { Tables } from "@/tipos/baseDeDatos";

type FilaConEnumsPostgres = Pick<Tables<"propiedades">, "tipoOperacion" | "tipoPropiedad" | "moneda">;

type ConEnumsTypeScript<T> = Omit<T, "tipoOperacion" | "tipoPropiedad" | "moneda"> & {
  tipoOperacion: TipoOperacion;
  tipoPropiedad: TipoPropiedad;
  moneda: Moneda;
};

// Los tipos generados desde Postgres tipan estas columnas como los literales
// del enum de la base. Ya verificamos en enums.ts que tienen los mismos
// valores que nuestros enums de TypeScript: acá se hace la conversión una
// sola vez para que el resto del código trabaje siempre con los enums.
export function convertirEnumsPropiedad<T extends FilaConEnumsPostgres>(
  fila: T,
): ConEnumsTypeScript<T> {
  return {
    ...fila,
    tipoOperacion: fila.tipoOperacion as TipoOperacion,
    tipoPropiedad: fila.tipoPropiedad as TipoPropiedad,
    moneda: fila.moneda as Moneda,
  };
}
