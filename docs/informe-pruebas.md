# Informe de pruebas y desarrollo — CanchaYa

## Objetivo
Registrar pruebas del sistema y justificar el orden de construcción. Completar los resultados con ejecuciones reales antes de entregar.

## Orden de implementación y justificación
1. Modelo de datos: la integridad de reservas y la prevención de solapamientos condicionan el resto del sistema.
2. Reglas de negocio: anticipación, duración, horarios y precio definen el comportamiento esperado.
3. Autenticación: reservas y administración requieren identidad y autorización.
4. API de canchas y reservas: exponen las reglas al frontend.
5. Interfaz: se construye sobre contratos de API ya definidos.
6. Tests: verifican reglas puras y deben ampliarse con pruebas de integración de PostgreSQL.
7. Despliegue: se realiza después de validar localmente para reducir errores de configuración.

## Pruebas automatizadas incluidas
Archivo: `backend/test/business.test.ts`.
- Precio normal fuera de hora pico.
- Recargo del 20% desde las 18:00.
- Rechazo de duración inválida.
- Rechazo de anticipación menor a dos horas.
- Rechazo de turno fuera de horario.
- Cancelación permitida con seis horas.
- Cancelación rechazada con menos de seis horas.

## Matriz de pruebas manuales/API pendiente de ejecutar
| Caso | Resultado esperado | Evidencia / resultado real |
|---|---|---|
| GET /api/courts | 200 y catálogo | Completar |
| Registro válido | 201 y token | Completar |
| Registro duplicado | 409 | Completar |
| Login incorrecto | 401 | Completar |
| Reserva válida | 201 | Completar |
| Reserva solapada | 409 | Completar |
| Cuarta reserva futura | 409 | Completar |
| Cancelar con 7 horas | 200 | Completar |
| Cancelar con 5 horas | 409 | Completar |
| Crear cancha como USER | 403 | Completar |
| Crear cancha como ADMIN | 201 | Completar |

## Resultado final
No completar esta sección hasta ejecutar tests, typecheck, build, pruebas de endpoints y validación del sitio desplegado. Adjuntar fecha, capturas y URL pública real.
