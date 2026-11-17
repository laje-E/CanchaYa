# CanchaYa

Plataforma web para descubrir y reservar canchas deportivas.

## Enlaces del proyecto

- Aplicación web (Netlify): https://canchayagent.netlify.app

- Backend / API (Render): https://canchaya-l26f.onrender.com

- Base de datos (Neon): PostgreSQL alojada en Neon.

## Funcionalidades
- Catálogo filtrable por deporte y búsqueda por nombre/ubicación.
- Registro e inicio de sesión con contraseña hasheada.
- Reservas de 60, 90 o 120 minutos.
- Prevención de dobles reservas, incluso ante solicitudes simultáneas.
- Cálculo de precios con tarifa pico desde las 18:00.
- Historial y cancelación de reservas.
- API protegida para administración de canchas.

## Tecnologías
React, TypeScript, Vite, Node.js, Express, PostgreSQL, JWT y bcrypt.

## Requisitos
Node.js 22 o superior y PostgreSQL 14 o superior.

## Instalación local
1. Clonar el repositorio.
2. En la raíz: `npm install`.
3. Crear `backend/.env` a partir de `.env.example` (o cargar variables en el entorno).
4. Crear una base PostgreSQL y ejecutar `backend/sql/schema.sql`.
5. Cargar al menos una cancha en la tabla `courts`.
6. Ejecutar `npm run dev`.
7. Frontend: `http://localhost:5173`; API: `http://localhost:3000/api/health`.

Ejemplo de cancha inicial:
```sql
INSERT INTO courts(name,sport,location,price_per_hour,image_url,description,capacity,opening_hour,closing_hour)
VALUES ('Arena Fútbol Club','Fútbol 5','Palermo, CABA',18000,
'https://images.unsplash.com/photo-1522778119026-d647f0596c20',
'Césped sintético, iluminación LED y vestuarios.',10,8,23);
```

## Variables de entorno
Copiar `.env.example` y configurar:
- `DATABASE_URL`: conexión PostgreSQL.
- `JWT_SECRET`: secreto aleatorio largo.
- `FRONTEND_URL`: origen exacto del frontend para CORS.
- `VITE_API_URL`: URL pública de la API más `/api`.

No subir `.env` a GitHub.

## Pruebas y build
- `npm test`
- `npm run typecheck`
- `npm run build`

## Despliegue
Consultar [docs/despliegue.md](docs/despliegue.md) para la configuración de Neon, Render y Netlify.

## Documentación
Consultar `docs/` para idea, decisiones, glosario, preguntas abiertas, especificación, plan, tareas y agentes.

## Estado
Este repositorio es una base funcional de proyecto académico. Antes de entregar, completar las tareas de despliegue y adjuntar evidencia real de tests, pruebas API y URL pública. No afirmar que la aplicación está publicada hasta realizar y verificar ese proceso.
