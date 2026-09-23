"use client";

import { useCallback, useRef, useState } from "react";
import { GestionImagenes, type GestionImagenesHandle } from "@/componentes/GestionImagenes";
import type {
  ImagenGestionable,
  ResultadoAccionImagenGestionable,
} from "@/componentes/tiposGestionImagenes";
import { CarruselPortada } from "@/funcionalidades/portada/componentes/CarruselPortada";
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
  const [imagenesActuales, setImagenesActuales] = useState<ImagenGestionable[]>(imagenesIniciales);
  const gestionRef = useRef<GestionImagenesHandle>(null);

  const manejarCambioImagenes = useCallback((imagenes: ImagenGestionable[]) => {
    setImagenesActuales(imagenes);
  }, []);

  const manejarAjustarEncuadre = useCallback(
    async (
      id: string,
      puntoFocalX: number,
      puntoFocalY: number,
    ): Promise<ResultadoAccionImagenGestionable> => {
      const resultado = await actualizarEncuadrePortada(id, puntoFocalX, puntoFocalY);

      if (!resultado.error) {
        gestionRef.current?.actualizarEncuadreLocal(id, puntoFocalX, puntoFocalY);
      }

      return resultado;
    },
    [],
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <h2 className="text-base font-semibold">Vista previa</h2>
        <p className="text-sm text-gris-600">Así se ve el carrusel en el Inicio.</p>
        <CarruselPortada
          imagenes={imagenesActuales}
          edicion={{ onAjustarEncuadre: manejarAjustarEncuadre }}
        />
      </div>

      <GestionImagenes
        ref={gestionRef}
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
        mostrarBotonEditarEncuadre={false}
        mensajeLimite={(maximo, actuales, elegidos) =>
          `Podés cargar hasta ${maximo} imágenes. Ya tenés ${actuales} y elegiste ${elegidos}.`
        }
        onCambioImagenes={manejarCambioImagenes}
        registrarAccion={registrarImagenPortada}
        reordenarAccion={reordenarImagenesPortada}
        eliminarAccion={eliminarImagenPortada}
        actualizarEncuadreAccion={actualizarEncuadrePortada}
      />
    </div>
  );
}
