"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useOptimistic,
  useRef,
  useState,
  useTransition,
  type ChangeEvent,
  type CSSProperties,
  type DragEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { crearClienteNavegador } from "@/lib/supabase/cliente";
import { comprimirImagen } from "@/utilidades/comprimirImagen";
import { ImagenGestionableItem, type ManejadoresManija } from "@/componentes/ImagenGestionableItem";
import type {
  ImagenGestionable,
  ResultadoAccionImagenGestionable,
  ResultadoRegistrarImagenGestionable,
} from "@/componentes/tiposGestionImagenes";

const BUCKET = "propiedades";

type ErrorSubida = {
  archivo: string;
  mensaje: string;
};

export type GestionImagenesProps = {
  prefijoRuta: string;
  maximo: number;
  ladoMaximo: number;
  proporcionAspecto: string;
  imagenesIniciales: ImagenGestionable[];
  titulo?: string;
  etiquetaAgregar: string;
  ayudaDropzone: string;
  textoVacio: string;
  nombreItem: string;
  nombreItemPlural: string;
  mostrarContador?: boolean;
  etiquetaPrimera?: string;
  bordeDestacadoPrimera?: boolean;
  mostrarBotonEditarEncuadre?: boolean;
  mensajeLimite: (maximo: number, actuales: number, elegidos: number) => string;
  onCambioImagenes?: (imagenes: ImagenGestionable[]) => void;
  registrarAccion: (rutaArchivo: string) => Promise<ResultadoRegistrarImagenGestionable>;
  reordenarAccion: (idsEnOrden: string[]) => Promise<ResultadoAccionImagenGestionable>;
  eliminarAccion: (imagenId: string) => Promise<ResultadoAccionImagenGestionable>;
  actualizarEncuadreAccion: (
    imagenId: string,
    puntoFocalX: number,
    puntoFocalY: number,
  ) => Promise<ResultadoAccionImagenGestionable>;
};

export type GestionImagenesHandle = {
  actualizarEncuadreLocal: (id: string, puntoFocalX: number, puntoFocalY: number) => void;
};

// Order visual de las imágenes que NO se están arrastrando: la arrastrada
// conserva siempre su order natural (i), así que nunca cambia de celda;
// las demás se corren de a una para "abrir hueco" en el destino.
function calcularOrder(i: number, indiceOriginal: number, indiceObjetivo: number): number {
  if (indiceObjetivo === indiceOriginal) {
    return i;
  }

  if (indiceObjetivo > indiceOriginal) {
    if (i > indiceOriginal && i <= indiceObjetivo) {
      return i - 1;
    }
    return i;
  }

  if (i >= indiceObjetivo && i < indiceOriginal) {
    return i + 1;
  }

  return i;
}

export const GestionImagenes = forwardRef<GestionImagenesHandle, GestionImagenesProps>(
  function GestionImagenes(
    {
      prefijoRuta,
      maximo,
      ladoMaximo,
      proporcionAspecto,
      imagenesIniciales,
      titulo,
      etiquetaAgregar,
      ayudaDropzone,
      textoVacio,
      nombreItem,
      nombreItemPlural,
      mostrarContador = false,
      etiquetaPrimera,
      bordeDestacadoPrimera = false,
      mostrarBotonEditarEncuadre = true,
      mensajeLimite,
      onCambioImagenes,
      registrarAccion,
      reordenarAccion,
      eliminarAccion,
      actualizarEncuadreAccion,
    },
    ref,
  ) {
    const [imagenes, setImagenes] = useState(imagenesIniciales);

    useEffect(() => {
      onCambioImagenes?.(imagenes);
    }, [imagenes, onCambioImagenes]);

    const [imagenesOptimistas, marcarOrdenOptimista] = useOptimistic(
      imagenes,
      (_estado: ImagenGestionable[], nuevoOrden: ImagenGestionable[]) => nuevoOrden,
    );
    const [pendienteOrden, iniciarTransicionOrden] = useTransition();
    const [errorOrden, setErrorOrden] = useState<string | null>(null);
    const [anuncioOrden, setAnuncioOrden] = useState("");

    const [idArrastrado, setIdArrastrado] = useState<string | null>(null);
    const [deltaArrastre, setDeltaArrastre] = useState({ x: 0, y: 0 });
    const [indiceObjetivo, setIndiceObjetivo] = useState<number | null>(null);
    const idArrastradoRef = useRef<string | null>(null);
    const inicioPunteroRef = useRef<{ x: number; y: number } | null>(null);
    const indiceArrastradoOriginalRef = useRef<number | null>(null);

    const [subiendo, setSubiendo] = useState(false);
    const [progreso, setProgreso] = useState<{ actual: number; total: number } | null>(null);
    const [errorLimite, setErrorLimite] = useState<string | null>(null);
    const [erroresSubida, setErroresSubida] = useState<ErrorSubida[]>([]);
    const [arrastrandoArchivos, setArrastrandoArchivos] = useState(false);

    // Derivado de idArrastrado (estado), no del ref: leer refs durante el
    // render no es válido en React, y este valor se necesita acá para el
    // order de cada tarjeta.
    const indiceArrastradoOriginal = idArrastrado
      ? imagenesOptimistas.findIndex((imagen) => imagen.id === idArrastrado)
      : null;

    function aplicarNuevoOrden(nuevoOrden: ImagenGestionable[]) {
      setErrorOrden(null);

      iniciarTransicionOrden(async () => {
        marcarOrdenOptimista(nuevoOrden);
        const resultado = await reordenarAccion(nuevoOrden.map((imagen) => imagen.id));

        if (resultado.error) {
          setErrorOrden(resultado.error);
          return;
        }

        setImagenes(nuevoOrden.map((imagen, indice) => ({ ...imagen, posicion: indice })));
      });
    }

    function moverConTeclado(indice: number, direccion: -1 | 1) {
      if (pendienteOrden) {
        return;
      }

      const nuevoIndice = indice + direccion;
      if (nuevoIndice < 0 || nuevoIndice >= imagenesOptimistas.length) {
        return;
      }

      const nuevoOrden = [...imagenesOptimistas];
      const [imagen] = nuevoOrden.splice(indice, 1);
      nuevoOrden.splice(nuevoIndice, 0, imagen);
      aplicarNuevoOrden(nuevoOrden);
      setAnuncioOrden(
        `${capitalizar(nombreItem)} movida a la posición ${nuevoIndice + 1} de ${nuevoOrden.length}.`,
      );
    }

    // Limpieza única del estado de arrastre: la usan pointerup, pointercancel
    // y lostpointercapture para no dejar nunca un arrastre a medio limpiar
    // (eso es lo que bloqueaba los intentos siguientes).
    function limpiarEstadoArrastre() {
      idArrastradoRef.current = null;
      inicioPunteroRef.current = null;
      indiceArrastradoOriginalRef.current = null;
      setIdArrastrado(null);
      setIndiceObjetivo(null);
    }

    useEffect(() => limpiarEstadoArrastre, []);

    function iniciarArrastre(evento: ReactPointerEvent<HTMLButtonElement>, id: string) {
      if (pendienteOrden) {
        return;
      }

      if (idArrastradoRef.current !== null) {
        // Salvaguarda: un arrastre anterior no se limpió (caso límite sin
        // pointerup/pointercancel/lostpointercapture). No bloquear el nuevo.
        limpiarEstadoArrastre();
      }

      const indiceOriginal = imagenesOptimistas.findIndex((imagen) => imagen.id === id);

      evento.currentTarget.setPointerCapture(evento.pointerId);
      idArrastradoRef.current = id;
      inicioPunteroRef.current = { x: evento.clientX, y: evento.clientY };
      indiceArrastradoOriginalRef.current = indiceOriginal;
      setIdArrastrado(id);
      setDeltaArrastre({ x: 0, y: 0 });
      setIndiceObjetivo(indiceOriginal);
    }

    function manejarPointerMove(evento: ReactPointerEvent<HTMLButtonElement>) {
      const idActual = idArrastradoRef.current;
      const inicio = inicioPunteroRef.current;
      if (idActual === null || inicio === null) {
        return;
      }

      // Delta acumulado desde el pointerdown: la celda de la tarjeta
      // arrastrada nunca cambia durante el gesto (ver calcularOrder), así
      // que esta base ya no se mueve sola.
      setDeltaArrastre({
        x: evento.clientX - inicio.x,
        y: evento.clientY - inicio.y,
      });

      // elementsFromPoint (no solo el elemento de más arriba) y filtrando
      // explícitamente la propia tarjeta arrastrada: pointer-events:none ya
      // la excluye del hit-test, pero esto no depende de que ese CSS alcance
      // a aplicarse a tiempo en cada movimiento.
      const idDebajo = document
        .elementsFromPoint(evento.clientX, evento.clientY)
        .map((elemento) => elemento.closest<HTMLElement>("[data-foto-id]")?.dataset.fotoId)
        .find((id) => id !== undefined && id !== idActual);

      if (!idDebajo) {
        return;
      }

      const indice = imagenesOptimistas.findIndex((imagen) => imagen.id === idDebajo);
      if (indice === -1) {
        return;
      }

      setIndiceObjetivo(indice);
    }

    function liberarCapturaSiCorresponde(evento: ReactPointerEvent<HTMLButtonElement>) {
      if (evento.currentTarget.hasPointerCapture(evento.pointerId)) {
        evento.currentTarget.releasePointerCapture(evento.pointerId);
      }
    }

    function terminarArrastre(evento: ReactPointerEvent<HTMLButtonElement>) {
      if (idArrastradoRef.current === null) {
        return;
      }

      liberarCapturaSiCorresponde(evento);

      const indiceOriginal = indiceArrastradoOriginalRef.current;
      const destino = indiceObjetivo;
      limpiarEstadoArrastre();

      if (indiceOriginal === null || destino === null || destino === indiceOriginal) {
        return;
      }

      // imagenesOptimistas nunca se tocó durante el gesto: indiceOriginal
      // sigue siendo válido para sacar la imagen de ahí.
      const nuevoOrden = [...imagenesOptimistas];
      const [imagen] = nuevoOrden.splice(indiceOriginal, 1);
      nuevoOrden.splice(destino, 0, imagen);
      aplicarNuevoOrden(nuevoOrden);
    }

    function cancelarArrastre(evento: ReactPointerEvent<HTMLButtonElement>) {
      if (idArrastradoRef.current === null) {
        return;
      }

      liberarCapturaSiCorresponde(evento);
      limpiarEstadoArrastre();
    }

    function manejarPerdidaDeCaptura() {
      // El navegador ya liberó la captura acá: solo queda limpiar el estado.
      if (idArrastradoRef.current === null) {
        return;
      }

      limpiarEstadoArrastre();
    }

    function crearManejadoresManija(id: string): ManejadoresManija {
      return {
        onPointerDown: (evento) => iniciarArrastre(evento, id),
        onPointerMove: manejarPointerMove,
        onPointerUp: terminarArrastre,
        onPointerCancel: cancelarArrastre,
        onLostPointerCapture: manejarPerdidaDeCaptura,
      };
    }

    function quitarDeLaLista(id: string) {
      setImagenes((actuales) => actuales.filter((imagen) => imagen.id !== id));
    }

    function actualizarEncuadreLocal(id: string, puntoFocalX: number, puntoFocalY: number) {
      setImagenes((actuales) =>
        actuales.map((imagen) => (imagen.id === id ? { ...imagen, puntoFocalX, puntoFocalY } : imagen)),
      );
    }

    useImperativeHandle(ref, () => ({ actualizarEncuadreLocal }));

    async function procesarArchivosSeleccionados(archivos: File[]) {
      if (archivos.length === 0) {
        return;
      }

      setErrorLimite(null);
      setErroresSubida([]);

      const disponibles = maximo - imagenes.length;
      if (archivos.length > disponibles) {
        setErrorLimite(mensajeLimite(maximo, imagenes.length, archivos.length));
        return;
      }

      setSubiendo(true);
      const supabase = crearClienteNavegador();
      const erroresDeEstaTanda: ErrorSubida[] = [];

      for (let indice = 0; indice < archivos.length; indice++) {
        const archivo = archivos[indice];
        setProgreso({ actual: indice + 1, total: archivos.length });

        if (!archivo.type.startsWith("image/")) {
          erroresDeEstaTanda.push({ archivo: archivo.name, mensaje: "El archivo no es una imagen." });
          continue;
        }

        try {
          const { blob, extension } = await comprimirImagen(archivo, ladoMaximo);
          const rutaArchivo = `${prefijoRuta}/${crypto.randomUUID()}.${extension}`;

          const { error: errorSubida } = await supabase.storage
            .from(BUCKET)
            .upload(rutaArchivo, blob, {
              upsert: false,
              contentType: blob.type,
              cacheControl: "31536000",
            });

          if (errorSubida) {
            erroresDeEstaTanda.push({
              archivo: archivo.name,
              mensaje: `No se pudo subir la ${nombreItem}.`,
            });
            continue;
          }

          const resultado = await registrarAccion(rutaArchivo);

          if (resultado.error !== null) {
            erroresDeEstaTanda.push({ archivo: archivo.name, mensaje: resultado.error });
            continue;
          }

          setImagenes((actuales) => [...actuales, resultado.imagen]);
        } catch (error) {
          erroresDeEstaTanda.push({
            archivo: archivo.name,
            mensaje: error instanceof Error ? error.message : `No se pudo procesar la ${nombreItem}.`,
          });
        }
      }

      setSubiendo(false);
      setProgreso(null);
      setErroresSubida(erroresDeEstaTanda);
    }

    async function manejarSeleccionArchivos(evento: ChangeEvent<HTMLInputElement>) {
      const archivos = Array.from(evento.target.files ?? []);
      evento.target.value = "";
      await procesarArchivosSeleccionados(archivos);
    }

    function manejarDragEnter(evento: DragEvent<HTMLLabelElement>) {
      if (!evento.dataTransfer?.types.includes("Files")) {
        return;
      }

      evento.preventDefault();
      setArrastrandoArchivos(true);
    }

    function manejarDragOver(evento: DragEvent<HTMLLabelElement>) {
      if (!evento.dataTransfer?.types.includes("Files")) {
        return;
      }

      evento.preventDefault();
    }

    function manejarDragLeave(evento: DragEvent<HTMLLabelElement>) {
      if (evento.currentTarget.contains(evento.relatedTarget as Node | null)) {
        return;
      }

      setArrastrandoArchivos(false);
    }

    async function manejarDrop(evento: DragEvent<HTMLLabelElement>) {
      evento.preventDefault();
      setArrastrandoArchivos(false);

      if (subiendo) {
        return;
      }

      const archivos = Array.from(evento.dataTransfer?.files ?? []);
      await procesarArchivosSeleccionados(archivos);
    }

    const estiloArrastreCard: CSSProperties = {
      transform: `translate(${deltaArrastre.x}px, ${deltaArrastre.y}px)`,
      pointerEvents: "none",
      // El transform ya crea su propio stacking context; sin un z-index
      // numérico explícito ACÁ (mismo elemento, no en un hijo), el orden de
      // pintado frente a los hermanos lo decide la posición en el DOM, no
      // quién se está arrastrando.
      zIndex: 50,
    };

    return (
      <div className="flex flex-col gap-4">
        {titulo && <h2 className="text-base font-semibold">{titulo}</h2>}

        <label
          onDragEnter={manejarDragEnter}
          onDragOver={manejarDragOver}
          onDragLeave={manejarDragLeave}
          onDrop={manejarDrop}
          className={`flex flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed px-4 py-8 text-center text-sm text-gris-600 ${
            subiendo ? "cursor-not-allowed opacity-50" : "cursor-pointer"
          } ${arrastrandoArchivos ? "border-negro bg-gris-100 text-negro" : "border-gris-400"}`}
        >
          <span className="font-medium text-negro">{etiquetaAgregar}</span>
          <span>{ayudaDropzone}</span>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={manejarSeleccionArchivos}
            disabled={subiendo}
            className="sr-only"
          />
        </label>

        {mostrarContador && (
          <p className="text-sm text-gris-600">
            {imagenes.length} de {maximo} {nombreItemPlural}
          </p>
        )}

        <div aria-live="polite" className="sr-only">
          {anuncioOrden}
        </div>

        {subiendo && progreso && (
          <p role="status" className="text-sm text-gris-600">
            Subiendo {progreso.actual} de {progreso.total}…
          </p>
        )}

        {errorLimite && (
          <p
            role="alert"
            className="border-l-4 border-negro bg-gris-100 px-3 py-2 text-sm font-medium text-negro"
          >
            {errorLimite}
          </p>
        )}

        {erroresSubida.length > 0 && (
          <div
            role="alert"
            className="border-l-4 border-negro bg-gris-100 px-3 py-2 text-sm font-medium text-negro"
          >
            <p>No se pudieron subir algunas {nombreItemPlural}:</p>
            <ul className="mt-1 list-disc pl-5">
              {erroresSubida.map((error, indice) => (
                <li key={indice}>
                  {error.archivo}: {error.mensaje}
                </li>
              ))}
            </ul>
          </div>
        )}

        {errorOrden && (
          <p
            role="alert"
            className="border-l-4 border-negro bg-gris-100 px-3 py-2 text-sm font-medium text-negro"
          >
            {errorOrden}
          </p>
        )}

        {imagenesOptimistas.length === 0 ? (
          <p className="text-sm text-gris-600">{textoVacio}</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {imagenesOptimistas.map((imagen, indice) => {
              const esArrastrada = idArrastrado === imagen.id;
              const order =
                indiceArrastradoOriginal !== null && indiceObjetivo !== null
                  ? calcularOrder(indice, indiceArrastradoOriginal, indiceObjetivo)
                  : indice;

              return (
                <ImagenGestionableItem
                  key={imagen.id}
                  imagen={imagen}
                  indice={indice}
                  total={imagenesOptimistas.length}
                  esPrimera={indice === 0}
                  etiquetaPrimera={etiquetaPrimera}
                  bordeDestacadoPrimera={bordeDestacadoPrimera}
                  proporcionAspecto={proporcionAspecto}
                  nombreItem={nombreItem}
                  pendienteOrden={pendienteOrden}
                  arrastrando={esArrastrada}
                  order={order}
                  estiloArrastre={esArrastrada ? estiloArrastreCard : undefined}
                  manejadoresManija={crearManejadoresManija(imagen.id)}
                  onMoverConTeclado={moverConTeclado}
                  onEliminado={quitarDeLaLista}
                  onEncuadreActualizado={actualizarEncuadreLocal}
                  mostrarBotonEditarEncuadre={mostrarBotonEditarEncuadre}
                  eliminarAccion={eliminarAccion}
                  actualizarEncuadreAccion={actualizarEncuadreAccion}
                />
              );
            })}
          </div>
        )}
      </div>
    );
  },
);

function capitalizar(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}
