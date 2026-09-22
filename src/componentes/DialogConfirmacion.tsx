"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";

export type DialogConfirmacionHandle = {
  abrir: () => void;
  cerrar: () => void;
};

type DialogConfirmacionProps = {
  idTitulo: string;
  titulo: string;
  descripcion: string;
  error?: string | null;
  pendiente: boolean;
  onConfirmar: () => void;
  textoConfirmar?: string;
  textoPendiente?: string;
};

export const DialogConfirmacion = forwardRef<DialogConfirmacionHandle, DialogConfirmacionProps>(
  function DialogConfirmacion(
    {
      idTitulo,
      titulo,
      descripcion,
      error,
      pendiente,
      onConfirmar,
      textoConfirmar = "Eliminar",
      textoPendiente = "Eliminando...",
    },
    ref,
  ) {
    const dialogRef = useRef<HTMLDialogElement>(null);

    useImperativeHandle(ref, () => ({
      abrir: () => dialogRef.current?.showModal(),
      cerrar: () => dialogRef.current?.close(),
    }));

    return (
      <dialog
        ref={dialogRef}
        aria-labelledby={idTitulo}
        className="m-auto w-[calc(100%-2rem)] max-w-sm rounded border border-gris-300 p-6 text-negro backdrop:bg-negro/50"
      >
        <h2 id={idTitulo} className="text-base font-semibold">
          {titulo}
        </h2>
        <p className="mt-2 text-sm text-gris-700">{descripcion}</p>

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
            onClick={onConfirmar}
            disabled={pendiente}
            className="rounded bg-negro px-3 py-2 text-sm text-blanco disabled:opacity-50"
          >
            {pendiente ? textoPendiente : textoConfirmar}
          </button>
        </div>
      </dialog>
    );
  },
);
