# QUICKSTART — VideoVault

De cero a corriendo en menos de 5 minutos.

## Prerequisitos
- Node.js ≥ 20
- Docker Desktop corriendo

## Pasos

```bash
# 1. Clonar y entrar al directorio
git clone https://github.com/OSCARJORGERAPP/videovault.git
cd videovault

# 2. Instalar dependencias
npm install

# 3. Variables de entorno
cp .env.example .env
# Abre .env y cambia JWT_SECRET por un valor seguro

# 4. Levantar servicios con Docker
docker run -d --name mongodb -p 27017:27017 mongo:7
docker run -d --name rustfs -p 9000:9000 -p 9001:9001 \
  -e RUSTFS_ROOT_USER=rustfsadmin -e RUSTFS_ROOT_PASSWORD=rustfsadmin \
  -v rustfs_data:/data rustfs/rustfs server /data

# 5. Arrancar la aplicación
npm run dev
```

Abre http://localhost:3000 en el navegador.

## Primer uso

1. Click en **Crear cuenta** → rellena email y contraseña.
2. En el **Dashboard** verás el resumen de vídeos.
3. Click en **Subir vídeo** → selecciona un archivo, añade nombre/tags/descripción.
4. Una vez subido, aparece en **Mis vídeos** con el reproductor integrado.

## Parar los servicios

```bash
docker stop mongodb rustfs
docker rm mongodb rustfs
```

## Problemas comunes

<!-- TODO: añadir entradas según RETROSPECTIVA.md -->
