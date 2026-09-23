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
  componentes/          # UI genérica compartida entre funcionalidades: ej.
                        # Interruptor, DialogConfirmacion, NavegacionAdmin, y
                        # el trío que gestiona imágenes (fotos de propiedad y
                        # carrusel de portada comparten esta implementación):
                        # GestionImagenes (orquestador: subida, dropzone,
                        # arrastre con manija, límite), ImagenGestionableItem
                        # (una tarjeta: manija, overlay Editar/Eliminar),
                        # AjustarEncuadreImagen (modal de punto focal) y
                        # tiposGestionImagenes.ts (tipos compartidos por los
                        # tres). Lo que cambia entre usos se pasa por props:
                        # prefijoRuta, maximo, ladoMaximo, proporcionAspecto,
                        # textos, y las 4 Server Actions inyectadas
                        # (registrar/reordenar/eliminar/actualizarEncuadre)
  configuracion/
    configuracionSitio.ts   # nombre, whatsapp, contacto, redes (placeholders)
    seccionesAdmin.ts        # secciones del menú del admin (etiqueta + ruta);
                              # agregar una sección nueva es una línea acá
  funcionalidades/
    autenticacion/
      acciones/          # iniciarSesion, cerrarSesion (Server Actions)
      componentes/       # FormularioLogin
    portada/              # carrusel único (mismo para celular y escritorio)
                           # de la página de inicio
      consultas/          # listarImagenesPortada
      acciones/            # registrarImagenPortada, reordenarImagenesPortada,
                            # eliminarImagenPortada, actualizarEncuadrePortada
      componentes/          # GestionPortada: wrapper delgado que configura
                             # el GestionImagenes compartido para este uso
    propiedades/
      enums.ts          # TipoOperacion, TipoPropiedad, Moneda
      consultas/        # lecturas a Supabase (Server Components/acciones)
      acciones/          # Server Actions (mutaciones) + validarDatosPropiedad
                          # (esquema Zod compartido por crear/actualizar)
      componentes/       # componentes de UI propios de propiedades;
                          # FotosPropiedad es el wrapper delgado que configura
                          # el GestionImagenes compartido para fotos
      utilidades/         # etiquetas, formatearPrecio, slugify,
                           # convertirEnumsPropiedad, valoresFormularioPropiedad
                           # — etiquetas y formatearPrecio se reutilizan
                           # también en el sitio público
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
  utilidades/             # utilidades genéricas compartidas entre
                           # funcionalidades: esUuid, construirUrlImagen,
                           # estiloObjectPosition, comprimirImagen (solo
                           # cliente), gestionImagenesServidor (helpers de
                           # Server Actions de imágenes: validar ruta/prefijo,
                           # validar porcentaje 0-100, borrar del bucket con
                           # mejor esfuerzo)
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
- **Imágenes (fotos de propiedad y carrusel de portada):** se suben directo
  del navegador al bucket `propiedades` (comprimidas antes de subir); las
  Server Actions nunca reciben archivos, solo rutas ya subidas. El carrusel
  de portada del Inicio es único (mismo para celular y escritorio); sus
  archivos van en la carpeta `portada/` del mismo bucket, registrados en
  `imagenesPortada`.
- **Optimizador de imágenes de Vercel:** está desactivado
  (`images.unoptimized` en `next.config.ts`) a propósito, para evitar el
  límite de transformaciones del plan gratuito; las imágenes ya llegan
  comprimidas desde el navegador antes de subirse. No lo reactives sin
  revisar el plan de Vercel del proyecto.
- **Gestión de imágenes compartida:** el arrastre con manija, el dropzone y
  el modal de encuadre viven en un único componente
  (`src/componentes/GestionImagenes.tsx` y su trío), reutilizado por fotos
  de propiedad y por el carrusel de portada, parametrizado por
  `prefijoRuta`/`maximo`/`ladoMaximo`/`proporcionAspecto` y las Server
  Actions inyectadas. No duplicar esta lógica para un uso nuevo: agregar un
  wrapper delgado que configure el componente compartido.
- **Portada de una propiedad y orden de fotos:** la portada (miniatura) de
  una propiedad es la imagen de menor `posicion` en `imagenesPropiedad`; el
  orden es `posicion` asc, `fechaCreacion` asc, `id` asc. (No confundir con
  el carrusel de "Portada" del sitio, que es una funcionalidad aparte.)
- **Borrado de imágenes:** al eliminar una imagen o una propiedad, primero
  se borran los archivos del bucket y recién después las filas de la base.
- **Secciones del admin:** se definen en un único módulo
  (`src/configuracion/seccionesAdmin.ts`); agregar una sección nueva al menú
  es agregar una línea ahí, no tocar el layout.
- **Sitio público:** es una única página (`src/app/(publico)/page.tsx`) con
  secciones ancladas (`#inicio` el carrusel de Portada, `#propiedades` el
  listado). Las fichas individuales de cada propiedad son rutas propias en
  `/propiedades/[slug]`, no secciones de esa misma página.
- **Filtrado del listado público:** es 100% en el cliente (sin ida al
  servidor en cada cambio de filtro), porque el volumen de propiedades es
  chico (~5). Los datos ya vienen cargados del Server Component.
- **Vista previa del carrusel en el admin:** el admin de Portada muestra una
  vista previa en vivo del carrusel, reutilizando el mismo componente
  `CarruselPortada` que usa el sitio público (no hay una segunda
  implementación). El encuadre de las imágenes del carrusel se ajusta
  arrastrando directo sobre esa vista previa (o con las flechas del
  teclado), no con un modal: Portada tiene un único contexto de uso real
  (el carrusel), a diferencia de las fotos de propiedad, que se usan en
  proporciones distintas según el contexto y por eso siguen usando el modal
  "Ajustar encuadre".
- **Ubicación en el mapa:** `latitud` y `longitud` nunca se muestran ni se
  editan como campos numéricos: se cargan por geocodificación de la
  dirección (Nominatim/OpenStreetMap) y se ajustan arrastrando un pin en
  `MapaUbicacion`. Ese componente está preparado para reutilizarse en modo
  no editable en la ficha pública.
- **Sin `console.log` ni código de depuración en el código final.**
- **Sin comentarios que solo repitan lo que el código ya dice** (ej. "//
  suma los valores" sobre una suma). Se admite un comentario corto solo
  cuando explica una decisión no obvia (ej. por qué el borrado va en cierto
  orden, por qué cierto valor no puede venir del cliente).

## Tipos de la base de datos

`npm run generarTipos` regenera `src/tipos/baseDeDatos.ts` a partir del
esquema real de Supabase (project id `jljkzhvonftvnlccnuek`). Correrlo cada
vez que el esquema cambie en Supabase.
