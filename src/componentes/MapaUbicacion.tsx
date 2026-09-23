"use client";

import dynamic from "next/dynamic";

export const MapaUbicacion = dynamic(() => import("@/componentes/MapaUbicacionLeaflet"), {
  ssr: false,
  loading: () => (
    <div className="flex h-64 w-full items-center justify-center rounded bg-gris-200 text-sm text-gris-600 sm:h-80">
      Cargando mapa…
    </div>
  ),
});
