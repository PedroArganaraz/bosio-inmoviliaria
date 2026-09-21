import { FilaPropiedadAdmin } from "@/funcionalidades/propiedades/componentes/FilaPropiedadAdmin";
import type { PropiedadConPortada } from "@/funcionalidades/propiedades/consultas/listarPropiedadesAdmin";

export function ListaPropiedadesAdmin({ propiedades }: { propiedades: PropiedadConPortada[] }) {
  return (
    <div className="flex flex-col gap-4">
      <ul className="flex flex-col">
        {propiedades.map((propiedad) => (
          <FilaPropiedadAdmin key={propiedad.id} propiedad={propiedad} />
        ))}
      </ul>
    </div>
  );
}
