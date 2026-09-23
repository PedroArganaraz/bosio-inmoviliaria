import type { Metadata } from "next";
import { listarImagenesPortada } from "@/funcionalidades/portada/consultas/listarImagenesPortada";
import { listarPropiedadesPublicas } from "@/funcionalidades/propiedades/consultas/listarPropiedadesPublicas";
import { CarruselPortada } from "@/funcionalidades/portada/componentes/CarruselPortada";
import { ListadoPropiedades } from "@/funcionalidades/propiedades/componentes/ListadoPropiedades";
import { configuracionSitio } from "@/configuracion/configuracionSitio";

export const metadata: Metadata = {
  title: configuracionSitio.nombre,
  description: `Propiedades en venta y alquiler de ${configuracionSitio.nombre}.`,
};

export default async function PaginaInicio() {
  const [imagenesPortada, propiedades] = await Promise.all([
    listarImagenesPortada(),
    listarPropiedadesPublicas(),
  ]);

  return (
    <>
      <section id="inicio">
        <CarruselPortada imagenes={imagenesPortada} />
      </section>

      <section id="propiedades" className="px-4 py-10 sm:px-6">
        <h2 className="mb-6 text-xl font-semibold">Propiedades</h2>
        <ListadoPropiedades propiedades={propiedades} />
      </section>
    </>
  );
}
