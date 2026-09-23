export const PASO_TECLADO_PUNTO_FOCAL = 5;

export const MOVIMIENTOS_TECLADO_PUNTO_FOCAL: Record<string, { x: number; y: number }> = {
  ArrowLeft: { x: -PASO_TECLADO_PUNTO_FOCAL, y: 0 },
  ArrowRight: { x: PASO_TECLADO_PUNTO_FOCAL, y: 0 },
  ArrowUp: { x: 0, y: -PASO_TECLADO_PUNTO_FOCAL },
  ArrowDown: { x: 0, y: PASO_TECLADO_PUNTO_FOCAL },
};

export function limitarPuntoFocal(valor: number): number {
  return Math.min(100, Math.max(0, valor));
}

// Arrastrar el contenido hacia la izquierda lo desplaza a la izquierda: el
// punto focal (lo que queda centrado en los recortes) se mueve al lado
// contrario del gesto, hacia la parte que se revela.
export function calcularPuntoFocalArrastrado(
  inicioFocal: { x: number; y: number },
  deltaPuntero: { x: number; y: number },
  dimensionesMarco: { width: number; height: number },
): { x: number; y: number } {
  return {
    x: limitarPuntoFocal(inicioFocal.x - (deltaPuntero.x / dimensionesMarco.width) * 100),
    y: limitarPuntoFocal(inicioFocal.y - (deltaPuntero.y / dimensionesMarco.height) * 100),
  };
}
