"use client";

import { GestionImagenes } from "@/componentes/GestionImagenes";
import { registrarImagenPortada } from "@/funcionalidades/portada/acciones/registrarImagenPortada";
import { reordenarImagenesPortada } from "@/funcionalidades/portada/acciones/reordenarImagenesPortada";
import { eliminarImagenPortada } from "@/funcionalidades/portada/acciones/eliminarImagenPortada";
import { actualizarEncuadrePortada } from "@/funcionalidades/portada/acciones/actualizarEncuadrePortada";
import type { ImagenPortada } from "@/funcionalidades/portada/consultas/listarImagenesPortada";

const MAXIMO_IMAGENES = 8;
const LADO_MAXIMO = 2000;

type GestionPortadaProps = {
  imagenesIniciales: ImagenPortada[];
};

export function GestionPortada({ imagenesIniciales }: GestionPortadaProps) {
  return (
    <GestionImagenes
      prefijoRuta="portada"
      maximo={MAXIMO_IMAGENES}
      ladoMaximo={LADO_MAXIMO}
      proporcionAspecto="16 / 9"
      imagenesIniciales={imagenesIniciales}
      etiquetaAgregar="Agregar imágenes"
      ayudaDropzone="Arrastrá las imágenes acá o tocá para elegirlas."
      textoVacio="Todavía no cargaste imágenes. Sin imágenes, el inicio muestra un fondo liso."
      nombreItem="imagen"
      nombreItemPlural="imágenes"
      mostrarContador
      mensajeLimite={(maximo, actuales, elegidos) =>
        `Podés cargar hasta ${maximo} imágenes. Ya tenés ${actuales} y elegiste ${elegidos}.`
      }
      registrarAccion={registrarImagenPortada}
      reordenarAccion={reordenarImagenesPortada}
      eliminarAccion={eliminarImagenPortada}
      actualizarEncuadreAccion={actualizarEncuadrePortada}
    />
  );
}
