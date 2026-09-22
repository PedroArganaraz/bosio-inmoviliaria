-- =====================================================================
-- Bosio Inmobiliaria — Carrusel de portada (imágenes del Inicio)
-- Un único carrusel, el mismo para celular y escritorio.
-- Los archivos viven en el bucket "propiedades", carpeta "portada/".
-- Ejecutar completo en Supabase > SQL Editor.
-- =====================================================================

create table "imagenesPortada" (
  "id"             uuid primary key default gen_random_uuid(),
  "rutaArchivo"    text not null unique,
  "posicion"       smallint not null default 0,
  "fechaCreacion"  timestamptz not null default now()
);

create index "imagenesPortadaOrdenIdx"
  on "imagenesPortada" ("posicion", "fechaCreacion", "id");

-- Grants explícitos; quien realmente limita el acceso es RLS.
grant select on "imagenesPortada" to anon;
grant select, insert, update, delete on "imagenesPortada" to authenticated;

alter table "imagenesPortada" enable row level security;

-- Público: el carrusel se ve completo en el sitio
create policy "imagenesPortadaLecturaPublica"
  on "imagenesPortada"
  for select
  to anon, authenticated
  using (true);

-- Administración: el único usuario con login lo edita
create policy "imagenesPortadaAdministracion"
  on "imagenesPortada"
  for all
  to authenticated
  using (true)
  with check (true);
