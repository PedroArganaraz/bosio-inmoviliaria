-- =====================================================================
-- Bosio Inmobiliaria — Punto focal (encuadre) de las fotos de propiedades
-- Define qué parte de la imagen se prioriza al recortarla con object-cover.
-- 50/50 = centro (comportamiento actual, sin cambios visuales hasta que
-- se edite el encuadre de una foto puntual).
-- Ejecutar completo en Supabase > SQL Editor.
-- =====================================================================

alter table "imagenesPropiedad"
  add column "puntoFocalX" smallint not null default 50
    check ("puntoFocalX" between 0 and 100),
  add column "puntoFocalY" smallint not null default 50
    check ("puntoFocalY" between 0 and 100);
