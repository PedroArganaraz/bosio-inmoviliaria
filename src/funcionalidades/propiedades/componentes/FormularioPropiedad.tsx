"use client";

import { useActionState, useState, useTransition } from "react";
import { Interruptor } from "@/componentes/Interruptor";
import { CampoFormulario } from "@/componentes/CampoFormulario";
import { MapaUbicacion } from "@/componentes/MapaUbicacion";
import { configuracionSitio } from "@/configuracion/configuracionSitio";
import { geocodificarDireccion } from "@/funcionalidades/propiedades/acciones/geocodificarDireccion";
import { geocodificarInversa } from "@/funcionalidades/propiedades/acciones/geocodificarInversa";
import { TipoOperacion, TipoPropiedad, Moneda } from "@/funcionalidades/propiedades/enums";
import {
  etiquetasTipoOperacion,
  etiquetasTipoPropiedad,
} from "@/funcionalidades/propiedades/utilidades/etiquetas";
import {
  valoresFormularioVacios,
  type ValoresFormularioPropiedad,
} from "@/funcionalidades/propiedades/utilidades/valoresFormularioPropiedad";
import type { EstadoFormularioPropiedad } from "@/funcionalidades/propiedades/acciones/validarDatosPropiedad";

const claseInput =
  "rounded border border-gris-400 px-3 py-2 text-base text-negro focus:border-negro focus:outline-none";

const claseTarjeta = "flex flex-col gap-4 rounded-lg bg-gris-100 p-4 sm:p-6";
const claseTituloSeccion = "text-base font-semibold";

type Coordenadas = { lat: number; lng: number };

function leerCoordenadas(valores: ValoresFormularioPropiedad): Coordenadas | null {
  if (valores.latitud === "" || valores.longitud === "") {
    return null;
  }

  const lat = Number(valores.latitud);
  const lng = Number(valores.longitud);
  return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
}

const estadoInicial: EstadoFormularioPropiedad = {
  valores: valoresFormularioVacios,
  errores: {},
  errorGeneral: null,
};

type FormularioPropiedadProps = {
  accion: (
    estadoPrevio: EstadoFormularioPropiedad,
    formData: FormData,
  ) => Promise<EstadoFormularioPropiedad>;
  valoresIniciales?: ValoresFormularioPropiedad;
  // Se renderiza dentro del <form>, entre "Publicación" y el botón
  // "Guardar" — así el botón queda siempre al final de todo (ej. debajo
  // de la sección de fotos en /admin/propiedades/[id]/editar). Ningún
  // control de ese contenido debe ser type="submit".
  children?: React.ReactNode;
};

export function FormularioPropiedad({
  accion,
  valoresIniciales,
  children,
}: FormularioPropiedadProps) {
  const [estado, ejecutarAccion, pendiente] = useActionState(accion, {
    ...estadoInicial,
    valores: valoresIniciales ?? valoresFormularioVacios,
  });

  const [moneda, setMoneda] = useState<Moneda>(
    estado.valores.moneda === Moneda.Usd ? Moneda.Usd : Moneda.Ars,
  );
  const [monedaTocada, setMonedaTocada] = useState(false);
  const [activa, setActiva] = useState(estado.valores.activa);
  const [coordenadas, setCoordenadas] = useState(() => leerCoordenadas(estado.valores));
  const [direccion, setDireccion] = useState(estado.valores.direccion);
  const [barrio, setBarrio] = useState(estado.valores.barrio);
  const [errorBusqueda, setErrorBusqueda] = useState<string | null>(null);
  const [buscando, iniciarBusqueda] = useTransition();

  // Cada vez que la Server Action devuelve un estado nuevo (éxito o error),
  // los campos controlados se resincronizan con lo que el servidor echoa.
  // Ajuste de estado durante el render (no en un efecto): evita el
  // re-render en cascada que produciría un useEffect acá.
  const [estadoPrevio, setEstadoPrevio] = useState(estado);
  if (estadoPrevio !== estado) {
    setEstadoPrevio(estado);
    setMoneda(estado.valores.moneda === Moneda.Usd ? Moneda.Usd : Moneda.Ars);
    setMonedaTocada(false);
    setActiva(estado.valores.activa);
    setCoordenadas(leerCoordenadas(estado.valores));
    setDireccion(estado.valores.direccion);
    setBarrio(estado.valores.barrio);
  }

  const errorUbicacion = estado.errores.latitud ?? estado.errores.longitud;

  function moverPin(lat: number, lng: number) {
    setCoordenadas({ lat, lng });

    iniciarBusqueda(async () => {
      const resultado = await geocodificarInversa(lat, lng);

      if ("error" in resultado) {
        return;
      }

      if (resultado.direccion !== "") {
        setDireccion(resultado.direccion);
      }
      if (resultado.barrio !== "") {
        setBarrio(resultado.barrio);
      }
    });
  }

  function buscarEnElMapa() {
    setErrorBusqueda(null);

    iniciarBusqueda(async () => {
      const resultado = await geocodificarDireccion(direccion, barrio, configuracionSitio.ciudad);

      if ("error" in resultado) {
        setErrorBusqueda(resultado.error);
        return;
      }

      setCoordenadas(resultado);
    });
  }

  return (
    <form action={ejecutarAccion} className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <h2 id="tituloDatosPrincipales" className={claseTituloSeccion}>
          Datos principales
        </h2>
        <fieldset aria-labelledby="tituloDatosPrincipales" className={claseTarjeta}>
          <CampoFormulario etiqueta="Título" idCampo="titulo" error={estado.errores.titulo}>
            <input
              id="titulo"
              name="titulo"
              type="text"
              maxLength={120}
              required
              defaultValue={estado.valores.titulo}
              aria-invalid={Boolean(estado.errores.titulo)}
              aria-describedby={estado.errores.titulo ? "titulo-error" : undefined}
              className={claseInput}
            />
          </CampoFormulario>

          <CampoFormulario
            etiqueta="Descripción"
            idCampo="descripcion"
            error={estado.errores.descripcion}
          >
            <textarea
              id="descripcion"
              name="descripcion"
              maxLength={5000}
              rows={5}
              defaultValue={estado.valores.descripcion}
              aria-invalid={Boolean(estado.errores.descripcion)}
              aria-describedby={estado.errores.descripcion ? "descripcion-error" : undefined}
              className={claseInput}
            />
          </CampoFormulario>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <CampoFormulario
              etiqueta="Operación"
              idCampo="tipoOperacion"
              error={estado.errores.tipoOperacion}
            >
              <select
                id="tipoOperacion"
                name="tipoOperacion"
                required
                defaultValue={estado.valores.tipoOperacion}
                onChange={(evento) => {
                  if (!monedaTocada) {
                    setMoneda(
                      evento.target.value === TipoOperacion.Venta ? Moneda.Usd : Moneda.Ars,
                    );
                  }
                }}
                aria-invalid={Boolean(estado.errores.tipoOperacion)}
                aria-describedby={estado.errores.tipoOperacion ? "tipoOperacion-error" : undefined}
                className={claseInput}
              >
                <option value="" disabled>
                  Elegir...
                </option>
                {Object.values(TipoOperacion).map((valor) => (
                  <option key={valor} value={valor}>
                    {etiquetasTipoOperacion[valor]}
                  </option>
                ))}
              </select>
            </CampoFormulario>

            <CampoFormulario
              etiqueta="Tipo de propiedad"
              idCampo="tipoPropiedad"
              error={estado.errores.tipoPropiedad}
            >
              <select
                id="tipoPropiedad"
                name="tipoPropiedad"
                required
                defaultValue={estado.valores.tipoPropiedad}
                aria-invalid={Boolean(estado.errores.tipoPropiedad)}
                aria-describedby={estado.errores.tipoPropiedad ? "tipoPropiedad-error" : undefined}
                className={claseInput}
              >
                <option value="" disabled>
                  Elegir...
                </option>
                {Object.values(TipoPropiedad).map((valor) => (
                  <option key={valor} value={valor}>
                    {etiquetasTipoPropiedad[valor]}
                  </option>
                ))}
              </select>
            </CampoFormulario>
          </div>
        </fieldset>
      </div>

      <div className="flex flex-col gap-3">
        <h2 id="tituloPrecio" className={claseTituloSeccion}>
          Precio
        </h2>
        <fieldset aria-labelledby="tituloPrecio" className={claseTarjeta}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <CampoFormulario etiqueta="Precio" idCampo="precio" error={estado.errores.precio}>
              <input
                id="precio"
                name="precio"
                type="number"
                inputMode="numeric"
                min={0}
                step={1}
                defaultValue={estado.valores.precio}
                aria-invalid={Boolean(estado.errores.precio)}
                aria-describedby={estado.errores.precio ? "precio-error" : undefined}
                className={claseInput}
              />
            </CampoFormulario>

            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-gris-700">Moneda</span>
              <div role="group" aria-label="Moneda" className="flex gap-2">
                {[Moneda.Ars, Moneda.Usd].map((opcion) => (
                  <button
                    key={opcion}
                    type="button"
                    aria-pressed={moneda === opcion}
                    onClick={() => {
                      setMoneda(opcion);
                      setMonedaTocada(true);
                    }}
                    className={`rounded border px-4 py-2 text-sm ${
                      moneda === opcion
                        ? "border-negro bg-negro text-blanco"
                        : "border-gris-400 text-negro"
                    }`}
                  >
                    {opcion === Moneda.Usd ? "USD" : "ARS"}
                  </button>
                ))}
              </div>
              <input type="hidden" name="moneda" value={moneda} />
            </div>
          </div>
        </fieldset>
      </div>

      <div className="flex flex-col gap-3">
        <h2 id="tituloUbicacion" className={claseTituloSeccion}>
          Ubicación
        </h2>
        <fieldset aria-labelledby="tituloUbicacion" className={claseTarjeta}>
          <CampoFormulario etiqueta="Dirección" idCampo="direccion" error={estado.errores.direccion}>
            <input
              id="direccion"
              name="direccion"
              type="text"
              maxLength={200}
              value={direccion}
              onChange={(evento) => setDireccion(evento.target.value)}
              aria-invalid={Boolean(estado.errores.direccion)}
              aria-describedby={estado.errores.direccion ? "direccion-error" : undefined}
              className={claseInput}
            />
          </CampoFormulario>

          <CampoFormulario etiqueta="Barrio" idCampo="barrio" error={estado.errores.barrio}>
            <input
              id="barrio"
              name="barrio"
              type="text"
              maxLength={100}
              value={barrio}
              onChange={(evento) => setBarrio(evento.target.value)}
              aria-invalid={Boolean(estado.errores.barrio)}
              aria-describedby={estado.errores.barrio ? "barrio-error" : undefined}
              className={claseInput}
            />
          </CampoFormulario>

          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={buscarEnElMapa}
              disabled={direccion.trim() === "" || buscando}
              className="cursor-pointer self-start rounded border border-negro px-4 py-2 text-sm text-negro disabled:cursor-not-allowed disabled:opacity-50"
            >
              {buscando ? "Buscando…" : "Buscar en el mapa"}
            </button>

            {errorBusqueda && (
              <p
                role="alert"
                className="border-l-4 border-negro bg-blanco px-3 py-2 text-sm font-medium text-negro"
              >
                {errorBusqueda}
              </p>
            )}

            {errorUbicacion && (
              <p
                role="alert"
                className="border-l-4 border-negro bg-blanco px-3 py-2 text-sm font-medium text-negro"
              >
                {errorUbicacion}
              </p>
            )}

            <p className="text-sm text-gris-600">
              {coordenadas
                ? "Si el pin no cae exactamente en el lugar correcto, podés arrastrarlo."
                : "Buscá la dirección para ubicarla en el mapa."}
            </p>
            <MapaUbicacion
              latitud={coordenadas?.lat ?? null}
              longitud={coordenadas?.lng ?? null}
              editable
              onCambiarPosicion={moverPin}
            />

            <input type="hidden" name="latitud" value={coordenadas ? String(coordenadas.lat) : ""} />
            <input type="hidden" name="longitud" value={coordenadas ? String(coordenadas.lng) : ""} />
          </div>
        </fieldset>
      </div>

      <div className="flex flex-col gap-3">
        <h2 id="tituloCaracteristicas" className={claseTituloSeccion}>
          Características
        </h2>
        <fieldset aria-labelledby="tituloCaracteristicas" className={claseTarjeta}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <CampoFormulario
              etiqueta="Superficie cubierta (m²)"
              idCampo="superficieCubierta"
              error={estado.errores.superficieCubierta}
            >
              <input
                id="superficieCubierta"
                name="superficieCubierta"
                type="number"
                inputMode="decimal"
                min={0}
                step="0.01"
                defaultValue={estado.valores.superficieCubierta}
                aria-invalid={Boolean(estado.errores.superficieCubierta)}
                aria-describedby={
                  estado.errores.superficieCubierta ? "superficieCubierta-error" : undefined
                }
                className={claseInput}
              />
            </CampoFormulario>

            <CampoFormulario
              etiqueta="Superficie total (m²)"
              idCampo="superficieTotal"
              error={estado.errores.superficieTotal}
            >
              <input
                id="superficieTotal"
                name="superficieTotal"
                type="number"
                inputMode="decimal"
                min={0}
                step="0.01"
                defaultValue={estado.valores.superficieTotal}
                aria-invalid={Boolean(estado.errores.superficieTotal)}
                aria-describedby={
                  estado.errores.superficieTotal ? "superficieTotal-error" : undefined
                }
                className={claseInput}
              />
            </CampoFormulario>

            <CampoFormulario etiqueta="Ambientes" idCampo="ambientes" error={estado.errores.ambientes}>
              <input
                id="ambientes"
                name="ambientes"
                type="number"
                inputMode="numeric"
                min={0}
                step={1}
                defaultValue={estado.valores.ambientes}
                aria-invalid={Boolean(estado.errores.ambientes)}
                aria-describedby={estado.errores.ambientes ? "ambientes-error" : undefined}
                className={claseInput}
              />
            </CampoFormulario>

            <CampoFormulario
              etiqueta="Dormitorios"
              idCampo="dormitorios"
              error={estado.errores.dormitorios}
            >
              <input
                id="dormitorios"
                name="dormitorios"
                type="number"
                inputMode="numeric"
                min={0}
                step={1}
                defaultValue={estado.valores.dormitorios}
                aria-invalid={Boolean(estado.errores.dormitorios)}
                aria-describedby={estado.errores.dormitorios ? "dormitorios-error" : undefined}
                className={claseInput}
              />
            </CampoFormulario>

            <CampoFormulario etiqueta="Baños" idCampo="banos" error={estado.errores.banos}>
              <input
                id="banos"
                name="banos"
                type="number"
                inputMode="numeric"
                min={0}
                step={1}
                defaultValue={estado.valores.banos}
                aria-invalid={Boolean(estado.errores.banos)}
                aria-describedby={estado.errores.banos ? "banos-error" : undefined}
                className={claseInput}
              />
            </CampoFormulario>
          </div>
        </fieldset>
      </div>

      <fieldset className="flex flex-col gap-3">
        <legend className="text-base font-semibold">Publicación</legend>

        <div className="flex items-center gap-2">
          <Interruptor
            etiqueta={activa ? "Desactivar propiedad" : "Activar propiedad"}
            activo={activa}
            onCambiar={setActiva}
          />
          <span className="text-sm">{activa ? "Activa" : "Inactiva"}</span>
        </div>
        <input type="hidden" name="activa" value={activa ? "true" : "false"} />
      </fieldset>

      {children}

      {estado.errorGeneral && (
        <p
          role="alert"
          className="border-l-4 border-negro bg-gris-100 px-3 py-2 text-sm font-medium text-negro"
        >
          {estado.errorGeneral}
        </p>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pendiente}
          className="cursor-pointer rounded bg-negro px-4 py-2 text-blanco disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pendiente ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </form>
  );
}
