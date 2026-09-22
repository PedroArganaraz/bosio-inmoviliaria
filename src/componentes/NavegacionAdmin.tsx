"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { seccionesAdmin } from "@/configuracion/seccionesAdmin";

export function NavegacionAdmin() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Secciones del admin"
      className="-mx-4 flex gap-1 overflow-x-auto px-4 sm:mx-0 sm:overflow-visible sm:px-0"
    >
      {seccionesAdmin.map((seccion) => {
        const activa = pathname === seccion.ruta || pathname.startsWith(`${seccion.ruta}/`);

        return (
          <Link
            key={seccion.ruta}
            href={seccion.ruta}
            aria-current={activa ? "page" : undefined}
            className={`flex min-h-11 shrink-0 items-center px-3 text-sm ${
              activa ? "font-semibold text-negro" : "text-gris-500"
            }`}
          >
            {seccion.etiqueta}
          </Link>
        );
      })}
    </nav>
  );
}
