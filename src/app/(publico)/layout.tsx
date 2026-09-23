import Link from "next/link";
import { configuracionSitio } from "@/configuracion/configuracionSitio";

export default function LayoutPublico({ children }: LayoutProps<"/">) {
  const anioActual = new Date().getFullYear();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b border-gris-200 px-4 py-3 sm:px-6">
        <Link href="/" className="text-base font-semibold">
          {configuracionSitio.nombre}
        </Link>
        <nav aria-label="Navegación principal">
          <a href="#propiedades" className="text-sm text-gris-600 hover:text-negro">
            Propiedades
          </a>
        </nav>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-gris-200 px-4 py-6 text-center text-sm text-gris-600 sm:px-6">
        <p>
          {configuracionSitio.nombre} · © {anioActual}
        </p>
      </footer>
    </div>
  );
}
