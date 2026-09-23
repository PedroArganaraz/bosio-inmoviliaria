import Image from "next/image";
import Link from "next/link";
import { construirUrlImagen } from "@/utilidades/construirUrlImagen";
import { estiloObjectPosition } from "@/utilidades/estiloObjectPosition";
import { formatearPrecio } from "@/funcionalidades/propiedades/utilidades/formatearPrecio";
import {
  etiquetasTipoOperacion,
  etiquetasTipoPropiedad,
} from "@/funcionalidades/propiedades/utilidades/etiquetas";
import type { PropiedadConPortada } from "@/funcionalidades/propiedades/consultas/listarPropiedadesAdmin";

export function TarjetaPropiedad({ propiedad }: { propiedad: PropiedadConPortada }) {
  return (
    <Link
      href={`/propiedades/${propiedad.slug}`}
      className="flex flex-col gap-2 rounded-lg border border-gris-200 p-3 transition-colors hover:border-negro"
    >
      <div className="relative aspect-4/3 overflow-hidden rounded bg-gris-100">
        {propiedad.portada ? (
          <Image
            src={construirUrlImagen(propiedad.portada.rutaArchivo)}
            alt=""
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
            style={estiloObjectPosition(propiedad.portada)}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gris-500">
            Sin foto
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <h3 className="font-medium">{propiedad.titulo}</h3>
        {propiedad.barrio && <p className="text-sm text-gris-600">{propiedad.barrio}</p>}
        <p className="text-sm text-gris-600">
          {etiquetasTipoOperacion[propiedad.tipoOperacion]} ·{" "}
          {etiquetasTipoPropiedad[propiedad.tipoPropiedad]}
        </p>
        <p className="font-semibold">{formatearPrecio(propiedad.precio, propiedad.moneda)}</p>
      </div>
    </Link>
  );
}
