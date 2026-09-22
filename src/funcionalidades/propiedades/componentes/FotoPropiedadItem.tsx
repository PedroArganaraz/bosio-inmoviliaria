"use client";

import {
  useRef,
  useState,
  useTransition,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import Image from "next/image";
import { construirUrlImagen } from "@/funcionalidades/propiedades/utilidades/construirUrlImagen";
import { eliminarImagen } from "@/funcionalidades/propiedades/acciones/eliminarImagen";
import { DialogConfirmacion, type DialogConfirmacionHandle } from "@/componentes/DialogConfirmacion";
import type { ImagenPropiedad } from "@/funcionalidades/propiedades/consultas/listarImagenesPropiedad";

export type ManejadoresManija = {
  onPointerDown: (evento: ReactPointerEvent<HTMLButtonElement>) => void;
  onPointerMove: (evento: ReactPointerEvent<HTMLButtonElement>) => void;
  onPointerUp: (evento: ReactPointerEvent<HTMLButtonElement>) => void;
  onPointerCancel: (evento: ReactPointerEvent<HTMLButtonElement>) => void;
  onLostPointerCapture: (evento: ReactPointerEvent<HTMLButtonElement>) => void;
};

function IconoManija() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden="true">
      <circle cx="5" cy="3" r="1.3" />
      <circle cx="11" cy="3" r="1.3" />
      <circle cx="5" cy="8" r="1.3" />
      <circle cx="11" cy="8" r="1.3" />
      <circle cx="5" cy="13" r="1.3" />
      <circle cx="11" cy="13" r="1.3" />
    </svg>
  );
}

type FotoPropiedadItemProps = {
  imagen: ImagenPropiedad;
  indice: number;
  total: number;
  esPortada: boolean;
  pendienteOrden: boolean;
  arrastrando: boolean;
  order: number;
  estiloArrastre: CSSProperties | undefined;
  manejadoresManija: ManejadoresManija;
  onMoverConTeclado: (indice: number, direccion: -1 | 1) => void;
  onEliminado: (id: string) => void;
};

export function FotoPropiedadItem({
  imagen,
  indice,
  total,
  esPortada,
  pendienteOrden,
  arrastrando,
  order,
  estiloArrastre,
  manejadoresManija,
  onMoverConTeclado,
  onEliminado,
}: FotoPropiedadItemProps) {
  const dialogRef = useRef<DialogConfirmacionHandle>(null);
  const [pendienteEliminar, iniciarTransicionEliminar] = useTransition();
  const [errorEliminar, setErrorEliminar] = useState<string | null>(null);

  function confirmarEliminacion() {
    setErrorEliminar(null);
    iniciarTransicionEliminar(async () => {
      const resultado = await eliminarImagen(imagen.id);

      if (resultado.error) {
        setErrorEliminar(resultado.error);
        return;
      }

      dialogRef.current?.cerrar();
      onEliminado(imagen.id);
    });
  }

  function manejarTeclado(evento: KeyboardEvent<HTMLButtonElement>) {
    if (evento.key !== "ArrowLeft" && evento.key !== "ArrowRight") {
      return;
    }

    evento.preventDefault();
    onMoverConTeclado(indice, evento.key === "ArrowLeft" ? -1 : 1);
  }

  return (
    <div data-foto-id={imagen.id} style={{ order, ...estiloArrastre }} className="relative">
      <div
        className={`relative aspect-[4/3] overflow-hidden rounded bg-gris-100 ${
          esPortada ? "border-2 border-negro" : "border border-gris-300"
        } ${arrastrando ? "scale-105 shadow-xl" : ""}`}
      >
        <Image
          src={construirUrlImagen(imagen.rutaArchivo)}
          alt=""
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          className="object-cover"
        />

        {esPortada && (
          <span className="absolute left-2 top-2 rounded bg-negro px-2 py-1 text-xs font-medium text-blanco">
            Portada
          </span>
        )}

        <button
          type="button"
          disabled={pendienteOrden}
          aria-label={`Reordenar foto ${indice + 1} de ${total}. Arrastrá o usá las flechas para moverla.`}
          onKeyDown={manejarTeclado}
          {...manejadoresManija}
          className="absolute right-0 top-0 flex h-11 w-11 touch-none items-center justify-center disabled:opacity-40"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blanco/80 text-negro shadow">
            <IconoManija />
          </span>
        </button>

        <div className="absolute inset-x-0 bottom-0 flex justify-end bg-negro/60">
          <button
            type="button"
            aria-label={`Eliminar foto ${indice + 1}`}
            onClick={() => dialogRef.current?.abrir()}
            className="min-h-11 px-4 text-sm font-medium text-blanco"
          >
            Eliminar
          </button>
        </div>
      </div>

      <DialogConfirmacion
        ref={dialogRef}
        idTitulo={`tituloDialogoEliminarFoto-${imagen.id}`}
        titulo="Eliminar foto"
        descripcion="Se va a eliminar esta foto. Esta acción no se puede deshacer."
        error={errorEliminar}
        pendiente={pendienteEliminar}
        onConfirmar={confirmarEliminacion}
      />
    </div>
  );
}
