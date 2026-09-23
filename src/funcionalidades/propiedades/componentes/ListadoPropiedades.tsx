"use client";

import { useMemo, useState } from "react";
import { TipoOperacion, TipoPropiedad } from "@/funcionalidades/propiedades/enums";
import {
  etiquetasTipoOperacion,
  etiquetasTipoPropiedad,
} from "@/funcionalidades/propiedades/utilidades/etiquetas";
import { TarjetaPropiedad } from "@/funcionalidades/propiedades/componentes/TarjetaPropiedad";
import type { PropiedadConPortada } from "@/funcionalidades/propiedades/consultas/listarPropiedadesAdmin";

const claseSelect =
  "rounded border border-gris-400 px-3 py-2 text-sm text-negro focus:border-negro focus:outline-none";

const TODAS = "todas";

export function ListadoPropiedades({ propiedades }: { propiedades: PropiedadConPortada[] }) {
  const [operacion, setOperacion] = useState<string>(TODAS);
  const [tipo, setTipo] = useState<string>(TODAS);

  const propiedadesFiltradas = useMemo(
    () =>
      propiedades.filter((propiedad) => {
        if (operacion !== TODAS && propiedad.tipoOperacion !== operacion) {
          return false;
        }
        if (tipo !== TODAS && propiedad.tipoPropiedad !== tipo) {
          return false;
        }
        return true;
      }),
    [propiedades, operacion, tipo],
  );

  if (propiedades.length === 0) {
    return <p className="text-gris-600">Todavía no hay propiedades publicadas.</p>;
  }

  const hayFiltrosActivos = operacion !== TODAS || tipo !== TODAS;

  function limpiarFiltros() {
    setOperacion(TODAS);
    setTipo(TODAS);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <select
          aria-label="Operación"
          value={operacion}
          onChange={(evento) => setOperacion(evento.target.value)}
          className={claseSelect}
        >
          <option value={TODAS}>Todas las operaciones</option>
          {Object.values(TipoOperacion).map((valor) => (
            <option key={valor} value={valor}>
              {etiquetasTipoOperacion[valor]}
            </option>
          ))}
        </select>

        <select
          aria-label="Tipo de propiedad"
          value={tipo}
          onChange={(evento) => setTipo(evento.target.value)}
          className={claseSelect}
        >
          <option value={TODAS}>Todos los tipos</option>
          {Object.values(TipoPropiedad).map((valor) => (
            <option key={valor} value={valor}>
              {etiquetasTipoPropiedad[valor]}
            </option>
          ))}
        </select>
      </div>

      {propiedadesFiltradas.length === 0 ? (
        <div className="flex flex-col items-start gap-2">
          <p className="text-gris-600">No encontramos propiedades con esos filtros.</p>
          {hayFiltrosActivos && (
            <button
              type="button"
              onClick={limpiarFiltros}
              className="text-sm font-medium text-negro underline underline-offset-2"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {propiedadesFiltradas.map((propiedad) => (
            <TarjetaPropiedad key={propiedad.id} propiedad={propiedad} />
          ))}
        </div>
      )}
    </div>
  );
}
