"use client";

import { GestionImagenes } from "@/componentes/GestionImagenes";
import { registrarImagen } from "@/funcionalidades/propiedades/acciones/registrarImagen";
import { reordenarImagenes } from "@/funcionalidades/propiedades/acciones/reordenarImagenes";
import { eliminarImagen } from "@/funcionalidades/propiedades/acciones/eliminarImagen";
import { actualizarEncuadreImagen } from "@/funcionalidades/propiedades/acciones/actualizarEncuadreImagen";
import type { ImagenPropiedad } from "@/funcionalidades/propiedades/consultas/listarImagenesPropiedad";

const MAXIMO_IMAGENES = 30;
const LADO_MAXIMO = 1600;

type FotosPropiedadProps = {
  propiedadId: string;
  imagenesIniciales: ImagenPropiedad[];
};

export function FotosPropiedad({ propiedadId, imagenesIniciales }: FotosPropiedadProps) {
  return (
    <GestionImagenes
      prefijoRuta={propiedadId}
      maximo={MAXIMO_IMAGENES}
      ladoMaximo={LADO_MAXIMO}
      proporcionAspecto="4 / 3"
      imagenesIniciales={imagenesIniciales}
      titulo="Fotos"
      etiquetaAgregar="Agregar fotos"
      ayudaDropzone="Arrastrá las fotos acá o tocá para elegirlas."
      textoVacio="Todavía no cargaste fotos. La primera va a ser la portada."
      nombreItem="foto"
      nombreItemPlural="fotos"
      etiquetaPrimera="Portada"
      bordeDestacadoPrimera
      mensajeLimite={(maximo, actuales, elegidos) =>
        `Podés cargar hasta ${maximo} fotos por propiedad. Ya tenés ${actuales} y elegiste ${elegidos}.`
      }
      registrarAccion={(rutaArchivo) => registrarImagen(propiedadId, rutaArchivo)}
      reordenarAccion={(idsEnOrden) => reordenarImagenes(propiedadId, idsEnOrden)}
      eliminarAccion={eliminarImagen}
      actualizarEncuadreAccion={actualizarEncuadreImagen}
    />
  );
}
