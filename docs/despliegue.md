# Guía de despliegue

- Base: Neon PostgreSQL; ejecutar `backend/sql/schema.sql`.
- Backend: Render, raíz del servicio `backend` o comandos desde la raíz del monorepo. Build `npm install && npm run build -w backend`; Start `npm run start -w backend`.
- Frontend: Netlify, base `frontend`, build `npm run build`, directorio `dist`; variable `VITE_API_URL=https://TU-API.onrender.com/api`.
- En Render configurar `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL=https://TU-SITIO.netlify.app` y `NODE_ENV=production`.

Para crear el primer administrador, registrar un usuario normalmente y cambiar su rol desde una conexión segura a PostgreSQL:
```sql
UPDATE users SET role='ADMIN' WHERE email='admin@tudominio.com';
```

