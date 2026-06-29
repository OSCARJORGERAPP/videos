# RETROSPECTIVA — VideoVault

Bitácora de problemas, causas y soluciones encontradas durante el desarrollo.

---

## 2026-06-29 — Next.js 15.3.3 con vulnerabilidad de seguridad crítica

**Problema**: Al ejecutar `npm install` con Next.js 15.3.3, npm reportó una vulnerabilidad crítica y una moderada en el paquete.

**Causa**: CVE-2025-66478 afectaba a Next.js 15.3.3.

**Solución**: Actualizar a `next@latest` (`16.2.9`) inmediatamente tras la instalación inicial. En proyectos nuevos, no fijar versiones de Next.js con `^` sino comprobar la versión más reciente antes de instalar.

---

## 2026-06-29 — `middleware.ts` deprecado en Next.js 16

**Problema**: Al arrancar `npm run dev`, Next.js 16 mostró el warning: *"The 'middleware' file convention is deprecated. Please use 'proxy' instead."*

**Causa**: Next.js 16 renombró el fichero de interceptación de rutas de `middleware.ts` a `proxy.ts`. La función exportada también debe llamarse `proxy` (no `middleware`).

**Solución**:
1. Renombrar `src/middleware.ts` → `src/proxy.ts`.
2. Cambiar `export function middleware(...)` por `export function proxy(...)`.
3. Limpiar la caché `.next/` con `Remove-Item -Recurse -Force .next` para que Turbopack no detecte ambos ficheros simultáneamente.

---

## 2026-06-29 — `serverActions.bodySizeLimit` no reconocido en `next.config.ts`

**Problema**: Warning en consola: *"Unrecognized key(s) in object: 'serverActions'"* al arrancar el servidor.

**Causa**: En Next.js 16, `serverActions` dejó de ser una opción experimental dentro de `next.config.ts`. La API de Server Actions está estable y ya no admite esa clave de configuración.

**Solución**: Eliminar el bloque `serverActions: { bodySizeLimit: '10mb' }` de `next.config.ts`. El tamaño máximo del body en route handlers se controla a nivel de la plataforma de despliegue (Vercel plan, etc.).

---

## 2026-06-29 — Error CORS al subir vídeos directamente a RustFS

**Problema**: Al intentar subir un vídeo desde el browser, la consola mostraba: *"Access to XMLHttpRequest blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present"*. La subida fallaba al intentar hacer PUT con la presigned URL directamente a `localhost:9000`.

**Causa**: RustFS en local no envía headers CORS por defecto. El browser hace un preflight OPTIONS antes del PUT, y RustFS no responde con los headers `Access-Control-Allow-Origin` necesarios. Arquitectónicamente, la subida directa desde el cliente al bucket requiere que el servidor de storage tenga CORS configurado.

**Solución**: Sustituir el flujo de presigned PUT por un proxy de subida a través del API de Next.js (`POST /api/upload`). El cliente sube el fichero a `localhost:3000` (mismo origen, sin CORS), y el servidor Next.js lo reenvía a RustFS internamente con el SDK de AWS S3. Se mantiene la barra de progreso usando XHR contra el propio servidor.

**Nota para producción**: Con un bucket S3 real (AWS, Cloudflare R2) o un RustFS con CORS configurado, se puede recuperar el flujo de presigned PUT directo, que es más eficiente para ficheros grandes.

---

## 2026-06-29 — Contenido de páginas pegado al borde izquierdo (Tailwind v4 + CSS Cascade Layers)

**Problema**: El contenido del dashboard y de las páginas de vídeos aparecía alineado al borde izquierdo de la pantalla en lugar de estar centrado. La Navbar sí aparecía centrada correctamente.

**Causa**: Tailwind v4 genera sus utilities dentro de `@layer utilities`. Todo CSS escrito fuera de un `@layer` en el mismo fichero tiene mayor prioridad en la cascada CSS, independientemente de la especificidad del selector. El reset global `* { margin: 0; padding: 0; }` en `globals.css` estaba fuera de cualquier layer y anulaba la utility `mx-auto` (que establece `margin-left: auto; margin-right: auto`). La Navbar funcionaba porque su `<nav>` es de ancho completo y el centrado lo hace un `<div>` interior — el `<nav>` en sí no necesita `mx-auto`.

**Solución**:
1. Eliminar `* { margin: 0; padding: 0; }` de `globals.css`. El preflight de Tailwind ya incluye este reset dentro de su propia layer — duplicarlo fuera rompe las utilities de margen.
2. Dejar solo `*, *::before, *::after { box-sizing: border-box; }` en el reset personalizado.
3. Adoptar el patrón de layout de la Navbar en todos los layouts: contenedor exterior semántico sin clases de margen + `<div className="max-w-7xl mx-auto px-6 py-8">` interior.

```tsx
// ✅ Correcto
<main>
  <div className="max-w-7xl mx-auto px-6 py-8">{children}</div>
</main>

// ❌ Rompe con Tailwind v4 si hay CSS fuera de @layer
<main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
```

---

## 2026-06-29 — `testPathPattern` no reconocido en `jest.config.ts`

**Problema**: Al ejecutar `npm test`, Jest fallaba con: *"'testPathPattern' does not exist in type"*.

**Causa**: La opción `testPathPattern` no existe en la interfaz de configuración estática de Jest (`Config`). Es un flag de CLI, no una clave de `jest.config.ts`.

**Solución**: Sustituir `testPathPattern: '__tests__'` por `testMatch: ['**/__tests__/**/*.test.ts']`.

---

## 2026-06-29 — Tests de auth fallando por `JWT_SECRET` leído en tiempo de importación

**Problema**: Los tests de `auth.test.ts` fallaban con *"secretOrPrivateKey must have a value"* aunque el test asignaba `process.env.JWT_SECRET` antes de usarlo.

**Causa**: En `src/lib/auth.ts`, la constante `const SECRET = process.env.JWT_SECRET!` se evaluaba en el momento en que Node.js importaba el módulo, antes de que el test pudiera asignar la variable de entorno.

**Solución**: Leer `process.env.JWT_SECRET` de forma lazy dentro de las funciones (`signToken` y `verifyToken`) en lugar de asignarlo a una constante de módulo. Así la variable se lee en el momento de la llamada, cuando el test ya la ha definido.
