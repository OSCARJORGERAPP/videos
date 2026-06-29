# AGENTS.md — Guía operativa de VideoVault

> Especificación del producto: ver `PROMPT.md`. Este archivo es el "cómo".

---

## 🚀 Instalación (paso a paso)

```bash
# 1. Dependencias (genera package-lock.json; en CI usa npm ci)
npm install

# 2. Variables de entorno
cp .env.example .env
# Edita .env: ajusta JWT_SECRET con un valor seguro aleatorio
```

---

## 🗄️ Servicios locales (requiere Docker Desktop)

```bash
# MongoDB 7
docker run -d --name mongodb \
  -p 27017:27017 \
  mongo:7

# RustFS (S3-compatible)
# Asegúrate de que la imagen rustfs/rustfs esté disponible en tu Docker Hub
docker run -d --name rustfs \
  -p 9000:9000 -p 9001:9001 \
  -e RUSTFS_ROOT_USER=rustfsadmin \
  -e RUSTFS_ROOT_PASSWORD=rustfsadmin \
  -v rustfs_data:/data \
  rustfs/rustfs server /data

# Verificar que ambos servicios están corriendo
docker ps
```

**Variables de entorno clave** (ver `.env.example`):
| Variable | Valor por defecto | Descripción |
|---|---|---|
| `MONGODB_URI` | `mongodb://localhost:27017` | Cadena de conexión MongoDB |
| `MONGODB_DB` | `Videovault` | Nombre de la base de datos |
| `RUSTFS_ENDPOINT` | `http://localhost:9001` | Endpoint S3 de RustFS |
| `RUSTFS_ACCESS_KEY` | `rustfsadmin` | Access key de RustFS |
| `RUSTFS_SECRET_KEY` | `rustfsadmin` | Secret key de RustFS |
| `RUSTFS_BUCKET` | `videos` | Bucket (se crea automáticamente) |
| `JWT_SECRET` | *(cambiar)* | Secreto para firmar tokens JWT |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | URL base de la aplicación |

**Índices MongoDB** (se crean automáticamente al arrancar):
```javascript
// users: índice único en email
db.users.createIndex({ email: 1 }, { unique: true })
// videos: índice por usuario + búsqueda de texto
db.videos.createIndex({ userId: 1 })
db.videos.createIndex({ name: "text", description: "text", tags: "text" })
```

---

## ▶️ Arranque del sistema

```bash
# Desarrollo (hot-reload, http://localhost:3000)
npm run dev

# Producción
npm run build && npm start

# Health check
curl http://localhost:3000/api/health
```

---

## ✅ Tests

```bash
npm test              # suite completa
npm run test:watch    # modo watch para desarrollo
npm run test:cov      # con cobertura
```

**Política**: cada RF de `PROMPT.md` tiene ≥ 1 test. Un PR sin tests no se mergea.
Los tests de API usan mocks de MongoDB y RustFS (no requieren servicios corriendo).

---

## 🧱 Estructura del proyecto

```
video/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout (fuentes, metadata global)
│   │   ├── globals.css             # Tailwind base + variables CSS
│   │   ├── page.tsx                # Landing page (pública)
│   │   ├── auth/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── dashboard/
│   │   │   ├── layout.tsx          # Layout protegido con Navbar
│   │   │   └── page.tsx            # Stats: nº vídeos + espacio
│   │   ├── videos/
│   │   │   ├── page.tsx            # Lista + búsqueda
│   │   │   ├── upload/page.tsx     # Formulario de subida
│   │   │   └── [id]/page.tsx       # Reproductor + metadatos
│   │   └── api/
│   │       ├── health/route.ts
│   │       ├── auth/
│   │       │   ├── register/route.ts
│   │       │   ├── login/route.ts
│   │       │   ├── logout/route.ts
│   │       │   └── me/route.ts
│   │       ├── videos/
│   │       │   ├── route.ts        # GET (list/search), POST (create)
│   │       │   └── [id]/route.ts   # GET, PUT, DELETE
│   │       ├── upload/
│   │       │   ├── route.ts            # POST — recibe fichero y lo sube a RustFS (evita CORS)
│   │       │   └── presigned/route.ts  # POST — genera presigned PUT URL (uso futuro/producción)
│   │       └── dashboard/
│   │           └── route.ts
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── VideoCard.tsx
│   │   ├── VideoPlayer.tsx
│   │   ├── SearchBar.tsx
│   │   └── UploadForm.tsx
│   ├── lib/
│   │   ├── mongodb.ts              # Singleton de conexión MongoDB
│   │   ├── rustfs.ts               # Cliente S3 para RustFS
│   │   └── auth.ts                 # JWT sign/verify
│   ├── proxy.ts                    # Protección de rutas (cookie JWT) — Next.js 16+
│   └── types/
│       └── index.ts                # Interfaces User, Video, ApiResponse
├── __tests__/
│   ├── auth.test.ts
│   ├── videos.test.ts
│   └── dashboard.test.ts
├── .env.example
├── .gitignore
├── jest.config.ts
├── next.config.ts
├── package.json
├── postcss.config.mjs
└── tsconfig.json
```

---

## 🧭 Convenciones

- **Lenguaje**: TypeScript estricto (`strict: true`). Sin `any` explícito.
- **Componentes**: `use client` solo cuando se necesite interactividad. Todo lo demás es RSC.
- **API responses**: siempre `{ data, error }` con código HTTP apropiado.
- **Auth**: JWT en cookie `httpOnly; SameSite=strict; Secure` (en prod).
- **Errores**: los API routes capturan excepciones y devuelven 500 estructurado; nunca stack traces al cliente.
- **Naming**: camelCase en TS, kebab-case en archivos, PascalCase en componentes.
- **Commits**: `feat:`, `fix:`, `docs:`, `test:`, `chore:` (Conventional Commits).
- **Acceso a datos**: siempre pasar `userId` del token para filtrar; nunca confiar en el body.

---

## 📊 Métricas (cómo recolectarlas)

```bash
# Health check con latencias
curl -s http://localhost:3000/api/health | jq .

# Tiempo de respuesta de endpoints clave (requiere `hyperfine`)
hyperfine 'curl -s http://localhost:3000/api/videos -H "Cookie: token=<JWT>"'

# Tamaño de documentos en MongoDB
mongosh Videovault --eval 'db.videos.stats().avgObjSize'

# Conexiones activas MongoDB
mongosh --eval 'db.serverStatus().connections'
```

Ver umbrales en `PROMPT.md §5`.

---

## 🌐 Deployment público

### Prerequisitos
- MongoDB Atlas: clúster creado, usuario con permisos de lectura/escritura, IP allowlist abierta.
- RustFS / bucket S3 real con credenciales de producción (o usar AWS S3 con el mismo SDK).
- Vercel: proyecto vinculado al repo de GitHub (`OSCARJORGERAPP/videovault`).
- Secrets configurados en Vercel (Settings → Environment Variables):

| Variable | Descripción |
|---|---|
| `MONGODB_URI` | URI de MongoDB Atlas (`mongodb+srv://...`) |
| `MONGODB_DB` | Nombre de la BD de producción |
| `RUSTFS_ENDPOINT` | Endpoint S3 de producción |
| `RUSTFS_ACCESS_KEY` | Access key de producción |
| `RUSTFS_SECRET_KEY` | Secret key de producción |
| `RUSTFS_BUCKET` | Nombre del bucket de producción |
| `JWT_SECRET` | Mínimo 32 chars — generar con `openssl rand -base64 32` |
| `NEXT_PUBLIC_APP_URL` | URL pública (`https://tudominio.com`) |

### Flujo de deployment

```bash
# 1. Verificar build y tests localmente
npm run build && npm test

# 2. Push a GitHub (dispara CI + deploy automático en Vercel)
git push github main

# 3. Sincronizar GitLab
git push gitlab main

# 4. Verificar post-deployment
curl https://tudominio.com/api/health
```

### Rollback

```bash
git revert HEAD --no-edit
git push github main && git push gitlab main
```

### Configurar remotes (primera vez)

```bash
git remote add github https://github.com/OSCARJORGERAPP/videos
git remote add gitlab https://gitlab.codecrypto.academy/ojrapp/videos
```

⚠️ **SINCRONIZACIÓN OBLIGATORIA**: cada push a `main` se replica en **ambos** remotes.

---

## 📒 Documentación viva (obligación del agente)

- Tras cada cambio en arranque o instalación: actualizar `README.md` y `QUICKSTART.md`.
- Tras cada bug relevante: registrar entrada en `RETROSPECTIVA.md` con formato:
  ```
  ## YYYY-MM-DD — <título>
  **Problema**: ...
  **Causa**: ...
  **Solución**: ...
  ```
- Al cerrar el proyecto: completar `REFLEXION-FINAL.md`.

---

## 🏗️ Arquitectura

```
Navegador
  │
  ├─ PUT (vídeo) ──────────────────────────────▶ RustFS :9001
  │                                               (S3-compatible)
  └─ HTTP/REST ────────────────────────────────▶ Next.js :3000
                                                   │
                                          ┌────────┴────────┐
                                          │   API Routes     │
                                          │  /api/auth       │
                                          │  /api/videos     │
                                          │  /api/upload     │
                                          │  /api/dashboard  │
                                          └────────┬─────────┘
                                                   │
                                          ┌────────┴────────┐
                                          │   MongoDB :27017  │
                                          │  users / videos  │
                                          └─────────────────┘
```

Diseño: ver skill `frontend-design` para landing y páginas principales.
