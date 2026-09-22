"use client";

import { useRef, useState, useTransition } from "react";
import { eliminarPropiedad } from "@/funcionalidades/propiedades/acciones/eliminarPropiedad";
import { DialogConfirmacion, type DialogConfirmacionHandle } from "@/componentes/DialogConfirmacion";

export function BotonEliminarPropiedad({ id, titulo }: { id: string; titulo: string }) {
  const dialogRef = useRef<DialogConfirmacionHandle>(null);
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

      dialogRef.current?.cerrar();
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.abrir()}
        className="w-24 rounded border border-negro px-4 py-2 text-center text-sm text-negro"
      >
        Eliminar
      </button>

      <DialogConfirmacion
        ref={dialogRef}
        idTitulo="tituloDialogoEliminarPropiedad"
        titulo={`Eliminar "${titulo}"`}
        descripcion="Esta acción no se puede deshacer. Si solo querés ocultarla, desactivala."
        error={error}
        pendiente={pendiente}
        onConfirmar={confirmarEliminacion}
      />
    </>
  );
}
