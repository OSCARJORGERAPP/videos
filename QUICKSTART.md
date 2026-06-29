# QUICKSTART — VideoVault

De cero a corriendo en menos de 5 minutos.

## Prerequisitos

| Herramienta | Versión mínima | Comprobación |
|---|---|---|
| Node.js | 20 | `node -v` |
| npm | 10 | `npm -v` |
| Docker Desktop | cualquiera | Docker Desktop abierto |

---

## 1. Clonar el repositorio

```bash
git clone https://github.com/OSCARJORGERAPP/videos.git
cd videos
```

## 2. Instalar dependencias

```bash
npm install
```

## 3. Variables de entorno

```bash
cp .env.example .env
```

El `.env` generado funciona tal cual para desarrollo. En producción cambia `JWT_SECRET` por un valor aleatorio seguro:

```bash
# Generar un secreto seguro (opcional en dev)
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## 4. Levantar servicios con Docker

Abre Docker Desktop y ejecuta:

```bash
# MongoDB
docker run -d --name mongodb -p 27017:27017 mongo:7

# RustFS (almacenamiento S3-compatible)
docker run -d --name rustfs \
  -p 9000:9000 -p 9001:9001 \
  -e RUSTFS_ROOT_USER=rustfsadmin \
  -e RUSTFS_ROOT_PASSWORD=rustfsadmin \
  -v rustfs_data:/data \
  rustfs/rustfs server /data

# Verificar que ambos están corriendo
docker ps
```

## 5. Arrancar la aplicación

```bash
npm run dev
```

Abre **http://localhost:3000** en el navegador.

---

## Primer uso

1. Click en **Crear cuenta** → rellena nombre, email y contraseña (mín. 8 caracteres)
2. El **Dashboard** muestra `0 vídeos` y `0.0 KB`
3. Click en **Subir vídeo** → selecciona un archivo, añade nombre, tags y descripción
4. La barra de progreso avanza mientras sube; al terminar redirige a **Mis vídeos**
5. Click en la card del vídeo → se abre el reproductor HTML5
6. Desde el reproductor, click **Editar metadatos** para modificar nombre, tags o pares clave-valor
7. Click **Salir** en la navbar para cerrar sesión

---

## Datos de demo (opcional)

Para probar la app con datos precargados:

```bash
npm run seed
# Crea: demo@videovault.local / demo1234 + 3 vídeos de ejemplo

npm run seed:reset
# Limpia los datos de seed y los vuelve a crear
```

---

## Parar los servicios

```bash
docker stop mongodb rustfs
docker rm mongodb rustfs
```

Para eliminar también los datos:

```bash
docker volume rm rustfs_data
```

---

## Problemas comunes

| Síntoma | Causa probable | Solución |
|---|---|---|
| Error CORS al subir vídeo | RustFS sin CORS configurado | La subida va por el proxy de Next.js — no debería ocurrir. Verifica que usas `/api/upload` |
| `connect ECONNREFUSED 27017` | MongoDB no está corriendo | `docker start mongodb` |
| `connect ECONNREFUSED 9000` | RustFS no está corriendo | `docker start rustfs` |
| Contenido pegado al borde izquierdo | CSS reset global rompe Tailwind v4 | Ver `globals.css` — solo debe tener `box-sizing` fuera de `@layer` |
| Pipeline GitLab falla con ENOSPC | Disco del runner lleno | Problema de infraestructura del runner; contactar al admin |

---

Ver [AGENTS.md](AGENTS.md) para comandos operativos completos y guía de deployment.
