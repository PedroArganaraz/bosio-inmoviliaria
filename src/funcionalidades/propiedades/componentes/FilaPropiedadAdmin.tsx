"use client";

import Image from "next/image";
import Link from "next/link";
import { useOptimistic, useState, useTransition } from "react";
import { cambiarEstadoActiva } from "@/funcionalidades/propiedades/acciones/cambiarEstadoActiva";
import { construirUrlImagen } from "@/utilidades/construirUrlImagen";
import { estiloObjectPosition } from "@/utilidades/estiloObjectPosition";
import { formatearPrecio } from "@/funcionalidades/propiedades/utilidades/formatearPrecio";
import {
  etiquetasTipoOperacion,
  etiquetasTipoPropiedad,
} from "@/funcionalidades/propiedades/utilidades/etiquetas";
import { BotonEliminarPropiedad } from "@/funcionalidades/propiedades/componentes/BotonEliminarPropiedad";
import { Interruptor } from "@/componentes/Interruptor";
import type { PropiedadConPortada } from "@/funcionalidades/propiedades/consultas/listarPropiedadesAdmin";

export function FilaPropiedadAdmin({ propiedad }: { propiedad: PropiedadConPortada }) {
  const [activaOptimista, marcarActivaOptimista] = useOptimistic(propiedad.activa);
  const [errorActiva, setErrorActiva] = useState<string | null>(null);
  const [pendiente, iniciarTransicion] = useTransition();

  function alternarActiva(nuevoValor: boolean) {
    setErrorActiva(null);

    iniciarTransicion(async () => {
      marcarActivaOptimista(nuevoValor);
      const resultado = await cambiarEstadoActiva(propiedad.id, nuevoValor);

      if (resultado.error) {
        setErrorActiva(resultado.error);
      }
    });
  }

  return (
    <li className="flex flex-col gap-3 border-b border-gris-200 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className={`flex gap-3 sm:flex-1 ${activaOptimista ? "" : "opacity-60"}`}>
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded bg-gris-100 sm:h-24 sm:w-24">
          {propiedad.portada ? (
            <Image
              src={construirUrlImagen(propiedad.portada.rutaArchivo)}
              alt=""
              fill
              sizes="(min-width: 640px) 96px, 80px"
              className="object-cover"
              style={estiloObjectPosition(propiedad.portada)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center px-1 text-center text-xs text-gris-500">
              Sin foto
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <span className="font-medium">{propiedad.titulo}</span>
          <span className="text-sm text-gris-600">
            {etiquetasTipoOperacion[propiedad.tipoOperacion]} ·{" "}
            {etiquetasTipoPropiedad[propiedad.tipoPropiedad]}
          </span>
          <span className="text-sm text-gris-600">
            {formatearPrecio(propiedad.precio, propiedad.moneda)}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-4 sm:justify-end">
          <div className="flex items-center gap-2">
            <Interruptor
              etiqueta={`${activaOptimista ? "Desactivar" : "Activar"} ${propiedad.titulo}`}
              activo={activaOptimista}
              onCambiar={alternarActiva}
              disabled={pendiente}
            />
            <span className="text-sm">{activaOptimista ? "Activa" : "Inactiva"}</span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/admin/propiedades/${propiedad.id}/editar`}
              className="w-24 rounded border border-negro px-4 py-2 text-center text-sm text-negro"
            >
              Editar
            </Link>
            <BotonEliminarPropiedad id={propiedad.id} titulo={propiedad.titulo} />
          </div>
        </div>

        {errorActiva && (
          <p
            role="alert"
            className="border-l-4 border-negro bg-gris-100 px-3 py-2 text-sm font-medium text-negro"
          >
            {errorActiva}
          </p>
        )}
      </div>
    </li>
  );
}
