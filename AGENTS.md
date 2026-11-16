# AGENTS.md — CanchaYa

## Fuente de verdad
- Reglas funcionales: `docs/spec.md`.
- Decisiones de negocio: `docs/decisiones.md`.
- Arquitectura: `docs/plan.md`.
- Tareas: `docs/tasks.md`.
- Esquema: `backend/sql/schema.sql`.

Si dos documentos se contradicen, detenerse y solicitar una decisión; no inventar reglas.

## Stack
React + TypeScript + Vite; Node.js + Express + TypeScript; PostgreSQL.

## Reglas generales
- No agregar dependencias sin justificarlo.
- No subir `.env`, contraseñas, tokens ni cadenas de conexión.
- Validar entradas en el backend aunque el frontend también valide.
- Toda modificación de reglas debe actualizar spec, tests y documentación.
- No confiar en cálculos de precio realizados por el cliente.
- Las reservas deben conservar protección ante concurrencia en la base de datos.
- Mantener accesibilidad básica, diseño responsive y mensajes claros.
- Una tarea se considera terminada cuando pasan sus tests, typecheck y build pertinentes.

## Agentes
- Analista: aclara reglas y actualiza documentación funcional.
- Arquitecto: revisa modelo, API y decisiones técnicas.
- Backend: implementa API y reglas del servidor.
- Frontend: implementa pantallas y experiencia.
- Tester: crea y ejecuta pruebas sin alterar la lógica productiva.
- Revisor: revisa seguridad, consistencia y criterios de aceptación.

## Ciclo por tarea
1. Analista confirma RN/HU involucradas.
2. Tester define casos y criterios de aceptación.
3. Desarrollador implementa sin debilitar tests.
4. Revisor verifica cambios y resultados.
5. Registrar un commit por tarea.
