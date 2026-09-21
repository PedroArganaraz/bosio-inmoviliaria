"use client";

import { useRef, useState, useTransition } from "react";
import { eliminarPropiedad } from "@/funcionalidades/propiedades/acciones/eliminarPropiedad";

export function BotonEliminarPropiedad({ id, titulo }: { id: string; titulo: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [pendiente, iniciarTransicion] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function confirmarEliminacion() {
    setError(null);
    iniciarTransicion(async () => {
      const resultado = await eliminarPropiedad(id);

      if (resultado.error) {
        setError(resultado.error);
        return;
      }

      dialogRef.current?.close();
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="text-sm text-gris-700 underline"
      >
        Eliminar
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby="tituloDialogoEliminar"
        className="w-[calc(100%-2rem)] max-w-sm rounded border border-gris-300 p-6 text-negro backdrop:bg-negro/50"
      >
        <h2 id="tituloDialogoEliminar" className="text-base font-semibold">
          Eliminar &quot;{titulo}&quot;
        </h2>
        <p className="mt-2 text-sm text-gris-700">
          Esta acción no se puede deshacer. Si solo querés ocultarla, desactivala.
        </p>

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
            className="rounded px-3 py-2 text-sm"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={confirmarEliminacion}
            disabled={pendiente}
            className="rounded bg-negro px-3 py-2 text-sm text-blanco disabled:opacity-50"
          >
            {pendiente ? "Eliminando..." : "Eliminar"}
          </button>
        </div>
      </dialog>
    </>
  );
}
