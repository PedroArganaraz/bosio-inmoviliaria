import { NextResponse, type NextRequest } from "next/server";
import { refrescarSesion } from "@/lib/supabase/sesion";

export async function proxy(request: NextRequest) {
  const { respuesta, usuario } = await refrescarSesion(request);
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    const esLogin = pathname === "/admin/login";

    if (!usuario && !esLogin) {
      return redirigirConservandoCookies(request, "/admin/login", respuesta);
    }

    if (usuario && esLogin) {
      return redirigirConservandoCookies(request, "/admin/propiedades", respuesta);
    }
  }

  return respuesta;
}

function redirigirConservandoCookies(
  request: NextRequest,
  destino: string,
  respuestaConSesion: NextResponse,
) {
  const url = request.nextUrl.clone();
  url.pathname = destino;

  const redireccion = NextResponse.redirect(url);
  respuestaConSesion.cookies.getAll().forEach((cookie) => {
    redireccion.cookies.set(cookie);
  });

  return redireccion;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
