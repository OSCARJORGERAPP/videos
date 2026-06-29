# REFLEXIÓN FINAL — VideoVault

## ¿Qué se logró?

MVP completo y funcional de una plataforma privada de gestión y reproducción de vídeos:
- Registro y login con JWT (httpOnly cookie), protección de rutas vía `proxy.ts` (Next.js 16).
- Subida de vídeos con barra de progreso, almacenada en RustFS (S3-compatible).
- Metadatos ricos en MongoDB: nombre, descripción, tags, pares clave-valor.
- Búsqueda full-text integrada en MongoDB (índice de texto sobre nombre, descripción y tags).
- Reproductor HTML5 con presigned GET URL desde RustFS.
- Dashboard con contador de vídeos y espacio ocupado vía agregación MongoDB.
- Edición y eliminación de vídeos (borra objeto en RustFS y documento en MongoDB).
- 21 tests unitarios en verde; CI configurado para GitHub Actions y GitLab CI.

## Decisiones técnicas clave

| Decisión | Alternativa descartada | Motivo |
|---|---|---|
| Subida proxy vía Next.js API | Presigned PUT directo desde el browser | RustFS en local no envía headers CORS; el proxy lo resuelve sin configurar el servidor de storage |
| JWT en httpOnly cookie | localStorage | Evita XSS; funciona con SSR y middleware de Next.js |
| Driver nativo de MongoDB | Mongoose | Esquema flexible para pares clave-valor; sin overhead de ODM |
| Tailwind v4 | v3 | Versión actual, pero requiere patrón de layout específico (ver abajo) |
| Next.js `proxy.ts` | `middleware.ts` | Next.js 16 depreca `middleware` en favor de `proxy` |

## Deuda técnica

- **Subida directa a RustFS**: en producción con un bucket S3 real (AWS, Cloudflare R2, etc.) configurar CORS correctamente y volver al flujo de presigned PUT para no saturar el servidor Next.js con binarios grandes.
- **Thumbnails automáticos**: no implementados. Requeriría un worker que procese el vídeo tras la subida (ffmpeg o servicio externo).
- **Tests de integración**: los tests actuales son unitarios. Faltan tests de integración contra MongoDB y RustFS reales (con Docker en CI).
- **Seed de vídeos reales**: el seed actual sube placeholders de 1 byte; en un entorno de demo debería subir vídeos reales de ejemplo.
- **Paginación**: la lista de vídeos carga todos los documentos del usuario sin paginar; necesario para colecciones grandes.

## Aprendizajes

- **Tailwind v4 y CSS Cascade Layers**: las utilities de Tailwind v4 van dentro de `@layer utilities`, que tiene menor prioridad que CSS fuera de capas. Un reset global `* { margin: 0 }` en `globals.css` anula `mx-auto` y rompe el centrado. Solución: solo `box-sizing` en el reset global; el preflight de Tailwind maneja el resto. Patrón correcto: contenedor exterior ancho completo + `<div>` interior con `max-w-* mx-auto`.
- **Next.js 16 cambia `middleware` por `proxy`**: el fichero de protección de rutas debe llamarse `proxy.ts` y exportar una función llamada `proxy` (no `middleware`).
- **CORS en subidas directas a storage local**: cualquier servidor S3-compatible en local (MinIO, RustFS) requiere configuración CORS explícita para que el browser pueda hacer PUT. En desarrollo, proxiar vía el API de Next.js es más rápido de implementar.
