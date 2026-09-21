"use client";

import { useActionState } from "react";
import {
  iniciarSesion,
  type EstadoIniciarSesion,
} from "@/funcionalidades/autenticacion/acciones/iniciarSesion";

const estadoInicial: EstadoIniciarSesion = {};

export function FormularioLogin() {
  const [estado, accion, pendiente] = useActionState(iniciarSesion, estadoInicial);

  return (
    <form action={accion} className="flex w-full max-w-sm flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-medium text-gris-700">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="rounded border border-gris-300 px-3 py-2 text-base text-negro focus:border-negro focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="contrasena" className="text-sm font-medium text-gris-700">
          Contraseña
        </label>
        <input
          id="contrasena"
          name="contrasena"
          type="password"
          autoComplete="current-password"
          required
          className="rounded border border-gris-300 px-3 py-2 text-base text-negro focus:border-negro focus:outline-none"
        />
      </div>

      {estado.error && (
        <p
          role="alert"
          className="border-l-4 border-negro bg-gris-100 px-3 py-2 text-sm font-medium text-negro"
        >
          {estado.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pendiente}
        className="rounded bg-negro px-4 py-2 text-blanco disabled:opacity-50"
      >
        {pendiente ? "Ingresando..." : "Ingresar"}
      </button>
    </form>
  );
}
