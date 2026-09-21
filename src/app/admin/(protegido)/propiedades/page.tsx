import Link from "next/link";
import { obtenerUsuarioAdmin } from "@/lib/supabase/autenticacion";
import { listarPropiedadesAdmin } from "@/funcionalidades/propiedades/consultas/listarPropiedadesAdmin";
import { ListaPropiedadesAdmin } from "@/funcionalidades/propiedades/componentes/ListaPropiedadesAdmin";

export default async function PaginaPropiedadesAdmin() {
  await obtenerUsuarioAdmin();

  const propiedades = await listarPropiedadesAdmin();
  const cantidadActivas = propiedades.filter((propiedad) => propiedad.activa).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Propiedades</h1>
          <p className="mt-1 text-sm text-gris-600">
            {propiedades.length} {propiedades.length === 1 ? "propiedad" : "propiedades"} ·{" "}
            {cantidadActivas} {cantidadActivas === 1 ? "activa" : "activas"}
          </p>
        </div>
        <Link
          href="/admin/propiedades/nueva"
          className="shrink-0 rounded bg-negro px-4 py-2 text-sm text-blanco"
        >
          Nueva propiedad
        </Link>
      </div>

      {propiedades.length === 0 ? (
        <p className="text-sm text-gris-600">Todavía no cargaste propiedades.</p>
      ) : (
        <ListaPropiedadesAdmin propiedades={propiedades} />
      )}
    </div>
  );
}
