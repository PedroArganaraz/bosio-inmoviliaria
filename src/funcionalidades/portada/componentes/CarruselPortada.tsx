"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import Image from "next/image";
import { construirUrlImagen } from "@/utilidades/construirUrlImagen";
import { estiloObjectPosition } from "@/utilidades/estiloObjectPosition";
import { configuracionSitio } from "@/configuracion/configuracionSitio";
import {
  MOVIMIENTOS_TECLADO_PUNTO_FOCAL,
  calcularPuntoFocalArrastrado,
} from "@/utilidades/puntoFocal";
import type {
  ImagenGestionable,
  ResultadoAccionImagenGestionable,
} from "@/componentes/tiposGestionImagenes";

const UMBRAL_ARRASTRE_PX = 50;

// Único lugar para ajustar la altura del hero: rango entre una altura mínima
// razonable en mobile y una más generosa en pantallas grandes (cercana a la
// proporción 16:9 en la que ya se recorta el encuadre en el admin), con un
// tope para no volverse absurda en monitores muy anchos.
const ALTO_CARRUSEL = "h-[70vh] min-h-[360px] max-h-[760px]";

type EdicionCarruselPortada = {
  onAjustarEncuadre: (
    id: string,
    puntoFocalX: number,
    puntoFocalY: number,
  ) => Promise<ResultadoAccionImagenGestionable>;
};

// -webkit-user-drag no está tipada en CSSProperties: es la única forma
// (junto con draggable={false} y onDragStart) de que Safari/Chrome no
// disparen el gesto nativo de "arrastrar esta imagen" con mouse.
type EstiloImagenSlide = CSSProperties & { WebkitUserDrag?: "none" };

type CarruselPortadaProps = {
  imagenes: ImagenGestionable[];
  edicion?: EdicionCarruselPortada;
};

// ImagenPortada (Tables<"imagenesPortada">) es un superset estructural de
// ImagenGestionable, así que se puede pasar directo acá sin convertir: este
// tipo más chico es el que reutiliza también la vista previa del admin.
export function CarruselPortada({ imagenes, edicion }: CarruselPortadaProps) {
  const [indiceActual, setIndiceActual] = useState(0);
  const [deltaArrastre, setDeltaArrastre] = useState(0);
  const [arrastrando, setArrastrando] = useState(false);
  const [ajusteFoco, setAjusteFoco] = useState<{ id: string; x: number; y: number } | null>(null);
  const [errorEncuadre, setErrorEncuadre] = useState<string | null>(null);
  const [transicionSuspendida, setTransicionSuspendida] = useState(false);
  const arrastrandoRef = useRef(false);
  const inicioPunteroRef = useRef({ x: 0, y: 0 });
  const inicioFocalRef = useRef({ x: 0, y: 0 });
  const contenedorRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  // Al reactivar la transición: solo cambiar la clase no alcanza, hay que
  // forzar un reflow (leer una propiedad de layout) entre el salto sin
  // transición y su reactivación, si no el navegador anima igual.
  useEffect(() => {
    if (!transicionSuspendida) {
      return;
    }

    void trackRef.current?.offsetWidth;

    const idFrame = requestAnimationFrame(() => setTransicionSuspendida(false));
    return () => cancelAnimationFrame(idFrame);
  }, [transicionSuspendida]);

  if (imagenes.length === 0) {
    return (
      <div className={`flex ${ALTO_CARRUSEL} items-center justify-center bg-gris-100`}>
        <h1 className="px-4 text-center text-2xl font-semibold sm:text-3xl">
          {configuracionSitio.nombre}
        </h1>
      </div>
    );
  }

  function irA(indice: number) {
    const total = imagenes.length;
    const nuevoIndice = ((indice % total) + total) % total;
    const esSaltoCircular =
      (indiceActual === total - 1 && nuevoIndice === 0) ||
      (indiceActual === 0 && nuevoIndice === total - 1);

    if (esSaltoCircular) {
      setTransicionSuspendida(true);
    }

    setIndiceActual(nuevoIndice);
  }

  async function persistirAjusteFoco(id: string, puntoFocalX: number, puntoFocalY: number) {
    if (!edicion) {
      return;
    }

    const resultado = await edicion.onAjustarEncuadre(id, puntoFocalX, puntoFocalY);
    setErrorEncuadre(resultado.error ?? null);
    setAjusteFoco(null);
  }

  function manejarPointerDown(evento: ReactPointerEvent<HTMLDivElement>) {
    evento.currentTarget.setPointerCapture(evento.pointerId);
    arrastrandoRef.current = true;
    inicioPunteroRef.current = { x: evento.clientX, y: evento.clientY };
    setArrastrando(true);
    setDeltaArrastre(0);

    if (edicion) {
      const imagenActual = imagenes[indiceActual];
      inicioFocalRef.current =
        ajusteFoco?.id === imagenActual.id
          ? { x: ajusteFoco.x, y: ajusteFoco.y }
          : { x: imagenActual.puntoFocalX, y: imagenActual.puntoFocalY };
    }
  }

  function manejarPointerMove(evento: ReactPointerEvent<HTMLDivElement>) {
    if (!arrastrandoRef.current) {
      return;
    }

    if (edicion) {
      const recto = contenedorRef.current?.getBoundingClientRect();
      if (!recto) {
        return;
      }

      const imagenActual = imagenes[indiceActual];
      const nuevoFoco = calcularPuntoFocalArrastrado(
        inicioFocalRef.current,
        {
          x: evento.clientX - inicioPunteroRef.current.x,
          y: evento.clientY - inicioPunteroRef.current.y,
        },
        recto,
      );
      setAjusteFoco({ id: imagenActual.id, x: nuevoFoco.x, y: nuevoFoco.y });
      return;
    }

    setDeltaArrastre(evento.clientX - inicioPunteroRef.current.x);
  }

  function terminarArrastre(evento: ReactPointerEvent<HTMLDivElement>) {
    if (!arrastrandoRef.current) {
      return;
    }

    if (evento.currentTarget.hasPointerCapture(evento.pointerId)) {
      evento.currentTarget.releasePointerCapture(evento.pointerId);
    }

    arrastrandoRef.current = false;
    setArrastrando(false);

    if (edicion) {
      if (ajusteFoco) {
        const x = Math.round(ajusteFoco.x);
        const y = Math.round(ajusteFoco.y);
        void persistirAjusteFoco(ajusteFoco.id, x, y);
      }
      return;
    }

    if (deltaArrastre > UMBRAL_ARRASTRE_PX) {
      irA(indiceActual - 1);
    } else if (deltaArrastre < -UMBRAL_ARRASTRE_PX) {
      irA(indiceActual + 1);
    }

    setDeltaArrastre(0);
  }

  function manejarTecladoEncuadre(evento: ReactKeyboardEvent<HTMLDivElement>) {
    if (!edicion) {
      return;
    }

    const movimiento = MOVIMIENTOS_TECLADO_PUNTO_FOCAL[evento.key];
    if (!movimiento) {
      return;
    }

    evento.preventDefault();

    const imagenActual = imagenes[indiceActual];
    const base =
      ajusteFoco?.id === imagenActual.id
        ? ajusteFoco
        : { id: imagenActual.id, x: imagenActual.puntoFocalX, y: imagenActual.puntoFocalY };
    const x = Math.min(100, Math.max(0, base.x + movimiento.x));
    const y = Math.min(100, Math.max(0, base.y + movimiento.y));
    setAjusteFoco({ id: imagenActual.id, x, y });
    void persistirAjusteFoco(imagenActual.id, Math.round(x), Math.round(y));
  }

  const mostrarControles = imagenes.length > 1;
  const desplazamientoBase = -100 * indiceActual;
  const desplazamientoArrastre =
    mostrarControles && !edicion
      ? (deltaArrastre / (typeof window === "undefined" ? 1 : window.innerWidth)) * 100
      : 0;

  return (
    <div className="flex flex-col gap-2">
      <div ref={contenedorRef} className={`relative ${ALTO_CARRUSEL} overflow-hidden bg-gris-100`}>
        <div
          ref={trackRef}
          onPointerDown={manejarPointerDown}
          onPointerMove={manejarPointerMove}
          onPointerUp={terminarArrastre}
          onPointerCancel={terminarArrastre}
          tabIndex={edicion ? 0 : undefined}
          onKeyDown={edicion ? manejarTecladoEncuadre : undefined}
          aria-label={
            edicion
              ? "Posición de la imagen actual. Arrastrá o usá las flechas del teclado para ajustarla."
              : undefined
          }
          className={`flex h-full ${
            arrastrando || transicionSuspendida ? "" : "transition-transform duration-300 ease-out"
          } ${
            edicion
              ? `touch-none focus:outline focus:outline-2 focus:outline-negro ${
                  arrastrando ? "cursor-grabbing" : "cursor-grab"
                }`
              : "touch-pan-y"
          }`}
          style={{ transform: `translateX(${desplazamientoBase + desplazamientoArrastre}%)` }}
        >
          {imagenes.map((imagen, indice) => {
            const conAjuste =
              edicion && indice === indiceActual && ajusteFoco?.id === imagen.id
                ? { ...imagen, puntoFocalX: ajusteFoco.x, puntoFocalY: ajusteFoco.y }
                : imagen;

            const estiloImagen: EstiloImagenSlide = {
              ...estiloObjectPosition(conAjuste),
              WebkitUserDrag: "none",
            };

            return (
              <div key={imagen.id} className="relative h-full w-full shrink-0">
                <Image
                  src={construirUrlImagen(imagen.rutaArchivo)}
                  alt=""
                  fill
                  priority={indice === 0}
                  sizes="100vw"
                  draggable={false}
                  onDragStart={(evento) => evento.preventDefault()}
                  className="object-cover select-none"
                  style={estiloImagen}
                />
              </div>
            );
          })}
        </div>

        <div aria-live="polite" className="sr-only">
          Imagen {indiceActual + 1} de {imagenes.length}
        </div>

        {mostrarControles && (
          <>
            <button
              type="button"
              onClick={() => irA(indiceActual - 1)}
              aria-label="Imagen anterior"
              className="absolute top-1/2 left-2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-blanco/80 text-negro"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => irA(indiceActual + 1)}
              aria-label="Imagen siguiente"
              className="absolute top-1/2 right-2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-blanco/80 text-negro"
            >
              ›
            </button>

            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
              {imagenes.map((imagen, indice) => (
                <button
                  key={imagen.id}
                  type="button"
                  onClick={() => irA(indice)}
                  aria-label={`Ir a la imagen ${indice + 1} de ${imagenes.length}`}
                  aria-current={indice === indiceActual ? "true" : undefined}
                  className={`h-2.5 w-2.5 rounded-full ${
                    indice === indiceActual ? "bg-blanco" : "bg-blanco/50"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {edicion && (
        <p className="text-sm text-gris-600">Arrastrá la imagen para ajustar la posición.</p>
      )}

      {errorEncuadre && (
        <p
          role="alert"
          className="border-l-4 border-negro bg-gris-100 px-3 py-2 text-sm font-medium text-negro"
        >
          {errorEncuadre}
        </p>
      )}
    </div>
  );
}
