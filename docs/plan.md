# plan.md — Plan técnico

## Arquitectura
- SPA React + TypeScript servida como archivos estáticos.
- API REST Express + TypeScript.
- PostgreSQL como fuente persistente de verdad.
- JWT para autenticar solicitudes; bcrypt para almacenar hashes de contraseñas.
- Variables sensibles exclusivamente en entorno.

## Modelo de datos
- users(id, name, email, password_hash, role, created_at)
- courts(id, name, sport, location, price_per_hour, image_url, description, capacity, opening_hour, closing_hour, active)
- bookings(id, user_id, court_id, start_at, end_at, duration_minutes, total_price, status, created_at)

## API
- GET /api/health
- POST /api/auth/register
- POST /api/auth/login
- GET /api/courts
- POST /api/courts (ADMIN)
- GET /api/bookings/mine (autenticado)
- POST /api/bookings (autenticado)
- PATCH /api/bookings/:id/cancel (autenticado)

## Dónde vive cada regla
- Validación de entrada: Zod en rutas.
- Duración, anticipación, horario y precio: `backend/src/business.ts`.
- Solapamiento: restricción de exclusión PostgreSQL en `backend/sql/schema.sql`.
- Límite de reservas: transacción de creación en `backend/src/routes.ts`.
- Propiedad y permisos: middleware JWT y consulta por user_id.
- Cancelación: `canCancel` en `business.ts`.

## Seguridad
Helmet, CORS restringido a FRONTEND_URL, rate limit de autenticación, límite de JSON, hash bcrypt, JWT y secretos mediante variables de entorno.

## Despliegue
Frontend en Netlify, backend en Render y PostgreSQL en Neon. Configurar `VITE_API_URL`, `DATABASE_URL`, `JWT_SECRET` y `FRONTEND_URL`. Ejecutar `backend/sql/schema.sql` en la base antes de probar.

## Riesgos y preguntas para analista
- Zona horaria: configurar `TZ=America/Argentina/Buenos_Aires` en Render y mantener entradas locales consistentes.
- Concurrencia: validar el comportamiento de la restricción GiST en Neon.
- Administrador inicial: asignar rol ADMIN manualmente desde la base de datos; nunca exponer un registro público como administrador.
