# VideoVault — Especificación del producto

## 1. Objetivo
Plataforma web privada de gestión y reproducción de vídeos personales/de equipo.
Resuelve la necesidad de almacenar, organizar y buscar vídeos propios sin mezclar
contenido entre usuarios, con metadatos ricos y un reproductor integrado.

## 2. Alcance

**Incluido (MVP):**
- Registro y login con JWT (httpOnly cookie).
- Subida de vídeos desde el navegador directamente a RustFS (presigned PUT URL).
- Almacenamiento de metadatos en MongoDB: nombre, descripción, tags, pares clave-valor, fecha, tamaño.
- Búsqueda de vídeos por nombre, descripción y tags.
- Reproductor HTML5 integrado con presigned GET URL.
- Dashboard: nº de vídeos subidos y espacio total ocupado.
- Bucket `videos` en RustFS creado automáticamente si no existe.
- Landing page profesional (skill `frontend-design`).

**Fuera de alcance (por ahora):**
- Vídeos públicos / compartidos.
- Transcodificación o thumbnails automáticos.
- Pasarela de pago.
- Notificaciones por email.

## 3. Stack tecnológico
| Capa | Tecnología | Motivo |
|---|---|---|
| Frontend | Next.js 15 (App Router) | SSR + RSC + API Routes en un solo proyecto |
| Estilos | Tailwind CSS v4 | Utilidades atómicas, diseño rápido y consistente |
| Backend | Next.js API Routes | Evita un servidor adicional; mismo despliegue |
| Auth | JWT (jsonwebtoken) + bcryptjs | Estándar sin sesiones server-side |
| Base de datos | MongoDB 7 (driver nativo) | Esquema flexible para metadatos clave-valor |
| Storage | RustFS (S3-compatible) | Especificado en el brief; endpoint local 9001 |
| S3 client | @aws-sdk/client-s3 v3 | Compatible con cualquier endpoint S3 |

## 4. Requisitos funcionales
| ID | Requisito | Criterio de aceptación |
|---|---|---|
| RF-01 | Registro de usuario | POST /api/auth/register crea usuario con password hasheada; devuelve JWT cookie; 409 si email duplicado |
| RF-02 | Login | POST /api/auth/login valida credenciales; devuelve JWT httpOnly cookie; 401 si inválidas |
| RF-03 | Logout | DELETE /api/auth/logout borra la cookie; redirige a `/` |
| RF-04 | Protección de rutas | Rutas `/dashboard` y `/videos/*` redirigen a `/auth/login` sin token válido |
| RF-05 | Subida de vídeo | POST /api/upload/presigned devuelve URL firmada; cliente sube directamente a RustFS |
| RF-06 | Registro de metadatos | POST /api/videos crea documento en MongoDB con userId, nombre, desc, tags, kv, size, key |
| RF-07 | Listado de vídeos | GET /api/videos devuelve solo los vídeos del usuario autenticado |
| RF-08 | Búsqueda | GET /api/videos?q=texto filtra por nombre, descripción y tags (case-insensitive) |
| RF-09 | Detalle de vídeo | GET /api/videos/[id] devuelve metadatos + presigned GET URL para reproducción |
| RF-10 | Edición de metadatos | PUT /api/videos/[id] actualiza nombre, desc, tags, kv |
| RF-11 | Eliminación | DELETE /api/videos/[id] borra objeto en RustFS y documento en MongoDB |
| RF-12 | Dashboard | GET /api/dashboard devuelve `{ count, totalBytes }` del usuario |
| RF-13 | Bucket automático | Al arrancar, el servidor crea el bucket `videos` si no existe |

## 5. Requisitos no funcionales (medibles)
- Latencia API p95 < 200 ms (excluye tiempo de subida de fichero).
- Tiempo de respuesta MongoDB p95 < 50 ms por operación clave (find, insertOne).
- Presigned URL generada en < 50 ms.
- Soporte ≥ 20 usuarios concurrentes sin degradación > 10 %.
- Tamaño máximo de vídeo por subida: 2 GB (límite del presigned URL).
- Cada documento de vídeo en MongoDB: < 2 KB (sin el binario).
- Disponibilidad objetivo dev: best-effort; prod: 99,5 % mensual.

## 6. Modelo de datos

### Colección `users`
```json
{
  "_id": "ObjectId",
  "email": "string (único, índice)",
  "name": "string",
  "password": "string (bcrypt hash)",
  "createdAt": "Date"
}
```

### Colección `videos`
```json
{
  "_id": "ObjectId",
  "userId": "ObjectId (índice)",
  "name": "string",
  "description": "string",
  "tags": ["string"],
  "metadata": [{ "key": "string", "value": "string" }],
  "size": "number (bytes)",
  "key": "string (S3 object key)",
  "contentType": "string",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

**Índices**: `users.email` (unique), `videos.userId`, `videos.name` (text), `videos.description` (text), `videos.tags` (multikey).

## 7. Entregables documentales (OBLIGATORIOS)
| Entregable | Propósito | Estado |
|---|---|---|
| `README.md` | Visión general, instalación, arranque, arquitectura (Mermaid) | ✅ |
| `QUICKSTART.md` | Camino mínimo "de cero a corriendo" en < 5 min | ✅ |
| `RETROSPECTIVA.md` | Bitácora problema → causa → solución | ✅ |
| `REFLEXION-FINAL.md` | Cierre: logros, decisiones, deuda técnica, aprendizajes | ✅ |
| Tests automatizados | 21 tests unitarios en verde (auth, videos, dashboard) | ✅ |
| Seed de datos | `scripts/seed.ts` — usuario demo + 3 vídeos de ejemplo | ✅ |
| `.env.example` | Plantilla de variables de entorno | ✅ |
| `package-lock.json` | Dependencias bloqueadas, commiteado | ✅ |
| Pipeline CI (`.github/workflows/ci.yml` + `.gitlab-ci.yml`) | install → lint → test → build | ✅ |
| Diagrama de arquitectura | En README (Mermaid) | ✅ |
| Sección de métricas | En AGENTS.md con comandos reales | ✅ |
| Guía de deployment público | En AGENTS.md — Vercel + Atlas + secrets + rollback | ✅ |

## 8. Métricas y observabilidad
- **Latencia API**: header `X-Response-Time` en ms en todas las rutas.
- **MongoDB**: logging de duración en operaciones clave (find, insertOne, deleteOne).
- **RustFS**: tamaño del objeto registrado en MongoDB al crear el vídeo.
- **Endpoint de salud**: `GET /api/health` → `{ status, mongo, rustfs, uptime }`.
- Umbrales definidos en §5.

## 9. Deployment público
- **Entorno objetivo**: Vercel (frontend + API) + MongoDB Atlas + RustFS en VPS o bucket S3 real.
- **Variables de entorno**: ver `.env.example`; nunca comitear `.env`.
- **Estrategia**: despliegue continuo desde `main`; rollback vía `git revert`.
- **DNS**: dominio propio apuntando al despliegue de Vercel.
- Ver `AGENTS.md` para comandos concretos.

## 10. Criterios de aceptación del proyecto
- [ ] Todos los RF-01..RF-13 verificados manualmente.
- [ ] Tests automatizados al 100 % en verde.
- [ ] Build `next build` sin errores ni warnings críticos.
- [ ] CI pipeline en verde.
- [ ] Todos los entregables del §7 presentes y completos.
- [ ] `.env.example` actualizado; `.env` en `.gitignore`.
- [ ] Subido a GitHub (`OSCARJORGERAPP/videovault`) y GitLab (`ojrapp/videovault`).
