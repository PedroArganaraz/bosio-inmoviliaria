const TAMANO_MAXIMO_ORIGINAL = 25 * 1024 * 1024;
const LADO_MAXIMO_DEFECTO = 1600;
const CALIDAD_WEBP = 0.82;
const CALIDAD_JPEG = 0.85;

export type ImagenComprimida = {
  blob: Blob;
  extension: "webp" | "jpg";
};

export async function comprimirImagen(
  archivo: File,
  ladoMaximo: number = LADO_MAXIMO_DEFECTO,
): Promise<ImagenComprimida> {
  if (archivo.size > TAMANO_MAXIMO_ORIGINAL) {
    throw new Error(`No se pudo procesar ${archivo.name}: pesa más de 25 MB.`);
  }

  let bitmap: ImageBitmap;

  try {
    bitmap = await createImageBitmap(archivo, { imageOrientation: "from-image" });
  } catch {
    throw new Error(`No se pudo procesar ${archivo.name}. Probá con una foto JPG o PNG.`);
  }

  const escala = Math.min(1, ladoMaximo / Math.max(bitmap.width, bitmap.height));
  const ancho = Math.round(bitmap.width * escala);
  const alto = Math.round(bitmap.height * escala);

  const canvas = document.createElement("canvas");
  canvas.width = ancho;
  canvas.height = alto;
  const contexto = canvas.getContext("2d");

  if (!contexto) {
    bitmap.close();
    throw new Error(`No se pudo procesar ${archivo.name}. Probá con una foto JPG o PNG.`);
  }

  contexto.drawImage(bitmap, 0, 0, ancho, alto);
  bitmap.close();

  const blobWebp = await convertirCanvasABlob(canvas, "image/webp", CALIDAD_WEBP);

  if (blobWebp.type === "image/webp") {
    return { blob: blobWebp, extension: "webp" };
  }

  const blobJpeg = await convertirCanvasABlob(canvas, "image/jpeg", CALIDAD_JPEG);

  return { blob: blobJpeg, extension: "jpg" };
}

function convertirCanvasABlob(
  canvas: HTMLCanvasElement,
  tipo: string,
  calidad: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("No se pudo generar la imagen comprimida."));
        }
      },
      tipo,
      calidad,
    );
  });
}
