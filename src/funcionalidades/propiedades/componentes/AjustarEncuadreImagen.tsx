"use client";

import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  useTransition,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import Image from "next/image";
import { construirUrlImagen } from "@/funcionalidades/propiedades/utilidades/construirUrlImagen";
import { actualizarEncuadreImagen } from "@/funcionalidades/propiedades/acciones/actualizarEncuadreImagen";

export type AjustarEncuadreImagenHandle = {
  abrir: () => void;
};

type AjustarEncuadreImagenProps = {
  imagenId: string;
  rutaArchivo: string;
  puntoFocalXInicial: number;
  puntoFocalYInicial: number;
  onGuardado: (puntoFocalX: number, puntoFocalY: number) => void;
};

const PASO_TECLADO = 5;

const MOVIMIENTOS_TECLADO: Record<string, { x: number; y: number }> = {
  ArrowLeft: { x: -PASO_TECLADO, y: 0 },
  ArrowRight: { x: PASO_TECLADO, y: 0 },
  ArrowUp: { x: 0, y: -PASO_TECLADO },
  ArrowDown: { x: 0, y: PASO_TECLADO },
};

function limitar(valor: number): number {
  return Math.min(100, Math.max(0, valor));
}

export const AjustarEncuadreImagen = forwardRef<
  AjustarEncuadreImagenHandle,
  AjustarEncuadreImagenProps
>(function AjustarEncuadreImagen(
  { imagenId, rutaArchivo, puntoFocalXInicial, puntoFocalYInicial, onGuardado },
  ref,
) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const marcoRef = useRef<HTMLDivElement>(null);
  const [puntoFocalX, setPuntoFocalX] = useState(puntoFocalXInicial);
  const [puntoFocalY, setPuntoFocalY] = useState(puntoFocalYInicial);
  const [pendiente, iniciarTransicion] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const arrastrandoRef = useRef(false);
  const inicioPunteroRef = useRef<{ x: number; y: number } | null>(null);
  const inicioFocalRef = useRef<{ x: number; y: number } | null>(null);

  useImperativeHandle(ref, () => ({
    abrir: () => {
      setPuntoFocalX(puntoFocalXInicial);
      setPuntoFocalY(puntoFocalYInicial);
      setError(null);
      dialogRef.current?.showModal();
    },
  }));

  function iniciarArrastre(evento: ReactPointerEvent<HTMLDivElement>) {
    evento.currentTarget.setPointerCapture(evento.pointerId);
    arrastrandoRef.current = true;
    inicioPunteroRef.current = { x: evento.clientX, y: evento.clientY };
    inicioFocalRef.current = { x: puntoFocalX, y: puntoFocalY };
  }

  function manejarPointerMove(evento: ReactPointerEvent<HTMLDivElement>) {
    const inicioPuntero = inicioPunteroRef.current;
    const inicioFocal = inicioFocalRef.current;
    if (!arrastrandoRef.current || !inicioPuntero || !inicioFocal) {
      return;
    }

    const recto = marcoRef.current?.getBoundingClientRect();
    if (!recto) {
      return;
    }

    // Arrastrar la imagen hacia la izquierda la desplaza a la izquierda:
    // el punto focal (lo que queda centrado en los recortes) se mueve al
    // lado contrario del gesto, hacia la parte que se revela.
    const dx = evento.clientX - inicioPuntero.x;
    const dy = evento.clientY - inicioPuntero.y;
    setPuntoFocalX(limitar(inicioFocal.x - (dx / recto.width) * 100));
    setPuntoFocalY(limitar(inicioFocal.y - (dy / recto.height) * 100));
  }

  function terminarArrastre(evento: ReactPointerEvent<HTMLDivElement>) {
    if (evento.currentTarget.hasPointerCapture(evento.pointerId)) {
      evento.currentTarget.releasePointerCapture(evento.pointerId);
    }

    arrastrandoRef.current = false;
    inicioPunteroRef.current = null;
    inicioFocalRef.current = null;
  }

  function manejarTeclado(evento: KeyboardEvent<HTMLDivElement>) {
    const movimiento = MOVIMIENTOS_TECLADO[evento.key];
    if (!movimiento) {
      return;
    }

    evento.preventDefault();
    setPuntoFocalX((actual) => limitar(actual + movimiento.x));
    setPuntoFocalY((actual) => limitar(actual + movimiento.y));
  }

  function confirmarGuardado() {
    setError(null);

    iniciarTransicion(async () => {
      const valorX = Math.round(puntoFocalX);
      const valorY = Math.round(puntoFocalY);
      const resultado = await actualizarEncuadreImagen(imagenId, valorX, valorY);

      if (resultado.error) {
        setError(resultado.error);
        return;
      }

      onGuardado(valorX, valorY);
      dialogRef.current?.close();
    });
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="tituloAjustarEncuadre"
      className="m-auto w-[calc(100%-2rem)] max-w-sm rounded border border-gris-300 p-6 text-negro backdrop:bg-negro/50"
    >
      <h2 id="tituloAjustarEncuadre" className="text-base font-semibold">
        Ajustar encuadre
      </h2>
      <p className="mt-2 text-sm text-gris-700">
        Arrastrá la imagen dentro del marco para elegir qué parte se ve siempre en los recortes.
      </p>

      <div
        ref={marcoRef}
        tabIndex={0}
        aria-label={`Encuadre de la foto. Posición actual: ${Math.round(puntoFocalX)}% horizontal, ${Math.round(puntoFocalY)}% vertical. Usá las flechas del teclado para moverlo.`}
        onPointerDown={iniciarArrastre}
        onPointerMove={manejarPointerMove}
        onPointerUp={terminarArrastre}
        onPointerCancel={terminarArrastre}
        onKeyDown={manejarTeclado}
        className="relative mt-4 aspect-[4/3] w-full touch-none overflow-hidden rounded border border-gris-300 focus:outline focus:outline-2 focus:outline-negro"
      >
        <Image
          src={construirUrlImagen(rutaArchivo)}
          alt=""
          fill
          sizes="400px"
          className="pointer-events-none object-cover"
          style={{ objectPosition: `${puntoFocalX}% ${puntoFocalY}%` }}
        />
      </div>

      {error && (
        <p
          role="alert"
          className="mt-3 border-l-4 border-negro bg-gris-100 px-3 py-2 text-sm font-medium text-negro"
        >
          {error}
        </p>
      )}

      <div className="mt-4 flex justify-end gap-3">
        <button
          type="button"
          onClick={() => dialogRef.current?.close()}
          className="rounded border border-negro px-3 py-2 text-sm text-negro"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={confirmarGuardado}
          disabled={pendiente}
          className="rounded bg-negro px-3 py-2 text-sm text-blanco disabled:opacity-50"
        >
          {pendiente ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </dialog>
  );
});
