const LONGITUD_MAXIMA_BASE = 60;
const CARACTERES_SUFIJO = "abcdefghijklmnopqrstuvwxyz0123456789";
const LONGITUD_SUFIJO = 6;

export function slugify(texto: string): string {
  const normalizado = texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .trim()
    .replace(/[\s-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const truncado = normalizado.slice(0, LONGITUD_MAXIMA_BASE).replace(/-+$/g, "");

  return truncado || "propiedad";
}

export function generarSufijoAleatorio(): string {
  let sufijo = "";

  for (let i = 0; i < LONGITUD_SUFIJO; i++) {
    sufijo += CARACTERES_SUFIJO[Math.floor(Math.random() * CARACTERES_SUFIJO.length)];
  }

  return sufijo;
}
