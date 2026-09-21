import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { configuracionSitio } from "@/configuracion/configuracionSitio";
import { FormularioLogin } from "@/funcionalidades/autenticacion/componentes/FormularioLogin";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function PaginaLogin() {
  const supabase = await crearClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/admin/propiedades");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">{configuracionSitio.nombre}</h1>
      <FormularioLogin />
    </main>
  );
}
