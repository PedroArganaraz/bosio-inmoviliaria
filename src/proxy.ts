import type { NextRequest } from "next/server";
import { refrescarSesion } from "@/lib/supabase/sesion";

export function proxy(request: NextRequest) {
  return refrescarSesion(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
