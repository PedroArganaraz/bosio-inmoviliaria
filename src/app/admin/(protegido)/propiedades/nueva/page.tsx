import Link from "next/link";
import { obtenerUsuarioAdmin } from "@/lib/supabase/autenticacion";
import { crearPropiedad } from "@/funcionalidades/propiedades/acciones/crearPropiedad";
import { FormularioPropiedad } from "@/funcionalidades/propiedades/componentes/FormularioPropiedad";

export default async function PaginaNuevaPropiedad() {
  await obtenerUsuarioAdmin();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">Nueva propiedad</h1>
        <Link
          href="/admin/propiedades"
          className="shrink-0 rounded border border-negro px-4 py-2 text-sm text-negro"
        >
          ← Volver
        </Link>
      </div>
      <FormularioPropiedad accion={crearPropiedad}>
        <p className="text-sm text-gris-600">Vas a poder cargar las fotos después de guardar.</p>
      </FormularioPropiedad>
    </div>
  );
}
