import type { Metadata } from "next";
import Link from "next/link";
import { obtenerUsuarioAdmin } from "@/lib/supabase/autenticacion";
import { cerrarSesion } from "@/funcionalidades/autenticacion/acciones/cerrarSesion";
import { configuracionSitio } from "@/configuracion/configuracionSitio";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function LayoutAdmin({ children }: LayoutProps<"/admin">) {
  await obtenerUsuarioAdmin();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex flex-col gap-3 border-b border-gris-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="text-base font-semibold">
          {configuracionSitio.nombre}
        </Link>
        <form action={cerrarSesion}>
          <button
            type="submit"
            className="rounded border border-negro px-4 py-2 text-sm text-negro"
          >
            Cerrar sesión
          </button>
        </form>
      </header>
      <main className="flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
