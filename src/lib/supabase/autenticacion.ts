import { redirect } from "next/navigation";
import { crearClienteServidor } from "@/lib/supabase/servidor";

export async function obtenerUsuarioAdmin() {
  const supabase = await crearClienteServidor();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/admin/login");
  }

  return user;
}
