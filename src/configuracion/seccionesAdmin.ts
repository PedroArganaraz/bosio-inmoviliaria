export type SeccionAdmin = {
  etiqueta: string;
  ruta: string;
};

export const seccionesAdmin: SeccionAdmin[] = [
  { etiqueta: "Propiedades", ruta: "/admin/propiedades" },
  { etiqueta: "Portada", ruta: "/admin/portada" },
];
