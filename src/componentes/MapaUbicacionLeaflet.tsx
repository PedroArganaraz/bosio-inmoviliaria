"use client";

import { useEffect, useRef } from "react";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import iconoMarcador from "leaflet/dist/images/marker-icon.png";
import iconoMarcador2x from "leaflet/dist/images/marker-icon-2x.png";
import sombraMarcador from "leaflet/dist/images/marker-shadow.png";

const CENTRO_POR_DEFECTO: L.LatLngTuple = [-31.4201, -64.1888];
const ZOOM_CIUDAD = 12;
const ZOOM_UBICADO = 16;

function urlDe(recurso: string | { src: string }): string {
  return typeof recurso === "string" ? recurso : recurso.src;
}

const iconoPin = L.icon({
  iconUrl: urlDe(iconoMarcador),
  iconRetinaUrl: urlDe(iconoMarcador2x),
  shadowUrl: urlDe(sombraMarcador),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export type MapaUbicacionProps = {
  latitud: number | null;
  longitud: number | null;
  editable: boolean;
  onCambiarPosicion?: (lat: number, lng: number) => void;
};

export default function MapaUbicacionLeaflet({
  latitud,
  longitud,
  editable,
  onCambiarPosicion,
}: MapaUbicacionProps) {
  const contenedorRef = useRef<HTMLDivElement>(null);
  const mapaRef = useRef<L.Map | null>(null);
  const marcadorRef = useRef<L.Marker | null>(null);
  const onCambiarPosicionRef = useRef(onCambiarPosicion);

  useEffect(() => {
    onCambiarPosicionRef.current = onCambiarPosicion;
  });

  useEffect(() => {
    if (!contenedorRef.current) {
      return;
    }

    const mapa = L.map(contenedorRef.current).setView(CENTRO_POR_DEFECTO, ZOOM_CIUDAD);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(mapa);
    mapaRef.current = mapa;

    return () => {
      mapa.remove();
      mapaRef.current = null;
      marcadorRef.current = null;
    };
  }, []);

  useEffect(() => {
    const mapa = mapaRef.current;
    if (!mapa) {
      return;
    }

    const hayPosicion = latitud !== null && longitud !== null;
    if (!hayPosicion && !editable) {
      marcadorRef.current?.remove();
      marcadorRef.current = null;
      return;
    }

    const posicion: L.LatLngTuple = hayPosicion ? [latitud, longitud] : CENTRO_POR_DEFECTO;
    let marcador = marcadorRef.current;

    if (marcador) {
      marcador.setLatLng(posicion);
    } else {
      const marcadorNuevo = L.marker(posicion, { icon: iconoPin }).addTo(mapa);
      marcadorNuevo.on("dragend", () => {
        const { lat, lng } = marcadorNuevo.getLatLng();
        onCambiarPosicionRef.current?.(lat, lng);
      });
      marcadorRef.current = marcadorNuevo;
      marcador = marcadorNuevo;
    }

    if (editable) {
      marcador.dragging?.enable();
    } else {
      marcador.dragging?.disable();
    }

    if (hayPosicion) {
      mapa.setView(posicion, Math.max(mapa.getZoom(), ZOOM_UBICADO), { animate: false });
    }
  }, [latitud, longitud, editable]);

  return <div ref={contenedorRef} className="isolate z-0 h-64 w-full rounded sm:h-80" />;
}
