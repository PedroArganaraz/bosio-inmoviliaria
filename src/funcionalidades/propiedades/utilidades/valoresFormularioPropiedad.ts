import { TipoOperacion, TipoPropiedad, Moneda } from "@/funcionalidades/propiedades/enums";

export type ValoresFormularioPropiedad = {
  titulo: string;
  descripcion: string;
  tipoOperacion: string;
  tipoPropiedad: string;
  precio: string;
  moneda: string;
  direccion: string;
  barrio: string;
  superficieCubierta: string;
  superficieTotal: string;
  ambientes: string;
  dormitorios: string;
  banos: string;
  activa: boolean;
};

export const valoresFormularioVacios: ValoresFormularioPropiedad = {
  titulo: "",
  descripcion: "",
  tipoOperacion: "",
  tipoPropiedad: "",
  precio: "",
  moneda: "",
  direccion: "",
  barrio: "",
  superficieCubierta: "",
  superficieTotal: "",
  ambientes: "",
  dormitorios: "",
  banos: "",
  activa: true,
};

type PropiedadParaFormulario = {
  titulo: string;
  descripcion: string | null;
  tipoOperacion: TipoOperacion;
  tipoPropiedad: TipoPropiedad;
  precio: number | null;
  moneda: Moneda;
  direccion: string | null;
  barrio: string | null;
  superficieCubierta: number | null;
  superficieTotal: number | null;
  ambientes: number | null;
  dormitorios: number | null;
  banos: number | null;
  activa: boolean;
};

const aTexto = (valor: number | null): string => (valor === null ? "" : String(valor));

export function convertirPropiedadAValores(
  propiedad: PropiedadParaFormulario,
): ValoresFormularioPropiedad {
  return {
    titulo: propiedad.titulo,
    descripcion: propiedad.descripcion ?? "",
    tipoOperacion: propiedad.tipoOperacion,
    tipoPropiedad: propiedad.tipoPropiedad,
    precio: aTexto(propiedad.precio),
    moneda: propiedad.moneda,
    direccion: propiedad.direccion ?? "",
    barrio: propiedad.barrio ?? "",
    superficieCubierta: aTexto(propiedad.superficieCubierta),
    superficieTotal: aTexto(propiedad.superficieTotal),
    ambientes: aTexto(propiedad.ambientes),
    dormitorios: aTexto(propiedad.dormitorios),
    banos: aTexto(propiedad.banos),
    activa: propiedad.activa,
  };
}
