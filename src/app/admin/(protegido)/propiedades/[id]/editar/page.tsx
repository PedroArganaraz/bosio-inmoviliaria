import Link from "next/link";
import { notFound } from "next/navigation";
import { obtenerUsuarioAdmin } from "@/lib/supabase/autenticacion";
import { obtenerPropiedadAdmin } from "@/funcionalidades/propiedades/consultas/obtenerPropiedadAdmin";
import { listarImagenesPropiedad } from "@/funcionalidades/propiedades/consultas/listarImagenesPropiedad";
import { actualizarPropiedad } from "@/funcionalidades/propiedades/acciones/actualizarPropiedad";
import { FormularioPropiedad } from "@/funcionalidades/propiedades/componentes/FormularioPropiedad";
import { FotosPropiedad } from "@/funcionalidades/propiedades/componentes/FotosPropiedad";
import { convertirPropiedadAValores } from "@/funcionalidades/propiedades/utilidades/valoresFormularioPropiedad";
import { esUuid } from "@/utilidades/esUuid";

export default async function PaginaEditarPropiedad(
  props: PageProps<"/admin/propiedades/[id]/editar">,
) {
  await obtenerUsuarioAdmin();

  const { id } = await props.params;

  if (!esUuid(id)) {
    notFound();
  }

  const propiedad = await obtenerPropiedadAdmin(id);

  if (!propiedad) {
    notFound();
  }

  const imagenes = await listarImagenesPropiedad(id);
  const { creada } = await props.searchParams;
  const accionConId = actualizarPropiedad.bind(null, id);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">Editar propiedad</h1>
        <Link
          href="/admin/propiedades"
          className="shrink-0 rounded border border-negro px-4 py-2 text-sm text-negro"
        >
          ← Volver
        </Link>
      </div>

      {creada === "1" && (
        <p
          role="status"
          className="border-l-4 border-negro bg-gris-100 px-3 py-2 text-sm font-medium text-negro"
        >
          Propiedad creada. Ahora podés cargar las fotos.
        </p>
      )}

      <FormularioPropiedad accion={accionConId} valoresIniciales={convertirPropiedadAValores(propiedad)}>
        <FotosPropiedad propiedadId={id} imagenesIniciales={imagenes} />
      </FormularioPropiedad>
    </div>
  );
}
