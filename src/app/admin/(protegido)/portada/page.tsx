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
        <p className="mt-1 text-sm text-gris-600">
          Estas imágenes forman el carrusel de la página de inicio, en el orden en que las ves
          acá. Usá fotos horizontales, con lo importante en el centro: en el celular se recortan
          los costados.
        </p>
      </div>

      <GestionPortada imagenesIniciales={imagenes} />
    </div>
  );
}
