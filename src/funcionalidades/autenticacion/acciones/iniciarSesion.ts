"use server";

import { redirect } from "next/navigation";
import { crearClienteServidor } from "@/lib/supabase/servidor";

export type EstadoIniciarSesion = {
  error?: string;
};

const mensajeErrorGenerico = "Email o contraseña incorrectos.";

export async function iniciarSesion(
  _estadoPrevio: EstadoIniciarSesion,
  formData: FormData,
): Promise<EstadoIniciarSesion> {
  const email = formData.get("email");
  const contrasena = formData.get("contrasena");

  if (
    typeof email !== "string" ||
    typeof contrasena !== "string" ||
    !email.trim() ||
    !contrasena
  ) {
    return { error: mensajeErrorGenerico };
  }

  const supabase = await crearClienteServidor();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: contrasena,
  });

  if (error) {
    return { error: mensajeErrorGenerico };
  }

  redirect("/admin/propiedades");
}
