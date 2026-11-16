# tasks.md — Tareas

- [x] T01 — Crear estructura monorepo — Agente: Arquitecto — RN: todas — HU: todas — Dep: ninguna — Terminado: workspaces y carpetas creados.
- [x] T02 — Definir esquema PostgreSQL — Agente: Backend — RN: 1, 4, 10, 13 — HU: 3, 5, 6 — Dep: T01 — Terminado: tablas y restricción anti-solapamiento.
- [x] T03 — Implementar reglas de negocio — Agente: Backend — RN: 2, 3, 7, 8, 9 — HU: 3 — Dep: T01 — Terminado: funciones puras.
- [x] T04 — Implementar autenticación — Agente: Backend — RN: 11 — HU: 2 — Dep: T02 — Terminado: registro, login, JWT y bcrypt.
- [x] T05 — Implementar API de canchas — Agente: Backend — RN: 12, 13 — HU: 1, 6 — Dep: T02, T04 — Terminado: GET público y POST admin.
- [x] T06 — Implementar API de reservas — Agente: Backend — RN: 1 a 11 — HU: 3, 4, 5 — Dep: T02, T03, T04 — Terminado: crear, listar y cancelar.
- [x] T07 — Construir interfaz responsive — Agente: Frontend — RN: 2 a 11 — HU: 1 a 5 — Dep: T05, T06 — Terminado: catálogo, autenticación y reservas.
- [x] T08 — Escribir tests de reglas — Agente: Tester — RN: 2, 3, 4, 7, 8 — HU: 3, 4 — Dep: T03 — Terminado: tests automatizados incluidos.
- [ ] T09 — Ejecutar instalación, typecheck, tests y build en entorno local — Agente: Tester — RN: todas — HU: todas — Dep: T01-T08 — Terminado: comandos ejecutados sin errores.
- [ ] T10 — Crear base Neon y desplegar API — Agente: DevOps — RN: todas — HU: todas — Dep: T09 — Terminado: health check público.
- [ ] T11 — Desplegar frontend Netlify y validar flujo real — Agente: Revisor — RN: todas — HU: todas — Dep: T10 — Terminado: URL pública probada.
- [ ] T12 — Registrar resultados y capturas del informe — Agente: Revisor — RN: todas — HU: todas — Dep: T09-T11 — Terminado: evidencia real adjunta.
