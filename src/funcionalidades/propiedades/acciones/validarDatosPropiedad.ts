import { z } from "zod";
import { TipoOperacion, TipoPropiedad, Moneda } from "@/funcionalidades/propiedades/enums";
import type { ValoresFormularioPropiedad } from "@/funcionalidades/propiedades/utilidades/valoresFormularioPropiedad";

const TITULO_MAXIMO = 120;
const DESCRIPCION_MAXIMA = 5000;
const DIRECCION_MAXIMA = 200;
const BARRIO_MAXIMO = 100;
const PRECIO_MAXIMO = 999_999_999;
const SUPERFICIE_MAXIMA = 999_999;
const CANTIDAD_MAXIMA = 50;

const mensajeNumero = "Tiene que ser un número.";
const mensajeEntero = "Tiene que ser un número entero.";
const mensajeNegativo = "No puede ser negativo.";

const esquemaEntero = (max: number) =>
  z
    .number({ message: mensajeNumero })
    .int(mensajeEntero)
    .min(0, mensajeNegativo)
    .max(max, `Máximo ${max}.`)
    .nullable();

const esquemaDecimal = (max: number) =>
  z.number({ message: mensajeNumero }).min(0, mensajeNegativo).max(max, `Máximo ${max}.`).nullable();

const esquemaTextoOpcional = (max: number) =>
  z.string().max(max, `Máximo ${max} caracteres.`).nullable();

const esquemaPropiedad = z
  .object({
    titulo: z
      .string()
      .min(1, "El título es obligatorio.")
      .max(TITULO_MAXIMO, `Máximo ${TITULO_MAXIMO} caracteres.`),
    descripcion: esquemaTextoOpcional(DESCRIPCION_MAXIMA),
    tipoOperacion: z.enum(TipoOperacion, { message: "Elegí una operación." }),
    tipoPropiedad: z.enum(TipoPropiedad, { message: "Elegí un tipo de propiedad." }),
    precio: esquemaEntero(PRECIO_MAXIMO),
    moneda: z.enum(Moneda, { message: "Elegí una moneda." }),
    direccion: esquemaTextoOpcional(DIRECCION_MAXIMA),
    barrio: esquemaTextoOpcional(BARRIO_MAXIMO),
    superficieCubierta: esquemaDecimal(SUPERFICIE_MAXIMA),
    superficieTotal: esquemaDecimal(SUPERFICIE_MAXIMA),
    ambientes: esquemaEntero(CANTIDAD_MAXIMA),
    dormitorios: esquemaEntero(CANTIDAD_MAXIMA),
    banos: esquemaEntero(CANTIDAD_MAXIMA),
    activa: z.boolean(),
  })
  .superRefine((datos, ctx) => {
    if (
      datos.superficieCubierta !== null &&
      datos.superficieTotal !== null &&
      datos.superficieTotal < datos.superficieCubierta
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["superficieTotal"],
        message: "Tiene que ser mayor o igual a la superficie cubierta.",
      });
    }
  });

export type DatosPropiedadValidados = z.infer<typeof esquemaPropiedad>;

export type EstadoFormularioPropiedad = {
  valores: ValoresFormularioPropiedad;
  errores: Record<string, string>;
  errorGeneral: string | null;
};

export type ResultadoValidacion =
  | { exito: true; datos: DatosPropiedadValidados }
  | { exito: false; errores: Record<string, string> };

function leerCampo(formData: FormData, nombre: string): string {
  const valor = formData.get(nombre);
  return typeof valor === "string" ? valor.trim() : "";
}

// Lista blanca: solo estos campos se leen del FormData. Nunca id, slug ni
// fechas, aunque alguien los agregue al formulario enviado.
export function leerValoresFormulario(formData: FormData): ValoresFormularioPropiedad {
  return {
    titulo: leerCampo(formData, "titulo"),
    descripcion: leerCampo(formData, "descripcion"),
    tipoOperacion: leerCampo(formData, "tipoOperacion"),
    tipoPropiedad: leerCampo(formData, "tipoPropiedad"),
    precio: leerCampo(formData, "precio"),
    moneda: leerCampo(formData, "moneda"),
    direccion: leerCampo(formData, "direccion"),
    barrio: leerCampo(formData, "barrio"),
    superficieCubierta: leerCampo(formData, "superficieCubierta"),
    superficieTotal: leerCampo(formData, "superficieTotal"),
    ambientes: leerCampo(formData, "ambientes"),
    dormitorios: leerCampo(formData, "dormitorios"),
    banos: leerCampo(formData, "banos"),
    activa: leerCampo(formData, "activa") === "true",
  };
}

function aNumeroONulo(valor: string): number | null {
  return valor === "" ? null : Number(valor);
}

export function validarDatosPropiedad(valores: ValoresFormularioPropiedad): ResultadoValidacion {
  const entrada = {
    titulo: valores.titulo,
    descripcion: valores.descripcion === "" ? null : valores.descripcion,
    tipoOperacion: valores.tipoOperacion,
    tipoPropiedad: valores.tipoPropiedad,
    precio: aNumeroONulo(valores.precio),
    moneda: valores.moneda,
    direccion: valores.direccion === "" ? null : valores.direccion,
    barrio: valores.barrio === "" ? null : valores.barrio,
    superficieCubierta: aNumeroONulo(valores.superficieCubierta),
    superficieTotal: aNumeroONulo(valores.superficieTotal),
    ambientes: aNumeroONulo(valores.ambientes),
    dormitorios: aNumeroONulo(valores.dormitorios),
    banos: aNumeroONulo(valores.banos),
    activa: valores.activa,
  };

  const resultado = esquemaPropiedad.safeParse(entrada);

  if (!resultado.success) {
    const errores: Record<string, string> = {};

    for (const incidencia of resultado.error.issues) {
      const campo = String(incidencia.path[0]);
      if (!errores[campo]) {
        errores[campo] = incidencia.message;
      }
    }

    return { exito: false, errores };
  }

  return { exito: true, datos: resultado.data };
}
