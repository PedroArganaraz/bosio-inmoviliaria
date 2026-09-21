@AGENTS.md

# Bosio Inmobiliaria

Sitio web de una inmobiliaria chica (~5 propiedades). Sitio público (Inicio,
Propiedades, Contacto) + panel admin privado de un único usuario. Sin pagos
ni usuarios públicos.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS 4 + Zod (validación en
  Server Actions).
- Supabase: base de datos, autenticación y Storage. Deploy en Vercel.
- La base de datos ya existe en Supabase. El SQL de referencia vive en
  `supabase/migrations/` — **no se ejecuta ni se modifica** desde acá; los
  cambios de esquema se hacen a mano en Supabase y ese SQL se actualiza
  como documentación.

## Estructura de carpetas

```
src/
  app/
    (publico)/         # rutas públicas: "/", "/propiedades", "/contacto"
    admin/              # rutas privadas del panel de administración
  componentes/          # UI genérica compartida entre funcionalidades (ej. Interruptor)
  configuracion/
    configuracionSitio.ts   # nombre, whatsapp, contacto, redes (placeholders)
  funcionalidades/
    autenticacion/
      acciones/          # iniciarSesion, cerrarSesion (Server Actions)
      componentes/       # FormularioLogin
    propiedades/
      enums.ts          # TipoOperacion, TipoPropiedad, Moneda
      consultas/        # lecturas a Supabase (Server Components/acciones)
      acciones/          # Server Actions (mutaciones) + validarDatosPropiedad
                          # (esquema Zod compartido por crear/actualizar)
      componentes/       # componentes de UI propios de propiedades
      utilidades/         # etiquetas, formatearPrecio, construirUrlImagen,
                           # slugify, esUuid, convertirEnumsPropiedad,
                           # valoresFormularioPropiedad — las primeras tres se
                           # reutilizan también en el sitio público
  lib/
    supabase/
      cliente.ts         # cliente de navegador
      servidor.ts         # cliente para Server Components/Server Actions
      sesion.ts            # refresco de sesión, usado desde proxy.ts
      autenticacion.ts      # obtenerUsuarioAdmin(), usado en layouts/acciones del admin
    revalidarSitioPublico.ts  # único punto que revalida las rutas públicas
  proxy.ts                # (antes "middleware"): refresca la sesión en cada request
  tipos/
    baseDeDatos.ts         # generado con `npm run generarTipos`, no editar a mano
```

## Convenciones

- **Idioma:** todo en español — nombres de tablas, columnas, enums,
  variables, funciones y comentarios.
- **Identificadores:** camelCase, sin tildes ni ñ (`banos`, `descripcion`).
  Componentes de React, tipos e interfaces en PascalCase. Carpetas de rutas
  en minúscula. Las tildes y la ñ solo aparecen en los textos que ve el
  usuario final (contenido de la UI).
- **SQL:** los identificadores camelCase van siempre entre comillas dobles
  (si no, Postgres los pasa a minúsculas).
- **Enums:** se modelan como enums de TypeScript (no como constantes
  sueltas), reflejando uno a uno los enums de Postgres. Valores en minúscula
  y sin tildes. Ver `src/funcionalidades/propiedades/enums.ts`, que incluye
  una verificación en tiempo de compilación contra los tipos generados de
  la base.
- **Sin duplicación ni código muerto.** Cada módulo tiene una única
  responsabilidad.
- **Datos de la inmobiliaria:** el nombre de la inmobiliaria y el número de
  WhatsApp nunca se escriben directo en un componente — siempre se leen de
  `src/configuracion/configuracionSitio.ts`.
- **Supabase:** nunca se usa la service role key. Todo el acceso a datos
  pasa por la key pública (anon) y confía en RLS para los permisos.
- **Regla de negocio:** `propiedades."activa"` controla la visibilidad en el
  sitio público. Se pasa a `false` cuando la propiedad se alquila o se
  vende, y vuelve a `true` cuando se libera.
- **Planificar antes de implementar:** para cambios no triviales, proponer
  el plan (archivos a tocar, enfoque) antes de escribir código.
- **Autenticación del admin:** todo layout, página y Server Action del admin
  debe llamar a `obtenerUsuarioAdmin()` (`src/lib/supabase/autenticacion.ts`)
  antes de leer o escribir datos. No confiar solo en el proxy.
- **Orden determinístico:** todo listado debe tener orden total
  determinístico: criterio principal + desempate por `id`.

## Tipos de la base de datos

`npm run generarTipos` regenera `src/tipos/baseDeDatos.ts` a partir del
esquema real de Supabase (project id `jljkzhvonftvnlccnuek`). Correrlo cada
vez que el esquema cambie en Supabase.
