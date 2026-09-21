import type { Database } from "@/tipos/baseDeDatos";

export enum TipoOperacion {
  Venta = "venta",
  Alquiler = "alquiler",
}

export enum TipoPropiedad {
  Casa = "casa",
  Departamento = "departamento",
  Duplex = "duplex",
  Terreno = "terreno",
  Otro = "otro",
}

export enum Moneda {
  Usd = "usd",
  Ars = "ars",
}

type EnumsPostgres = Database["public"]["Enums"];

type MismosValores<A extends string, B extends string> = [A] extends [B]
  ? [B] extends [A]
    ? true
    : false
  : false;

type ComprobarTipoOperacion = MismosValores<`${TipoOperacion}`, EnumsPostgres["tipoOperacion"]>;
type ComprobarTipoPropiedad = MismosValores<`${TipoPropiedad}`, EnumsPostgres["tipoPropiedad"]>;
type ComprobarMoneda = MismosValores<`${Moneda}`, EnumsPostgres["moneda"]>;

// Si algún enum de TypeScript se desalinea con el de Postgres, alguna de
// estas líneas deja de compilar (no se puede asignar `true` a `false`).
const _comprobarTipoOperacion: ComprobarTipoOperacion = true;
const _comprobarTipoPropiedad: ComprobarTipoPropiedad = true;
const _comprobarMoneda: ComprobarMoneda = true;

void _comprobarTipoOperacion;
void _comprobarTipoPropiedad;
void _comprobarMoneda;
