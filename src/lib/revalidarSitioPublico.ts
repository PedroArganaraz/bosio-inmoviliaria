import { revalidatePath } from "next/cache";

// Único punto que sabe qué rutas son públicas: cuando se agreguen
// "/propiedades" o "/contacto", se amplía acá, no en cada Server Action.
export function revalidarSitioPublico() {
  revalidatePath("/");
}
