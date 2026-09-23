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
import { construirUrlImagen } from "@/utilidades/construirUrlImagen";
import { estiloObjectPosition } from "@/utilidades/estiloObjectPosition";
import { DialogConfirmacion, type DialogConfirmacionHandle } from "@/componentes/DialogConfirmacion";
import {
  AjustarEncuadreImagen,
  type AjustarEncuadreImagenHandle,
} from "@/componentes/AjustarEncuadreImagen";
import type {
  ImagenGestionable,
  ResultadoAccionImagenGestionable,
} from "@/componentes/tiposGestionImagenes";

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

type ImagenGestionableItemProps = {
  imagen: ImagenGestionable;
  indice: number;
  total: number;
  esPrimera: boolean;
  etiquetaPrimera: string | undefined;
  bordeDestacadoPrimera: boolean;
  proporcionAspecto: string;
  nombreItem: string;
  pendienteOrden: boolean;
  arrastrando: boolean;
  order: number;
  estiloArrastre: CSSProperties | undefined;
  manejadoresManija: ManejadoresManija;
  onMoverConTeclado: (indice: number, direccion: -1 | 1) => void;
  onEliminado: (id: string) => void;
  onEncuadreActualizado: (id: string, puntoFocalX: number, puntoFocalY: number) => void;
  mostrarBotonEditarEncuadre: boolean;
  eliminarAccion: (imagenId: string) => Promise<ResultadoAccionImagenGestionable>;
  actualizarEncuadreAccion: (
    imagenId: string,
    puntoFocalX: number,
    puntoFocalY: number,
  ) => Promise<ResultadoAccionImagenGestionable>;
};

export function ImagenGestionableItem({
  imagen,
  indice,
  total,
  esPrimera,
  etiquetaPrimera,
  bordeDestacadoPrimera,
  proporcionAspecto,
  nombreItem,
  pendienteOrden,
  arrastrando,
  order,
  estiloArrastre,
  manejadoresManija,
  onMoverConTeclado,
  onEliminado,
  onEncuadreActualizado,
  mostrarBotonEditarEncuadre,
  eliminarAccion,
  actualizarEncuadreAccion,
}: ImagenGestionableItemProps) {
  const dialogRef = useRef<DialogConfirmacionHandle>(null);
  const dialogEncuadreRef = useRef<AjustarEncuadreImagenHandle>(null);
  const [pendienteEliminar, iniciarTransicionEliminar] = useTransition();
  const [errorEliminar, setErrorEliminar] = useState<string | null>(null);

  const mostrarDestacadoPrimera = esPrimera && bordeDestacadoPrimera;
  const mostrarEtiquetaPrimera = esPrimera && Boolean(etiquetaPrimera);

  function confirmarEliminacion() {
    setErrorEliminar(null);
    iniciarTransicionEliminar(async () => {
      const resultado = await eliminarAccion(imagen.id);

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
        style={{ aspectRatio: proporcionAspecto }}
        className={`relative overflow-hidden rounded bg-gris-100 ${
          mostrarDestacadoPrimera ? "border-2 border-negro" : "border border-gris-300"
        } ${arrastrando ? "scale-105 shadow-xl" : ""}`}
      >
        <Image
          src={construirUrlImagen(imagen.rutaArchivo)}
          alt=""
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          className="object-cover"
          style={estiloObjectPosition(imagen)}
        />

        {mostrarEtiquetaPrimera && (
          <span className="absolute left-2 top-2 rounded bg-negro px-2 py-1 text-xs font-medium text-blanco">
            {etiquetaPrimera}
          </span>
        )}

        <button
          type="button"
          disabled={pendienteOrden}
          aria-label={`Reordenar ${nombreItem} ${indice + 1} de ${total}. Arrastrá o usá las flechas para moverla.`}
          onKeyDown={manejarTeclado}
          {...manejadoresManija}
          className="absolute right-0 top-0 flex h-11 w-11 touch-none items-center justify-center disabled:opacity-40"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blanco/80 text-negro shadow">
            <IconoManija />
          </span>
        </button>

        <div className="absolute inset-x-0 bottom-0 flex divide-x divide-blanco/20 bg-negro/60">
          {mostrarBotonEditarEncuadre && (
            <button
              type="button"
              aria-label={`Editar ${nombreItem} ${indice + 1}`}
              onClick={() => dialogEncuadreRef.current?.abrir()}
              className="flex min-h-11 flex-1 cursor-pointer items-center justify-center px-4 text-sm font-medium text-blanco"
            >
              Editar
            </button>
          )}
          <button
            type="button"
            aria-label={`Eliminar ${nombreItem} ${indice + 1}`}
            onClick={() => dialogRef.current?.abrir()}
            className="flex min-h-11 flex-1 cursor-pointer items-center justify-center px-4 text-sm font-medium text-blanco"
          >
            Eliminar
          </button>
        </div>
      </div>

      <DialogConfirmacion
        ref={dialogRef}
        idTitulo={`tituloDialogoEliminar-${imagen.id}`}
        titulo={`Eliminar ${nombreItem}`}
        descripcion={`Esta acción no se puede deshacer.`}
        error={errorEliminar}
        pendiente={pendienteEliminar}
        onConfirmar={confirmarEliminacion}
      />

      {mostrarBotonEditarEncuadre && (
        <AjustarEncuadreImagen
          ref={dialogEncuadreRef}
          imagenId={imagen.id}
          rutaArchivo={imagen.rutaArchivo}
          puntoFocalXInicial={imagen.puntoFocalX}
          puntoFocalYInicial={imagen.puntoFocalY}
          proporcionAspecto={proporcionAspecto}
          accion={actualizarEncuadreAccion}
          onGuardado={(puntoFocalX, puntoFocalY) =>
            onEncuadreActualizado(imagen.id, puntoFocalX, puntoFocalY)
          }
        />
      )}
    </div>
  );
}
