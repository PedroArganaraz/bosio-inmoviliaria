import { obtenerUsuarioAdmin } from "@/lib/supabase/autenticacion";
import { listarImagenesPortada } from "@/funcionalidades/portada/consultas/listarImagenesPortada";
import { GestionPortada } from "@/funcionalidades/portada/componentes/GestionPortada";

export default async function PaginaPortada() {
  await obtenerUsuarioAdmin();

  const imagenes = await listarImagenesPortada();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Portada</h1>
      </div>

      <GestionPortada imagenesIniciales={imagenes} />
    </div>
  );
}
