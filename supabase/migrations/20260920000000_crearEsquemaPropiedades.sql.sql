-- =====================================================================
-- Bosio Inmobiliaria — Esquema inicial (mínimo)
-- Convención: español, camelCase, sin tildes ni ñ.
-- Los identificadores camelCase van SIEMPRE entre comillas dobles,
-- si no Postgres los pasa a minúsculas.
-- Ejecutar completo en Supabase > SQL Editor.
-- =====================================================================


-- 1. Enums --------------------------------------------------------------
-- Se pueden agregar valores después (alter type ... add value),
-- pero no quitarlos fácilmente: por eso las listas arrancan cortas.

create type "tipoOperacion" as enum ('venta', 'alquiler');
create type "tipoPropiedad" as enum ('casa', 'departamento', 'duplex', 'terreno', 'otro');
create type "moneda" as enum ('usd', 'ars');


-- 2. Tabla propiedades ---------------------------------------------------
-- "activa" = visible en el sitio público.
-- Se pone en false cuando la propiedad está alquilada/vendida y se
-- vuelve a poner en true cuando se libera.

create table "propiedades" (
  "id"                  uuid primary key default gen_random_uuid(),
  "slug"                text not null unique,
  "titulo"              text not null,
  "descripcion"         text,
  "tipoOperacion"       "tipoOperacion" not null,
  "tipoPropiedad"       "tipoPropiedad" not null,
  "precio"              numeric(14, 2) check ("precio" >= 0),
  "moneda"              "moneda" not null default 'ars',
  "direccion"           text,
  "barrio"              text,
  "latitud"             double precision,
  "longitud"            double precision,
  "superficieCubierta"  numeric(10, 2) check ("superficieCubierta" >= 0),
  "superficieTotal"     numeric(10, 2) check ("superficieTotal" >= 0),
  "ambientes"           smallint check ("ambientes" >= 0),
  "dormitorios"         smallint check ("dormitorios" >= 0),
  "banos"               smallint check ("banos" >= 0),
  "activa"              boolean not null default true,
  "fechaCreacion"       timestamptz not null default now(),
  "fechaActualizacion"  timestamptz not null default now()
);


-- 3. Tabla imagenesPropiedad ----------------------------------------------
-- La portada es la imagen con menor "posicion".
-- El cascade borra las filas, pero NO los archivos del bucket:
-- eso lo hace la aplicación al eliminar una propiedad.

create table "imagenesPropiedad" (
  "id"             uuid primary key default gen_random_uuid(),
  "propiedadId"    uuid not null references "propiedades" ("id") on delete cascade,
  "rutaArchivo"    text not null,
  "posicion"       smallint not null default 0,
  "fechaCreacion"  timestamptz not null default now()
);

create index "imagenesPropiedadPropiedadIdPosicionIdx"
  on "imagenesPropiedad" ("propiedadId", "posicion");


-- 4. Trigger fechaActualizacion -------------------------------------------

create function "actualizarFechaActualizacion"()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new."fechaActualizacion" = now();
  return new;
end;
$$;

create trigger "propiedadesActualizarFecha"
before update on "propiedades"
for each row execute function "actualizarFechaActualizacion"();


-- 5. Permisos y RLS -------------------------------------------------------
-- Los grants son explícitos para no depender de los defaults de Supabase.
-- Quien realmente limita el acceso es RLS.

grant select on "propiedades", "imagenesPropiedad" to anon;
grant select, insert, update, delete on "propiedades", "imagenesPropiedad" to authenticated;

alter table "propiedades" enable row level security;
alter table "imagenesPropiedad" enable row level security;

-- Público: solo propiedades activas
create policy "propiedadesLecturaPublica"
  on "propiedades"
  for select
  to anon, authenticated
  using ("activa" = true);

-- Administración: el único usuario con login ve y modifica todo
create policy "propiedadesAdministracion"
  on "propiedades"
  for all
  to authenticated
  using (true)
  with check (true);

-- Público: imágenes solo de propiedades activas
create policy "imagenesPropiedadLecturaPublica"
  on "imagenesPropiedad"
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from "propiedades" p
      where p."id" = "imagenesPropiedad"."propiedadId"
        and p."activa" = true
    )
  );

create policy "imagenesPropiedadAdministracion"
  on "imagenesPropiedad"
  for all
  to authenticated
  using (true)
  with check (true);


-- 6. Storage --------------------------------------------------------------
-- Bucket público en lectura (las URLs se usan directo en <img>).
-- Escritura solo para usuarios autenticados.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'propiedades',
  'propiedades',
  true,
  5242880,  -- 5 MB por archivo
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

create policy "propiedadesStorageAdministracion"
  on storage.objects
  for all
  to authenticated
  using (bucket_id = 'propiedades')
  with check (bucket_id = 'propiedades');


-- =====================================================================
-- Cómo evolucionar el esquema (ejemplos, NO ejecutar ahora)
-- =====================================================================
-- alter table "propiedades" add column "cocheras" smallint check ("cocheras" >= 0);
-- alter table "propiedades" add column "expensas" numeric(14, 2);
-- alter type "tipoPropiedad" add value 'ph';
-- alter table "propiedades" drop column "ambientes";
--
-- Después de cada cambio: regenerar los tipos de TypeScript.
-- =====================================================================
