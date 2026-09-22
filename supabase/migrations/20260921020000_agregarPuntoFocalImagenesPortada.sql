-- =====================================================================
-- Bosio Inmobiliaria — Punto focal (encuadre) de las imágenes de portada
-- Mismo esquema que el punto focal de imagenesPropiedad (0-100, 50/50 =
-- centro). Ejecutar completo en Supabase > SQL Editor.
-- =====================================================================

alter table "imagenesPortada"
  add column "puntoFocalX" smallint not null default 50
    check ("puntoFocalX" between 0 and 100),
  add column "puntoFocalY" smallint not null default 50
    check ("puntoFocalY" between 0 and 100);
