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
        <span className="text-base font-semibold">{configuracionSitio.nombre}</span>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm text-gris-700 underline">
            Ver sitio
          </Link>
          <form action={cerrarSesion}>
            <button type="submit" className="text-sm text-gris-700 underline">
              Cerrar sesión
            </button>
          </form>
        </div>
      </header>
      <main className="flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
