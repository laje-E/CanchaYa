# spec.md — Especificación funcional

## Objetivo
Permitir que una persona encuentre una cancha deportiva, consulte sus datos y reserve un horario disponible de forma segura.

## Usuarios y roles
- Visitante: consulta canchas.
- Usuario: se registra, inicia sesión, reserva y cancela sus propias reservas.
- Administrador: crea canchas mediante endpoints protegidos.

## Alcance
Catálogo, autenticación, reservas, cancelaciones, reglas de horario/precio y persistencia. Pagos y notificaciones quedan fuera del MVP.

## Reglas de negocio

- **RN1 — No solapamiento:** una cancha no puede tener dos reservas activas que compartan minutos. Se aplica en PostgreSQL para cubrir solicitudes simultáneas.
- **RN2 — Anticipación:** el inicio del turno debe estar al menos 2 horas después del momento de creación.
- **RN3 — Duración:** solo se admiten turnos de 60, 90 o 120 minutos.
- **RN4 — Horario de atención:** el turno debe comenzar y finalizar dentro del horario de apertura y cierre configurado para la cancha.
- **RN5 — Cancelación:** el usuario dueño puede cancelar una reserva confirmada hasta 6 horas antes de su inicio.
- **RN6 — Límite personal:** un usuario no puede superar 3 reservas futuras en estado PENDING o CONFIRMED.
- **RN7 — Precio:** precio = tarifa por hora × duración en horas.
- **RN8 — Franja pico:** si el turno comienza a las 18:00 o después, se aplica un recargo del 20%.
- **RN9 — Fechas válidas:** no se aceptan fechas pasadas; queda cubierta por RN2.
- **RN10 — Estados:** estados válidos: PENDING, CONFIRMED, CANCELLED y COMPLETED. La creación normal produce CONFIRMED.
- **RN11 — Autorización:** solo un usuario autenticado puede reservar; solo puede consultar y cancelar sus propias reservas.
- **RN12 — Administración:** solo ADMIN puede crear canchas.
- **RN13 — Integridad:** cancha, usuario y reserva deben existir; duración, capacidad y precio deben ser válidos.

## Historias de usuario

### HU1 — Explorar canchas
Como visitante quiero ver canchas disponibles para elegir dónde jugar.
- Dado que ingreso al sitio, cuando se carga el catálogo, entonces veo nombre, deporte, ubicación, precio y descripción.
- Dado que selecciono un deporte, cuando aplico el filtro, entonces solo veo canchas de ese deporte.

### HU2 — Crear una cuenta
Como visitante quiero registrarme para poder reservar.
- Dado un nombre, email válido y contraseña de al menos 8 caracteres, cuando envío el formulario, entonces se crea la cuenta y recibo una sesión.
- Dado un email ya registrado, cuando intento registrarme, entonces recibo un conflicto y no se duplica la cuenta.

### HU3 — Reservar una cancha
Como usuario quiero reservar un turno.
- Dado un horario dentro de las reglas, cuando confirmo, entonces se crea una reserva confirmada con precio calculado.
- Dado un horario solapado, cuando intento reservar, entonces el sistema rechaza la operación.
- Dado que ya tengo 3 reservas futuras activas, cuando intento crear otra, entonces recibo un rechazo.

### HU4 — Cancelar una reserva
Como usuario quiero cancelar un turno propio.
- Dado que faltan al menos 6 horas, cuando cancelo mi reserva confirmada, entonces pasa a CANCELLED.
- Dado que faltan menos de 6 horas, cuando intento cancelar, entonces el sistema rechaza la operación.
- Dado que la reserva pertenece a otra persona, cuando intento cancelarla, entonces no puedo modificarla.

### HU5 — Consultar mis reservas
Como usuario quiero consultar mis reservas.
- Dado que tengo una sesión, cuando abro Mis reservas, entonces veo únicamente mis reservas ordenadas por fecha.

### HU6 — Administrar canchas
Como administrador quiero incorporar canchas al catálogo.
- Dado que tengo rol ADMIN, cuando envío datos válidos, entonces se crea la cancha.
- Dado que soy USER, cuando intento crear una cancha, entonces recibo 403.

## Casos borde
- Dos personas reservan el mismo intervalo al mismo tiempo.
- Una reserva empieza antes del cierre pero termina después.
- Una persona intenta cancelar a 5 h 59 min del inicio.
- Una persona intenta crear una cuarta reserva futura.
- El usuario envía una duración distinta de 60, 90 o 120.
- La cancha fue desactivada antes de confirmar.
- La sesión JWT venció.
- La base de datos no responde.

## Pendientes
No hay pendientes bloqueantes para el MVP. Las decisiones comerciales listadas en `preguntas-abiertas.md` quedan fuera del alcance académico inicial.
